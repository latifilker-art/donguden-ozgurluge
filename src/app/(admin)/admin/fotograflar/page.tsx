import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";
import { uploadPhoto, deletePhoto } from "./actions";

export default async function AdminFotograflarPage() {
  const supabase = await createClient();

  const [{ data: photos }, { data: events }] = await Promise.all([
    supabase
      .from("photos")
      .select("id, image_path, caption, event_id, events(title)")
      .order("created_at", { ascending: false }),
    supabase.from("events").select("id, title").order("starts_at", { ascending: false }),
  ]);

  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-2xl px-7 py-8">
        <p className="mb-5 text-xs text-ink-faint">
          Admin / <span className="font-medium text-ink-soft">Fotoğraflar</span>
        </p>
        <h1 className="mb-6 font-display text-[25px]">Fotoğraf Galerisi</h1>

        <section className="mb-8">
          <h2 className="mb-3 font-display text-[16px]">Yeni Fotoğraf</h2>
          <form
            action={uploadPhoto}
            className="flex flex-col gap-4 rounded-xl border border-line bg-card p-5 shadow-sm"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Fotoğraf
              </label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                required
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Hangi etkinlik (opsiyonel)
              </label>
              <select
                name="eventId"
                className="w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm"
              >
                <option value="">— Genel —</option>
                {(events ?? []).map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Açıklama (opsiyonel)
              </label>
              <input
                type="text"
                name="caption"
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
              ({(photos ?? []).length})
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(photos ?? []).map(
              (p: {
                id: string;
                image_path: string;
                caption: string | null;
                events: { title: string } | { title: string }[] | null;
              }) => {
                const eventTitle = Array.isArray(p.events)
                  ? p.events[0]?.title
                  : p.events?.title;
                return (
                  <div
                    key={p.id}
                    className="overflow-hidden rounded-xl border border-line bg-card shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image_path}
                      alt={p.caption ?? ""}
                      className="h-32 w-full object-cover"
                    />
                    <div className="p-2.5">
                      {eventTitle && (
                        <div className="text-[10.5px] font-semibold text-brand">
                          {eventTitle}
                        </div>
                      )}
                      {p.caption && (
                        <div className="text-[11px] text-ink-soft">
                          {p.caption}
                        </div>
                      )}
                      <form action={deletePhoto.bind(null, p.id, p.image_path)}>
                        <button
                          type="submit"
                          className="mt-1.5 text-[10.5px] font-semibold text-ink-faint hover:text-neg"
                        >
                          Sil
                        </button>
                      </form>
                    </div>
                  </div>
                );
              },
            )}
          </div>
          {(photos ?? []).length === 0 && (
            <p className="text-sm text-ink-faint">Henüz fotoğraf yok.</p>
          )}
        </section>
      </div>
    </>
  );
}
