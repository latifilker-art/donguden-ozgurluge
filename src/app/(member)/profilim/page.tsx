import Link from "next/link";
import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import type { AccessLogEntry, ExternalWork, RhythmEntry } from "@/lib/types";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

const WORK_STATUS_LABEL: Record<string, string> = {
  not_started: "Başlanmadı",
  in_progress: "Devam ediyor",
  completed: "Tamamlandı",
};

export default async function ProfilimPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // (member)/layout.tsx zaten girişsiz kullanıcıyı /giris'e yönlendiriyor.
  if (!user) return null;

  const [profileRes, rhythmRes, worksRes, logRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, created_at")
      .eq("id", user.id)
      .single(),
    supabase.rpc("get_or_create_today_rhythm", { p_member_id: user.id }),
    supabase
      .from("external_works")
      .select("id, title, description, sort_order, member_work_progress(status, result_file_path)")
      .order("sort_order"),
    supabase
      .from("access_log")
      .select("id, reason, scope, accessed_at, admin_id")
      .eq("member_id", user.id)
      .order("accessed_at", { ascending: false }),
  ]);

  const profile = profileRes.data;
  const rhythm = (rhythmRes.data ?? []) as RhythmEntry[];
  const works = (worksRes.data ?? []) as unknown as ExternalWork[];
  const accessLog = (logRes.data ?? []) as AccessLogEntry[];

  const completedToday = rhythm.filter((r) => r.completed_at).length;
  const initials = (profile?.display_name ?? user.email ?? "?")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <AppBar active="/profilim" />
      <div className="mx-auto max-w-5xl px-7 py-8">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-display text-[27px]">Profilim</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1.5 text-xs font-semibold text-gold">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <rect x="4" y="11" width="16" height="9" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Sadece sen görüyorsun
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-[280px_1fr]">
          {/* ---- Sidebar ---- */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-xl border border-line bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-[62px] w-[62px] items-center justify-center rounded-full bg-brand font-display text-xl font-semibold text-brand-ink">
                {initials}
              </div>
              <h2 className="font-display text-lg">
                {profile?.display_name ?? user.email}
              </h2>
              {profile?.created_at && (
                <div className="mt-0.5 text-xs text-ink-faint">
                  {formatDate(profile.created_at)}&apos;den beri üye
                </div>
              )}
              <div className="mt-4 rounded-lg bg-surface-2 px-3 py-2.5 text-sm">
                <span className="font-mono">{completedToday} / 4</span>{" "}
                <span className="text-ink-faint">bugün tamamlandı</span>
              </div>
              <Link
                href="/randevularim"
                className="mt-4 block text-xs font-semibold text-brand"
              >
                Randevularım →
              </Link>
              <form action={signOut} className="mt-2.5">
                <button
                  type="submit"
                  className="text-xs text-ink-faint hover:text-neg"
                >
                  Çıkış Yap
                </button>
              </form>
            </div>

            <div className="rounded-xl border border-line bg-card p-5 shadow-sm">
              <div className="mb-2.5 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gold-soft text-gold">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                  >
                    <rect x="4" y="11" width="16" height="9" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold">Gizlilik</h3>
              </div>
              <p className="text-xs leading-relaxed text-ink-soft">
                Bu sayfadaki hiçbir bilgi diğer üyelerle paylaşılmaz. Destek
                ekibi yalnızca senin açtığın bir talebe yanıt vermek için,
                yalnızca gerekli kısma erişir — her erişim aşağıda kayıt
                altındadır.
              </p>
            </div>
          </aside>

          {/* ---- Main ---- */}
          <main className="flex flex-col gap-6">
            <Link
              href="/bugun"
              className="flex items-center justify-between rounded-xl border border-line bg-card p-5 shadow-sm transition hover:border-brand"
            >
              <div>
                <h2 className="font-display text-[17px]">Bugünün Ritmi</h2>
                <p className="mt-0.5 text-sm text-ink-soft">
                  {formatDate(new Date().toISOString())} — günlük pratiğini
                  görmek için Bugün&apos;e git
                </p>
              </div>
              <span className="shrink-0 font-mono text-lg text-brand">
                {completedToday} / 4
              </span>
            </Link>

            <section>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-display text-[17px]">Harici Çalışmalar</h2>
                <span className="font-mono text-[11px] text-ink-faint">
                  {works.filter((w) => w.member_work_progress[0]?.status === "completed").length}{" "}
                  / {works.length} tamamlandı
                </span>
              </div>
              <div className="rounded-xl border border-line bg-card p-1.5 shadow-sm">
                {works.map((work, i) => {
                  const status = work.member_work_progress[0]?.status ?? "not_started";
                  const fileReady = status === "completed" && work.member_work_progress[0]?.result_file_path;
                  return (
                    <div
                      key={work.id}
                      className="grid grid-cols-[34px_1fr_auto] items-center gap-4 border-b border-line-soft px-4 py-3.5 last:border-b-0"
                    >
                      <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-brand-soft font-mono text-xs font-semibold text-brand">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <div className="text-[13.5px] font-semibold">{work.title}</div>
                        <div className="mt-0.5 text-[11.5px] text-ink-faint">
                          {WORK_STATUS_LABEL[status]}
                        </div>
                      </div>
                      {fileReady ? (
                        <span className="text-xs font-semibold text-brand">
                          Dosyanı Gör
                        </span>
                      ) : (
                        <span className="text-xs text-ink-faint">
                          Eğitmenin işaretlemesini bekliyor
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-display text-[17px]">Erişim Günlüğü</h2>
                <span className="font-mono text-[11px] text-ink-faint">
                  son 90 gün
                </span>
              </div>
              <div className="rounded-xl border border-line bg-card p-5 shadow-sm">
                {accessLog.length === 0 ? (
                  <div className="flex items-center gap-2.5 rounded-lg bg-brand-soft px-3.5 py-3 text-sm font-semibold text-brand">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5 shrink-0"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Destek ekibi hesabına hiç erişmedi
                  </div>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {accessLog.map((entry) => (
                      <li
                        key={entry.id}
                        className="border-t border-line-soft pt-3 text-sm first:border-t-0 first:pt-0"
                      >
                        <span className="font-mono text-ink-faint">
                          {formatDate(entry.accessed_at)}
                        </span>{" "}
                        — <span className="font-semibold">{entry.reason}</span>{" "}
                        <span className="text-ink-soft">{entry.scope}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
