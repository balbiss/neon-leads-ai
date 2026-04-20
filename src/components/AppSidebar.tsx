import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  Download,
  Users,
  Activity,
  BarChart3,
  Search,
  CreditCard,
  Shield,
  Settings,
  LogOut,
} from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const mainItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/extractions", label: "Minhas Extrações", icon: Download },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/monitoring", label: "Monitoramento", icon: Activity },
  { to: "/reports", label: "Relatórios", icon: BarChart3 },
  { to: "/garimpador", label: "Garimpador VivaReal & ZAP", icon: Search },
];

const settingsItems = [
  { to: "/plan", label: "Meu Plano", icon: CreditCard },
  { to: "/admin", label: "Administração", icon: Shield },
  { to: "/settings", label: "Configurações", icon: Settings },
];

function NavItem({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-200",
        active
          ? "bg-white/5 text-foreground"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 transition-colors",
          active ? "text-[color:var(--neon)]" : "text-muted-foreground group-hover:text-[color:var(--neon)]",
        )}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function AppSidebar() {
  const { location } = useRouterState();
  const path = location.pathname;

  return (
    <aside className="flex h-screen w-[240px] shrink-0 flex-col border-r border-[color:var(--border)] bg-sidebar">
      <div className="flex h-14 items-center border-b border-[color:var(--border)] px-5">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {mainItems.map((it) => (
            <NavItem key={it.to} {...it} active={path === it.to || path.startsWith(it.to + "/")} />
          ))}
        </div>

        <div className="mt-6">
          <div className="label-caps mb-2 px-3">Configurações</div>
          <div className="space-y-1">
            {settingsItems.map((it) => (
              <NavItem key={it.to} {...it} active={path === it.to} />
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-[color:var(--border)] p-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
