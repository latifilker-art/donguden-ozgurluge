import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { createClient } from "@/lib/supabase/server";

const TABS = [
  { href: "/bugun", label: "Bugün" },
  { href: "/programlar", label: "Programlar" },
  { href: "/egitmenler", label: "Eğitmenler" },
  { href: "/duyurular", label: "Duyurular" },
  { href: "/fotograflar", label: "Fotoğraflar" },
  { href: "/profilim", label: "Profilim" },
] as const;

type TabHref = (typeof TABS)[number]["href"];

export async function AppBar({ active }: { active?: TabHref }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName = "?";
  let avatarUrl: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single();
    displayName = profile?.display_name ?? user.email ?? "?";
    avatarUrl = profile?.avatar_url ?? null;
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b border-line bg-card px-7 py-4">
      <Link
        href="/"
        className="flex items-center gap-2.5 font-display text-base italic text-brand"
      >
        <span className="h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
        Döngüden Özgürlüğe
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
      {user ? (
        <Link href="/profilim" aria-label="Profilim">
          <Avatar name={displayName} avatarUrl={avatarUrl} size={32} className="text-xs" />
        </Link>
      ) : (
        <Avatar name="?" size={32} className="text-xs" />
      )}
    </header>
  );
}
