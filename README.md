LegalBot – AI Legal Assistant (Full Stack)

An AI-powered legal assistant web application that allows users to chat with an AI lawyer, upload legal documents (PDF/images), extract text using OCR, and get intelligent responses powered by LLaMA 3 via Hugging Face API.

Features
Authentication
-JWT-based signup/login system
-Secure password hashing (bcrypt)
AI Legal Chatbot
-Powered by Hugging Face LLaMA 3
-Context-aware legal responses
-Session-based conversations
Document Intelligence
-Upload PDFs and images
-OCR using Tesseract.js
-AI automatically analyzes uploaded documents
Conversation History
-Persistent chat storage (MongoDB)
-Sidebar chat switching
Voice Input
-Speech-to-text input support
-Auto AI Response
-AI responds immediately after file upload

Tech Stack

Frontend
React.js
Axios
React Router DOM
React Markdown
Web Speech API

Backend
Node.js
Express.js
MongoDB + Mongoose
JWT Authentication
bcryptjs
multer
Tesseract.js
pdf2pic
node-fetch
Hugging Face API

Project Structure
project/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── public/

Environment Variables
backend/.env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
HF_API_KEY=your_huggingface_key


Run Project Locally
Backend
cd backend
npm install
npm start

Frontend
cd frontend
npm install
npm run dev

API Endpoints
Auth
  POST /api/auth/signup
  POST /api/auth/login
Chat
  POST /api/chat
Conversations
  GET /api/conversations
Upload
  POST /api/upload/:sessionId

System Flow
User logs in
Starts chat session
Sends message OR uploads file
Backend extracts text (OCR if needed)
Hugging Face LLM processes request
AI response stored + displayed
