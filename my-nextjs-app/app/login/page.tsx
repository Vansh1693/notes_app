"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (authType: "login" | "signup") => {
    setError("");
    setLoading(true);

    try {
      if (authType === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/notes");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Signup successful! Please check your email to confirm, then login.");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: "2rem auto",
      color: "white",
      backgroundColor: "#000",
      padding: "2rem",
      borderRadius: 8,
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
    }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Login / Signup</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          display: "block",
          marginBottom: "1rem",
          padding: "0.75rem",
          width: "100%",
          color: "black",
          border: "1px solid #ddd",
          borderRadius: "4px"
        }}
        disabled={loading}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          display: "block",
          marginBottom: "1.5rem",
          padding: "0.75rem",
          width: "100%",
          color: "black",
          border: "1px solid #ddd",
          borderRadius: "4px"
        }}
        disabled={loading}
      />

      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "1rem",
        marginTop: "1rem"
      }}>
        <button
          onClick={() => handleAuth("login")}
          style={{
            padding: "0.75rem 1.5rem",
            cursor: loading ? "not-allowed" : "pointer",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            opacity: loading ? 0.7 : 1,
            transition: "opacity 0.3s ease"
          }}
          disabled={loading}
        >
          {loading ? "Processing..." : "Login"}
        </button>
        <button
          onClick={() => handleAuth("signup")}
          style={{
            padding: "0.75rem 1.5rem",
            cursor: loading ? "not-allowed" : "pointer",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            opacity: loading ? 0.7 : 1,
            transition: "opacity 0.3s ease"
          }}
          disabled={loading}
        >
          Sign Up
        </button>
      </div>

      {error && (
        <p style={{
          color: "#ff6b6b",
          marginTop: "1.5rem",
          padding: "0.5rem",
          backgroundColor: "rgba(255, 0, 0, 0.1)",
          borderRadius: "4px",
          textAlign: "center"
        }}>
          {error}
        </p>
      )}
    </div>
  );
}
