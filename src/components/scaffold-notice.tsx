export function ScaffoldNotice({
  title,
  eyebrow,
  artifact,
  phase,
}: {
  title: string;
  eyebrow: string;
  artifact: string;
  phase: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-7 py-20">
      <p className="mb-3 font-mono text-[11px] tracking-wide text-brand uppercase">
        {eyebrow}
      </p>
      <h1 className="mb-4 font-display text-3xl text-balance">{title}</h1>
      <div className="rounded-xl border border-line bg-card p-5 text-sm text-ink-soft shadow-sm">
        <p className="mb-1">
          Bu rota bilerek iskelet halinde bırakıldı — tasarımı{" "}
          <span className="font-semibold text-ink">{artifact}</span>{" "}
          artifact&apos;inde zaten var, buraya gerçek veriyle{" "}
          <span className="font-semibold text-ink">{phase}</span>{" "}
          aşamasında bağlanacak.
        </p>
      </div>
    </div>
  );
}
