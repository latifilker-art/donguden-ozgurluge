import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";
import { uploadMemberPhoto, deleteMyPhoto } from "./actions";

type PhotoRow = {
  id: string;
  image_path: string;
  caption: string | null;
  uploaded_by: string | null;
  events: { title: string } | { title: string }[] | null;
};

export default async function FotograflarPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("photos")
    .select("id, image_path, caption, uploaded_by, events(title)")
    .order("created_at", { ascending: false });

  const photos = (data ?? []) as unknown as PhotoRow[];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: levelData } = user
    ? await supabase.rpc("member_level", { p_member: user.id })
    : { data: null };
  const { data: me } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const canUpload = levelData === "ileri" || me?.role === "instructor" || me?.role === "admin";

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

        {canUpload ? (
          <form
            action={uploadMemberPhoto}
            className="mb-8 flex flex-col gap-3 rounded-2xl border border-line bg-card p-4 shadow-sm sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-ink-soft">Görsel ekle</label>
              <input type="file" name="photo" accept="image/*" required className="text-sm" />
            </div>
            <input name="caption" placeholder="Açıklama (opsiyonel)" className="flex-1 rounded-lg border border-line bg-card px-3 py-2 text-sm" />
            <button className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-brand-ink">Yükle</button>
          </form>
        ) : (
          <p className="mb-8 rounded-xl bg-gold-soft px-4 py-2.5 text-xs text-gold">
            Görsel ekleyebilmek için İleri seviye üye olmalısın (Kalbin Rehberliği).
          </p>
        )}

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
                  {user && p.uploaded_by === user.id && (
                    <form action={deleteMyPhoto.bind(null, p.id, p.image_path)} className="px-2.5 pb-2">
                      <button className="text-[10.5px] font-semibold text-ink-faint hover:text-neg">Sil</button>
                    </form>
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
