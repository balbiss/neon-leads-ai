import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Criar conta — Visita IA Leads" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Conta criada! Verifique seu email.");
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-[#141414] p-8 shadow-2xl">
          <h1 className="text-xl font-semibold">Criar conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Comece a extrair leads em minutos</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label-caps">Nome completo</label>
              <input 
                name="name" 
                required 
                className="mt-1.5 w-full rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-3 py-2.5 text-sm focus:border-[color:var(--neon)]/50 focus:outline-none" 
                placeholder="Seu Nome"
              />
            </div>
            <div>
              <label className="label-caps">Email</label>
              <input 
                type="email" 
                name="email" 
                required 
                className="mt-1.5 w-full rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-3 py-2.5 text-sm focus:border-[color:var(--neon)]/50 focus:outline-none" 
                placeholder="voce@email.com"
              />
            </div>
            <div>
              <label className="label-caps">Senha</label>
              <input 
                type="password" 
                name="password" 
                required 
                className="mt-1.5 w-full rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-3 py-2.5 text-sm focus:border-[color:var(--neon)]/50 focus:outline-none" 
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-lg bg-[color:var(--neon)] py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[color:var(--neon-soft)] disabled:opacity-60"
            >
              {loading ? "Criando..." : "Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta? <Link to="/login" className="neon-text hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
