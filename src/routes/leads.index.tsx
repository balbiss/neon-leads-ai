import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Filter } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { NeonBadge } from "@/components/NeonBadge";

export const Route = createFileRoute("/leads/")({
  head: () => ({ meta: [{ title: "Leads — Visita IA Leads" }] }),
  component: LeadsPage,
});

const leads = [
  { id: "1", name: "Imobiliária Premium", phone: "(11) 99999-1234", email: "contato@premium.com", city: "São Paulo", source: "VivaReal", status: "Novo", date: "Hoje" },
  { id: "2", name: "Restaurante Sabor & Arte", phone: "(21) 98888-5678", email: "atendimento@sabor.com", city: "Rio de Janeiro", source: "Google Maps", status: "Contatado", date: "Hoje" },
  { id: "3", name: "Pet Shop Amigo Fiel", phone: "(41) 97777-1111", email: "amigofiel@pet.com", city: "Curitiba", source: "Google Maps", status: "Negociação", date: "Ontem" },
  { id: "4", name: "@fitlifebh", phone: "(31) 96666-2222", email: "—", city: "Belo Horizonte", source: "Instagram", status: "Novo", date: "Ontem" },
  { id: "5", name: "Imóveis Total ZAP", phone: "(11) 95555-3333", email: "vendas@total.com", city: "São Paulo", source: "ZAP Imóveis", status: "Convertido", date: "20/01" },
];

function sourceColor(s: string) {
  if (s === "VivaReal") return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (s === "Google Maps") return "bg-orange-500/15 text-orange-400 border-orange-500/30";
  if (s === "ZAP Imóveis") return "bg-pink-500/15 text-pink-400 border-pink-500/30";
  return "bg-purple-500/15 text-purple-400 border-purple-500/30";
}

function LeadsPage() {
  return (
    <AppLayout title="Leads" subtitle="Todos os leads capturados pelas suas extrações">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input placeholder="Buscar por nome, telefone, email..." className="flex-1 min-w-[240px] rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-3 py-2 text-sm focus:border-[color:var(--neon)]/50 focus:outline-none" />
        <select className="rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-3 py-2 text-sm">
          <option>Todas as fontes</option><option>Google Maps</option><option>VivaReal</option><option>ZAP</option><option>Instagram</option>
        </select>
        <select className="rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-3 py-2 text-sm">
          <option>Todos os status</option><option>Novo</option><option>Contatado</option><option>Convertido</option>
        </select>
        <button className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
          <Filter className="h-4 w-4" /> Filtros
        </button>
        <button className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/10 px-4 py-2 text-sm font-medium neon-text hover:bg-[color:var(--neon)]/20">
          <Download className="h-4 w-4" /> Exportar CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-[#141414]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[color:var(--border)] text-left">
              <th className="px-4 py-3"><input type="checkbox" className="accent-[color:var(--neon)]" /></th>
              <th className="label-caps px-4 py-3">Nome / Empresa</th>
              <th className="label-caps px-4 py-3">Telefone</th>
              <th className="label-caps px-4 py-3">Email</th>
              <th className="label-caps px-4 py-3">Cidade</th>
              <th className="label-caps px-4 py-3">Fonte</th>
              <th className="label-caps px-4 py-3">Status</th>
              <th className="label-caps px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-[color:var(--border)] last:border-0 transition-colors hover:bg-[#1a1a1a]">
                <td className="px-4 py-3"><input type="checkbox" className="accent-[color:var(--neon)]" /></td>
                <td className="px-4 py-3 font-medium">
                  <Link to="/leads/$leadId" params={{ leadId: l.id }} className="hover:neon-text">{l.name}</Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{l.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.city}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${sourceColor(l.source)}`}>{l.source}</span>
                </td>
                <td className="px-4 py-3"><NeonBadge variant={l.status === "Convertido" ? "neon" : "neutral"}>{l.status}</NeonBadge></td>
                <td className="px-4 py-3 text-muted-foreground">{l.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
