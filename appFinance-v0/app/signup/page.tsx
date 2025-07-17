"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 space-y-4">
      <input
        name="username"
        placeholder="Nome de usuário"
        value={form.username}
        onChange={handleChange}
        className="input"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="input"
      />
      <input
        name="password"
        type="password"
        placeholder="Senha"
        value={form.password}
        onChange={handleChange}
        className="input"
      />
      {error && <div className="text-red-500">{error}</div>}
      <button type="submit" className="btn" disabled={loading}>
        {loading ? "Cadastrando..." : "Cadastrar"}
      </button>
    </form>
  );
} 