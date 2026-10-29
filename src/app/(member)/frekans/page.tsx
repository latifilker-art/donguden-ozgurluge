import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";
import { CHAKRAS } from "@/lib/chakras";


type TrackRow = {
  id: string;
  category: string;
  chakra: string | null;
  title: string;
  description: string | null;
  storage_path: string;
};

export default async function FrekansPage() {
  const supabase = await createClient();

  const { data: tracks } = await supabase
    .from("audio_tracks")
    .select("id, category, chakra, title, description, storage_path")
    .order("sort_order")
    .order("title");

  const withUrls = await Promise.all(
    ((tracks ?? []) as TrackRow[]).map(async (t) => {
      const { data } = await supabase.storage
        .from("audio-library")
        .createSignedUrl(t.storage_path, 60 * 60);
      return { ...t, url: data?.signedUrl ?? null };
    }),
  );

  const chakraTracks = (key: string) => withUrls.filter((t) => t.chakra === key);
  const affirmations = withUrls.filter((t) => t.category === "olumlama");
  const others = withUrls.filter(
    (t) => t.category === "cakra_dengeleme" && !CHAKRAS.some((c) => c.key === t.chakra),
  );

  return (
    <>
      <AppBar active="/frekans" />
      <div className="mx-auto max-w-3xl px-7 py-8">
        <p className="mb-2 font-mono text-[11px] tracking-wide text-brand uppercase">Frekans</p>
        <h1 className="mb-2 font-display text-[27px]">Ses Kütüphanesi</h1>
        <p className="mb-8 max-w-[60ch] text-sm text-ink-soft">
          Çakra dengeleme frekansları ve olumlama sesleri. Kulaklıkla, sessiz bir ortamda,
          gözlerin kapalı dinlemeni öneririz.
        </p>

        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          {CHAKRAS.map((c) => {
            const items = chakraTracks(c.key);
            return (
              <div key={c.key} className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
                <div className="flex items-center gap-3 px-4 py-3" style={{ background: `${c.color}1f` }}>
                  <div className="h-9 w-9 rounded-full ring-2 ring-white" style={{ background: c.color }} />
                  <div>
                    <div className="text-sm font-bold">{c.name}</div>
                    <div className="font-mono text-[10px] text-ink-soft">{c.hz} Hz · {c.desc}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 p-4">
                  {items.map((t) => (
                    <div key={t.id}>
                      <div className="mb-1 text-xs font-semibold">{t.title}</div>
                      {t.url && <audio controls preload="none" className="w-full" src={t.url} />}
                    </div>
                  ))}
                  {items.length === 0 && <p className="text-xs text-ink-faint">Yakında eklenecek.</p>}
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="mb-1 font-display text-[19px]">Olumlama Frekansları</h2>
        <p className="mb-4 text-xs text-ink-faint">Olumlama sesleri ve destekleyici frekanslar</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[...affirmations, ...others].map((t) => (
            <div key={t.id} className="rounded-2xl border border-line bg-card p-4 shadow-sm">
              <div className="text-sm font-semibold">{t.title}</div>
              {t.description && <div className="mb-2 text-xs text-ink-faint">{t.description}</div>}
              {t.url && <audio controls preload="none" className="mt-1 w-full" src={t.url} />}
            </div>
          ))}
          {affirmations.length === 0 && <p className="text-sm text-ink-faint">Yakında eklenecek.</p>}
        </div>
      </div>
    </>
  );
}
