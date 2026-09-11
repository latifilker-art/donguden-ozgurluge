import { notFound } from "next/navigation";
import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";
import { logMemberAccess } from "../actions";

const RHYTHM_LABEL: Record<string, string> = {
  morning_affirmation: "Sabah Olumlaması",
  breath: "Nefes Çalışması",
  noon_affirmation: "Öğlen Olumlaması",
  evening_questions: "Akşam Dönüştürücü Sorular",
};

const WORK_STATUS_LABEL: Record<string, string> = {
  not_started: "Başlanmadı",
  in_progress: "Devam ediyor",
  completed: "Tamamlandı",
};

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

export default async function DestekMemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ memberId: string }>;
  searchParams: Promise<{ viewed?: string }>;
}) {
  const { memberId } = await params;
  const { viewed } = await searchParams;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, created_at")
    .eq("id", memberId)
    .eq("role", "member")
    .single();

  if (!profile) notFound();

  if (viewed !== "1") {
    return (
      <>
        <AppBar />
        <div className="mx-auto max-w-md px-7 py-8">
          <p className="mb-5 text-xs text-ink-faint">
            Admin / Destek /{" "}
            <span className="font-medium text-ink-soft">
              {profile.display_name}
            </span>
          </p>
          <h1 className="mb-2 font-display text-[22px]">
            {profile.display_name} profilini görüntüle
          </h1>
          <p className="mb-6 text-sm text-ink-soft">
            Devam etmeden önce sebep gir — bu, üyenin kendi{" "}
            <span className="font-semibold">Erişim Günlüğü</span>&apos;nde
            görünecek.
          </p>
          <form
            action={logMemberAccess.bind(null, memberId)}
            className="flex flex-col gap-4 rounded-xl border border-line bg-card p-5 shadow-sm"
          >
            <div>
              <label
                htmlFor="reason"
                className="mb-1.5 block text-sm font-medium text-ink-soft"
              >
                Sebep
              </label>
              <input
                id="reason"
                name="reason"
                required
                placeholder="Örn: Destek Talebi #482"
                className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
            </div>
            <div>
              <label
                htmlFor="scope"
                className="mb-1.5 block text-sm font-medium text-ink-soft"
              >
                Neyi görüntüleyeceksin
              </label>
              <input
                id="scope"
                name="scope"
                required
                placeholder="Örn: Sadece program ilerlemesi"
                className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-ink"
            >
              Kaydet ve Görüntüle
            </button>
          </form>
        </div>
      </>
    );
  }

  // viewed=1 — erişim zaten loglandı, veriyi göster.
  const [{ data: rhythm }, { data: works }, { data: appointments }] =
    await Promise.all([
      supabase
        .from("rhythm_entries")
        .select("item, completed_at")
        .eq("member_id", memberId)
        .order("entry_date", { ascending: false })
        .limit(4),
      supabase
        .from("member_work_progress")
        .select("status, external_works(title)")
        .eq("member_id", memberId),
      supabase
        .from("appointments")
        .select("session_type, status, requested_at")
        .eq("member_id", memberId)
        .order("requested_at", { ascending: false })
        .limit(5),
    ]);

  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-2xl px-7 py-8">
        <p className="mb-5 text-xs text-ink-faint">
          Admin / Destek /{" "}
          <span className="font-medium text-ink-soft">
            {profile.display_name}
          </span>
        </p>
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-gold-soft px-3.5 py-2.5 text-xs font-semibold text-gold">
          Bu görüntüleme üyenin erişim günlüğüne kaydedildi.
        </div>
        <h1 className="mb-6 font-display text-[22px]">
          {profile.display_name}
        </h1>

        <section className="mb-6">
          <h2 className="mb-3 font-display text-[16px]">
            Son Günlük Ritim Kayıtları
          </h2>
          <div className="rounded-xl border border-line bg-card p-1.5 shadow-sm">
            {(rhythm ?? []).map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-line-soft px-4 py-3 text-sm last:border-b-0"
              >
                <span>{RHYTHM_LABEL[r.item] ?? r.item}</span>
                <span
                  className={
                    r.completed_at
                      ? "font-semibold text-brand"
                      : "text-ink-faint"
                  }
                >
                  {r.completed_at ? "Tamamlandı" : "Yapılmadı"}
                </span>
              </div>
            ))}
            {(rhythm ?? []).length === 0 && (
              <p className="p-4 text-sm text-ink-faint">Kayıt yok.</p>
            )}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 font-display text-[16px]">Harici Çalışmalar</h2>
          <div className="rounded-xl border border-line bg-card p-1.5 shadow-sm">
            {(works ?? []).map(
              (
                w: {
                  status: string;
                  external_works: { title: string } | { title: string }[] | null;
                },
                i: number,
              ) => {
                const title = Array.isArray(w.external_works)
                  ? w.external_works[0]?.title
                  : w.external_works?.title;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-line-soft px-4 py-3 text-sm last:border-b-0"
                  >
                    <span>{title ?? "—"}</span>
                    <span className="text-ink-faint">
                      {WORK_STATUS_LABEL[w.status] ?? w.status}
                    </span>
                  </div>
                );
              },
            )}
            {(works ?? []).length === 0 && (
              <p className="p-4 text-sm text-ink-faint">Henüz başlanmamış.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-[16px]">Son Randevular</h2>
          <div className="rounded-xl border border-line bg-card p-1.5 shadow-sm">
            {(appointments ?? []).map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-line-soft px-4 py-3 text-sm last:border-b-0"
              >
                <span>{a.session_type}</span>
                <span className="text-xs text-ink-faint">
                  {formatDateTime(a.requested_at)} · {a.status}
                </span>
              </div>
            ))}
            {(appointments ?? []).length === 0 && (
              <p className="p-4 text-sm text-ink-faint">Randevu yok.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
