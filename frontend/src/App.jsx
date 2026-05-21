import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import Chatbot from "./components/chatbot.jsx"

function App() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />}/>
                <Route path="/signup" element={<Signup />}/>
                <Route path="/chatbot" element={<Chatbot />}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;