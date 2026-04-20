import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, Phone, MapPin, Instagram, Clock } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { NeonBadge } from "@/components/NeonBadge";

export const Route = createFileRoute("/leads/$leadId")({
  head: () => ({ meta: [{ title: "Detalhe do Lead — Visita IA Leads" }] }),
  component: LeadDetailPage,
});

const timeline = [
  { status: "Novo", at: "20/01 14:32", note: "Lead capturado via VivaReal" },
  { status: "Contatado", at: "21/01 10:15", note: "Primeiro contato por WhatsApp" },
  { status: "Negociação", at: "22/01 16:40", note: "Proposta enviada" },
];

function LeadDetailPage() {
  const { leadId } = Route.useParams();
  return (
    <AppLayout title="Detalhe do Lead" subtitle={`ID #${leadId}`}>
      <Link to="/leads" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-[color:var(--border)] bg-[#141414] p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">Imobiliária Premium</h2>
                <p className="text-sm text-muted-foreground">Capturado via VivaReal</p>
              </div>
              <NeonBadge>Negociação</NeonBadge>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <InfoRow icon={Phone} label="Telefone" value="(11) 99999-1234" />
              <InfoRow icon={Mail} label="Email" value="contato@premium.com" />
              <InfoRow icon={MapPin} label="Endereço" value="Av. Paulista, 1000 — São Paulo / SP" />
              <InfoRow icon={Instagram} label="Instagram" value="@imobpremium" />
            </div>
          </div>

          <div className="rounded-xl border border-[color:var(--border)] bg-[#141414] p-6">
            <h3 className="mb-3 text-sm font-semibold">Notas</h3>
            <textarea
              rows={5}
              defaultValue="Lead respondeu ao WhatsApp. Interessado em imóveis comerciais."
              className="w-full rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] p-3 text-sm focus:border-[color:var(--neon)]/50 focus:outline-none"
            />
            <div className="mt-3 flex justify-end">
              <button className="rounded-lg bg-[color:var(--neon)] px-4 py-2 text-sm font-semibold text-black hover:bg-[color:var(--neon-soft)]">
                Salvar nota
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[color:var(--border)] bg-[#141414] p-6">
          <h3 className="mb-4 text-sm font-semibold">Histórico de Status</h3>
          <ol className="relative space-y-5 border-l border-[color:var(--border)] pl-5">
            {timeline.map((t, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[26px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-[color:var(--neon)] ring-4 ring-[#141414]" />
                <div className="text-sm font-medium">{t.status}</div>
                <div className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {t.at}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t.note}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </AppLayout>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--neon)]/15">
        <Icon className="h-4 w-4 neon-text" />
      </div>
      <div className="min-w-0">
        <div className="label-caps">{label}</div>
        <div className="mt-0.5 truncate text-sm">{value}</div>
      </div>
    </div>
  );
}
