import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPage,
});

function ForgotPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-[#141414] p-8">
          <h1 className="text-xl font-semibold">Recuperar senha</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enviaremos um link para seu email</p>
          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="seu@email.com" className="w-full rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-3 py-2.5 text-sm focus:border-[color:var(--neon)]/50 focus:outline-none" />
            <button className="w-full rounded-lg bg-[color:var(--neon)] py-2.5 text-sm font-semibold text-black hover:bg-[color:var(--neon-soft)]">Enviar link</button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/login" className="neon-text hover:underline">Voltar ao login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
