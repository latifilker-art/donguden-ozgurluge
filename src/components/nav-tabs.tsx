"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string };

// En uzun eşleşen sekme aktif sayılır (/panel, /panel/programlar'ı gölgelemesin).
function activeHref(tabs: Tab[], pathname: string, override?: string) {
  if (override) return override;
  const matches = tabs.filter((t) => pathname === t.href || pathname.startsWith(t.href + "/"));
  return matches.sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

export function NavTabs({
  tabs,
  active,
  unread,
}: {
  tabs: Tab[];
  active?: string;
  unread: number;
}) {
  const pathname = usePathname();
  const current = activeHref(tabs, pathname, active);

  return (
    <nav className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto px-1 md:order-none md:w-auto md:overflow-visible">
      {tabs.map((tab) => {
        const on = tab.href === current;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={on ? "page" : undefined}
            className={
              "relative shrink-0 rounded-md px-3 py-1.5 text-sm whitespace-nowrap " +
              (on ? "bg-brand-soft font-semibold text-brand" : "text-ink-faint hover:text-ink")
            }
          >
            {tab.label}
            {tab.href === "/mesajlar" && unread > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-neg px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
