"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

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
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-8 rounded shadow">
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input bg-blue-50 dark:bg-zinc-900 dark:text-foreground"
          />
          {error && <div className="text-red-500 text-center">{error}</div>}
          {message && <div className="text-green-500 text-center">{message}</div>}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Enviando..." : "Enviar email de recuperação"}
          </button>
        </form>
        <div className="flex flex-col items-center space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <Link href="/alterar-senha" className="hover:underline">Alterar senha</Link>
        </div>
      </div>
    </div>
  );
} 