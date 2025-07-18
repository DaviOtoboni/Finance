"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.email || !form.password) {
      setError("Preencha todos os campos.");
      setLoading(false);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Alternar tema"
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-8 rounded shadow">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="input bg-blue-50 dark:bg-zinc-900 dark:text-foreground"
          />
          <input
            name="password"
            type="password"
            placeholder="Senha"
            value={form.password}
            onChange={handleChange}
            className="input bg-blue-50 dark:bg-zinc-900 dark:text-foreground"
          />
          {error && <div className="text-red-500 text-center">{error}</div>}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <div className="flex flex-col items-center space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <Link href="/signup" className="hover:underline">Criar nova conta</Link>
          <Link href="/esqueci-senha" className="hover:underline">Esqueci minha senha</Link>
          <Link href="/alterar-senha" className="hover:underline">Alterar senha</Link>
        </div>
      </div>
    </div>
  );
} 