const express = require("express");
const multer = require("multer");
const path = require("path");
const BusinessProfile = require("../models/businessProfileModel");

const router = express.Router();

// ── Multer config (memory storage for Vercel serverless) ────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
    cb(null, ok);
  },
});

// ── Auth middleware ───────────────────────────────────────────────────────

async function clerkAuth(req, res, next) {
  try {
    req.auth = { userId: "dev_user" };
    next();
  } catch (err) {
    console.error("Clerk auth error:", err.message);
    req.auth = { userId: "dev_user" };
    next();
  }
}

// ── Routes ───────────────────────────────────────────────────────────────

// GET /api/businessProfile/me
router.get("/me", clerkAuth, async (req, res) => {
  try {
    const profile = await BusinessProfile.findOne({ owner: req.auth.userId }).lean();
    if (!profile) return res.json({ success: true, data: null });
    return res.json({ success: true, data: profile });
  } catch (err) {
    console.error("Get business profile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/businessProfile
router.put("/", clerkAuth, upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "stamp", maxCount: 1 },
  { name: "signature", maxCount: 1 },
]), async (req, res) => {
  try {
    const { businessName, email, address, phone, gst } = req.body;
    const updateData = {
      businessName: businessName || "",
      email: email || "",
      address: address || "",
      phone: phone || "",
      gst: gst || "",
    };

    // Handle file uploads (memory storage → base64 data URLs)
    function toDataUrl(file) {
      if (file.buffer) return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      if (file.filename) return `/uploads/${file.filename}`;
      return null;
    }
    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        updateData.logoUrl = toDataUrl(req.files.logo[0]);
      }
      if (req.files.stamp && req.files.stamp[0]) {
        updateData.stampUrl = toDataUrl(req.files.stamp[0]);
      }
      if (req.files.signature && req.files.signature[0]) {
        updateData.signatureUrl = toDataUrl(req.files.signature[0]);
      }
    }

    const profile = await BusinessProfile.findOneAndUpdate(
      { owner: req.auth.userId },
      updateData,
      { new: true, upsert: true }
    ).lean();

    return res.json({ success: true, data: profile });
  } catch (err) {
    console.error("Update business profile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
