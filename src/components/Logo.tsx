export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="text-lg font-bold tracking-tight">
        <span className="text-foreground">Visita IA</span>{" "}
        <span className="neon-text">Leads</span>
      </div>
      <span className="rounded-md border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wider neon-text">
        PRO
      </span>
    </div>
  );
}
