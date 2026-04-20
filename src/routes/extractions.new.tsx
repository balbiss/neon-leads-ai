import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Rocket } from "lucide-react";

export const Route = createFileRoute("/extractions/new")({
  head: () => ({ meta: [{ title: "Nova Extração — Visita IA Leads" }] }),
  component: NewExtractionPage,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-caps">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-3 py-2.5 text-sm text-foreground focus:border-[color:var(--neon)]/50 focus:outline-none";

function NewExtractionPage() {
  const navigate = useNavigate();
  return (
    <AppLayout title="Nova Extração" subtitle="Configure uma nova campanha de captura">
      <form
        onSubmit={(e) => { e.preventDefault(); navigate({ to: "/extractions" }); }}
        className="mx-auto max-w-3xl rounded-xl border border-[color:var(--border)] bg-[#141414] p-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Nome da extração">
            <input className={inputCls} placeholder="Ex: Imobiliárias SP Zona Sul" required />
          </Field>
          <Field label="Fonte">
            <select className={inputCls} required>
              <option>Google Maps</option>
              <option>VivaReal</option>
              <option>ZAP Imóveis</option>
              <option>Instagram</option>
            </select>
          </Field>
          <Field label="Cidade alvo">
            <input className={inputCls} placeholder="São Paulo" required />
          </Field>
          <Field label="Nicho / Categoria">
            <input className={inputCls} placeholder="Imobiliária, Restaurante..." />
          </Field>
          <Field label="Limite de leads">
            <input type="number" className={inputCls} defaultValue={500} />
          </Field>
          <Field label="Palavras-chave (opcional)">
            <input className={inputCls} placeholder="apartamento, cobertura..." />
          </Field>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate({ to: "/extractions" })} className="rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground">
            Cancelar
          </button>
          <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--neon)] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[color:var(--neon-soft)]">
            <Rocket className="h-4 w-4" /> Iniciar Extração
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
