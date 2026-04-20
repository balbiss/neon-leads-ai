import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Configurações — Visita IA Leads" }] }),
  component: SettingsPage,
});

const inputCls =
  "w-full rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-3 py-2.5 text-sm text-foreground focus:border-[color:var(--neon)]/50 focus:outline-none";

function SettingsPage() {
  const [show, setShow] = useState(false);
  const used = 6420;
  const limit = 10000;
  const pct = Math.min(100, (used / limit) * 100);

  return (
    <AppLayout title="Configurações" subtitle="Conta, plano e integrações">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-xl border border-[color:var(--border)] bg-[#141414] p-6">
          <h3 className="mb-4 text-sm font-semibold">Perfil</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label-caps">Nome</label>
              <input className={`mt-1.5 ${inputCls}`} defaultValue="João Silva" />
            </div>
            <div>
              <label className="label-caps">Email</label>
              <input className={`mt-1.5 ${inputCls}`} defaultValue="joao@email.com" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[color:var(--border)] bg-[#141414] p-6">
          <h3 className="mb-4 text-sm font-semibold">Integração Apify</h3>
          <label className="label-caps">API Key</label>
          <div className="relative mt-1.5">
            <input
              type={show ? "text" : "password"}
              className={`${inputCls} pr-10`}
              defaultValue="apify_api_xxxxxxxxxxxxxxxxxxxxxxxxx"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[color:var(--border)] bg-[#141414] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Plano Atual</h3>
              <p className="text-xs text-muted-foreground">PRO — renovação em 12/02</p>
            </div>
            <button className="rounded-lg bg-[color:var(--neon)] px-4 py-2 text-sm font-semibold text-black hover:bg-[color:var(--neon-soft)]">
              Fazer upgrade
            </button>
          </div>
          <div className="mt-5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Créditos usados</span>
              <span>{used.toLocaleString()} / {limit.toLocaleString()}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#1a1a1a]">
              <div className="h-full rounded-full bg-[color:var(--neon)] transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <h3 className="text-sm font-semibold text-destructive">Zona de perigo</h3>
          <p className="mt-1 text-xs text-muted-foreground">Esta ação é permanente e não poderá ser desfeita.</p>
          <button className="mt-4 inline-flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/15 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/25">
            <Trash2 className="h-4 w-4" /> Deletar conta
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
