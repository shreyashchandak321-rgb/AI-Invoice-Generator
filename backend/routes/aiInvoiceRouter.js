const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const router = express.Router();

// ── Auth middleware (dev-friendly) ──────────────────────────────────────

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

// ── Gemini setup ─────────────────────────────────────────────────────────

const API_KEY = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0",
];

// ── Prompt builder ───────────────────────────────────────────────────────

function buildInvoicePrompt(promptText) {
  const invoiceTemplate = {
    invoiceNumber: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    fromBusinessName: "",
    fromEmail: "",
    fromAddress: "",
    fromPhone: "",
    fromGst: "",
    client: { name: "", email: "", address: "", phone: "" },
    items: [{ id: "1", description: "", qty: 1, unitPrice: 0 }],
    taxPercent: 18,
    notes: "",
  };

  return `
You are an invoice generation assistant.

Task:
  - Analyze the user's input text and produce a valid JSON object only (no explanatory text).
  - The JSON MUST match the schema below (include all fields even if empty).
  - Ensure all dates are ISO 'YYYY-MM-DD' strings and numeric fields are numbers.
  - Items array must have at least one item with id, description, qty, unitPrice.

Schema:
${JSON.stringify(invoiceTemplate, null, 2)}

User input:
${promptText}

Output: valid JSON only (no surrounding code fences, no commentary).
`;
}

// ── Model caller ─────────────────────────────────────────────────────────

async function tryGenerateWithModel(modelName, prompt) {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
  });

  let text =
    (response && typeof response.text === "string" && response.text) ||
    (response &&
      response.output &&
      Array.isArray(response.output) &&
      response.output[0] &&
      response.output[0].content &&
      Array.isArray(response.output[0].content) &&
      response.output[0].content[0] &&
      response.output[0].content[0].text) ||
    (response &&
      response.outputs &&
      Array.isArray(response.outputs) &&
      response.outputs[0] &&
      (response.outputs[0].text || response.outputs[0].content)) ||
    null;

  if (!text && response && Array.isArray(response.outputs)) {
    const joined = response.outputs
      .map((o) => {
        if (!o) return "";
        if (typeof o === "string") return o;
        if (typeof o.text === "string") return o.text;
        if (Array.isArray(o.content)) {
          return o.content.map((c) => (c && c.text) || "").join("\n");
        }
        return JSON.stringify(o);
      })
      .filter(Boolean)
      .join("\n\n");
    if (joined) text = joined;
  }

  if (!text && response) {
    try {
      text = JSON.stringify(response);
    } catch {
      text = String(response);
    }
  }

  if (!text || !String(text).trim()) {
    throw new Error("Empty text returned from model");
  }
  return { text: String(text).trim(), modelName };
}

// ── Route ────────────────────────────────────────────────────────────────

router.post("/generate", clerkAuth, async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || !String(prompt).trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Prompt is required" });
    }

    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key not configured",
      });
    }

    const fullPrompt = buildInvoicePrompt(prompt);

    let lastErr = null;
    let lastText = null;
    let usedModel = null;

    for (const m of MODEL_CANDIDATES) {
      try {
        const { text, modelName } = await tryGenerateWithModel(m, fullPrompt);
        lastText = text;
        usedModel = modelName;
        if (text && text.trim()) break;
      } catch (err) {
        console.warn(`Model ${m} failed:`, err?.message || err);
        lastErr = err;
        continue;
      }
    }

    if (!lastText) {
      const errMsg =
        (lastErr && lastErr.message) ||
        "All candidate models failed. Check API key, network, or model availability.";
      console.error("AI generation failed (no text):", errMsg);
      return res.status(502).json({
        success: false,
        message: "AI generation failed",
        detail: errMsg,
      });
    }

    const text = lastText.trim();
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      console.error("AI response did not contain JSON object:", {
        usedModel,
        text,
      });
      return res.status(502).json({
        success: false,
        message: "AI returned malformed response (no JSON found)",
        raw: text,
        model: usedModel,
      });
    }

    const jsonStr = text.substring(firstBrace, lastBrace + 1);
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("Failed to parse AI JSON:", parseErr.message, jsonStr);
      return res.status(502).json({
        success: false,
        message: "AI returned invalid JSON",
        raw: jsonStr,
        model: usedModel,
      });
    }

    return res.json({
      success: true,
      data: parsed,
      model: usedModel,
    });
  } catch (err) {
    console.error("AI generate error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
