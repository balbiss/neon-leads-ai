import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Trash2, Save, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Configurações — Visita IA Leads" }] }),
  component: SettingsPage,
});

const inputCls =
  "w-full rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-3 py-2.5 text-sm text-foreground focus:border-[color:var(--neon)]/50 focus:outline-none disabled:opacity-50";

function SettingsPage() {
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const { profile, loading, refreshProfile } = useProfile();
  const [editingProfile, setEditingProfile] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setEditingProfile(profile);
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editingProfile.name,
          apify_key: editingProfile.apify_key
        })
        .eq('user_id', editingProfile.user_id);

      if (error) throw error;
      toast.success("Configurações salvas!");
      refreshProfile?.();
    } catch (error: any) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
      return (
          <AppLayout title="Configurações" subtitle="Carregando...">
              <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin neon-text" />
              </div>
          </AppLayout>
      );
  }

  const used = profile?.credits_used || 0;
  const limit = profile?.credits_limit || 500;
  const pct = Math.min(100, (used / limit) * 100);

  return (
    <AppLayout title="Configurações" subtitle="Conta, plano e integrações">
      <form onSubmit={handleSave} className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-xl border border-[color:var(--border)] bg-[#141414] p-6">
          <h3 className="mb-4 text-sm font-semibold">Perfil</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label-caps mb-1.5 block">Nome Completo</label>
              <input 
                className={inputCls} 
                value={editingProfile?.name || ''} 
                onChange={e => setEditingProfile({...editingProfile, name: e.target.value})}
                disabled={saving}
              />
            </div>
            <div>
              <label className="label-caps mb-1.5 block">Email</label>
              <input 
                className={inputCls} 
                disabled 
                value={editingProfile?.email || ''} 
              />
            </div>
          </div>
        </div>

        {profile?.role === 'admin' && (
          <div className="rounded-xl border border-[color:var(--border)] bg-[#141414] p-6">
            <h3 className="mb-4 text-sm font-semibold">Integração Apify (Apenas Admin)</h3>
            <p className="mb-4 text-xs text-muted-foreground">Obrigatório para realizar as extrações. Obtenha sua chave no console do Apify.</p>
            <label className="label-caps mb-1.5 block">Chave de API (Apify Key)</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                className={`${inputCls} pr-10`}
                placeholder="apify_api_..."
                value={editingProfile?.apify_key || ''} 
                onChange={e => setEditingProfile({...editingProfile, apify_key: e.target.value})}
                disabled={saving}
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
        )}

 <div className="flex justify-end pt-4">
             <button 
                type="submit" 
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--neon)] px-8 py-3 text-sm font-bold text-black hover:bg-[color:var(--neon-soft)] shadow-lg hover:shadow-[0_0_20px_rgba(20,255,100,0.2)] transition-all disabled:opacity-50"
             >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar Alterações
             </button>
        </div>

        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
          <h3 className="text-sm font-semibold text-destructive">Zona de perigo</h3>
          <p className="mt-1 text-xs text-muted-foreground">Desativar sua conta removerá todos os seus leads e extrações permanentemente.</p>
          <button type="button" className="mt-4 inline-flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/15 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/25">
            <Trash2 className="h-4 w-4" /> Deletar conta
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
