import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Rocket, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/extractions/new")({
  head: () => ({ meta: [{ title: "Nova Extração — Visita IA Leads" }] }),
  component: NewExtractionPage,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-caps mb-1.5 block">{label}</label>
      <div>{children}</div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-3 py-2.5 text-sm text-foreground focus:border-[color:var(--neon)]/50 focus:outline-none disabled:opacity-50";

function NewExtractionPage() {
  const navigate = useNavigate();
  const { profile, loading: loadingProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const isApproved = profile?.is_approved === true;
  const [formData, setFormData] = useState({
    name: "",
    source: "google_maps",
    target: "",
    category: "",
    limit: 500,
    seller_type: "particular",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApproved) {
      toast.error("Sua conta aguarda aprovação do administrador.");
      return;
    }
    try {
      setLoading(true);
      
      const configJson: any = {
        limit: formData.limit,
        seller_type: formData.seller_type
      };

      if (formData.source === 'google_maps') {
          configJson.queries = [formData.category];
          configJson.city = formData.target;
      } else {
          configJson.city = formData.target;
          configJson.category = formData.category;
      }

      // 1. Obter o usuário logado para satisfazer o RLS
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado. Por favor, faça login novamente.");

      // 2. Criar o registro da extração no banco para gerar um ID
      const { data: extraction, error: insertError } = await supabase
        .from("extractions")
        .insert({
          user_id: user.id,
          name: formData.name,
          source: formData.source,
          status: "pending",
          config_json: configJson,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Invocar o Webhook do n8n (Substituindo a Edge Function que dava erro 401)
      const response = await fetch('https://webhook.inoovaweb.com.br/webhook/start-extraction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          extraction_id: extraction.id,
          user_id: user.id,
          name: formData.name,
          source: formData.source,
          config: {
            city: formData.target,
            limit: formData.limit,
            category: formData.category,
            seller_type: formData.seller_type
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro no servidor de extração (n8n).");
      }

      toast.success("Extração iniciada com sucesso!");
      navigate({ to: "/extractions" });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao iniciar extração. Verifique se sua API Key do Apify está configurada.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Nova Extração" subtitle="Configure uma nova campanha de captura">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl rounded-xl border border-[color:var(--border)] bg-[#141414] p-8 shadow-2xl"
      >
        {!isApproved && !loadingProfile && (
          <div className="mb-8 flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-200/80">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold text-yellow-500 mb-1">Acesso Restrito</p>
              Sua conta foi criada com sucesso, mas o acesso às ferramentas de extração ainda não foi liberado. 
              Aguarde a aprovação do administrador para começar a capturar leads.
            </div>
          </div>
        )}
        <div className={cn("grid gap-6", !isApproved && "opacity-50 pointer-events-none")}>
          <Field label="Nome da extração">
            <input 
                className={inputCls} 
                placeholder="Ex: Imobiliárias SP Zona Sul" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                disabled={loading}
            />
          </Field>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Fonte">
                <select 
                    className={inputCls} 
                    required
                    value={formData.source}
                    onChange={e => setFormData({...formData, source: e.target.value})}
                    disabled={loading}
                >
                <option value="google_maps">Google Maps</option>
                <option value="zap">ZAP Imóveis</option>
                <option value="instagram">Instagram</option>
                </select>
            </Field>

            <Field label="Cidade / Local Alvo">
                <input 
                    className={inputCls} 
                    placeholder="Ex: São Paulo, SP" 
                    required 
                    value={formData.target}
                    onChange={e => setFormData({...formData, target: e.target.value})}
                    disabled={loading}
                />
            </Field>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Nicho / O que buscar?">
                <input 
                    className={inputCls} 
                    placeholder="Ex: Imobiliária, Dentista..." 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    disabled={loading}
                />
            </Field>

            <Field label="Limite de Leads (Estimado)">
                <input 
                    type="number" 
                    className={inputCls} 
                    value={formData.limit}
                    onChange={e => setFormData({...formData, limit: parseInt(e.target.value)})}
                    disabled={loading}
                />
            </Field>
          </div>

          {formData.source === 'zap' && (
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Tipo de Anunciante">
                <select 
                  className={inputCls} 
                  required
                  value={formData.seller_type}
                  onChange={e => setFormData({...formData, seller_type: e.target.value})}
                  disabled={loading}
                >
                  <option value="particular">Particular (Filtrar Imobiliárias)</option>
                  <option value="all">Todos (Incluir Imobiliárias)</option>
                </select>
              </Field>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-end gap-4 border-t border-[color:var(--border)] pt-6">
          <button 
            type="button" 
            disabled={loading}
            onClick={() => navigate({ to: "/extractions" })} 
            className="rounded-lg border border-[color:var(--border)] bg-transparent px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-[#1a1a1a] hover:text-foreground disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading || !isApproved || loadingProfile}
            className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--neon)] px-8 py-2.5 text-sm font-bold text-black transition-all hover:bg-[color:var(--neon-soft)] hover:shadow-[0_0_20px_rgba(20,255,100,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
            {isApproved ? "Iniciar Extração" : "Aguardando Aprovação"}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
