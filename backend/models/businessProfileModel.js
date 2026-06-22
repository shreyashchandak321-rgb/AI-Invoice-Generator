const mongoose = require("mongoose");

const businessProfileSchema = new mongoose.Schema(
  {
    owner: { type: String, required: true, unique: true },
    businessName: { type: String, default: "ABC Solutions" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    gst: { type: String, default: "" },
    logoUrl: { type: String, default: null },
    stampUrl: { type: String, default: null },
    signatureUrl: { type: String, default: null },
    signatureOwnerName: { type: String, default: "" },
    signatureOwnerTitle: { type: String, default: "" },
    defaultTaxPercent: { type: Number, default: 18 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusinessProfile", businessProfileSchema);
