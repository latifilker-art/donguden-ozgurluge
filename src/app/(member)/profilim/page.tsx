import Link from "next/link";
import { AppBar } from "@/components/app-bar";
import { Avatar } from "@/components/avatar";
import { AvatarUploadInput } from "@/components/avatar-upload-input";
import { createClient } from "@/lib/supabase/server";
import { ColorProfileCard } from "@/components/color-profile";
import { DailyBoard } from "@/components/daily-board";
import { LevelBadge } from "@/components/level-badge";
import { LEVELS, asLevel } from "@/lib/level";
import { requestColorAnalysis, requestWork } from "./actions";
import type { ColorAnalysisComputation } from "@/lib/color-analysis/numerology";
import { signOut } from "@/lib/auth/actions";
import { uploadAvatar, updateProfile } from "./actions";
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

const TIER_LABEL: Record<string, { label: string; pill: string }> = {
  temel: { label: "Temel", pill: "bg-surface-2 text-ink-soft" },
  premium: { label: "Premium", pill: "bg-brand-soft text-brand" },
  vip: { label: "VIP", pill: "bg-gold-soft text-gold" },
};

export default async function ProfilimPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // (member)/layout.tsx zaten girişsiz kullanıcıyı /giris'e yönlendiriyor.
  if (!user) return null;

  const [profileRes, rhythmRes, worksRes, logRes, subRes, colorAnalysisRes, eveningHistoryRes, requestRes, workReqRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, avatar_url, created_at")
      .eq("id", user.id)
      .single(),
    supabase.rpc("get_or_create_today_rhythm", { p_member_id: user.id }),
    supabase
      .from("external_works")
      .select(
        "id, title, description, sort_order, member_work_progress(status, result_file_path, result_text)",
      )
      .order("sort_order"),
    supabase
      .from("access_log")
      .select("id, reason, scope, accessed_at, admin_id")
      .eq("member_id", user.id)
      .order("accessed_at", { ascending: false }),
    supabase
      .from("subscriptions")
      .select("plan, status, current_period_end")
      .eq("member_id", user.id)
      .maybeSingle(),
    supabase
      .from("color_analyses")
      .select("id, computation")
      .eq("member_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("rhythm_entries")
      .select("id, entry_date, answer_text")
      .eq("member_id", user.id)
      .eq("item", "evening_questions")
      .not("answer_text", "is", null)
      .order("entry_date", { ascending: false })
      .limit(10),
    supabase
      .from("color_analysis_requests")
      .select("status, created_at")
      .eq("member_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("work_requests")
      .select("work_title")
      .eq("member_id", user.id)
      .eq("status", "pending"),
  ]);
  const pendingWorks = new Set((workReqRes.data ?? []).map((r: { work_title: string }) => r.work_title));

  const profile = profileRes.data;
  const { data: priv } = await supabase
    .from("profile_private")
    .select("phone, birth_date, address, emergency_contact, bio")
    .eq("id", user.id)
    .maybeSingle();
  const rhythm = (rhythmRes.data ?? []) as RhythmEntry[];
  const works = (worksRes.data ?? []) as unknown as ExternalWork[];
  const accessLog = (logRes.data ?? []) as AccessLogEntry[];
  const fileUrls: Record<string, string> = {};
  for (const w of works) {
    const path = w.member_work_progress[0]?.result_file_path;
    if (path && w.title !== "Renk Analizi") {
      const { data: signed } = await supabase.storage
        .from("work-results")
        .createSignedUrl(path, 60 * 30);
      if (signed?.signedUrl) fileUrls[w.id] = signed.signedUrl;
    }
  }
  const latestColorAnalysisId = colorAnalysisRes.data?.id as string | undefined;
  const colorComputation = colorAnalysisRes.data?.computation as ColorAnalysisComputation | undefined;
  const lastRequest = requestRes.data as { status: string } | null;
  const eveningHistory = (eveningHistoryRes.data ?? []) as {
    id: string;
    entry_date: string;
    answer_text: string;
  }[];
  const { data: levelRaw } = await supabase.rpc("member_level", { p_member: user.id });
  const level = asLevel(levelRaw);

  const completedToday = rhythm.filter((r) => r.completed_at).length;
  const displayName = profile?.display_name ?? user.email ?? "?";

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
              <Avatar
                name={displayName}
                avatarUrl={profile?.avatar_url}
                size={72}
                className="mx-auto mb-3 text-2xl"
              />
              <form action={uploadAvatar} className="mb-3">
                <label className="block cursor-pointer text-[11px] font-semibold text-brand hover:underline">
                  Fotoğraf değiştir
                  <AvatarUploadInput />
                </label>
              </form>
              <h2 className="font-display text-lg">{displayName}</h2>
              <div className="mt-2">
                <LevelBadge level={level} />
              </div>
              <p className="mt-2 text-[11px] leading-snug text-ink-faint">{LEVELS[level].hint}</p>
              {profile?.created_at && (
                <div className="mt-2 text-xs text-ink-faint">
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

            <DailyBoard userId={user.id} name={displayName} doneToday={completedToday} />

            {colorComputation ? (
              <>
                <ColorProfileCard computation={colorComputation} />
              </>
            ) : (
              <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
                <h2 className="mb-1 font-display text-[17px]">Renk Analizi</h2>
                {lastRequest?.status === "pending" ? (
                  <p className="text-sm text-ink-soft">
                    Talebin alındı — Renk Analisti onayladığında raporun ve sana özel günlük planın burada görünecek.
                  </p>
                ) : (
                  <form action={requestColorAnalysis} className="flex flex-col gap-3">
                    <p className="text-sm text-ink-soft">
                      İsmin ve doğum tarihinle kişisel renk analizi talep et. Onay sonrası sana özel olumlama ve günlük plan oluşur.
                    </p>
                    {lastRequest?.status === "rejected" && (
                      <p className="text-xs text-neg">Önceki talebin onaylanmadı, bilgilerini kontrol edip tekrar gönderebilirsin.</p>
                    )}
                    <input name="fullName" required defaultValue={displayName} placeholder="Ad Soyad (kimlikteki gibi)" className="rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm" />
                    <input name="birthDate" type="date" required defaultValue={priv?.birth_date ?? ""} className="rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm" />
                    <button type="submit" className="self-start rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-brand-ink">Analiz Talep Et</button>
                  </form>
                )}
              </div>
            )}

            <section>
              <h2 className="mb-3 font-display text-[17px]">Hakkımda</h2>
              <form
                action={updateProfile}
                className="flex flex-col gap-3 rounded-xl border border-line bg-card p-5 shadow-sm"
              >
                <div>
                  <label
                    htmlFor="displayName"
                    className="mb-1.5 block text-xs font-semibold text-ink-soft"
                  >
                    Ad
                  </label>
                  <input
                    id="displayName"
                    name="displayName"
                    defaultValue={displayName}
                    required
                    className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  />
                </div>
                <div>
                  <label
                    htmlFor="bio"
                    className="mb-1.5 block text-xs font-semibold text-ink-soft"
                  >
                    Kısa biyografi (opsiyonel — sadece sen görürsün)
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    defaultValue={priv?.bio ?? ""}
                    placeholder="Kendinle ilgili birkaç kelime…"
                    className="w-full resize-y rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-1.5 block text-xs font-semibold text-ink-soft"
                    >
                      Telefon (opsiyonel)
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={priv?.phone ?? ""}
                      placeholder="05xx xxx xx xx"
                      className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="birthDate"
                      className="mb-1.5 block text-xs font-semibold text-ink-soft"
                    >
                      Doğum Tarihi (opsiyonel)
                    </label>
                    <input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      defaultValue={priv?.birth_date ?? ""}
                      className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="address"
                    className="mb-1.5 block text-xs font-semibold text-ink-soft"
                  >
                    Adres (opsiyonel)
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={2}
                    defaultValue={priv?.address ?? ""}
                    placeholder="Kamp/kargo gibi organizasyonlar için"
                    className="w-full resize-y rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  />
                </div>
                <div>
                  <label
                    htmlFor="emergencyContact"
                    className="mb-1.5 block text-xs font-semibold text-ink-soft"
                  >
                    Acil Durum İletişim Kişisi (opsiyonel)
                  </label>
                  <input
                    id="emergencyContact"
                    name="emergencyContact"
                    defaultValue={priv?.emergency_contact ?? ""}
                    placeholder="Ad Soyad — telefon"
                    className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  />
                </div>
                <button
                  type="submit"
                  className="self-start rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-brand-ink"
                >
                  Kaydet
                </button>
              </form>
            </section>

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
                  const resultText = work.member_work_progress[0]?.result_text;
                  return (
                    <div
                      key={work.id}
                      className="border-b border-line-soft px-4 py-3.5 last:border-b-0"
                    >
                      <div className="grid grid-cols-[34px_1fr_auto] items-center gap-4">
                        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-brand-soft font-mono text-xs font-semibold text-brand">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div>
                          <div className="text-[13.5px] font-semibold">{work.title}</div>
                          <div className="mt-0.5 text-[11.5px] text-ink-faint">
                            {WORK_STATUS_LABEL[status]}
                          </div>
                        </div>
                        {fileReady && work.title === "Renk Analizi" && latestColorAnalysisId ? (
                          <Link
                            href={`/renk-analizim/${latestColorAnalysisId}`}
                            className="text-xs font-semibold text-brand hover:underline"
                          >
                            Dosyanı Gör
                          </Link>
                        ) : fileReady ? (
                          <a
                            href={fileUrls[work.id] ?? "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-brand hover:underline"
                          >
                            PDF&apos;i Aç ↗
                          </a>
                        ) : resultText ? (
                          <span className="text-xs font-semibold text-brand">
                            Sonuç hazır ↓
                          </span>
                        ) : (
                          pendingWorks.has(work.title) ? (
                            <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold text-gold">
                              Talep gönderildi
                            </span>
                          ) : work.title === "Renk Analizi" ? (
                            <span className="text-xs text-ink-faint">Yukarıdan talep et</span>
                          ) : (
                            <form action={requestWork.bind(null, work.title)}>
                              <button type="submit" className="rounded-lg bg-brand px-3 py-1.5 text-[11px] font-semibold text-brand-ink">
                                Talep Et
                              </button>
                            </form>
                          )
                        )}
                      </div>
                      {resultText && (
                        <details className="mt-2.5 ml-[50px]">
                          <summary className="cursor-pointer text-xs font-semibold text-brand">
                            Sonucu Gör
                          </summary>
                          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                            {resultText}
                          </p>
                        </details>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {eveningHistory.length > 0 && (
              <section>
                <h2 className="mb-3 font-display text-[17px]">
                  Dönüştürücü Sorular Geçmişi
                </h2>
                <div className="flex flex-col gap-3">
                  {eveningHistory.map((e) => (
                    <details
                      key={e.id}
                      className="rounded-xl border border-line bg-card p-4 shadow-sm"
                    >
                      <summary className="cursor-pointer text-sm font-semibold text-ink">
                        {formatDate(e.entry_date)}
                      </summary>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                        {e.answer_text}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}

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
