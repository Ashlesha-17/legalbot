import express from "express";
import Conversation from "../models/Conversation.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to extract userId from JWT
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// GET /api/conversations => fetch all conversations for logged-in user
router.get("/", authenticate, async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.userId }).sort({ createdAt: 1 });
    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/conversations => create a new conversation
router.post("/", authenticate, async (req, res) => {
  try {
    const { messages } = req.body; // messages can be empty or an array
    const conversation = new Conversation({
      userId: req.userId,
      messages: messages || [],
    });
    await conversation.save();
    res.status(201).json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Optional: GET /api/conversations/:id => fetch single conversation by ID (only if belongs to user)
router.get("/:id", authenticate, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, userId: req.userId });
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    res.json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
