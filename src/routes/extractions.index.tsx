import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Play, Pause, MoreVertical } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { NeonBadge } from "@/components/NeonBadge";

export const Route = createFileRoute("/extractions/")({
  head: () => ({ meta: [{ title: "Extrações — Visita IA Leads" }] }),
  component: ExtractionsPage,
});

const rows = [
  { id: "1", name: "Imobiliárias SP — Zona Sul", source: "VivaReal", status: "Ativo", leads: 342, date: "Hoje 14:32" },
  { id: "2", name: "Restaurantes RJ Centro", source: "Google Maps", status: "Ativo", leads: 187, date: "Hoje 12:10" },
  { id: "3", name: "Pet Shops Curitiba", source: "Google Maps", status: "Concluído", leads: 95, date: "Ontem" },
  { id: "4", name: "Influencers fitness BH", source: "Instagram", status: "Pausado", leads: 28, date: "20/01" },
];

function statusVariant(s: string): "neon" | "neutral" | "danger" {
  if (s === "Ativo") return "neon";
  if (s === "Pausado") return "danger";
  return "neutral";
}

function ExtractionsPage() {
  return (
    <AppLayout title="Minhas Extrações" subtitle="Gerencie suas campanhas de captura de leads">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button className="rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-3 py-2 text-xs text-muted-foreground hover:text-foreground">Todos</button>
          <button className="rounded-lg border border-[color:var(--neon)]/30 bg-[color:var(--neon)]/10 px-3 py-2 text-xs neon-text">Ativos</button>
          <button className="rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-3 py-2 text-xs text-muted-foreground hover:text-foreground">Concluídos</button>
        </div>
        <Link
          to="/extractions/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--neon)] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[color:var(--neon-soft)]"
        >
          <Plus className="h-4 w-4" /> Nova Extração
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-[#141414]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[color:var(--border)] text-left">
              <th className="label-caps px-5 py-3">Nome</th>
              <th className="label-caps px-5 py-3">Fonte</th>
              <th className="label-caps px-5 py-3">Status</th>
              <th className="label-caps px-5 py-3">Leads</th>
              <th className="label-caps px-5 py-3">Atualizado</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-[color:var(--border)] last:border-0 transition-colors hover:bg-[#1a1a1a]">
                <td className="px-5 py-4 font-medium">{r.name}</td>
                <td className="px-5 py-4 text-muted-foreground">{r.source}</td>
                <td className="px-5 py-4"><NeonBadge variant={statusVariant(r.status)}>{r.status}</NeonBadge></td>
                <td className="px-5 py-4 font-semibold">{r.leads}</td>
                <td className="px-5 py-4 text-muted-foreground">{r.date}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button className="rounded-md border border-[color:var(--border)] p-1.5 text-muted-foreground hover:text-[color:var(--neon)]">
                      {r.status === "Pausado" ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                    </button>
                    <button className="rounded-md border border-[color:var(--border)] p-1.5 text-muted-foreground hover:text-foreground">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
