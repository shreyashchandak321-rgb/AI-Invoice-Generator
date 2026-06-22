const express = require("express");
const multer = require("multer");
const path = require("path");
const BusinessProfile = require("../models/businessProfileModel");

const router = express.Router();

// ── Multer config ────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `business-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
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

    // Handle file uploads
    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        updateData.logoUrl = `/uploads/${req.files.logo[0].filename}`;
      }
      if (req.files.stamp && req.files.stamp[0]) {
        updateData.stampUrl = `/uploads/${req.files.stamp[0].filename}`;
      }
      if (req.files.signature && req.files.signature[0]) {
        updateData.signatureUrl = `/uploads/${req.files.signature[0].filename}`;
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
