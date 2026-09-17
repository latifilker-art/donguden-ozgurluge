import { AppBar } from "@/components/app-bar";
import { Avatar } from "@/components/avatar";
import { createClient } from "@/lib/supabase/server";
import { approveMember, rejectMember } from "./actions";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function UyelerPage() {
  const supabase = await createClient();

  const [{ data: pending }, { data: everyone }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url, created_at")
      .eq("role", "member")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, display_name, status")
      .eq("role", "member")
      .order("display_name"),
  ]);

  const STATUS_LABEL: Record<string, { label: string; pill: string }> = {
    pending: { label: "Bekliyor", pill: "bg-gold-soft text-gold" },
    approved: { label: "Onaylı", pill: "bg-brand-soft text-brand" },
    rejected: { label: "Reddedildi", pill: "bg-neg-soft text-neg" },
  };

  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-2xl px-7 py-8">
        <p className="mb-2 font-mono text-[11px] tracking-wide text-brand uppercase">
          Admin
        </p>
        <h1 className="mb-6 font-display text-[25px]">Üye Onayı</h1>

        <section className="mb-8">
          <h2 className="mb-3 font-display text-[17px]">
            Onay Bekleyenler{" "}
            <span className="font-mono text-sm text-ink-faint">
              ({(pending ?? []).length})
            </span>
          </h2>
          {(pending ?? []).length === 0 ? (
            <div className="rounded-xl border border-line bg-card p-5 text-sm text-ink-faint shadow-sm">
              Onay bekleyen bir kayıt yok.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {(pending ?? []).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-line bg-card p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={m.display_name} avatarUrl={m.avatar_url} size={38} />
                    <div>
                      <div className="text-sm font-bold">{m.display_name}</div>
                      <div className="text-xs text-ink-faint">
                        {formatDate(m.created_at)} tarihinde kaydoldu
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <form action={approveMember.bind(null, m.id)}>
                      <button
                        type="submit"
                        className="rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-brand-ink"
                      >
                        Onayla
                      </button>
                    </form>
                    <form action={rejectMember.bind(null, m.id)}>
                      <button
                        type="submit"
                        className="rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-ink-soft hover:border-neg hover:text-neg"
                      >
                        Reddet
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-display text-[17px]">Tüm Üyeler</h2>
          <div className="rounded-xl border border-line bg-card shadow-sm">
            {(everyone ?? []).map((m) => {
              const meta = STATUS_LABEL[m.status] ?? STATUS_LABEL.pending;
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between border-b border-line-soft px-5 py-3 text-sm last:border-b-0"
                >
                  <span className="font-medium">{m.display_name}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.pill}`}
                  >
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
