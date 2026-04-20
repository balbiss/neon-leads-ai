import { cn } from "@/lib/utils";

export function NeonBadge({
  children,
  variant = "neon",
  className,
}: {
  children: React.ReactNode;
  variant?: "neon" | "neutral" | "danger";
  className?: string;
}) {
  const styles = {
    neon: "bg-[color:var(--neon)]/15 text-[color:var(--neon)] border-[color:var(--neon)]/30",
    neutral: "bg-white/5 text-[#aaa] border-white/10",
    danger: "bg-destructive/15 text-destructive border-destructive/30",
  }[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles,
        className,
      )}
    >
      {children}
    </span>
  );
}
