import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Image, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BulkMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeads: any[];
}

export function BulkMessageModal({ isOpen, onClose, selectedLeads }: BulkMessageModalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [mediaType, setMediaType] = useState("text");
  const [mediaUrl, setMediaUrl] = useState("");

  const handleSend = async () => {
    if (!message && mediaType === "text") {
      toast.error("Por favor, escreva uma mensagem.");
      return;
    }

    setLoading(true);
    try {
      // ENDEREÇO DO SEU WEBHOOK NO N8N
      const N8N_WEBHOOK_URL = "https://webhook.inoovaweb.com.br/webhook/visitaiadipsaro";

      const payload = {
        action: "bulk_message",
        timestamp: new Date().toISOString(),
        totalLeads: selectedLeads.length,
        message,
        mediaType,
        mediaUrl,
        leads: selectedLeads.map(l => ({
          id: l.id,
          name: l.name,
          phone: l.phone,
          whatsapp: l.whatsapp,
          email: l.email
        }))
      };

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Nota: Alguns n8n não retornam OK se for webhook de teste sem resposta configurada, então ignore se falhar mas o n8n recebeu
      if (!response.ok && response.status !== 200) throw new Error("Falha ao enviar para o n8n");

      toast.success(`${selectedLeads.length} leads enviados para processamento no n8n!`);
      onClose();
      setMessage("");
      setMediaUrl("");
    } catch (error: any) {
      console.error(error);
      toast.error("Configure sua URL do n8n no código do BulkMessageModal.tsx");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-[color:var(--border)] bg-[#141414] text-white shadow-[0_0_50px_rgba(34,197,94,0.1)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Send className="h-5 w-5 neon-text" />
            Disparo em Massa
          </DialogTitle>
          <DialogDescription className="text-muted-foreground pt-1">
            Você selecionou <span className="neon-text font-bold text-base">{selectedLeads.length}</span> leads para esta campanha.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <Tabs defaultValue="text" onValueChange={setMediaType} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-[color:var(--border)] p-1 h-auto">
              <TabsTrigger 
                value="text" 
                className="py-2 data-[state=active]:bg-[color:var(--neon)]/10 data-[state=active]:text-[color:var(--neon)]"
              >
                <div className="flex flex-col items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-[10px]">Texto</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="image" 
                className="py-2 data-[state=active]:bg-[color:var(--neon)]/10 data-[state=active]:text-[color:var(--neon)]"
              >
                <div className="flex flex-col items-center gap-1">
                    <Image className="h-4 w-4" />
                    <span className="text-[10px]">Imagem</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-2">
                <Label htmlFor="message" className="text-muted-foreground">Mensagem da Campanha</Label>
                <Textarea
                  id="message"
                  placeholder="Olá {{nome}}! Vi que você tem interesse em..."
                  className="min-h-[140px] bg-black/20 border-[color:var(--border)] focus:border-[color:var(--neon)]/50 focus:ring-1 focus:ring-[color:var(--neon)]/20 transition-all"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">
                  Use <code className="bg-white/5 px-1 rounded text-green-400">{"{{nome}}"}</code> para personalizar o envio.
                </p>
              </div>

              {mediaType === "image" && (
                <div className="space-y-2 animate-in zoom-in-95 duration-200">
                  <Label htmlFor="url" className="text-muted-foreground">URL do arquivo (Imagem)</Label>
                  <Input
                    id="url"
                    placeholder="https://suaimagem.com/foto.png"
                    className="bg-black/20 border-[color:var(--border)] focus:border-[color:var(--neon)]/50"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground italic">
                    O n8n usará este link para disparar a mídia no WhatsApp.
                  </p>
                </div>
              )}
            </div>
          </Tabs>
        </div>

        <DialogFooter className="mt-2">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={loading}
            className="text-muted-foreground hover:bg-white/5 hover:text-white"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={loading || selectedLeads.length === 0}
            className="bg-[color:var(--neon)]/20 text-[color:var(--neon)] border border-[color:var(--neon)]/30 hover:bg-[color:var(--neon)] hover:text-black font-bold transition-all px-6"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Disparar Campanha
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
