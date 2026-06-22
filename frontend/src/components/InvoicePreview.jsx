import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSafeAuth } from "../hooks/useSafeAuth";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import { invoicePreviewStyles } from "../assets/dummyStyles";

import { API_BASE } from "../config";

const currencySymbol = (code) => {
  const symbols = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
  return symbols[code] || code + " ";
};

export default function InvoicePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useSafeAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiBase = API_BASE; // eslint-disable-line no-unused-vars

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/invoices/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Invoice not found");
        const json = await res.json();
        setInvoice(json?.data ?? json);
      } catch (err) {
        toast.error(err.message);
        navigate("/invoices");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, getToken, navigate]);

  const fmtDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    if (!invoice) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const margin = 40;
    const rightX = pw - margin;
    let y = 50;

    const cur = currencySymbol(invoice.currency);
    const items = invoice.items || [];
    const sub = invoice.subtotal || items.reduce((s, i) => s + (i.qty || 1) * (i.unitPrice || 0), 0);
    const taxAmt = invoice.tax || 0;
    const total = invoice.total || sub + taxAmt;

    // ── Top accent bar ──
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pw, 6, "F");
    y = 40;

    // ── INVOICE FROM (left) ──
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("INVOICE FROM", margin, y);
    y += 14;

    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, "bold");
    doc.text(invoice.fromBusinessName || "—", margin, y);
    y += 14;

    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    if (invoice.fromAddress) { doc.text(invoice.fromAddress, margin, y); y += 13; }

    const fromMeta = [];
    if (invoice.fromEmail) fromMeta.push(`Email: ${invoice.fromEmail}`);
    if (invoice.fromPhone) fromMeta.push(`Phone: ${invoice.fromPhone}`);
    if (invoice.fromGst) fromMeta.push(`GST: ${invoice.fromGst}`);
    if (fromMeta.length) {
      doc.setFontSize(9);
      doc.text(fromMeta.join("   "), margin, y);
      y += 13;
    }
    y += 10;

    // ── INVOICE title (right) ──
    doc.setFontSize(28);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, "bold");
    doc.text("INVOICE", rightX, 60, { align: "right" });

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`#${invoice.invoiceNumber}`, rightX, 76, { align: "right" });

    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    let metaY = 92;
    doc.text(`Invoice Date:  ${fmtDate(invoice.issueDate || invoice.createdAt)}`, rightX, metaY, { align: "right" });
    metaY += 15;
    doc.text(`Due Date:  ${fmtDate(invoice.dueDate) || "—"}`, rightX, metaY, { align: "right" });
    metaY += 15;
    doc.text(`Status:  ${(invoice.status || "draft").toUpperCase()}`, rightX, metaY, { align: "right" });

    // ── Divider ──
    y = Math.max(y, metaY) + 18;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, y, rightX, y);
    y += 20;

    // ── BILL TO (left) ──
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("BILL TO", margin, y);
    y += 14;

    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, "bold");
    doc.text(invoice.client?.name || "—", margin, y);
    y += 14;

    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    if (invoice.client?.address) { doc.text(invoice.client.address, margin, y); y += 13; }
    if (invoice.client?.email) { doc.text(invoice.client.email, margin, y); y += 13; }
    if (invoice.client?.phone) { doc.text(invoice.client.phone, margin, y); y += 13; }

    // ── PAYMENT DETAILS (right) ──
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("PAYMENT DETAILS", pw / 2 + 20, y - (invoice.client?.phone ? 13 : invoice.client?.email ? 26 : invoice.client?.address ? 39 : 0));

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Currency:  ${invoice.currency || "INR"}`, pw / 2 + 20, y - (invoice.client?.phone ? 0 : invoice.client?.email ? 13 : invoice.client?.address ? 26 : 0));

    y += 18;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, rightX, y);
    y += 20;

    // ── Items table ──
    const colDesc = margin;
    const colQty = pw - 195;
    const colUnit = pw - 140;
    const colTotal = pw - margin;

    // Table header
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y - 5, pw - 2 * margin, 22, "F");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.setFont(undefined, "bold");
    doc.text("Description", colDesc + 5, y + 10);
    doc.text("Qty", colQty + 10, y + 10, { align: "center" });
    doc.text("Unit Price", colUnit + 15, y + 10, { align: "center" });
    doc.text("Total", colTotal - 5, y + 10, { align: "right" });
    y += 28;

    // Table rows
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    items.forEach((item, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, y - 5, pw - 2 * margin, 20, "F");
      }
      doc.setTextColor(50, 50, 50);
      doc.text(item.description || "—", colDesc + 5, y + 8);
      doc.text(String(item.qty || 1), colQty + 10, y + 8, { align: "center" });
      doc.text(`${cur}${(item.unitPrice || 0).toFixed(2)}`, colUnit + 15, y + 8, { align: "center" });
      doc.text(`${cur}${((item.qty || 1) * (item.unitPrice || 0)).toFixed(2)}`, colTotal - 5, y + 8, { align: "right" });
      y += 20;
    });

    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, rightX, y);
    y += 30;

    // ── Signatures (left) + Totals (right) ──
    // Signatures
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("AUTHORIZED SIGNATURE", margin, y);
    doc.text("COMPANY STAMP", margin + 170, y);
    y += 40;

    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + 130, y);
    doc.line(margin + 170, y, margin + 280, y);
    y += 14;
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    if (invoice.signatureName) doc.text(invoice.signatureName, margin, y);
    if (invoice.signatureTitle) doc.text(invoice.signatureTitle, margin, y + 12);

    // Totals (right side)
    let ty = y - 52;
    const totalsX = pw - margin - 170;
    const valX = rightX;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.setFont(undefined, "normal");
    doc.text("Subtotal", totalsX, ty);
    doc.text(`${cur}${sub.toFixed(2)}`, valX, ty, { align: "right" });
    ty += 18;

    if (taxAmt > 0) {
      doc.text(`Tax (${invoice.taxPercent || 0}%)`, totalsX, ty);
      doc.text(`${cur}${taxAmt.toFixed(2)}`, valX, ty, { align: "right" });
      ty += 18;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(totalsX, ty - 4, valX, ty - 4);
    ty += 10;

    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, "bold");
    doc.text("Total Amount", totalsX, ty);
    doc.setTextColor(59, 130, 246);
    doc.text(`${cur}${total.toFixed(2)}`, valX, ty, { align: "right" });

    // ── Thank you ──
    y += 40;
    doc.setFont(undefined, "italic");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("Thank you for your business!", pw / 2, y, { align: "center" });
    y += 16;

    // ── Footer ──
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(`Invoice generated by InvoiceAI • ${fmtDate(new Date())}`, pw / 2, y, { align: "center" });

    doc.save(`Invoice-${invoice.invoiceNumber || invoice._id}.pdf`);
    toast.success("PDF downloaded!");
  };

  const statusColor = {
    draft: "bg-gray-100 text-gray-700",
    unpaid: "bg-amber-100 text-amber-700",
    paid: "bg-emerald-100 text-emerald-700",
    overdue: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!invoice) return null;

  const items = invoice.items || [];
  const sub = invoice.subtotal || items.reduce((s, i) => s + (i.qty || 1) * (i.unitPrice || 0), 0);
  const taxAmt = invoice.tax || 0;
  const total = invoice.total || sub + taxAmt;
  const cur = currencySymbol(invoice.currency);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      {/* Action bar */}
      <div className="flex items-center justify-between mb-6 no-print">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back
        </button>
        <div className="flex gap-3">
          <button onClick={handlePrint} className={invoicePreviewStyles.printButton}>
            🖨️ Print
          </button>
          <button onClick={handleDownloadPDF} className={invoicePreviewStyles.downloadButton}>
            📥 Download PDF
          </button>
        </div>
      </div>

      {/* Invoice paper */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-10 print:shadow-none">

        {/* ── INVOICE FROM + INVOICE header ── */}
        <div className="flex flex-col sm:flex-row justify-between gap-8 mb-8">
          {/* FROM section */}
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">
              Invoice From
            </h3>
            <div className="space-y-1">
              <p className="text-base font-bold text-gray-900">{invoice.fromBusinessName || "—"}</p>
              <p className="text-sm text-gray-600">{invoice.fromAddress || "—"}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                {invoice.fromEmail && <span>✉ {invoice.fromEmail}</span>}
                {invoice.fromPhone && <span>📞 {invoice.fromPhone}</span>}
                {invoice.fromGst && <span>GST: {invoice.fromGst}</span>}
              </div>
            </div>
          </div>

          {/* INVOICE title + meta */}
          <div className="text-right flex-shrink-0">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-1">INVOICE</h1>
            <p className="text-lg font-semibold text-gray-700 mb-4">#{invoice.invoiceNumber}</p>

            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-800">Invoice Date: </span>
                {fmtDate(invoice.issueDate || invoice.createdAt)}
              </p>
              {invoice.dueDate && (
                <p>
                  <span className="font-medium text-gray-800">Due Date: </span>
                  {fmtDate(invoice.dueDate)}
                </p>
              )}
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColor[invoice.status] || ""}`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── BILL TO + PAYMENT DETAILS ── */}
        <div className="flex flex-col sm:flex-row justify-between gap-8 mb-8">
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">
              Bill To
            </h3>
            <div className="space-y-1">
              <p className="text-base font-bold text-gray-900">{invoice.client?.name || "—"}</p>
              <p className="text-sm text-gray-600">{invoice.client?.address || "—"}</p>
              {invoice.client?.email && <p className="text-sm text-gray-600">✉ {invoice.client.email}</p>}
              {invoice.client?.phone && <p className="text-sm text-gray-600">📞 {invoice.client.phone}</p>}
            </div>
          </div>

          <div className="flex-shrink-0 text-right">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">
              Payment Details
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium text-gray-800">Currency: </span>{invoice.currency || "INR"}</p>
              <p><span className="font-medium text-gray-800">Payment Status: </span><span className="capitalize">{invoice.status}</span></p>
            </div>
          </div>
        </div>

        {/* ── Items table ── */}
        <div className="mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 w-20">Quantity</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 w-28">Unit Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id || i} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-800">{item.description || "—"}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{item.qty || 1}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{cur}{(item.unitPrice || 0).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                      {cur}{((item.qty || 1) * (item.unitPrice || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400 italic">No items</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Signatures + Totals ── */}
        <div className="flex flex-col sm:flex-row justify-between gap-8 mb-8">
          {/* Signature / Stamp placeholders */}
          <div className="flex gap-10">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">Authorized Signature</p>
              {invoice.signatureDataUrl ? (
                <img src={invoice.signatureDataUrl} alt="Signature" className="h-12 object-contain" />
              ) : (
                <div className="w-40 border-b border-gray-300" />
              )}
              {invoice.signatureName && (
                <p className="text-sm text-gray-700 mt-2">{invoice.signatureName}</p>
              )}
              {invoice.signatureTitle && (
                <p className="text-xs text-gray-500">{invoice.signatureTitle}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">Company Stamp</p>
              {invoice.stampDataUrl ? (
                <img src={invoice.stampDataUrl} alt="Stamp" className="h-16 object-contain" />
              ) : (
                <div className="w-32 h-20 border border-dashed border-gray-300 rounded" />
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="w-full sm:w-64">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-800">{cur}{sub.toFixed(2)}</span>
            </div>
            {taxAmt > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Tax ({invoice.taxPercent || 0}%)</span>
                <span className="font-medium text-gray-800">{cur}{taxAmt.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 text-lg font-bold">
              <span className="text-gray-900">Total Amount</span>
              <span className="text-blue-600">{cur}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ── Thank you note ── */}
        {invoice.notes && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Notes</p>
            <p className="text-gray-600 text-sm">{invoice.notes}</p>
          </div>
        )}

        <p className="text-sm text-gray-500 italic text-center">Thank you for your business!</p>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 mt-6">
        Invoice generated by InvoiceAI • {fmtDate(new Date())}
      </p>
    </div>
  );
}
