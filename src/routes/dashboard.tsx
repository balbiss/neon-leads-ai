import { createFileRoute } from "@tanstack/react-router";
import { Users, Activity, TrendingUp, MapPin, Home, Building2, Instagram, Loader2, RefreshCcw } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { MetricCard } from "@/components/MetricCard";
import { NeonBadge } from "@/components/NeonBadge";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
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

const sourceIcons = {
  google_maps: MapPin,
  vivareal: Home,
  zap: Building2,
  instagram: Instagram,
};

const sourceNames = {
  google_maps: "Google Maps",
  vivareal: "VivaReal",
  zap: "ZAP Imóveis",
  instagram: "Instagram",
};

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: resp, error } = await supabase.functions.invoke('get-dashboard-stats');

      if (error) throw error;
      setData(resp);
    } catch (error: any) {
      console.error("Dashboard error:", error);
      toast.error("Erro ao carregar estatísticas");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Dashboard" subtitle="Carregando dados...">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin neon-text" />
        </div>
      </AppLayout>
    );
  }

  const stats = data?.stats || {
    total_leads: 0,
    running_extractions: 0,
    enrichment_rate: 0,
    credits_used: 0,
    credits_limit: 500
  };

  const chartData = data?.extractions_history?.map((h: any) => {
    // Adiciona T12:00:00 para evitar que o fuso horário mude o dia ao converter a string de data
    const date = new Date(h.date + 'T12:00:00');
    return {
      day: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      fullDate: date.toLocaleDateString('pt-BR'),
      leads: h.count
    };
  }) || [];

  const sources = data?.leads_by_source || [];

  return (
    <AppLayout title="Dashboard" subtitle="Visão geral da sua operação em tempo real">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard 
          label="Total de Leads Extraídos" 
          value={stats.total_leads.toLocaleString()} 
          icon={Users} 
          trend={`${stats.credits_used} créditos usados de ${stats.credits_limit}`} 
        />
        <MetricCard 
          label="Extrações Ativas" 
          value={stats.running_extractions.toString()} 
          icon={Activity} 
          trend={stats.running_extractions > 0 ? "Extraindo agora" : "Nenhuma ativa"} 
        />
        <MetricCard 
          label="Taxa de Enriquecimento" 
          value={`${stats.enrichment_rate}%`} 
          icon={TrendingUp} 
          trend="Leads com Contato" 
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[color:var(--border)] bg-[#141414] p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Volume de Extrações</h3>
              <p className="text-xs text-muted-foreground">Volume de leads capturados nos últimos 7 dias</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchStats}
                disabled={loading}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
                title="Atualizar dados"
              >
                <RefreshCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <NeonBadge>Tempo Real</NeonBadge>
            </div>
          </div>
          <div className="mt-6 h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="neonFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="day" 
                    stroke="#555" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                    tickFormatter={(val) => val.toUpperCase()}
                  />
                  <YAxis 
                    stroke="#555" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ stroke: '#00ff88', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{
                      background: "rgba(13, 13, 13, 0.9)",
                      backdropFilter: "blur(4px)",
                      border: "1px solid rgba(0, 255, 136, 0.2)",
                      borderRadius: 12,
                      padding: '8px 12px',
                    }}
                    itemStyle={{ color: '#00ff88', fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#aaa', fontSize: '10px', marginBottom: '4px' }}
                    formatter={(value: number) => [`${value} leads`, 'Capturados']}
                    labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="#00ff88" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#neonFill)" 
                    animationDuration={1500}
                    activeDot={{ r: 6, fill: '#00ff88', stroke: '#000', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Sem dados suficientes nos últimos 7 dias
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[color:var(--border)] bg-[#141414] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Atividade Recente</h3>
            <span className={`h-2 w-2 rounded-full ${stats.running_extractions > 0 ? 'animate-pulse bg-[color:var(--neon)]' : 'bg-zinc-700'}`} />
          </div>
          <ul className="mt-5 space-y-4">
            {data?.recent_activity?.length > 0 ? (
              data.recent_activity.map((a: any, i: number) => (
                <li key={i} className="flex gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--neon)]" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{a.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-center text-xs text-muted-foreground py-8">Nenhuma atividade registrada</li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold">Distribuição por Fonte</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {sources.map((s: any) => {
            const Icon = (sourceIcons as any)[s.source] || MapPin;
            const name = (sourceNames as any)[s.source] || s.source;
            return (
              <div key={s.source} className="rounded-xl border border-[color:var(--border)] bg-[#141414] p-5 transition-colors hover:border-[color:var(--neon)]/30">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--neon)]/15">
                    <Icon className="h-5 w-5 neon-text" />
                  </div>
                  <NeonBadge>Ativo</NeonBadge>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">{s.count}</div>
                  <div className="text-xs text-muted-foreground">{name}</div>
                </div>
              </div>
            );
          })}
          {sources.length === 0 && (
             <div className="col-span-full rounded-xl border border-dashed border-[color:var(--border)] p-8 text-center text-sm text-muted-foreground">
                Nenhum lead extraído ainda. Comece uma nova extração para ver os dados aqui.
             </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
