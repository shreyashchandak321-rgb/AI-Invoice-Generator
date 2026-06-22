const express = require("express");
const multer = require("multer");
const {
  createInvoice,
  listInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
} = require("../controllers/invoiceController");

const router = express.Router();

// ── Auth middleware (dev-friendly) ──────────────────────────────────────

async function clerkAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ") && authHeader.length > 20) {
      // In production, verify the token with Clerk SDK
      // For now, just extract userId from the dev fallback
    }
    req.auth = { userId: "dev_user" };
    next();
  } catch (err) {
    console.error("Clerk auth error:", err.message);
    req.auth = { userId: "dev_user" };
    next();
  }
}

// ── Multer config (memory storage for Vercel serverless) ────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const uploadFields = upload.fields([
  { name: "logoName", maxCount: 1 },
  { name: "stampName", maxCount: 1 },
  { name: "signatureNameMeta", maxCount: 1 },
  { name: "logo", maxCount: 1 },
  { name: "stamp", maxCount: 1 },
  { name: "signature", maxCount: 1 },
]);

// ── Routes ───────────────────────────────────────────────────────────────

router.get("/", clerkAuth, listInvoices);
router.get("/:id", clerkAuth, getInvoice);
router.post("/", clerkAuth, uploadFields, createInvoice);
router.put("/:id", clerkAuth, uploadFields, updateInvoice);
router.delete("/:id", clerkAuth, deleteInvoice);

module.exports = router;
