"use client";

import React, { useState } from "react";
import { useGlobal } from "@/app/context/GlobalContext";

export default function LoginPage() {
  const { login } = useGlobal();
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    const success = await login(phone, pass);
    if (!success) {
      setError("Invalid phone number or password. Please try again.");
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      width: "100%",
      background: "#f8fafc",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      <div
        className="card"
        style={{ maxWidth: "450px", width: "100%", padding: "40px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "var(--primary)",
              color: "white",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "24px",
              fontWeight: 800,
            }}
          >
            MS
          </div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "var(--text)",
            }}
          >
            Welcome Back
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>
            Log in to your Work Log monitoring account
          </p>
        </div>

        <div className="input-group">
          <label>Phone Number</label>
          <input
            type="tel"
            id="login-phone"
            placeholder="Enter your 10-digit number"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            id="login-password"
            placeholder="••••••••"
            required
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
        </div>

        {error && (
          <div style={{
            marginTop: "12px",
            padding: "10px 14px",
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            color: "#991b1b",
            fontSize: "13px",
            fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{
            width: "100%",
            marginTop: "12px",
            height: "48px",
            fontSize: "16px",
          }}
          onClick={handleLogin}
        >
          Sign In
        </button>

        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
            fontSize: "13px",
            color: "var(--muted)",
          }}
        >
          Don&apos;t have an account? Contact your Branch Officer.
        </div>
      </div>
    </div>
  );
}
