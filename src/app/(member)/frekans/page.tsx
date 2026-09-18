import Link from "next/link";
import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";

const CATEGORY_META: Record<string, { title: string; desc: string }> = {
  cakra_dengeleme: {
    title: "Çakra Dengeleme",
    desc: "Enerji merkezlerini dengelemek için ses çalışmaları",
  },
  olumlama: {
    title: "Olumlama",
    desc: "Günlük pratiğini destekleyen olumlama sesleri",
  },
};

type TrackRow = {
  id: string;
  category: string;
  title: string;
  description: string | null;
  storage_path: string;
};

export default async function FrekansPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("member_id", user.id)
    .maybeSingle();

  const hasAccess =
    sub?.status === "active" && (sub?.plan === "premium" || sub?.plan === "vip");

  if (!hasAccess) {
    return (
      <>
        <AppBar active="/frekans" />
        <div className="mx-auto max-w-md px-7 py-8">
          <p className="mb-2 font-mono text-[11px] tracking-wide text-brand uppercase">
            Frekans
          </p>
          <h1 className="mb-3 font-display text-[22px]">Ses Kütüphanesi</h1>
          <div className="rounded-xl border border-line bg-card p-5 text-sm shadow-sm">
            <p className="mb-3 text-ink-soft">
              Çakra dengeleme ve olumlama sesleri Premium ve VIP üyelere özeldir.
            </p>
            <Link
              href="/profilim"
              className="font-semibold text-brand hover:underline"
            >
              Üyelik durumunu profilimde gör →
            </Link>
          </div>
        </div>
      </>
    );
  }

  const { data: tracks } = await supabase
    .from("audio_tracks")
    .select("id, category, title, description, storage_path")
    .order("category")
    .order("sort_order");

  const trackList = (tracks ?? []) as TrackRow[];

  const tracksWithUrls = await Promise.all(
    trackList.map(async (t) => {
      const { data: signed } = await supabase.storage
        .from("audio-library")
        .createSignedUrl(t.storage_path, 60 * 30);
      return { ...t, url: signed?.signedUrl ?? null };
    }),
  );

  const grouped = tracksWithUrls.reduce<Record<string, typeof tracksWithUrls>>(
    (acc, t) => {
      (acc[t.category] ??= []).push(t);
      return acc;
    },
    {},
  );

  return (
    <>
      <AppBar active="/frekans" />
      <div className="mx-auto max-w-2xl px-7 py-8">
        <p className="mb-2 font-mono text-[11px] tracking-wide text-brand uppercase">
          Frekans
        </p>
        <h1 className="mb-6 font-display text-[25px]">Ses Kütüphanesi</h1>

        {Object.entries(CATEGORY_META).map(([category, meta]) => {
          const items = grouped[category] ?? [];
          if (items.length === 0) return null;
          return (
            <section key={category} className="mb-8">
              <h2 className="mb-1 font-display text-[17px]">{meta.title}</h2>
              <p className="mb-3 text-xs text-ink-faint">{meta.desc}</p>
              <div className="flex flex-col gap-3">
                {items.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-line bg-card p-4 shadow-sm"
                  >
                    <div className="mb-2">
                      <div className="text-sm font-semibold">{t.title}</div>
                      {t.description && (
                        <div className="text-xs text-ink-faint">
                          {t.description}
                        </div>
                      )}
                    </div>
                    {t.url ? (
                      <audio controls preload="none" className="w-full" src={t.url} />
                    ) : (
                      <p className="text-xs text-neg">Ses dosyası yüklenemedi.</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {tracksWithUrls.length === 0 && (
          <p className="text-sm text-ink-faint">Henüz ses eklenmedi.</p>
        )}
      </div>
    </>
  );
}
