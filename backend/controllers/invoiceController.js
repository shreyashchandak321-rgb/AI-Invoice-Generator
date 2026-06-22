const path = require("path");
const mongoose = require("mongoose");
const Invoice = require("../models/invoiceModel");

const API_BASE = process.env.API_BASE || "http://localhost:4000";

// ── helpers ──────────────────────────────────────────────────────────────

function parseItemsField(items) {
  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(items) ? items : [];
}

function computeTotals(items, taxPercent) {
  const subtotal = (items || []).reduce(
    (sum, item) => sum + Number(item.qty || 0) * Number(item.unitPrice || 0),
    0
  );
  const tax = Math.round(subtotal * (Number(taxPercent) / 100) * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { subtotal, tax, total };
}

function uploadedFilesToUrls(req) {
  const urls = {};
  if (!req.files) return urls;
  const mapping = {
    logoName: "logoDataUrl",
    stampName: "stampDataUrl",
    signatureNameMeta: "signatureDataUrl",
    logo: "logoDataUrl",
    stamp: "stampDataUrl",
    signature: "signatureDataUrl",
  };
  Object.keys(mapping).forEach((field) => {
    const arr = req.files[field];
    if (Array.isArray(arr) && arr[0]) {
      const filename =
        arr[0].filename || (arr[0].path && path.basename(arr[0].path));
      if (filename) urls[mapping[field]] = `${API_BASE}/uploads/${filename}`;
    }
  });
  return urls;
}

async function generateUniqueInvoiceNumber(attempts = 8) {
  for (let i = 0; i < attempts; i++) {
    const ts = Date.now().toString();
    const suffix = Math.floor(Math.random() * 900000)
      .toString()
      .padStart(6, "0");
    const candidate = `INV-${ts.slice(-6)}-${suffix}`;
    const exists = await Invoice.exists({ invoiceNumber: candidate });
    if (!exists) return candidate;
    await new Promise((r) => setTimeout(r, 2));
  }
  return new mongoose.Types.ObjectId().toString();
}

// ── CREATE ───────────────────────────────────────────────────────────────

async function createInvoice(req, res) {
  try {
    const { userId } = req.auth || {};
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const body = req.body || {};
    const items = Array.isArray(body.items)
      ? body.items
      : parseItemsField(body.items);
    const taxPercent = Number(body.taxPercent ?? body.tax ?? 18);
    const totals = computeTotals(items, taxPercent);
    const fileUrls = uploadedFilesToUrls(req);

    let invoiceNumberProvided =
      typeof body.invoiceNumber === "string" && body.invoiceNumber.trim()
        ? String(body.invoiceNumber).trim()
        : null;

    if (invoiceNumberProvided) {
      const duplicate = await Invoice.exists({
        invoiceNumber: invoiceNumberProvided,
      });
      if (duplicate) {
        return res
          .status(409)
          .json({ success: false, message: "Invoice number already exists" });
      }
    }

    let invoiceNumber =
      invoiceNumberProvided || (await generateUniqueInvoiceNumber());

    const doc = new Invoice({
      _id: new mongoose.Types.ObjectId(),
      owner: userId,
      invoiceNumber,
      issueDate: body.issueDate || new Date().toISOString().slice(0, 10),
      dueDate: body.dueDate || "",
      fromBusinessName: body.fromBusinessName || "",
      fromEmail: body.fromEmail || "",
      fromAddress: body.fromAddress || "",
      fromPhone: body.fromPhone || "",
      fromGst: body.fromGst || "",
      client:
        typeof body.client === "string" && body.client.trim()
          ? { name: body.client }
          : body.client || {},
      items,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      currency: body.currency || "INR",
      status: body.status ? String(body.status).toLowerCase() : "draft",
      taxPercent,
      logoDataUrl:
        fileUrls.logoDataUrl || body.logoDataUrl || body.logo || null,
      stampDataUrl:
        fileUrls.stampDataUrl || body.stampDataUrl || body.stamp || null,
      signatureDataUrl:
        fileUrls.signatureDataUrl ||
        body.signatureDataUrl ||
        body.signature ||
        null,
      signatureName: body.signatureName || "",
      signatureTitle: body.signatureTitle || "",
      notes: body.notes || "",
    });

    let saved = null;
    let attempts = 0;
    while (attempts < 6) {
      try {
        saved = await doc.save();
        break;
      } catch (err) {
        if (err && err.code === 11000 && err.keyPattern && err.keyPattern.invoiceNumber) {
          attempts += 1;
          doc.invoiceNumber = await generateUniqueInvoiceNumber();
          continue;
        }
        throw err;
      }
    }

    if (!saved) {
      return res.status(500).json({
        success: false,
        message: "Failed to create invoice after multiple attempts",
      });
    }

    return res
      .status(201)
      .json({ success: true, message: "Invoice created", data: saved });
  } catch (err) {
    console.error("createInvoice error:", err);
    if (err && err.code === 11000 && err.keyPattern && err.keyPattern.invoiceNumber) {
      return res
        .status(409)
        .json({ success: false, message: "Invoice number already exists" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// ── LIST ─────────────────────────────────────────────────────────────────

async function listInvoices(req, res) {
  try {
    const { userId } = req.auth || {};
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const q = { owner: userId };

    if (req.query.search) {
      const search = req.query.search.trim();
      q.$or = [
        { fromEmail: { $regex: search, $options: "i" } },
        { "client.email": { $regex: search, $options: "i" } },
        { "client.name": { $regex: search, $options: "i" } },
        { invoiceNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (req.query.status) {
      q.status = req.query.status;
    }

    const [data, total] = await Promise.all([
      Invoice.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Invoice.countDocuments(q),
    ]);

    return res.json({
      success: true,
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("listInvoices error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// ── GET SINGLE ───────────────────────────────────────────────────────────

async function getInvoice(req, res) {
  try {
    const { userId } = req.auth || {};
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const invoice = await Invoice.findOne({ _id: req.params.id, owner: userId });
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    return res.json({ success: true, data: invoice });
  } catch (err) {
    console.error("getInvoice error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// ── UPDATE ───────────────────────────────────────────────────────────────

async function updateInvoice(req, res) {
  try {
    const { userId } = req.auth || {};
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const existing = await Invoice.findOne({ _id: req.params.id, owner: userId });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    const body = req.body || {};

    if (body.invoiceNumber && String(body.invoiceNumber).trim() !== existing.invoiceNumber) {
      const conflict = await Invoice.findOne({
        invoiceNumber: String(body.invoiceNumber).trim(),
      });
      if (conflict && String(conflict._id) !== String(existing._id)) {
        return res
          .status(409)
          .json({ success: false, message: "Invoice number already exists" });
      }
    }

    let items = [];
    if (Array.isArray(body.items)) items = body.items;
    else if (typeof body.items === "string" && body.items.length) {
      try {
        items = JSON.parse(body.items);
      } catch {
        items = [];
      }
    }

    const taxPercent = Number(
      body.taxPercent ?? body.tax ?? existing.taxPercent ?? 18
    );
    const totals = computeTotals(items, taxPercent);
    const fileUrls = uploadedFilesToUrls(req);

    const update = {};
    if (body.invoiceNumber !== undefined) update.invoiceNumber = body.invoiceNumber;
    if (body.issueDate !== undefined) update.issueDate = body.issueDate;
    if (body.dueDate !== undefined) update.dueDate = body.dueDate;
    if (body.fromBusinessName !== undefined) update.fromBusinessName = body.fromBusinessName;
    if (body.fromEmail !== undefined) update.fromEmail = body.fromEmail;
    if (body.fromAddress !== undefined) update.fromAddress = body.fromAddress;
    if (body.fromPhone !== undefined) update.fromPhone = body.fromPhone;
    if (body.fromGst !== undefined) update.fromGst = body.fromGst;
    if (body.client !== undefined) {
      update.client =
        typeof body.client === "string" && body.client.trim()
          ? { name: body.client }
          : body.client;
    }
    if (body.currency !== undefined) update.currency = body.currency;
    if (body.status !== undefined) update.status = String(body.status).toLowerCase();
    if (body.signatureName !== undefined) update.signatureName = body.signatureName;
    if (body.signatureTitle !== undefined) update.signatureTitle = body.signatureTitle;
    if (body.notes !== undefined) update.notes = body.notes;

    // Always recompute totals from items
    update.items = items.length > 0 ? items : existing.items;
    update.subtotal = totals.subtotal;
    update.tax = totals.tax;
    update.total = totals.total;
    update.taxPercent = taxPercent;

    // File URLs
    if (fileUrls.logoDataUrl) update.logoDataUrl = fileUrls.logoDataUrl;
    else if (body.logoDataUrl !== undefined) update.logoDataUrl = body.logoDataUrl;
    if (fileUrls.stampDataUrl) update.stampDataUrl = fileUrls.stampDataUrl;
    else if (body.stampDataUrl !== undefined) update.stampDataUrl = body.stampDataUrl;
    if (fileUrls.signatureDataUrl) update.signatureDataUrl = fileUrls.signatureDataUrl;
    else if (body.signatureDataUrl !== undefined) update.signatureDataUrl = body.signatureDataUrl;

    const saved = await Invoice.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    return res.json({ success: true, message: "Invoice updated", data: saved });
  } catch (err) {
    console.error("updateInvoice error:", err);
    if (err && err.code === 11000 && err.keyPattern && err.keyPattern.invoiceNumber) {
      return res
        .status(409)
        .json({ success: false, message: "Invoice number already exists" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// ── DELETE ───────────────────────────────────────────────────────────────

async function deleteInvoice(req, res) {
  try {
    const { userId } = req.auth || {};
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      owner: userId,
    });
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    return res.json({ success: true, message: "Invoice deleted" });
  } catch (err) {
    console.error("deleteInvoice error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = {
  createInvoice,
  listInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
};
