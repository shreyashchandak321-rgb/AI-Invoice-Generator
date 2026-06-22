const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    owner: { type: String, default: "" },
    invoiceNumber: { type: String, required: true, unique: true },
    issueDate: { type: String, default: "" },
    dueDate: { type: String, default: "" },
    fromBusinessName: { type: String, default: "" },
    fromEmail: { type: String, default: "" },
    fromAddress: { type: String, default: "" },
    fromPhone: { type: String, default: "" },
    fromGst: { type: String, default: "" },
    client: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      address: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    items: [{ id: String, description: String, qty: Number, unitPrice: Number }],
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["draft", "unpaid", "paid", "overdue"],
      default: "draft",
    },
    logoDataUrl: { type: String, default: null },
    stampDataUrl: { type: String, default: null },
    signatureDataUrl: { type: String, default: null },
    signatureName: { type: String, default: "" },
    signatureTitle: { type: String, default: "" },
    taxPercent: { type: Number, default: 18 },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
