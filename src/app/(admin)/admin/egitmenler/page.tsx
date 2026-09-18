import Link from "next/link";
import { AppBar } from "@/components/app-bar";
import { InstructorBadge } from "@/components/instructor-badge";
import { createClient } from "@/lib/supabase/server";

type InstructorRow = {
  id: string;
  slug: string;
  tagline: string | null;
  profile: { display_name: string } | null;
};

export default async function AdminEgitmenlerPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("instructors")
    .select("id, slug, tagline, profile:profiles(display_name)")
    .order("slug");

  const instructors = (data ?? []) as unknown as InstructorRow[];

  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-2xl px-7 py-8">
        <p className="mb-5 text-xs text-ink-faint">
          Admin / <span className="font-medium text-ink-soft">Eğitmenler</span>
        </p>
        <h1 className="mb-2 font-display text-[25px]">Eğitmen Yönetimi</h1>
        <p className="mb-6 text-sm text-ink-soft">
          Bir eğitmen seç, verdiği eğitim/uygulamaları düzenle.
        </p>

        <div className="rounded-xl border border-line bg-card shadow-sm">
          {instructors.map((inst) => (
            <Link
              key={inst.id}
              href={`/admin/egitmenler/${inst.id}`}
              className="flex items-center justify-between gap-4 border-b border-line-soft px-5 py-4 text-sm last:border-b-0 hover:bg-brand-soft/40"
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold">
                  {inst.profile?.display_name ?? "Eğitmen"}
                  <InstructorBadge />
                </div>
                <div className="text-xs text-ink-faint">
                  {inst.tagline ?? inst.slug}
                </div>
              </div>
              <span className="shrink-0 text-xs font-semibold text-brand">
                Yönet →
              </span>
            </Link>
          ))}
          {instructors.length === 0 && (
            <p className="p-5 text-sm text-ink-faint">Henüz eğitmen yok.</p>
          )}
        </div>
      </div>
    </>
  );
}
