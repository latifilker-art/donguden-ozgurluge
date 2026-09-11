import Link from "next/link";

const TABS = [
  { href: "/bugun", label: "Bugün" },
  { href: "/programlar", label: "Programlar" },
  { href: "/egitmenler", label: "Eğitmenler" },
  { href: "/duyurular", label: "Duyurular" },
  { href: "/profilim", label: "Profilim" },
] as const;

type TabHref = (typeof TABS)[number]["href"];

export function AppBar({ active }: { active?: TabHref }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-line bg-card px-7 py-4">
      <Link
        href="/"
        className="flex items-center gap-2.5 font-display text-base italic text-brand"
      >
        <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
        Sükunet
      </Link>
      <nav className="flex flex-wrap gap-1">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={tab.href === active ? "page" : undefined}
            className={
              "rounded-md px-3.5 py-1.5 text-sm " +
              (tab.href === active
                ? "bg-brand-soft font-semibold text-brand"
                : "text-ink-faint hover:text-ink")
            }
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-brand-ink"
        aria-hidden="true"
      >
        EK
      </div>
    </header>
  );
}
