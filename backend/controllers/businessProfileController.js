const BusinessProfile = require("../models/businessProfileModel");

function uploadedFilesToUrls(req) {
  const urls = {};
  if (!req.files) return urls;

  const logoArr = req.files.logoName || req.files.logo || [];
  const stampArr = req.files.stampName || req.files.stamp || [];
  const sigArr = req.files.signatureNameMeta || req.files.signature || [];

  function toDataUrl(file) {
    if (file.buffer) return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    if (file.filename) return `/uploads/${file.filename}`;
    return null;
  }

  if (logoArr[0]) urls.logoUrl = toDataUrl(logoArr[0]);
  if (stampArr[0]) urls.stampUrl = toDataUrl(stampArr[0]);
  if (sigArr[0]) urls.signatureUrl = toDataUrl(sigArr[0]);

  return urls;
}

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

// ── GET MY PROFILE ───────────────────────────────────────────────────────

async function getMyProfile(req, res) {
  try {
    const { userId } = req.auth || {};
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const profile = await BusinessProfile.findOne({ owner: userId });
    if (!profile) {
      return res.json({ success: true, data: null });
    }

    return res.json({ success: true, data: profile });
  } catch (err) {
    console.error("getMyProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// ── CREATE / UPSERT PROFILE ──────────────────────────────────────────────

async function createProfile(req, res) {
  try {
    const { userId } = req.auth || {};
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const body = req.body || {};
    const fileUrls = uploadedFilesToUrls(req);

    // If profile already exists, update it instead
    const existing = await BusinessProfile.findOne({ owner: userId });

    if (existing) {
      const update = {};
      if (body.businessName !== undefined) update.businessName = body.businessName;
      if (body.email !== undefined) update.email = body.email;
      if (body.address !== undefined) update.address = body.address;
      if (body.phone !== undefined) update.phone = body.phone;
      if (body.gst !== undefined) update.gst = body.gst;
      if (body.notes !== undefined) update.notes = body.notes;

      if (fileUrls.logoUrl) update.logoUrl = fileUrls.logoUrl;
      else if (body.logoUrl !== undefined) update.logoUrl = body.logoUrl;

      if (fileUrls.stampUrl) update.stampUrl = fileUrls.stampUrl;
      else if (body.stampUrl !== undefined) update.stampUrl = body.stampUrl;

      if (fileUrls.signatureUrl) update.signatureUrl = fileUrls.signatureUrl;
      else if (body.signatureUrl !== undefined) update.signatureUrl = body.signatureUrl;

      if (body.signatureOwnerName !== undefined)
        update.signatureOwnerName = body.signatureOwnerName;
      if (body.signatureOwnerTitle !== undefined)
        update.signatureOwnerTitle = body.signatureOwnerTitle;
      if (body.defaultTaxPercent !== undefined)
        update.defaultTaxPercent = Number(body.defaultTaxPercent);

      const saved = await BusinessProfile.findByIdAndUpdate(
        existing._id,
        { $set: update },
        { new: true, runValidators: true }
      );
      return res.json({ success: true, message: "Profile updated", data: saved });
    }

    // Create new profile
    const profile = new BusinessProfile({
      owner: userId,
      businessName: body.businessName || "ABC Solutions",
      email: body.email || "",
      address: body.address || "",
      phone: body.phone || "",
      gst: body.gst || "",
      logoUrl: fileUrls.logoUrl || body.logoUrl || null,
      stampUrl: fileUrls.stampUrl || body.stampUrl || null,
      signatureUrl: fileUrls.signatureUrl || body.signatureUrl || null,
      signatureOwnerName: body.signatureOwnerName || "",
      signatureOwnerTitle: body.signatureOwnerTitle || "",
      defaultTaxPercent:
        body.defaultTaxPercent !== undefined ? Number(body.defaultTaxPercent) : 18,
      notes: body.notes || "",
    });

    const saved = await profile.save();
    return res
      .status(201)
      .json({ success: true, message: "Profile created", data: saved });
  } catch (err) {
    console.error("createProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// ── UPDATE PROFILE ───────────────────────────────────────────────────────

async function updateProfile(req, res) {
  try {
    const { userId } = req.auth || {};
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const existing = await BusinessProfile.findOne({ owner: userId });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    const body = req.body || {};
    const fileUrls = uploadedFilesToUrls(req);

    const update = {};
    if (body.businessName !== undefined) update.businessName = body.businessName;
    if (body.email !== undefined) update.email = body.email;
    if (body.address !== undefined) update.address = body.address;
    if (body.phone !== undefined) update.phone = body.phone;
    if (body.gst !== undefined) update.gst = body.gst;
    if (body.notes !== undefined) update.notes = body.notes;

    if (fileUrls.logoUrl) update.logoUrl = fileUrls.logoUrl;
    else if (body.logoUrl !== undefined) update.logoUrl = body.logoUrl;

    if (fileUrls.stampUrl) update.stampUrl = fileUrls.stampUrl;
    else if (body.stampUrl !== undefined) update.stampUrl = body.stampUrl;

    if (fileUrls.signatureUrl) update.signatureUrl = fileUrls.signatureUrl;
    else if (body.signatureUrl !== undefined) update.signatureUrl = body.signatureUrl;

    if (body.signatureOwnerName !== undefined)
      update.signatureOwnerName = body.signatureOwnerName;
    if (body.signatureOwnerTitle !== undefined)
      update.signatureOwnerTitle = body.signatureOwnerTitle;
    if (body.defaultTaxPercent !== undefined)
      update.defaultTaxPercent = Number(body.defaultTaxPercent);

    const saved = await BusinessProfile.findByIdAndUpdate(
      existing._id,
      { $set: update },
      { new: true, runValidators: true }
    );

    return res.json({ success: true, message: "Profile updated", data: saved });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { getMyProfile, createProfile, updateProfile };
