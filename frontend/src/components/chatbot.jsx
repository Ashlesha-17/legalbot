import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import "./chatbot.css";

function Chatbot() {
  const [conversations, setConversations] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [currentChat, setCurrentChat] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");

  // Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => setInput(event.results[0][0].transcript);
    recognition.onerror = (event) => console.error("Voice recognition error:", event.error);
  }

  // Auto-scroll
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [currentChat]);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/conversations", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const convArray = Object.entries(
          res.data.reduce((acc, msg) => {
            if (!acc[msg.sessionId]) acc[msg.sessionId] = [];
            acc[msg.sessionId].push(msg);
            return acc;
          }, {})
        ).map(([sessionId, messages]) => ({
          sessionId,
          messages: messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
        }));

        setConversations(
          convArray.sort(
            (a, b) =>
              new Date(b.messages[b.messages.length - 1].createdAt) -
              new Date(a.messages[a.messages.length - 1].createdAt)
          )
        );
      } catch (err) {
        console.error("Failed to load conversations", err);
      }
    };
    loadConversations();
  }, [token]);

  // Start new chat
  const startNewChat = () => {
    const newSessionId = uuidv4();
    setConversations((prev) => [{ sessionId: newSessionId, messages: [] }, ...prev]);
    setCurrentSessionId(newSessionId);
    setCurrentChat([]);
  };
  useEffect(() => startNewChat(), []);

  const appendMessage = (message) => {
    setCurrentChat((prev) => [...prev, message]);
    setConversations((prev) =>
      prev.map((conv) =>
        conv.sessionId === currentSessionId
          ? { ...conv, messages: [...conv.messages, message] }
          : conv
      )
    );
  };

  // Send text message
  const sendMessage = async () => {
    if (!input.trim()) return;
    appendMessage({ role: "user", message: input });
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/chat",
        { message: input, sessionId: currentSessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      appendMessage({ role: "ai", message: res.data.response || "No response from AI" });
    } catch (err) {
      console.error(err);
      appendMessage({ role: "ai", message: "Failed to send message" });
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  // File upload
  const handleFileUpload = async (files) => {
    if (!files?.length) return;

    for (const file of files) {
      appendMessage({ role: "user", message: `Uploading ${file.name}...` });

      const formData = new FormData();
      formData.append("file", file);

      try {
        // Correct URL: /api/upload/:sessionId
        const res = await axios.post(
          `http://localhost:5000/api/upload/${currentSessionId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { file: fileInfo } = res.data;

        appendMessage({
          role: "user",
          // message: `${fileInfo.name} uploaded successfully.`,
          file: fileInfo,
        });

        // Ask AI to respond based on uploaded document
        const aiRes = await axios.post(
          "http://localhost:5000/api/chat",
          { message: "Please respond based on the uploaded document.", sessionId: currentSessionId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        appendMessage({ role: "ai", message: aiRes.data.response || "No response from AI" });

      } catch (err) {
        console.error("File upload error:", err);
        appendMessage({ role: "ai", message: `Failed to upload ${file.name}` });
      }
    }
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") sendMessage(); };

  return (
    <div className="chatbot-container">
      {!sidebarOpen && (
        <button className="toggle-sidebar-btn" onClick={() => setSidebarOpen(true)}>☰</button>
      )}

      {sidebarOpen && (
        <div className="sidebar">
          <div className="sidebar-header">
            <button className="new-chat-btn" onClick={startNewChat}>+ New Chat</button>
            <button className="close-sidebar-btn" onClick={() => setSidebarOpen(false)}>×</button>
          </div>
          {conversations.map((conv) => (
            <div
              key={conv.sessionId}
              className={`chat-item ${conv.sessionId === currentSessionId ? "active" : ""}`}
              onClick={() => {
                setCurrentSessionId(conv.sessionId);
                setCurrentChat(conv.messages);
              }}
            >
              {conv.messages?.[0]?.message || "New Chat"}
            </div>
          ))}
        </div>
      )}

      <div className={`chatbox ${sidebarOpen ? "" : "centered"}`}>
        <div className="messages">
          {currentChat.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              {msg.file ? (
                <div className="file-preview">
                  <p>{msg.message}</p>
                  {msg.file.mimetype.startsWith("image/") ? (
                    <img
                      src={`http://localhost:5000${msg.file.url}`}
                      alt={msg.file.name}
                      className="uploaded-image-preview"
                    />
                  ) : (
                    <a href={`http://localhost:5000${msg.file.url}`} target="_blank" rel="noopener noreferrer">
                      View PDF ({msg.file.name})
                    </a>
                  )}
                </div>
              ) : msg.role === "ai" ? (
                <div className="ai-message"><ReactMarkdown>{msg.message}</ReactMarkdown></div>
              ) : (
                <p>{msg.message}</p>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <label className="upload-btn">
            📎
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              multiple
              style={{ display: "none" }}
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </label>
          <input
            type="text"
            placeholder="Ask your legal query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button onClick={() => recognition?.start()} className={listening ? "listening" : ""}>🎙️</button>
          <button onClick={sendMessage} disabled={loading}>{loading ? "Sending..." : "Send"}</button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
