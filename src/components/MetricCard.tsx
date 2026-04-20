import type { LucideIcon } from "lucide-react";
import { NeonBadge } from "./NeonBadge";

export function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
}) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[#141414] p-5 transition-colors duration-200 hover:border-[color:var(--neon)]/30">
      <div className="flex items-start justify-between">
        <div className="label-caps">{label}</div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--neon)]/15">
          <Icon className="h-4 w-4 neon-text" />
        </div>
      </div>
      <div className="mt-4 text-3xl font-bold text-foreground">{value}</div>
      {trend && (
        <div className="mt-3">
          <NeonBadge>{trend}</NeonBadge>
        </div>
      )}
    </div>
  );
}
