# LegalBot – AI Legal Assistant (Full Stack)

An AI-powered legal assistant web application that allows users to chat with an AI lawyer, upload legal documents (PDF/images), extract text using OCR, and get intelligent responses powered by LLaMA 3 via Hugging Face API.

---

## ✨ Features

- **Authentication** – JWT-based signup/login system with secure password hashing (bcrypt)
- **AI Legal Chatbot** – Powered by Hugging Face LLaMA 3 with context-aware legal responses and session-based conversations
- **Document Intelligence** – Upload PDFs and images; OCR via Tesseract.js; AI automatically analyzes uploaded documents
- **Conversation History** – Persistent chat storage (MongoDB) with sidebar chat switching
- **Voice Input** – Speech-to-text input support
- **Auto AI Response** – AI responds immediately after file upload

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js | UI Framework |
| Axios | HTTP Client |
| React Router DOM | Routing |
| React Markdown | Markdown Rendering |
| Web Speech API | Voice Input |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | Server |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| multer | File Uploads |
| Tesseract.js | OCR |
| pdf2pic | PDF Processing |
| node-fetch | HTTP Requests |
| Hugging Face API | LLM Integration |

---

## 📁 Project Structure

```
project/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── .env
└── frontend/
    └── src/
        ├── components/
        ├── App.jsx
        ├── main.jsx
        └── public/
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
HF_API_KEY=your_huggingface_key
```

---

## 🚀 Run Locally

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/chat` | Send a chat message |
| GET | `/api/conversations` | Get conversation history |
| POST | `/api/upload/:sessionId` | Upload a document |

---

## 🔄 System Flow

1. User logs in → Starts a chat session
2. User sends a message **or** uploads a file
3. Backend extracts text (OCR if needed)
4. Hugging Face LLM processes the request
5. AI response is stored in MongoDB and displayed to the user
