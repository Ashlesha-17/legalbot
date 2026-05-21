import React, { useState } from "react";
import axios from "axios";
import "./Signup.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        { name, email, password }
      );

      alert(response.data.message || "Signup Successful!");
      console.log("User registered:", response.data.user);

      window.location.href = "./chatbot";
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(error.response?.data?.message || "Signup Failed!");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2>Create an account</h2>

        <form onSubmit={handleSignup}>
          <input 
            type="text" 
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
          />

          <input 
            type="email" 
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🔓" : "🔒"}
            </span>
          </div>

          <button type="submit">Signup</button>
        </form>

        <p className="login-text">
          Already have an account?{" "}
          <a href="/Login" className="signup-link">
            Login here!
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
