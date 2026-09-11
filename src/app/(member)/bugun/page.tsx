import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";
import { toggleRhythmItem } from "./actions";
import type { RhythmEntry, RhythmItem } from "@/lib/types";

const RHYTHM_META: Record<
  RhythmItem,
  { time: string; title: string; desc: string }
> = {
  morning_affirmation: {
    time: "07:00",
    title: "Sabah Olumlaması",
    desc: "Güne başlamadan önce 3 olumlama",
  },
  breath: {
    time: "GÜN İÇİ",
    title: "Nefes Çalışması",
    desc: "Kendi hızında bir nefes pratiği",
  },
  noon_affirmation: {
    time: "13:00",
    title: "Öğlen Olumlaması",
    desc: "Öğlen molasında kısa bir hatırlatma",
  },
  evening_questions: {
    time: "21:00",
    title: "Akşam Dönüştürücü Sorular",
    desc: "Günü kapatan 3 soru — gece okunur",
  },
};

function formatIstanbulTime(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function BugunPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.rpc("get_or_create_today_rhythm", {
    p_member_id: user.id,
  });
  const rhythm = (data ?? []) as RhythmEntry[];
  const completedToday = rhythm.filter((r) => r.completed_at).length;

  return (
    <>
      <AppBar active="/bugun" />
      <div className="mx-auto max-w-2xl px-7 py-8">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="mb-1 font-mono text-[11px] tracking-wide text-brand uppercase">
              Bugün
            </p>
            <h1 className="font-display text-[27px]">
              {formatDate(new Date().toISOString())}
            </h1>
          </div>
          <span className="rounded-full bg-surface-2 px-3 py-1.5 font-mono text-sm text-ink-soft">
            {completedToday} / 4 tamamlandı
          </span>
        </div>

        <div className="rounded-xl border border-line bg-card p-1.5 shadow-sm">
          {rhythm.map((entry) => {
            const meta = RHYTHM_META[entry.item];
            const isDone = !!entry.completed_at;
            const isLocked =
              !isDone &&
              !!entry.unlock_at &&
              new Date(entry.unlock_at) > new Date();

            return (
              <div
                key={entry.id}
                className="grid grid-cols-[60px_1fr_84px] items-center gap-4 border-b border-line-soft px-4 py-3.5 last:border-b-0"
              >
                <div className="rounded-md bg-surface-2 py-1.5 text-center font-mono text-[10px] text-ink-faint">
                  {meta.time}
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold">
                    {meta.title}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-soft">
                    {meta.desc}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <form action={toggleRhythmItem.bind(null, entry.id)}>
                    <button
                      type="submit"
                      disabled={isLocked}
                      aria-pressed={isDone}
                      aria-label={
                        isLocked
                          ? `${meta.title} — ${formatIstanbulTime(entry.unlock_at!)}'de açılır`
                          : isDone
                            ? `${meta.title} tamamlandı — işareti kaldırmak için tıkla`
                            : `${meta.title} — tamamlandı olarak işaretle`
                      }
                      className={
                        "flex h-[27px] w-[27px] items-center justify-center rounded-full border text-transparent " +
                        (isDone
                          ? "border-brand bg-brand-soft text-brand"
                          : isLocked
                            ? "cursor-not-allowed border-dashed border-line bg-surface-2 text-ink-faint"
                            : "cursor-pointer border-line text-ink-faint hover:border-brand hover:text-brand")
                      }
                    >
                      {isDone ? (
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.4}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3.5 w-3.5"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : isLocked ? (
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
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 2" />
                        </svg>
                      ) : (
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                        </svg>
                      )}
                    </button>
                  </form>
                  <span className="font-mono text-[10px] whitespace-nowrap text-ink-faint">
                    {isLocked
                      ? `${formatIstanbulTime(entry.unlock_at!)}'de açılır`
                      : !isDone
                        ? "henüz yapılmadı"
                        : null}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
