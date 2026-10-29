import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buildDailyPlan, COLOR_CONTENT } from "@/lib/color-analysis/daily-plan";
import type { ColorAnalysisComputation, ColorName } from "@/lib/color-analysis/numerology";
import { CHAKRAS, COLOR_TO_CHAKRA } from "@/lib/chakras";
import { dailyHoroscope } from "@/lib/horoscope";
import { dayIndex, todaysReminders } from "@/lib/breathing";

const GENERIC_AFFIRMATIONS = [
  "Bugün kendime nazik davranıyorum.",
  "Her nefeste biraz daha hafifliyorum.",
  "Olduğum gibi yeterliyim.",
];
const GENERIC_TODOS = [
  "5 dakika sessizce nefesine odaklan",
  "Bir bardak su iç ve gerin",
  "Minnettar olduğun bir şeyi yaz",
  "Bir kişiye içten bir mesaj gönder",
];

function greeting() {
  const h = Number(
    new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", hour12: false, timeZone: "Europe/Istanbul" }).format(new Date()),
  );
  return h < 5 ? "İyi geceler" : h < 12 ? "Günaydın" : h < 18 ? "İyi günler" : "İyi akşamlar";
}

export async function DailyBoard({
  userId,
  name,
  doneToday,
}: {
  userId: string;
  name: string;
  doneToday?: number;
}) {
  const supabase = await createClient();
  const [{ data: profile }, { data: analysis }] = await Promise.all([
    supabase.from("profile_private").select("birth_date").eq("id", userId).maybeSingle(),
    supabase
      .from("color_analyses")
      .select("computation")
      .eq("member_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const comp = analysis?.computation as ColorAnalysisComputation | undefined;
  const plan = comp ? buildDailyPlan(comp) : null;
  const heroColor = comp ? COLOR_CONTENT[comp.lifePath.color].hex : "#3f6f5e";
  const accent2 = comp ? COLOR_CONTENT[comp.mask.color].hex : "#d7b56e";

  const chakraKey = plan
    ? COLOR_TO_CHAKRA[plan.focusColor]
    : CHAKRAS[dayIndex() % CHAKRAS.length].key;
  const chakra = CHAKRAS.find((c) => c.key === chakraKey)!;
  const { data: track } = await supabase
    .from("audio_tracks")
    .select("title, storage_path")
    .eq("chakra", chakraKey)
    .limit(1)
    .maybeSingle();
  let audioUrl: string | null = null;
  if (track) {
    const { data: s } = await supabase.storage.from("audio-library").createSignedUrl(track.storage_path, 3600);
    audioUrl = s?.signedUrl ?? null;
  }

  const horo = profile?.birth_date ? dailyHoroscope(profile.birth_date) : null;
  const reminders = todaysReminders();
  const dateStr = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul", weekday: "long", day: "numeric", month: "long",
  }).format(new Date());

  const affirmations = plan
    ? plan.affirmations
    : GENERIC_AFFIRMATIONS.map((t, i) => ({
        label: ["Sabah", "Öğlen", "Akşam"][i],
        color: "Yeşil" as ColorName,
        text: t,
      }));
  const todos = plan
    ? plan.todos
    : GENERIC_TODOS.map((t) => ({ color: "Yeşil" as ColorName, text: t }));

  return (
    <div className="flex flex-col gap-5">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${heroColor}, ${accent2})` }}
      >
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15" />
        <div className="absolute -bottom-12 right-16 h-32 w-32 rounded-full bg-white/10" />
        <p className="font-mono text-[11px] tracking-wide uppercase opacity-80">{dateStr}</p>
        <h2 className="mt-1 font-display text-[26px]">{greeting()}, {name}</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {horo && (
            <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">
              {horo.sign.symbol} {horo.sign.name}
            </span>
          )}
          {typeof doneToday === "number" && (
            <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">Bugün {doneToday}/4 pratik</span>
          )}
          {plan && (
            <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">Odak rengin: {plan.focusColor}</span>
          )}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Günlük olumlama */}
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
          <h3 className="mb-3 font-display text-[16px]">Günün Olumlamaları</h3>
          <div className="flex flex-col gap-2.5">
            {affirmations.map((a) => (
              <div
                key={a.label}
                className="rounded-xl px-3.5 py-2.5"
                style={{ background: `${COLOR_CONTENT[a.color].hex}1c`, borderLeft: `4px solid ${COLOR_CONTENT[a.color].hex}` }}
              >
                <div className="font-mono text-[10px] text-ink-soft">{a.label}</div>
                <div className="text-sm italic">&ldquo;{a.text}&rdquo;</div>
              </div>
            ))}
          </div>
        </div>

        {/* Önerilen frekans */}
        <div
          className="rounded-2xl border border-line p-5 shadow-sm"
          style={{ background: `linear-gradient(160deg, ${chakra.color}22, transparent)` }}
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full ring-2 ring-white" style={{ background: chakra.color }} />
            <div>
              <h3 className="font-display text-[16px]">Bugünün Frekansı</h3>
              <div className="font-mono text-[10px] text-ink-soft">{chakra.name} · {chakra.hz} Hz</div>
            </div>
          </div>
          <p className="mb-3 text-xs text-ink-soft">{chakra.desc}</p>
          {audioUrl ? (
            <audio controls preload="none" src={audioUrl} className="w-full" />
          ) : (
            <Link href="/frekans" className="text-xs font-semibold text-brand hover:underline">Ses Kütüphanesi&apos;ne git →</Link>
          )}
        </div>

        {/* Burç yorumu */}
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
          <h3 className="mb-3 font-display text-[16px]">Günlük Burç Yorumu</h3>
          {horo ? (
            <>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <span className="text-2xl">{horo.sign.symbol}</span>
                {horo.sign.name} · {horo.sign.element}
              </div>
              <p className="mb-3 text-sm leading-relaxed text-ink-soft">{horo.text}</p>
              <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full bg-brand-soft px-2.5 py-1 text-brand">Ruh hali: {horo.mood}</span>
                <span className="rounded-full bg-gold-soft px-2.5 py-1 text-gold">Renk: {horo.luckyColor}</span>
                <span className="rounded-full bg-surface-2 px-2.5 py-1 text-ink-soft">Sayı: {horo.luckyNumber}</span>
              </div>
              <p className="text-xs font-semibold text-brand">Öneri: {horo.advice}</p>
              <p className="mt-2 text-[10px] text-ink-faint">Eğlence ve ilham amaçlıdır.</p>
            </>
          ) : (
            <p className="text-sm text-ink-soft">
              Doğum tarihini profilinde girersen günlük burç yorumun burada görünür.
            </p>
          )}
        </div>

        {/* Görevler */}
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
          <h3 className="mb-3 font-display text-[16px]">Bugünkü Görevlerin</h3>
          <ul className="flex flex-col gap-2.5">
            {todos.map((t, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-ink-soft">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: COLOR_CONTENT[t.color].hex }} />
                {t.text}
              </li>
            ))}
          </ul>
          {!comp && (
            <p className="mt-3 text-[11px] text-ink-faint">Renk analizi talep edersen görevlerin sana özel olur.</p>
          )}
        </div>
      </div>

      {/* Nefes hatırlatmaları */}
      <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
        <h3 className="mb-1 font-display text-[16px]">Nefes Hatırlatmaları</h3>
        <p className="mb-4 text-xs text-ink-faint">Gün içinde üç mola — her gün farklı bir teknik</p>
        <div className="grid gap-3 md:grid-cols-3">
          {reminders.map((r) => (
            <details key={r.when} className="group rounded-xl bg-surface-2 p-3.5">
              <summary className="cursor-pointer list-none">
                <div className="flex items-center gap-3">
                  <span className="breath-orb h-9 w-9 shrink-0 rounded-full" style={{ background: heroColor }} />
                  <div>
                    <div className="font-mono text-[10px] text-ink-faint">{r.when}</div>
                    <div className="text-[13px] font-semibold">{r.tech.name}</div>
                    <div className="text-[10.5px] text-ink-soft">{r.tech.pattern}</div>
                  </div>
                </div>
              </summary>
              <p className="mt-3 text-xs text-brand">{r.tech.benefit}</p>
              <ol className="mt-2 list-decimal pl-4 text-xs text-ink-soft">
                {r.tech.steps.map((s) => (<li key={s}>{s}</li>))}
              </ol>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
