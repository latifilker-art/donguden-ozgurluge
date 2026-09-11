import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";
import { cancelAppointment } from "./actions";

type AppointmentRow = {
  id: string;
  session_type: string;
  requested_at: string;
  status: "pending" | "approved" | "declined";
  note: string | null;
  response_note: string | null;
  instructor: { profile: { display_name: string } | null } | null;
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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function RandevularimPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("appointments")
    .select(
      "id, session_type, requested_at, status, note, response_note, instructor:instructors(profile:profiles(display_name))",
    )
    .eq("member_id", user.id)
    .order("requested_at", { ascending: false });

  const appointments = (data ?? []) as unknown as AppointmentRow[];

  return (
    <>
      <AppBar active="/profilim" />
      <div className="mx-auto max-w-2xl px-7 py-8">
        <p className="mb-5 text-xs text-ink-faint">
          Profilim / <span className="font-medium text-ink-soft">Randevularım</span>
        </p>
        <h1 className="mb-6 font-display text-[25px]">Randevularım</h1>

        {appointments.length === 0 ? (
          <div className="rounded-xl border border-line bg-card p-6 text-sm text-ink-faint shadow-sm">
            Henüz bir randevu talebin yok. Bir eğitmenin profilinden
            bireysel randevu isteyebilirsin.
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {appointments.map((a) => {
              const meta = STATUS_META[a.status];
              const instructorName =
                a.instructor?.profile?.display_name ?? "Eğitmen";
              return (
                <div
                  key={a.id}
                  className="rounded-xl border border-line bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[15px] font-bold">
                        {a.session_type}
                      </div>
                      <div className="mt-0.5 text-xs text-ink-faint">
                        {instructorName} ile
                      </div>
                      <div className="mt-2 font-mono text-xs text-ink-soft">
                        {formatDateTime(a.requested_at)}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.pill}`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  {a.note && (
                    <p className="mt-3 border-t border-line-soft pt-3 text-sm text-ink-soft">
                      {a.note}
                    </p>
                  )}

                  {a.status === "declined" && a.response_note && (
                    <p className="mt-3 rounded-lg bg-surface-2 px-3.5 py-2.5 text-sm text-ink-soft italic">
                      &quot;{a.response_note}&quot;
                      <span className="mt-1 block text-xs not-italic text-ink-faint">
                        — {instructorName}
                      </span>
                    </p>
                  )}

                  {a.status === "pending" && (
                    <form
                      action={cancelAppointment.bind(null, a.id)}
                      className="mt-3 border-t border-line-soft pt-3"
                    >
                      <button
                        type="submit"
                        className="text-xs font-semibold text-ink-faint hover:text-neg"
                      >
                        Talebi İptal Et
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
