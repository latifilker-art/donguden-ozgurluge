import { COLOR_CONTENT, buildDailyPlan } from "@/lib/color-analysis/daily-plan";
import type { ColorAnalysisComputation, ColorName } from "@/lib/color-analysis/numerology";

function Swatch({ color, label }: { color: ColorName; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div
        className="h-14 w-14 rounded-2xl shadow-inner ring-1 ring-black/5"
        style={{ background: COLOR_CONTENT[color].hex }}
      />
      <div className="text-[11px] font-semibold">{color}</div>
      <div className="font-mono text-[10px] text-ink-faint">{label}</div>
    </div>
  );
}

export function ColorProfileCard({ computation }: { computation: ColorAnalysisComputation }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[17px]">Renk Profilin</h2>
        <span className="font-mono text-[10px] text-ink-faint">4 ana katman</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Swatch color={computation.lifePath.color} label="Yaşam Yolu" />
        <Swatch color={computation.potential.color} label="Potansiyel" />
        <Swatch color={computation.innerSelf.color} label="İç Benlik" />
        <Swatch color={computation.mask.color} label="Maske" />
      </div>
      {computation.missingColors.length > 0 && (
        <p className="mt-4 rounded-lg bg-gold-soft px-3 py-2 text-xs text-gold">
          Çalışma rengin:{" "}
          <span className="font-semibold">{computation.missingColors.join(", ")}</span>
        </p>
      )}
    </div>
  );
}

export function DailyPlanCard({ computation }: { computation: ColorAnalysisComputation }) {
  const plan = buildDailyPlan(computation);
  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
      <h2 className="mb-1 font-display text-[17px]">Sana Özel Günlük Plan</h2>
      <p className="mb-4 text-xs text-ink-faint">
        Renk analizinden üretildi — odak rengin: {plan.focusColor}
      </p>
      <div className="mb-5 flex flex-col gap-2.5">
        {plan.affirmations.map((a) => (
          <div
            key={a.label}
            className="rounded-xl border-l-4 bg-surface-2 px-3.5 py-2.5"
            style={{ borderLeftColor: COLOR_CONTENT[a.color].hex }}
          >
            <div className="font-mono text-[10px] text-ink-faint">{a.label}</div>
            <div className="text-sm italic">&ldquo;{a.text}&rdquo;</div>
          </div>
        ))}
      </div>
      <h3 className="mb-2 text-sm font-semibold">Bugün yapabileceklerin</h3>
      <ul className="flex flex-col gap-2">
        {plan.todos.map((t, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-ink-soft">
            <span
              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: COLOR_CONTENT[t.color].hex }}
            />
            {t.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
