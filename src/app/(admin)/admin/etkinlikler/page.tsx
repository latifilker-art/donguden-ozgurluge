import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";
import { createEvent } from "./actions";

type InstructorOption = {
  id: string;
  profile: { display_name: string } | null;
};

export default async function EtkinliklerPage() {
  const supabase = await createClient();

  const [{ data: events }, { data: instructorData }] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, type, starts_at, location, capacity")
      .order("starts_at", { ascending: false }),
    supabase
      .from("instructors")
      .select("id, profile:profiles(display_name)"),
  ]);
  const instructors = (instructorData ?? []) as unknown as InstructorOption[];

  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-2xl px-7 py-8">
        <p className="mb-5 text-xs text-ink-faint">
          Admin / <span className="font-medium text-ink-soft">Etkinlikler</span>
        </p>
        <h1 className="mb-6 font-display text-[25px]">Etkinlik Yönetimi</h1>

        <section className="mb-8">
          <h2 className="mb-3 font-display text-[16px]">Yeni Etkinlik</h2>
          <form
            action={createEvent}
            className="flex flex-col gap-4 rounded-xl border border-line bg-card p-5 shadow-sm"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                  Tür
                </label>
                <select
                  name="type"
                  className="w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm"
                >
                  <option value="online">Online Eğitim</option>
                  <option value="camp">Fiziki Kamp</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                  Eğitmen
                </label>
                <select
                  name="hostInstructorId"
                  className="w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm"
                >
                  {(instructors ?? []).map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.profile?.display_name ?? i.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Başlık
              </label>
              <input
                name="title"
                required
                className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                  Başlangıç
                </label>
                <input
                  type="datetime-local"
                  name="startsAt"
                  required
                  className="w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                  Bitiş (opsiyonel)
                </label>
                <input
                  type="datetime-local"
                  name="endsAt"
                  className="w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                  Konum
                </label>
                <input
                  name="location"
                  required
                  placeholder="Zoom üzerinden / Şirince, İzmir"
                  className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                  Kontenjan
                </label>
                <input
                  type="number"
                  name="capacity"
                  min={1}
                  required
                  className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Açıklama (opsiyonel)
              </label>
              <textarea
                name="description"
                rows={2}
                className="w-full resize-y rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-ink"
            >
              Etkinliği Oluştur
            </button>
          </form>
        </section>

        <section>
          <h2 className="mb-3 font-display text-[16px]">Mevcut Etkinlikler</h2>
          <div className="rounded-xl border border-line bg-card shadow-sm">
            {(events ?? []).map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between border-b border-line-soft px-5 py-3.5 text-sm last:border-b-0"
              >
                <div>
                  <div className="font-semibold">{e.title}</div>
                  <div className="text-xs text-ink-faint">
                    {e.type === "online" ? "Online" : "Kamp"} · {e.location} ·
                    kontenjan {e.capacity}
                  </div>
                </div>
              </div>
            ))}
            {(events ?? []).length === 0 && (
              <p className="p-5 text-sm text-ink-faint">Henüz etkinlik yok.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
