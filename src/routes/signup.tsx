import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Criar conta — Visita IA Leads" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-[#141414] p-8">
          <h1 className="text-xl font-semibold">Criar conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Comece a extrair leads em minutos</p>

          <form
            onSubmit={(e) => { e.preventDefault(); navigate({ to: "/dashboard" }); }}
            className="mt-6 space-y-4"
          >
            <div>
              <label className="label-caps">Nome completo</label>
              <input className="mt-1.5 w-full rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-3 py-2.5 text-sm focus:border-[color:var(--neon)]/50 focus:outline-none" />
            </div>
            <div>
              <label className="label-caps">Email</label>
              <input type="email" className="mt-1.5 w-full rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-3 py-2.5 text-sm focus:border-[color:var(--neon)]/50 focus:outline-none" />
            </div>
            <div>
              <label className="label-caps">Senha</label>
              <input type="password" className="mt-1.5 w-full rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-3 py-2.5 text-sm focus:border-[color:var(--neon)]/50 focus:outline-none" />
            </div>
            <button type="submit" className="w-full rounded-lg bg-[color:var(--neon)] py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[color:var(--neon-soft)]">
              Criar conta
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
