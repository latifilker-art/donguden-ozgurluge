import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";
import { uploadAudioTrack, deleteAudioTrack } from "./actions";

const CATEGORY_LABEL: Record<string, string> = {
  cakra_dengeleme: "Çakra Dengeleme",
  olumlama: "Olumlama",
};

type TrackRow = {
  id: string;
  category: string;
  title: string;
  description: string | null;
  storage_path: string;
};

export default async function AdminSesKutuphanesiPage() {
  const supabase = await createClient();

  const { data: tracks } = await supabase
    .from("audio_tracks")
    .select("id, category, title, description, storage_path")
    .order("category")
    .order("sort_order");

  const trackList = (tracks ?? []) as TrackRow[];

  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-2xl px-7 py-8">
        <p className="mb-5 text-xs text-ink-faint">
          Admin / <span className="font-medium text-ink-soft">Ses Kütüphanesi</span>
        </p>
        <h1 className="mb-2 font-display text-[25px]">Ses Kütüphanesi</h1>
        <p className="mb-6 text-sm text-ink-soft">
          Çakra dengeleme ve olumlama sesleri — yalnızca Premium/VIP üyelere
          &quot;Frekans&quot; sayfasında gösterilir.
        </p>

        <section className="mb-8">
          <h2 className="mb-3 font-display text-[16px]">Yeni Ses Ekle</h2>
          <form
            action={uploadAudioTrack}
            className="flex flex-col gap-4 rounded-xl border border-line bg-card p-5 shadow-sm"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Ses Dosyası
              </label>
              <input
                type="file"
                name="audio"
                accept="audio/*"
                required
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Kategori
              </label>
              <select
                name="category"
                required
                className="w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm"
              >
                <option value="cakra_dengeleme">Çakra Dengeleme</option>
                <option value="olumlama">Olumlama</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Başlık
              </label>
              <input
                type="text"
                name="title"
                required
                className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Açıklama (opsiyonel)
              </label>
              <input
                type="text"
                name="description"
                className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm"
              />
            </div>
            <button
              type="submit"
              className="self-start rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-ink"
            >
              Yükle
            </button>
          </form>
        </section>

        <section>
          <h2 className="mb-3 font-display text-[16px]">
            Yüklenenler{" "}
            <span className="font-mono text-sm text-ink-faint">
              ({trackList.length})
            </span>
          </h2>
          <div className="rounded-xl border border-line bg-card shadow-sm">
            {trackList.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-3.5 text-sm last:border-b-0"
              >
                <div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-xs text-ink-faint">
                    {CATEGORY_LABEL[t.category] ?? t.category}
                    {t.description ? ` · ${t.description}` : ""}
                  </div>
                </div>
                <form action={deleteAudioTrack.bind(null, t.id, t.storage_path)}>
                  <button
                    type="submit"
                    className="shrink-0 text-xs font-semibold text-ink-faint hover:text-neg"
                  >
                    Sil
                  </button>
                </form>
              </div>
            ))}
            {trackList.length === 0 && (
              <p className="p-4 text-sm text-ink-faint">Henüz ses eklenmedi.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
