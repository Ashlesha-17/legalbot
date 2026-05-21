import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // optional: if you have a User model
      required: true,
    },
    sessionId: {
      type: String,
      required: true, // all messages in one chat session share this
    },
    role: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },
    message: {
      type: String,
      required: true, // OCR text or user/AI message
    },
    imageUrl: {
      type: String, // Path or URL of uploaded file (if any)
      default: null,
    },
    fileName: {
      type: String, // Original uploaded file name (optional)
      default: null,
    },
    fileType: {
      type: String, // MIME type of uploaded file (optional)
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", ConversationSchema);
