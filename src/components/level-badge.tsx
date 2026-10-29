import { LEVELS, type Level } from "@/lib/level";

export function LevelBadge({ level }: { level: Level }) {
  const l = LEVELS[level];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
      style={{ background: l.bg, color: l.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: l.color }} />
      {l.label} Üye
    </span>
  );
}
