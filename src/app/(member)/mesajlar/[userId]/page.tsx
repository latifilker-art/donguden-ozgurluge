import Link from "next/link";
import { notFound } from "next/navigation";
import { AppBar } from "@/components/app-bar";
import { Avatar } from "@/components/avatar";
import { AutoRefresh } from "@/components/auto-refresh";
import { createClient } from "@/lib/supabase/server";
import { sendMessage } from "../actions";

type Msg = { id: string; sender_id: string; body: string; created_at: string };

function fmt(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function SohbetPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id === userId) notFound();

  const [{ data: other }, { data: msgData }] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url, role").eq("id", userId).single(),
    supabase
      .from("messages")
      .select("id, sender_id, body, created_at")
      .or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id})`,
      )
      .order("created_at", { ascending: true })
      .limit(300),
  ]);
  if (!other) notFound();

  await supabase.rpc("mark_thread_read", { p_other: userId });
  const msgs = (msgData ?? []) as Msg[];

  return (
    <>
      <AppBar active="/mesajlar" />
      <AutoRefresh seconds={8} />
      <div className="mx-auto flex max-w-2xl flex-col px-7 py-6">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/mesajlar" className="text-sm text-ink-faint hover:text-ink">
            ←
          </Link>
          <Avatar name={other.display_name} avatarUrl={other.avatar_url} size={40} className="text-sm" />
          <div>
            <div className="text-[15px] font-bold">{other.display_name}</div>
            <div className="text-[11px] text-ink-faint">
              {other.role === "instructor" ? "Eğitmen" : other.role === "admin" ? "Yönetim" : "Üye"}
            </div>
          </div>
        </div>

        <div className="mb-4 flex min-h-[40vh] flex-col gap-2.5 rounded-2xl border border-line bg-card p-4 shadow-sm">
          {msgs.map((m) => {
            const mine = m.sender_id === user.id;
            return (
              <div key={m.id} className={"flex " + (mine ? "justify-end" : "justify-start")}>
                <div
                  className={
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm " +
                    (mine ? "rounded-br-sm bg-brand text-brand-ink" : "rounded-bl-sm bg-surface-2 text-ink")
                  }
                >
                  <div className="whitespace-pre-line">{m.body}</div>
                  <div className={"mt-1 text-[10px] " + (mine ? "text-white/70" : "text-ink-faint")}>
                    {fmt(m.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
          {msgs.length === 0 && (
            <p className="m-auto text-sm text-ink-faint">Sohbeti başlat — ilk mesajı sen yaz.</p>
          )}
        </div>

        <form action={sendMessage.bind(null, userId)} className="flex gap-2">
          <textarea
            name="body"
            required
            rows={2}
            maxLength={4000}
            placeholder="Mesajını yaz…"
            className="flex-1 resize-none rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
          <button className="self-end rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-ink">
            Gönder
          </button>
        </form>
      </div>
    </>
  );
}
