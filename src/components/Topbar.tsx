import { Bell, Search } from "lucide-react";
import { NeonBadge } from "./NeonBadge";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[#1f1f1f] bg-[#0d0d0d] px-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Buscar leads, extrações..."
            className="w-72 rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[color:var(--neon)]/40 focus:outline-none"
          />
        </div>

        <NeonBadge>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--neon)]" />
          Sistema Online
        </NeonBadge>

        <button className="relative rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] p-2 text-muted-foreground transition-colors hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--neon)] text-[10px] font-bold text-black">
            3
          </span>
        </button>

        <div className="flex items-center gap-3 border-l border-[color:var(--border)] pl-4">
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">João Silva</div>
            <div className="text-xs text-muted-foreground">Admin</div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--neon)]/15 text-sm font-semibold neon-text">
            JS
          </div>
        </div>
      </div>
    </header>
  );
}
