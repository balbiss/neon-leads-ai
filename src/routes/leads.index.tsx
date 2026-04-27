import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Download, Filter, Loader2, Search, MessageCircle, MapPin, Globe, ExternalLink, Send } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { NeonBadge } from "@/components/NeonBadge";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { z } from "zod";
import { BulkMessageModal } from "@/components/BulkMessageModal";

const leadsSearchSchema = z.object({
  extractionId: z.string().optional(),
});

export const Route = createFileRoute("/leads/")({
  validateSearch: (search) => leadsSearchSchema.parse(search),
  head: () => ({ meta: [{ title: "Leads — Visita IA Leads" }] }),
  component: LeadsPage,
});

function sourceColor(s: string) {
  if (s === "vivareal") return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (s === "google_maps") return "bg-orange-500/15 text-orange-400 border-orange-500/30";
  if (s === "zap") return "bg-pink-500/15 text-pink-400 border-pink-500/30";
  return "bg-purple-500/15 text-purple-400 border-purple-500/30";
}

const sourceNames: Record<string, string> = {
  google_maps: "Google Maps",
  vivareal: "VivaReal",
  zap: "ZAP Imóveis",
  instagram: "Instagram",
};

const statusMap: Record<string, string> = {
  new: 'Novo',
  contacted: 'Contatado',
  qualified: 'Qualificado',
  discarded: 'Descartado'
};

