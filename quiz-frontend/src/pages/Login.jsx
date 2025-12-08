import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (localStorage.getItem("token")) {
    navigate("/dashboard");
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/accounts/login/", {
        email: email,
        password: password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    }
  }

  function handleGoogleLogin(cred) {
    api
      .post("/accounts/google-login/", {
        credential: cred.credential,
      })
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      })
      .catch(() => alert("Google login failed"));
  }

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-logo">QuizGen</div>

        <div className="login-card">
          <h2>Welcome Back</h2>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleLogin}>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Login</button>
          </form>

          <div className="divider">OR</div>

          <div className="google-wrap">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => alert("Google login error")}
            />
          </div>

          <p className="login-text">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
