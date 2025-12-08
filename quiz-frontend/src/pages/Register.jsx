import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { GoogleLogin } from "@react-oauth/google";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (localStorage.getItem("token")) {
    navigate("/dashboard");
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/accounts/register/", {
        name,
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Registration failed. Try a different email.");
    }
  }

  function handleGoogleSignup(cred) {
    api
      .post("/accounts/google-login/", {
        credential: cred.credential,
      })
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      })
      .catch(() => alert("Google Sign-Up failed"));
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Create Account</h2>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Register</button>
        </form>

        <div className="divider">OR</div>

        <div className="google-wrap">
          <GoogleLogin
            onSuccess={handleGoogleSignup}
            onError={() => alert("Google sign-up error")}
          />
        </div>

        <p className="login-text">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
