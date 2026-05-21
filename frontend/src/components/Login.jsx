import React, {useState} from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Login() {
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        
        try{
          const response = await axios.post("http://localhost:5000/api/auth/login", {email, password,});
          alert(response.data.message);
          console.log("User:", response.data.user);
          console.log("Token:", response.data.token);

          localStorage.setItem("token", response.data.token);

          window.location.href = "/chatbot";
        } catch(error) {
          console.error(error.response?.data || error.message);
          alert(error.response?.data?.message || "Login Failed!")
        }
        //backend
    };

    return (
        <div className="login-page">
            <div className="login-container">
            <h2>Legalbot Login</h2>
            <form onSubmit={handleLogin}>
                <input 
                    type="email"
                    placeholder="Enter your E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

<div className="password-container">
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

                <button type="submit">Login</button>
            </form>

            <p className="signuptext">
                Don’t have an account?{" "}
                <Link to="/signup" className="signup-link">
                Sign up here!
                </Link>
            </p>
        </div>
    </div>
    );
}

export default Login;