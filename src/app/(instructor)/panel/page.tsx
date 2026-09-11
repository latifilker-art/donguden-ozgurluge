import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";
import { respondToAppointment } from "./actions";

type AppointmentRow = {
  id: string;
  session_type: string;
  requested_at: string;
  status: "pending" | "approved" | "declined";
  note: string | null;
  member: { display_name: string } | null;
};

const STATUS_META = {
  pending: { label: "Bekliyor", pill: "bg-gold-soft text-gold" },
  approved: { label: "Onaylandı", pill: "bg-brand-soft text-brand" },
  declined: { label: "Reddedildi", pill: "bg-neg-soft text-neg" },
} as const;

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function EgitmenPaneliPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("appointments")
    .select(
      "id, session_type, requested_at, status, note, member:profiles(display_name)",
    )
    .eq("instructor_id", user.id)
    .order("requested_at", { ascending: false });

  const appointments = (data ?? []) as unknown as AppointmentRow[];
  const pending = appointments.filter((a) => a.status === "pending");
  const answered = appointments.filter((a) => a.status !== "pending");

  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-2xl px-7 py-8">
        <p className="mb-2 font-mono text-[11px] tracking-wide text-brand uppercase">
          Eğitmen Paneli
        </p>
        <h1 className="mb-6 font-display text-[25px]">Gelen Randevu Talepleri</h1>

        <section className="mb-8">
          <h2 className="mb-3 font-display text-[17px]">
            Bekliyor{" "}
            <span className="font-mono text-sm text-ink-faint">
              ({pending.length})
            </span>
          </h2>
          {pending.length === 0 ? (
            <div className="rounded-xl border border-line bg-card p-5 text-sm text-ink-faint shadow-sm">
              Bekleyen bir talep yok.
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {pending.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-line bg-card p-5 shadow-sm"
                >
                  <div className="text-[15px] font-bold">{a.session_type}</div>
                  <div className="mt-0.5 text-xs text-ink-faint">
                    {a.member?.display_name ?? "Üye"} · {formatDateTime(a.requested_at)}
                  </div>
                  {a.note && (
                    <p className="mt-2 text-sm text-ink-soft">{a.note}</p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line-soft pt-3.5">
                    <form action={respondToAppointment.bind(null, a.id, "approved")}>
                      <button
                        type="submit"
                        className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-brand-ink"
                      >
                        Onayla
                      </button>
                    </form>
                    <form
                      action={respondToAppointment.bind(null, a.id, "declined")}
                      className="flex flex-1 items-center gap-2"
                    >
                      <input
                        type="text"
                        name="responseNote"
                        placeholder="Reddetme nedeni (opsiyonel)"
                        className="min-w-0 flex-1 rounded-lg border border-line bg-card px-3 py-2 text-xs text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      />
                      <button
                        type="submit"
                        className="shrink-0 rounded-lg border border-line px-4 py-2 text-xs font-semibold text-ink-soft hover:border-neg hover:text-neg"
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

        {answered.length > 0 && (
          <section>
            <h2 className="mb-3 font-display text-[17px]">Yanıtlanmış</h2>
            <div className="flex flex-col gap-3">
              {answered.map((a) => {
                const meta = STATUS_META[a.status];
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line bg-card p-4 shadow-sm"
                  >
                    <div>
                      <div className="text-sm font-semibold">{a.session_type}</div>
                      <div className="text-xs text-ink-faint">
                        {a.member?.display_name ?? "Üye"} · {formatDateTime(a.requested_at)}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.pill}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
