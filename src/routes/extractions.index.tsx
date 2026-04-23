import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Play, Pause, MoreVertical, RefreshCcw, Loader2, Trash2, Eye } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { NeonBadge } from "@/components/NeonBadge";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/extractions/")({
  head: () => ({ meta: [{ title: "Extrações — Visita IA Leads" }] }),
  component: ExtractionsPage,
});

function statusVariant(s: string): "neon" | "neutral" | "danger" {
  if (s === 'completed') return "neon";
  if (s === 'running') return "neon";
  if (s === 'error') return "danger";
  return "neutral";
}

const statusMap: Record<string, string> = {
    pending: 'Pendente',
    running: 'Rodando',
    completed: 'Concluído',
    error: 'Erro'
};

function ExtractionsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchExtractions();

    // Habilita o Realtime para a tabela de extrações
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta INSERT, UPDATE e DELETE
          schema: 'public',
          table: 'extractions',
        },
        (payload) => {
          console.log('Mudança detectada no banco:', payload);
          
          if (payload.eventType === 'UPDATE') {
            setRows((current) => 
              current.map((row) => 
                row.id === payload.new.id ? { ...row, ...payload.new } : row
              )
            );
          } else if (payload.eventType === 'INSERT') {
            setRows((current) => [payload.new, ...current]);
          } else if (payload.eventType === 'DELETE') {
            setRows((current) => current.filter((row) => row.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchExtractions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('extractions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRows(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar extrações");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (id: string) => {
    try {
        toast.info("Verificando status...");
        const { data, error } = await supabase.functions.invoke('check-extraction-status', {
            body: { extraction_id: id }
        });
        if (error) throw error;
        toast.success(`Status: ${data.status}`);
        fetchExtractions();
    } catch (error: any) {
        toast.error("Erro ao sincronizar");
    }
  };

  const handleDelete = async (ids: string[]) => {
    try {
      setDeleting(true);
      const { error } = await supabase
        .from('extractions')
        .delete()
        .in('id', ids);

      if (error) throw error;

      toast.success(`${ids.length} extração(ões) removida(s)`);
      setSelectedIds([]);
      fetchExtractions();
    } catch (error: any) {
      toast.error("Erro ao remover extrações");
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === rows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(rows.map(r => r.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(current => 
      current.includes(id) 
        ? current.filter(i => i !== id) 
        : [...current, id]
    );
  };

  return (
    <AppLayout title="Minhas Extrações" subtitle="Gerencie suas campanhas de captura de leads">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          {selectedIds.length > 0 ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20">
                  <Trash2 className="h-4 w-4" /> Excluir {selectedIds.length}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#141414] border-[color:var(--border)]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Tem certeza que deseja excluir {selectedIds.length} extração(ões)? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-[color:var(--border)] text-white hover:bg-white/5">Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDelete(selectedIds)}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <button className="rounded-lg border border-[color:var(--neon)]/30 bg-[color:var(--neon)]/10 px-3 py-2 text-xs neon-text">Todas</button>
          )}
        </div>
        <div className="flex gap-2">
            <button 
                onClick={fetchExtractions}
                className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <RefreshCcw className={`h-4 w-4 ${loading || deleting ? 'animate-spin' : ''}`} /> Sincronizar
            </button>
            <Link
                to="/extractions/new"
                className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--neon)] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[color:var(--neon-soft)]"
            >
                <Plus className="h-4 w-4" /> Nova Extração
            </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-[#141414]">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-[color:var(--border)]">
              <th className="px-5 py-3 w-10">
                <Checkbox 
                  checked={rows.length > 0 && selectedIds.length === rows.length}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="label-caps px-5 py-3">Nome</th>
              <th className="label-caps px-5 py-3">Fonte</th>
              <th className="label-caps px-5 py-3">Status</th>
              <th className="label-caps px-5 py-3">Leads</th>
              <th className="label-caps px-5 py-3">Data</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin neon-text" />
                    </td>
                </tr>
            ) : rows.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                        Nenhuma extração encontrada.
                    </td>
                </tr>
            ) : rows.map((r) => (
              <tr 
                key={r.id} 
                className={`border-b border-[color:var(--border)] last:border-0 transition-colors hover:bg-[#1a1a1a] ${selectedIds.includes(r.id) ? 'bg-[color:var(--neon)]/5' : ''}`}
              >
                <td className="px-5 py-4">
                  <Checkbox 
                    checked={selectedIds.includes(r.id)}
                    onCheckedChange={() => toggleSelectRow(r.id)}
                  />
                </td>
                <td className="px-5 py-4 font-medium">
                  <button 
                    onClick={() => navigate({ to: '/leads', search: { extractionId: r.id } })}
                    className="hover:neon-text transition-colors text-left"
                  >
                    {r.name}
                  </button>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{r.source}</td>
                <td className="px-5 py-4">
                    <NeonBadge variant={statusVariant(r.status)}>
                        {statusMap[r.status] || r.status}
                    </NeonBadge>
                </td>
                <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold">{r.leads_count}</span>
                        {r.status === 'completed' && r.leads_count === 0 && (
                            <span className="text-[10px] text-amber-500/80 leading-none">
                                Todos filtrados (Imobiliárias)
                            </span>
                        )}
                    </div>
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-md border border-[color:var(--border)] p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-[#1a1a1a] border-[color:var(--border)] text-muted-foreground">
                        <DropdownMenuItem 
                          onClick={() => navigate({ to: '/leads', search: { extractionId: r.id } })}
                          className="flex items-center gap-2 hover:bg-white/5 cursor-pointer"
                        >
                          <Eye className="h-4 w-4" /> Ver Leads
                        </DropdownMenuItem>
                        {r.status === 'running' && (
                          <DropdownMenuItem 
                            onClick={() => handleSync(r.id)}
                            className="flex items-center gap-2 hover:bg-white/5 cursor-pointer"
                          >
                            <RefreshCcw className="h-4 w-4" /> Sincronizar
                          </DropdownMenuItem>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              onSelect={(e) => e.preventDefault()}
                              className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#141414] border-[color:var(--border)]">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                Tem certeza que deseja excluir esta extração? Todos os dados associados serão removidos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-transparent border-[color:var(--border)] text-white hover:bg-white/5">Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete([r.id])}
                                className="bg-red-600 text-white hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
