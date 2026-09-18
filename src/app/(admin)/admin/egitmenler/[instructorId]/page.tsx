import { notFound } from "next/navigation";
import Link from "next/link";
import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";
import { adminAddProgram, adminDeleteProgram, adminUpdateProgram } from "./actions";

type ProgramRow = {
  id: string;
  title: string;
  format: string;
  session_count: number | null;
};

export default async function AdminEgitmenDetayPage({
  params,
}: {
  params: Promise<{ instructorId: string }>;
}) {
  const { instructorId } = await params;
  const supabase = await createClient();

  const [{ data: instructor }, { data: programData }] = await Promise.all([
    supabase
      .from("instructors")
      .select("id, slug, profile:profiles(display_name)")
      .eq("id", instructorId)
      .single(),
    supabase
      .from("taught_programs")
      .select("id, title, format, session_count")
      .eq("instructor_id", instructorId)
      .order("title"),
  ]);

  if (!instructor) notFound();
  const inst = instructor as unknown as {
    id: string;
    slug: string;
    profile: { display_name: string } | null;
  };
  const programs = (programData ?? []) as ProgramRow[];

  const updateProgram = adminUpdateProgram.bind(null, instructorId);
  const deleteProgram = adminDeleteProgram.bind(null, instructorId);
  const addProgram = adminAddProgram.bind(null, instructorId);

  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-2xl px-7 py-8">
        <p className="mb-5 text-xs text-ink-faint">
          Admin / <Link href="/admin/egitmenler" className="hover:underline">Eğitmenler</Link> /{" "}
          <span className="font-medium text-ink-soft">
            {inst.profile?.display_name ?? "Eğitmen"}
          </span>
        </p>
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="font-display text-[25px]">
            {inst.profile?.display_name ?? "Eğitmen"} — Verdiği Çalışmalar
          </h1>
          <Link
            href={`/egitmenler/${inst.slug}`}
            className="text-sm font-semibold text-brand hover:underline"
          >
            Genel profili gör
          </Link>
        </div>

        <div className="mb-6 flex flex-col gap-3">
          {programs.map((p) => (
            <form
              key={p.id}
              action={updateProgram.bind(null, p.id)}
              className="grid grid-cols-[1fr_auto] items-end gap-3 rounded-xl border border-line bg-card p-4 shadow-sm"
            >
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-ink-soft">
                    Başlık
                  </label>
                  <input
                    name="title"
                    defaultValue={p.title}
                    required
                    className="w-full rounded-lg border border-line bg-card px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-ink-soft">
                    Format
                  </label>
                  <select
                    name="format"
                    defaultValue={p.format}
                    className="w-full rounded-lg border border-line bg-card px-2.5 py-1.5 text-sm"
                  >
                    <option value="Bire bir">Bire bir</option>
                    <option value="Canlı grup">Canlı grup</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-ink-soft">
                    Oturum Sayısı
                  </label>
                  <input
                    type="number"
                    name="sessionCount"
                    min={1}
                    defaultValue={p.session_count ?? ""}
                    className="w-full rounded-lg border border-line bg-card px-2.5 py-1.5 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-brand px-3.5 py-1.5 text-xs font-semibold text-brand-ink"
                >
                  Kaydet
                </button>
                <button
                  type="submit"
                  formAction={deleteProgram.bind(null, p.id)}
                  className="rounded-lg border border-line px-3.5 py-1.5 text-xs font-semibold text-ink-soft hover:border-neg hover:text-neg"
                >
                  Sil
                </button>
              </div>
            </form>
          ))}
          {programs.length === 0 && (
            <div className="rounded-xl border border-line bg-card p-5 text-sm text-ink-faint shadow-sm">
              Bu eğitmenin henüz eklenmiş bir çalışması yok.
            </div>
          )}
        </div>

        <section>
          <h2 className="mb-3 font-display text-[16px]">Yeni Çalışma Ekle</h2>
          <form
            action={addProgram}
            className="grid grid-cols-[1fr_auto] items-end gap-3 rounded-xl border border-line bg-card p-4 shadow-sm"
          >
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-ink-soft">
                  Başlık
                </label>
                <input
                  name="title"
                  required
                  placeholder="Örn. Nefes Çalışmaları"
                  className="w-full rounded-lg border border-line bg-card px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-ink-soft">
                  Format
                </label>
                <select
                  name="format"
                  defaultValue="Bire bir"
                  className="w-full rounded-lg border border-line bg-card px-2.5 py-1.5 text-sm"
                >
                  <option value="Bire bir">Bire bir</option>
                  <option value="Canlı grup">Canlı grup</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-ink-soft">
                  Oturum Sayısı
                </label>
                <input
                  type="number"
                  name="sessionCount"
                  min={1}
                  placeholder="opsiyonel"
                  className="w-full rounded-lg border border-line bg-card px-2.5 py-1.5 text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-brand px-3.5 py-1.5 text-xs font-semibold text-brand-ink"
            >
              Ekle
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
