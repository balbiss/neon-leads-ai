import { createFileRoute } from "@tanstack/react-router";
import { Users, Activity, TrendingUp, MapPin, Home, Building2, Instagram } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { MetricCard } from "@/components/MetricCard";
import { NeonBadge } from "@/components/NeonBadge";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Visita IA Leads" }] }),
  component: DashboardPage,
});

const chartData = [
  { day: "Seg", leads: 320 },
  { day: "Ter", leads: 480 },
  { day: "Qua", leads: 410 },
  { day: "Qui", leads: 620 },
  { day: "Sex", leads: 780 },
  { day: "Sab", leads: 540 },
  { day: "Dom", leads: 690 },
];

const sources = [
  { name: "Google Maps", icon: MapPin, leads: "2.847", status: "Ativo" },
  { name: "VivaReal", icon: Home, leads: "1.234", status: "Ativo" },
  { name: "ZAP Imóveis", icon: Building2, leads: "987", status: "Ativo" },
  { name: "Instagram", icon: Instagram, leads: "543", status: "Ativo" },
];

const activity = [
  { text: "Extração 'Imóveis SP' concluída — 142 leads", time: "há 2 min" },
  { text: "Novo lead capturado em Google Maps", time: "há 5 min" },
  { text: "Extração 'Restaurantes RJ' iniciada", time: "há 12 min" },
  { text: "47 leads enriquecidos com Instagram", time: "há 28 min" },
  { text: "Exportação CSV concluída — 320 leads", time: "há 1 h" },
];

function DashboardPage() {
  return (
    <AppLayout title="Dashboard" subtitle="Visão geral da sua operação em tempo real">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total de Leads Extraídos" value="12.847" icon={Users} trend="+12.4% essa semana" />
        <MetricCard label="Extrações Ativas" value="8" icon={Activity} trend="3 em tempo real" />
        <MetricCard label="Taxa de Enriquecimento" value="87%" icon={TrendingUp} trend="+4% vs mês anterior" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[color:var(--border)] bg-[#141414] p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Extrações da Semana</h3>
              <p className="text-xs text-muted-foreground">Total de leads capturados por dia</p>
            </div>
            <NeonBadge>Real-time</NeonBadge>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="neonFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ff88" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1f1f1f" vertical={false} />
                <XAxis dataKey="day" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#0d0d0d",
                    border: "1px solid #2a2a2a",
                    borderRadius: 8,
                    color: "#fff",
                  }}
                />
                <Area type="monotone" dataKey="leads" stroke="#00ff88" strokeWidth={2} fill="url(#neonFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[color:var(--border)] bg-[#141414] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Atividade Recente</h3>
            <span className="h-2 w-2 animate-pulse rounded-full bg-[color:var(--neon)]" />
          </div>
          <ul className="mt-5 space-y-4">
            {activity.map((a, i) => (
              <li key={i} className="flex gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--neon)]" />
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold">Fontes Ativas</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {sources.map((s) => (
            <div key={s.name} className="rounded-xl border border-[color:var(--border)] bg-[#141414] p-5 transition-colors hover:border-[color:var(--neon)]/30">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--neon)]/15">
                  <s.icon className="h-5 w-5 neon-text" />
                </div>
                <NeonBadge>{s.status}</NeonBadge>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold">{s.leads}</div>
                <div className="text-xs text-muted-foreground">{s.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