function LeadsPage() {
  const { extractionId } = useSearch({ from: '/leads/' });
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [extraction, setExtraction] = useState<any>(null); // Armazena info da extração filtrada
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [exporting, setExporting] = useState(false);
  
  // Estados para seleção em massa
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  useEffect(() => {
    fetchLeads();
    if (extractionId) {
      fetchExtractionInfo();
    } else {
      setExtraction(null);
    }
  }, [sourceFilter, statusFilter, extractionId]);

  const fetchExtractionInfo = async () => {
    const { data } = await supabase
      .from('extractions')
      .select('*')
      .eq('id', extractionId)
      .single();
    if (data) setExtraction(data);
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      let query = supabase.from('leads').select('*').order('created_at', { ascending: false });

      if (sourceFilter) query = query.eq('source', sourceFilter);
      if (statusFilter) query = query.eq('status', statusFilter);
      if (extractionId && extractionId !== "") {
        query = query.eq('extraction_id', extractionId);
      }
      if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,whatsapp.ilike.%${search}%`);

      const { data, error } = await query;
      if (error) throw error;
      setLeads(data || []);
      setSelectedIds(new Set()); // Limpa seleção ao mudar filtros
    } catch (error: any) {
      toast.error("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const { data, error } = await supabase.functions.invoke('export-leads-csv', {
        body: { source: sourceFilter, status: statusFilter }
      });

      if (error) throw error;

      // Download file
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `leads_${new Date().getTime()}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success("CSV exportado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao exportar CSV");
    } finally {
      setExporting(false);
    }
  };

  const toggleSelectLead = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map(l => l.id)));
    }
  };

  const selectedLeadsData = leads.filter(l => selectedIds.has(l.id));

  return (
    <AppLayout 
      title={extraction ? `Leads: ${extraction.name}` : "Leads"} 
      subtitle={extraction ? `Mostrando apenas leads da extração feita em ${new Date(extraction.created_at).toLocaleDateString('pt-BR')}` : "Todos os leads capturados pelas suas extrações"}
    >
      {extraction && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-[color:var(--neon)]/20 bg-[color:var(--neon)]/5 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[color:var(--neon)]/20 p-2">
              <Filter className="h-4 w-4 neon-text" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Filtro Ativo: <span className="neon-text">{extraction.name}</span></p>
              <p className="text-xs text-muted-foreground">Busca: "{extraction.query}" em {extraction.location}</p>
            </div>
          </div>
          <Link 
            to="/leads" 
            className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Limpar Filtro / Ver Todos
          </Link>
        </div>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
                placeholder="Buscar por nome, telefone, email..." 
                className="w-full rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] pl-9 pr-3 py-2 text-sm focus:border-[color:var(--neon)]/50 focus:outline-none" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchLeads()}
            />
        </div>

        {selectedIds.size > 0 && (
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-bold text-black hover:bg-green-400 transition-colors"
          >
            <Send className="h-4 w-4" /> 
            🚀 Enviar Campanha ({selectedIds.size})
          </button>
        )}

        <select 
            className="rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-3 py-2 text-sm"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
        >
          <option value="">Todas as fontes</option>
          <option value="google_maps">Google Maps</option>
          <option value="vivareal">VivaReal</option>
          <option value="zap">ZAP</option>
          <option value="instagram">Instagram</option>
        </select>
        <select 
            className="rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="new">Novo</option>
          <option value="contacted">Contatado</option>
          <option value="qualified">Qualificado</option>
          <option value="discarded">Descartado</option>
        </select>
        


        <button 
            disabled={exporting}
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/10 px-4 py-2 text-sm font-medium neon-text hover:bg-[color:var(--neon)]/20 disabled:opacity-50"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} 
          Exportar CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-[#141414]">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-[color:var(--border)]">
              <th className="px-4 py-3">
                <input 
                  type="checkbox" 
                  className="accent-[color:var(--neon)]" 
                  checked={leads.length > 0 && selectedIds.size === leads.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="label-caps px-4 py-3">Nome / Empresa</th>
              <th className="label-caps px-4 py-3">Telefone</th>
              <th className="label-caps px-4 py-3">Nº WhatsApp</th>
              <th className="label-caps px-4 py-3 text-center">Ação</th>
              <th className="label-caps px-4 py-3">Endereço</th>
              <th className="label-caps px-4 py-3 text-center">Site</th>
              <th className="label-caps px-4 py-3">Email</th>
              <th className="label-caps px-4 py-3">Cidade</th>
              <th className="label-caps px-4 py-3">Fonte</th>
              <th className="label-caps px-4 py-3">Status</th>
              <th className="label-caps px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody>
             {loading && leads.length === 0 ? (
                <tr>
                    <td colSpan={12} className="px-4 py-12 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin neon-text" />
                    </td>
                </tr>
            ) : leads.length === 0 ? (
                <tr>
                    <td colSpan={12} className="px-4 py-12 text-center text-muted-foreground">
                        Nenhum lead encontrado.
                    </td>
                </tr>
            ) : leads.map((l) => (
              <tr key={l.id} className={`border-b border-[color:var(--border)] last:border-0 transition-colors hover:bg-[#1a1a1a] ${selectedIds.has(l.id) ? 'bg-[color:var(--neon)]/5' : ''}`}>
                <td className="px-4 py-3">
                  <input 
                    type="checkbox" 
                    className="accent-[color:var(--neon)]" 
                    checked={selectedIds.has(l.id)}
                    onChange={() => toggleSelectLead(l.id)}
                  />
                </td>
                <td className="px-4 py-3 font-medium">
                  <Link to="/leads/$leadId" params={{ leadId: l.id }} className="hover:neon-text">{l.name}</Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{l.phone || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{l.whatsapp || '—'}</td>
                <td className="px-4 py-3 text-center">
                  {l.whatsapp ? (
                    <a 
                      href={`https://wa.me/${l.whatsapp.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                      title="Abrir WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <div className="flex items-center gap-2 max-w-[200px]">
                    <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                    <span className="truncate text-xs" title={l.address}>{l.address || '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  {l.website ? (
                    <a 
                      href={l.website} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                      title="Visitar Website"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground truncate max-w-[150px]">{l.email || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.city || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${sourceColor(l.source)}`}>
                    {sourceNames[l.source] || l.source}
                  </span>
                </td>
                <td className="px-4 py-3">
                    <NeonBadge variant={l.status === "qualified" ? "neon" : "neutral"}>
                        {statusMap[l.status] || l.status}
                    </NeonBadge>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(l.created_at).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BulkMessageModal 
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        selectedLeads={selectedLeadsData}
      />
    </AppLayout>
  );
}
