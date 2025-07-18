"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.username || !form.email || !form.password) {
      setError("Preencha todos os campos.");
      setLoading(false);
      return;
    }

    if (form.password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({ user_id: user.id, username: form.username });

      if (profileError) {
        setError("Erro ao salvar perfil: " + profileError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            placeholder="Nome de usuário"
            value={form.username}
            onChange={handleChange}
            className="input bg-blue-50"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="input bg-blue-50"
          />
          <input
            name="password"
            type="password"
            placeholder="Senha"
            value={form.password}
            onChange={handleChange}
            className="input bg-blue-50"
          />
          {error && <div className="text-red-500 text-center">{error}</div>}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
        <div className="flex flex-col items-center space-y-2 text-sm text-blue-700">
          <Link href="/login" className="hover:underline">Já tem conta? Entrar</Link>
          <Link href="/esqueci-senha" className="hover:underline">Esqueci minha senha</Link>
          <Link href="/alterar-senha" className="hover:underline">Alterar senha</Link>
        </div>
      </div>
    </div>
  );
} 