import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";

type PhotoRow = {
  id: string;
  image_path: string;
  caption: string | null;
  events: { title: string } | { title: string }[] | null;
};

export default async function FotograflarPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("photos")
    .select("id, image_path, caption, events(title)")
    .order("created_at", { ascending: false });

  const photos = (data ?? []) as unknown as PhotoRow[];

  return (
    <>
      <AppBar active="/fotograflar" />
      <div className="mx-auto max-w-5xl px-7 py-8">
        <p className="mb-2 font-mono text-[11px] tracking-wide text-brand uppercase">
          Fotoğraflar
        </p>
        <h1 className="mb-2 font-display text-[27px] text-balance">
          Kamplardan ve buluşmalardan kareler
        </h1>
        <p className="mb-8 max-w-[60ch] text-sm text-ink-soft">
          Geçmiş etkinlik ve kamplardan anlar.
        </p>

        {photos.length === 0 ? (
          <p className="text-sm text-ink-faint">Henüz fotoğraf paylaşılmadı.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((p) => {
              const eventTitle = Array.isArray(p.events)
                ? p.events[0]?.title
                : p.events?.title;
              return (
                <figure
                  key={p.id}
                  className="overflow-hidden rounded-xl border border-line bg-card shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image_path}
                    alt={p.caption ?? eventTitle ?? ""}
                    className="aspect-square w-full object-cover"
                  />
                  {(p.caption || eventTitle) && (
                    <figcaption className="p-2.5 text-[11.5px] text-ink-soft">
                      {eventTitle && (
                        <span className="font-semibold text-brand">
                          {eventTitle}
                        </span>
                      )}
                      {p.caption && eventTitle ? " — " : ""}
                      {p.caption}
                    </figcaption>
                  )}
                </figure>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
