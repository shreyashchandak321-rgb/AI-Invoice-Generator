import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { aiInvoiceModalStyles as s } from "../assets/dummyStyles";
import { API_BASE } from "../config";

export default function AiInvoiceModal({ open, onClose, onGenerate, initialText = "" }) {
  const [prompt, setPrompt] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setPrompt(initialText);
      setError("");
    }
  }, [open, initialText]);

  if (!open) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please describe the invoice you want to create.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/api/ai/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt.trim() }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || json?.detail || "Failed to generate invoice");
      }
      toast.success("Invoice generated!");
      onGenerate?.(json);
      onClose?.();
    } catch (err) {
      setError(err.message || "Something went wrong");
      toast.error(err.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError("");
      onClose?.();
    }
  };

  return (
    <div className={s.overlay} onClick={handleClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.header}>
          <h2 className={s.title}>AI Invoice Generator</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors text-lg font-bold leading-none disabled:opacity-50"
            aria-label="Close"
          >
            &times;
          </button>
          <p className={s.subtitle}>
            Describe your invoice in plain English and let AI create it for you.
          </p>
        </div>

        <textarea
          className={s.textarea}
          rows={4}
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); setError(""); }}
          placeholder='e.g. "Create a $500 invoice for web design services for Acme Corp due in 30 days"'
        />

        {error && <p className={s.error}>{error}</p>}

        <div className={s.actions}>
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className={s.generateButton}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </span>
            ) : (
              "Generate Invoice"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
