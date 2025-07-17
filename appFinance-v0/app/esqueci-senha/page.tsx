"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://finance-production-5d86.up.railway.app/alterar-senha",
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setMessage("Email de recuperação enviado!");
    setLoading(false);
    setEmail("");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 space-y-4">
      <input
        type="email"
        placeholder="Seu email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input"
      />
      {error && <div className="text-red-500">{error}</div>}
      {message && <div className="text-green-500">{message}</div>}
      <button type="submit" className="btn" disabled={loading}>
        {loading ? "Enviando..." : "Enviar email de recuperação"}
      </button>
    </form>
  );
} 