type ReportSection = { title: string; body: string };

export function ColorAnalysisReportView({
  fullName,
  sections,
}: {
  fullName: string;
  sections: ReportSection[];
}) {
  return (
    <div className="flex flex-col gap-5">
      {sections.map((s, i) => (
        <section
          key={i}
          className="rounded-xl border border-line bg-card p-5 shadow-sm"
        >
          <h2 className="mb-2 font-display text-[16px] text-brand">{s.title}</h2>
          <div className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
            {s.body}
          </div>
        </section>
      ))}
      {sections.length === 0 && (
        <p className="text-sm text-ink-faint">
          {fullName} için henüz bir rapor bölümü yok.
        </p>
      )}
    </div>
  );
}
