import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Loader2, 
  Search,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { NeonBadge } from "@/components/NeonBadge";
import { useProfile } from "@/hooks/useProfile";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administração — Visita IA Leads" }] }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const { profile, loading: loadingProfile } = useProfile();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showMaster, setShowMaster] = useState(false);

  useEffect(() => {
    if (!loadingProfile && profile?.role !== 'admin') {
      toast.error("Acesso negado.");
      navigate({ to: "/dashboard" });
    } else if (profile?.role === 'admin') {
      fetchUsers();
    }
  }, [profile, loadingProfile]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: !currentStatus })
        .eq('user_id', userId);

      if (error) throw error;
      toast.success(currentStatus ? "Usuário bloqueado" : "Usuário aprovado");
      fetchUsers();
    } catch (error: any) {
      toast.error("Erro ao atualizar status");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.")) return;
    
    try {
      // Nota: No Supabase, deletar do auth.users requer funções RPC ou service role.
      // Aqui deletamos apenas o perfil para fins demonstrativos.
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      toast.success("Usuário removido da lista");
      fetchUsers();
    } catch (error: any) {
      toast.error("Erro ao deletar usuário");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loadingProfile || (loading && users.length === 0)) {
    return (
      <AppLayout title="Administração" subtitle="Carregando usuários...">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin neon-text" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Administração" subtitle="Gerenciamento de usuários e permissões">
      <div className="mb-8 rounded-xl border border-[color:var(--neon)]/20 bg-[#1a1a1a] p-6 shadow-[0_0_20px_rgba(20,255,100,0.05)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--neon)]/10 text-[color:var(--neon)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Configurações Globais (Master)</h3>
            <p className="text-xs text-muted-foreground">Esta chave será usada para todas as extrações do sistema.</p>
          </div>
        </div>
        
        <div className="max-w-xl">
          <label className="label-caps mb-1.5 block">Chave de API Apify (Master)</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showMaster ? "text" : "password"}
                className="w-full rounded-lg border border-[color:var(--border)] bg-[#141414] px-3 py-2.5 text-sm text-foreground focus:border-[color:var(--neon)]/50 focus:outline-none pr-10"
                placeholder="apify_api_..."
                value={profile?.apify_key || ''} 
                readOnly
              />
              <button
                type="button"
                onClick={() => setShowMaster((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:text-foreground"
              >
                {showMaster ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button 
              onClick={() => navigate({ to: '/settings' })}
              className="rounded-lg bg-white/5 px-4 py-2 text-xs font-bold text-foreground hover:bg-white/10 transition-colors"
            >
              Editar em Configurações
            </button>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">Para alterar a chave master, use a sua própria página de configurações (oculta para usuários).</p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input 
            placeholder="Buscar por nome ou email..." 
            className="w-full rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] pl-9 pr-3 py-2 text-sm focus:border-[color:var(--neon)]/50 focus:outline-none" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-4 w-4" />
          {users.length} usuários cadastrados
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-[#141414]">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-[color:var(--border)] bg-white/5">
              <th className="label-caps px-6 py-4">Usuário</th>
              <th className="label-caps px-6 py-4">Status</th>
              <th className="label-caps px-6 py-4">Plano / Créditos</th>
              <th className="label-caps px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f1f]">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-white/5">
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground">{u.name || 'Sem nome'}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                  <div className="mt-1 text-[10px] text-zinc-600">ID: {u.user_id}</div>
                </td>
                <td className="px-6 py-4">
                  {u.is_approved ? (
                    <NeonBadge variant="neon">
                      <ShieldCheck className="mr-1 h-3 w-3" /> Aprovado
                    </NeonBadge>
                  ) : (
                    <div className="inline-flex items-center rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-500">
                      <ShieldAlert className="mr-1 h-3 w-3" /> Pendente
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">{u.plan || 'Free'}</div>
                  <div className="text-xs text-zinc-500">{u.credits_used} / {u.credits_limit} créditos</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => toggleApproval(u.user_id, u.is_approved)}
                      disabled={u.user_id === profile?.user_id}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                        u.is_approved 
                          ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                          : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                      } disabled:opacity-30 disabled:cursor-not-allowed`}
                      title={u.is_approved ? "Bloquear Usuário" : "Aprovar Usuário"}
                    >
                      {u.is_approved ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => deleteUser(u.user_id)}
                      disabled={u.user_id === profile?.user_id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 transition-all hover:bg-red-500/20 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Deletar Usuário"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  Nenhum usuário encontrado para a busca "{search}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
