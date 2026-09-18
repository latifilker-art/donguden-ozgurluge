import Link from "next/link";
import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";
import { updateInstructorProfile } from "./actions";

type InstructorRow = {
  slug: string;
  tagline: string | null;
  bio: string | null;
  specialties: string[];
  years_experience: number | null;
  website_url: string | null;
};

export default async function EgitmenProfilDuzenlePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("instructors")
    .select("slug, tagline, bio, specialties, years_experience, website_url")
    .eq("id", user.id)
    .single();

  const inst = data as InstructorRow | null;

  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-2xl px-7 py-8">
        <p className="mb-2 font-mono text-[11px] tracking-wide text-brand uppercase">
          Eğitmen Paneli
        </p>
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="font-display text-[25px]">Profilimi Düzenle</h1>
          <div className="flex gap-4">
            <Link href="/panel" className="text-sm font-semibold text-brand hover:underline">
              Randevu talepleri
            </Link>
            <Link
              href="/panel/programlar"
              className="text-sm font-semibold text-brand hover:underline"
            >
              Verdiğim çalışmalar
            </Link>
          </div>
        </div>

        {inst?.slug && (
          <p className="mb-6 text-sm text-ink-faint">
            Genel profilin:{" "}
            <Link
              href={`/egitmenler/${inst.slug}`}
              className="font-semibold text-brand hover:underline"
            >
              /egitmenler/{inst.slug}
            </Link>
          </p>
        )}

        <form
          action={updateInstructorProfile}
          className="flex flex-col gap-5 rounded-xl border border-line bg-card p-6 shadow-sm"
        >
          <div>
            <label htmlFor="tagline" className="mb-1.5 block text-xs font-semibold text-ink-soft">
              Kısa Tanıtım
            </label>
            <input
              id="tagline"
              name="tagline"
              type="text"
              defaultValue={inst?.tagline ?? ""}
              placeholder="Örn. Nefes çalışmaları ve travma-bilgili meditasyon rehberi"
              className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </div>

          <div>
            <label htmlFor="bio" className="mb-1.5 block text-xs font-semibold text-ink-soft">
              Hakkında
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={5}
              defaultValue={inst?.bio ?? ""}
              placeholder="Profilinin altında görünecek uzun tanıtım metni"
              className="w-full resize-y rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </div>

          <div>
            <label
              htmlFor="specialties"
              className="mb-1.5 block text-xs font-semibold text-ink-soft"
            >
              Uzmanlık Alanları
            </label>
            <input
              id="specialties"
              name="specialties"
              type="text"
              defaultValue={(inst?.specialties ?? []).join(", ")}
              placeholder="Virgülle ayır — örn. Nefes Çalışması, Mindfulness, Human Design"
              className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
            <p className="mt-1 text-[11px] text-ink-faint">
              Eğitmen dizinindeki filtre etiketleri bu alanlardan oluşur.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="yearsExperience"
                className="mb-1.5 block text-xs font-semibold text-ink-soft"
              >
                Deneyim (Yıl)
              </label>
              <input
                id="yearsExperience"
                name="yearsExperience"
                type="number"
                min={0}
                max={80}
                defaultValue={inst?.years_experience ?? ""}
                className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
            </div>
            <div>
              <label
                htmlFor="websiteUrl"
                className="mb-1.5 block text-xs font-semibold text-ink-soft"
              >
                Web Sitesi
              </label>
              <input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                defaultValue={inst?.website_url ?? ""}
                placeholder="https://…"
                className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
            </div>
          </div>

          <button
            type="submit"
            className="self-start rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-ink"
          >
            Kaydet
          </button>
        </form>
      </div>
    </>
  );
}
