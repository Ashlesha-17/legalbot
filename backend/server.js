import 'dotenv/config';
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js"; // text chat
import conversationRoutes from "./routes/conversation.js";
import { uploadRouter } from "./routes/upload.js"; // document/image upload
import path from "path";


// Check if HF API key is loaded
console.log("HF_API_KEY loaded:", process.env.HF_API_KEY ? "YES" : "NO");

const app = express();
app.use(express.json());
app.use(cors());

// Serve static uploaded files under /uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/upload", uploadRouter); // use named export

// Health check
app.get("/", (req, res) => {
  res.send("Legalbot backend is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
