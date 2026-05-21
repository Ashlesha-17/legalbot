import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Tesseract from "tesseract.js";
import { fromPath } from "pdf2pic";
import jwt from "jsonwebtoken";
import Conversation from "../models/Conversation.js";
import fetch from "node-fetch"; // for calling chat endpoint

const router = express.Router();

// Ensure uploads folders exist
const uploadsDir = "./uploads";
const pdfPagesDir = path.join(uploadsDir, "pdf_pages");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(pdfPagesDir)) fs.mkdirSync(pdfPagesDir, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Utility: clean OCR text
function cleanText(text) {
  return text.replace(/\s+/g, " ").trim();
}

// OCR: Image
async function extractImageText(filePath) {
  try {
    const result = await Tesseract.recognize(filePath, "eng");
    return cleanText(result.data.text);
  } catch (err) {
    console.error("Tesseract OCR failed:", err);
    return "";
  }
}

// OCR: PDF → PNG → OCR
async function extractPdfText(pdfPath) {
  const converter = fromPath(pdfPath, {
    density: 250,
    saveFilename: "page",
    savePath: pdfPagesDir,
    format: "png",
  });

  const pages = await converter.bulk(-1);
  let finalText = "";

  for (const page of pages) {
    const imgPath = path.join(pdfPagesDir, page.name);
    const pageText = await extractImageText(imgPath);
    finalText += "\n" + pageText;

    fs.unlink(imgPath, (err) => {
      if (err) console.error("Failed to delete temp PDF page image:", err);
    });
  }

  return cleanText(finalText);
}

// Upload route
router.post("/:sessionId", upload.single("file"), async (req, res) => {
  const { sessionId } = req.params;
  let userId = null;

  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      console.log("Invalid token, userId will be null");
    }
  }

  if (!req.file) return res.status(400).json({ response: "No file uploaded" });

  const filePath = req.file.path;

  try {
    let extractedText = "";

    if (req.file.mimetype.startsWith("image/")) {
      extractedText = await extractImageText(filePath);
    } else if (req.file.mimetype === "application/pdf") {
      extractedText = await extractPdfText(filePath);
    } else {
      return res.status(400).json({ response: "Unsupported file type" });
    }

    // Save OCR text as a Conversation message
    const newMessage = new Conversation({
      userId,
      sessionId,
      role: "user",
      message: extractedText || "(Image uploaded, no text found)",
      imageUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
    });

    await newMessage.save();
    console.log(`Saved OCR message for session ${sessionId}`);

    // --- CALL AI AUTOMATICALLY ---
    const chatRes = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: {
        Authorization: authHeader || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: extractedText,
        sessionId,
      }),
    });
    const chatData = await chatRes.json();
    const aiResponse = chatData.response || "AI could not respond";

    return res.json({
      file: {
        name: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        mimetype: req.file.mimetype,
      },
      response: aiResponse, // AI response based on uploaded file
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ response: "Failed to process file" });
  }
});

export { router as uploadRouter };
