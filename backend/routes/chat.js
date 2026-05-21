import express from "express";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import Conversation from "../models/Conversation.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const HF_URL = "https://router.huggingface.co/v1/chat/completions";

// Utility: format AI response for readability
function formatAiMessage(text) {
  if (!text) return "";

  let formatted = text;

  // Numbered lists
  formatted = formatted.replace(/(\d+)\.\s+/g, "\n$1. ");

  // Bullets
  formatted = formatted.replace(/(\*|\-)\s+/g, "\n• ");

  // Add spacing between paragraphs
  formatted = formatted.replace(/\n{2,}/g, "\n\n");

  return formatted.trim();
}

// Helper: summarize OCR text using HF API
async function summarizeOCR(text) {
  try {
    const hfResponse = await fetch(HF_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful legal assistant. Summarize the following document text concisely:",
          },
          { role: "user", content: text },
        ],
        max_tokens: 500,
      }),
    });

    const data = await hfResponse.json();
    const summary = data.choices?.[0]?.message?.content || "";
    return summary.trim();
  } catch (err) {
    console.error("OCR summarization failed:", err);
    return text; // fallback to original text if summarization fails
  }
}

router.post("/", async (req, res) => {
  let { message, sessionId, userQuestion } = req.body;
  const authHeader = req.headers.authorization;

  if (!message?.trim() && !userQuestion)
    return res.status(400).json({ response: "No message provided" });

  let userId = null;
  if (authHeader) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      return res.status(401).json({ response: "Invalid token" });
    }
  }

  if (!sessionId) sessionId = uuidv4();
  const currentSessionId = sessionId;

  try {
    // Save user message if it's not a document question placeholder
    if (message) {
      await Conversation.create({
        userId,
        sessionId: currentSessionId,
        role: "user",
        message,
      });
    }

    // Fetch uploaded document messages (OCR text) for this session
    const documentMessages = await Conversation.find({
      sessionId: currentSessionId,
      role: "user",
      imageUrl: { $exists: true, $ne: null },
    }).sort({ createdAt: 1 });

    const useDocuments = documentMessages.length > 0;

    let systemMessage;
    let prompt;

    if (useDocuments) {
      // Only keep OCR messages with actual text
      const validOCRMessages = documentMessages
        .map((msg) => msg.message)
        .filter(
          (text) =>
            text &&
            text !== "(No text extracted)" &&
            text !== "(Image uploaded, no text found)"
        );

      let contextText = "";

      if (validOCRMessages.length > 0) {
        const combinedOCR = validOCRMessages.join("\n\n");
        contextText = await summarizeOCR(combinedOCR); // summarize only real OCR text
      } else {
        contextText =
          "(Document uploaded, but no text could be extracted from it.)";
      }

      console.log(
        `Using summarized documents for session ${currentSessionId}:`,
        contextText
      );

      systemMessage =
        "You are LegalBot. Only use uploaded documents to answer legal questions. If asked anything non-legal, politely refuse.";
      prompt = `Answer ONLY based on the uploaded documents below:\n\n${contextText}\n\nUser question: ${userQuestion || message}`;
    } else {
      systemMessage =
        "You are LegalBot. Answer legal questions professionally based on general legal knowledge. If asked non-legal, politely refuse.";
      prompt = userQuestion || message; // just the user question
    }

    // Call Hugging Face API
    const hfResponse = await fetch(HF_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
        max_tokens: 500,
      }),
    });

    const data = await hfResponse.json();
    let aiResponse =
      data.choices?.[0]?.message?.content || "No response from model";

    aiResponse = formatAiMessage(aiResponse);

    // Save AI response to MongoDB
    await Conversation.create({
      userId,
      sessionId: currentSessionId,
      role: "ai",
      message: aiResponse,
    });

    res.json({ response: aiResponse, sessionId: currentSessionId });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ response: "AI service unavailable" });
  }
});

export default router;
