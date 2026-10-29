import Link from "next/link";
import { AppBar } from "@/components/app-bar";
import { Avatar } from "@/components/avatar";
import { AutoRefresh } from "@/components/auto-refresh";
import { createClient } from "@/lib/supabase/server";

type Msg = { sender_id: string; recipient_id: string; body: string; created_at: string; read_at: string | null };
type Person = { id: string; display_name: string; avatar_url: string | null; role: string };

const ROLE_LABEL: Record<string, string> = { member: "Üye", instructor: "Eğitmen", admin: "Yönetim" };

export default async function MesajlarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let peopleQuery = supabase
    .from("profiles")
    .select("id, display_name, avatar_url, role")
    .eq("status", "approved")
    .neq("id", user.id)
    .order("display_name")
    .limit(60);
  if (q) peopleQuery = peopleQuery.ilike("display_name", `%${q.replace(/[%_]/g, "")}%`);

  const [{ data: msgData }, { data: peopleData }] = await Promise.all([
    supabase
      .from("messages")
      .select("sender_id, recipient_id, body, created_at, read_at")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(300),
    peopleQuery,
  ]);

  const msgs = (msgData ?? []) as Msg[];
  const people = (peopleData ?? []) as Person[];

  const convos = new Map<string, { last: Msg; unread: number }>();
  for (const m of msgs) {
    const other = m.sender_id === user.id ? m.recipient_id : m.sender_id;
    const c = convos.get(other) ?? { last: m, unread: 0 };
    if (m.recipient_id === user.id && !m.read_at) c.unread += 1;
    convos.set(other, c);
  }

  const missing = [...convos.keys()].filter((id) => !people.some((p) => p.id === id));
  const { data: extra } = missing.length
    ? await supabase.from("profiles").select("id, display_name, avatar_url, role").in("id", missing)
    : { data: [] };
  const byId = new Map<string, Person>(
    [...people, ...((extra ?? []) as Person[])].map((p) => [p.id, p]),
  );

  return (
    <>
      <AppBar active="/mesajlar" />
      <AutoRefresh seconds={15} />
      <div className="mx-auto max-w-3xl px-7 py-8">
        <p className="mb-2 font-mono text-[11px] tracking-wide text-brand uppercase">Mesajlar</p>
        <h1 className="mb-6 font-display text-[27px]">Sohbetlerin</h1>

        <div className="mb-8 overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
          {[...convos.entries()].map(([id, c]) => {
            const p = byId.get(id);
            if (!p) return null;
            return (
              <Link
                key={id}
                href={`/mesajlar/${id}`}
                className="flex items-center gap-3 border-b border-line-soft px-4 py-3.5 last:border-b-0 hover:bg-brand-soft/40"
              >
                <Avatar name={p.display_name} avatarUrl={p.avatar_url} size={42} className="text-sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{p.display_name}</span>
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-ink-soft">
                      {ROLE_LABEL[p.role] ?? p.role}
                    </span>
                  </div>
                  <div className="truncate text-xs text-ink-soft">
                    {c.last.sender_id === user.id ? "Sen: " : ""}
                    {c.last.body}
                  </div>
                </div>
                {c.unread > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-neg px-1.5 text-[11px] font-bold text-white">
                    {c.unread}
                  </span>
                )}
              </Link>
            );
          })}
          {convos.size === 0 && (
            <p className="p-5 text-sm text-ink-faint">Henüz bir sohbetin yok. Aşağıdan birini seçip yazabilirsin.</p>
          )}
        </div>

        <h2 className="mb-3 font-display text-[17px]">Yeni Mesaj</h2>
        <form className="mb-4 flex gap-2">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="İsimle ara…"
            className="flex-1 rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm"
          />
          <button className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-brand-ink">Ara</button>
        </form>
        <div className="grid gap-2 sm:grid-cols-2">
          {people.map((p) => (
            <Link
              key={p.id}
              href={`/mesajlar/${p.id}`}
              className="flex items-center gap-3 rounded-xl border border-line bg-card px-3.5 py-3 shadow-sm transition hover:border-brand"
            >
              <Avatar name={p.display_name} avatarUrl={p.avatar_url} size={36} className="text-xs" />
              <div>
                <div className="text-sm font-semibold">{p.display_name}</div>
                <div className="text-[11px] text-ink-faint">{ROLE_LABEL[p.role] ?? p.role}</div>
              </div>
            </Link>
          ))}
          {people.length === 0 && <p className="text-sm text-ink-faint">Sonuç yok.</p>}
        </div>
      </div>
    </>
  );
}
