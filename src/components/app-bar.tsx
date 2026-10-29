import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { NavTabs } from "@/components/nav-tabs";
import { createClient } from "@/lib/supabase/server";

type Tab = { href: string; label: string };

const MEMBER_TABS: Tab[] = [
  { href: "/bugun", label: "Bugün" },
  { href: "/programlar", label: "Programlar" },
  { href: "/egitmenler", label: "Eğitmenler" },
  { href: "/duyurular", label: "Duyurular" },
  { href: "/frekans", label: "Frekans" },
  { href: "/fotograflar", label: "Fotoğraflar" },
  { href: "/mesajlar", label: "Mesajlar" },
  { href: "/profilim", label: "Profilim" },
];

const INSTRUCTOR_TABS: Tab[] = [
  { href: "/panel", label: "Panelim" },
  { href: "/panel/programlar", label: "Verdiğim Eğitimler" },
  { href: "/panel/profil", label: "Eğitmen Profilim" },
  { href: "/mesajlar", label: "Mesajlar" },
  { href: "/frekans", label: "Frekans" },
  { href: "/fotograflar", label: "Fotoğraflar" },
];

const ADMIN_TABS: Tab[] = [
  { href: "/admin", label: "Yönetim" },
  { href: "/admin/talepler", label: "Talepler" },
  { href: "/admin/uyeler", label: "Üyeler" },
  { href: "/admin/uyelikler", label: "Seviyeler" },
  { href: "/admin/egitmenler", label: "Eğitmenler" },
  { href: "/admin/destek", label: "Destek" },
  { href: "/admin/etkinlikler", label: "Etkinlikler" },
  { href: "/admin/fotograflar", label: "Fotoğraflar" },
  { href: "/admin/ses-kutuphanesi", label: "Ses" },
  { href: "/mesajlar", label: "Mesajlar" },
];

const TABS_BY_ROLE: Record<string, Tab[]> = {
  member: MEMBER_TABS,
  instructor: INSTRUCTOR_TABS,
  admin: ADMIN_TABS,
};

export async function AppBar({ active }: { active?: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName = "?";
  let avatarUrl: string | null = null;
  let role = "member";
  let unread = 0;
  if (user) {
    const [{ data: profile }, { count }] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, avatar_url, role")
        .eq("id", user.id)
        .single(),
      supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .is("read_at", null),
    ]);
    displayName = profile?.display_name ?? user.email ?? "?";
    avatarUrl = profile?.avatar_url ?? null;
    role = profile?.role ?? "member";
    unread = count ?? 0;
  }

  const tabs = user ? (TABS_BY_ROLE[role] ?? MEMBER_TABS) : [];
  const home = role === "admin" ? "/admin" : role === "instructor" ? "/panel" : "/profilim";

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line bg-card px-5 py-3.5 md:px-7">
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2.5 font-display text-base italic text-brand"
      >
        <span className="h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
        Döngüden Özgürlüğe
      </Link>
      {tabs.length > 0 && <NavTabs tabs={tabs} active={active} unread={unread} />}
      {user ? (
        <Link href={home} aria-label="Hesabım" className="shrink-0">
          <Avatar name={displayName} avatarUrl={avatarUrl} size={32} className="text-xs" />
        </Link>
      ) : (
        <span />
      )}
    </header>
  );
}
