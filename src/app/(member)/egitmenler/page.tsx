import Link from "next/link";
import { AppBar } from "@/components/app-bar";
import { Avatar } from "@/components/avatar";
import { InstructorBadge } from "@/components/instructor-badge";
import { createClient } from "@/lib/supabase/server";

const SPECIALTIES = [
  "Nefes Çalışmaları",
  "Human Design",
  "Kalbin Rehberliği",
  "Renk Analizi",
  "Uyku",
  "Meditasyon",
];

type InstructorCard = {
  id: string;
  slug: string;
  tagline: string;
  specialties: string[];
  profile: { display_name: string; avatar_url: string | null } | null;
  diplomas: { verified: boolean }[];
};

function chipClass(active: boolean) {
  return (
    "rounded-full border px-3.5 py-1.5 text-xs font-semibold " +
    (active
      ? "border-brand bg-brand text-brand-ink"
      : "border-line bg-card text-ink-soft hover:border-brand hover:text-brand")
  );
}

export default async function EgitmenlerPage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string }>;
}) {
  const { u } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("instructors")
    .select(
      "id, slug, tagline, specialties, profile:profiles(display_name, avatar_url), diplomas(verified)",
    )
    .order("slug");

  if (u) {
    query = query.contains("specialties", [u]);
  }

  const { data } = await query;
  const instructors = (data ?? []) as unknown as InstructorCard[];

  return (
    <>
      <AppBar active="/egitmenler" />
      <div className="mx-auto max-w-5xl px-7 py-8">
        <div className="mb-6">
          <h1 className="font-display text-[27px]">Eğitmenler</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Uzmanlık alanına göre bir rehber seç, profiline gir ve doğrudan
            bireysel randevu iste.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="/egitmenler" className={chipClass(!u)}>
            Tümü
          </Link>
          {SPECIALTIES.map((s) => (
            <Link
              key={s}
              href={`/egitmenler?u=${encodeURIComponent(s)}`}
              className={chipClass(u === s)}
            >
              {s}
            </Link>
          ))}
        </div>

        {instructors && instructors.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {instructors.map((inst) => {
              const verified = (inst.diplomas ?? []).some(
                (d: { verified: boolean }) => d.verified,
              );
              const name = inst.profile?.display_name ?? "?";
              return (
                <Link
                  key={inst.id}
                  href={`/egitmenler/${inst.slug}`}
                  className="flex flex-col gap-3 rounded-xl border border-line bg-card p-5 shadow-sm transition hover:border-brand"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={name}
                      avatarUrl={inst.profile?.avatar_url}
                      size={46}
                      rounded="rounded-xl"
                      className="font-display text-base"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14.5px] font-bold">{name}</span>
                        <InstructorBadge />
                      </div>
                      <div className="text-[11.5px] text-ink-faint">
                        {inst.tagline}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(inst.specialties ?? []).map((s: string) => (
                      <span
                        key={s}
                        className="rounded-full bg-brand-soft px-2.5 py-1 text-[10.5px] font-semibold text-brand"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  {verified && (
                    <span className="mt-auto inline-flex items-center gap-1 text-[10.5px] font-semibold text-gold">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      Doğrulanmış
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-ink-faint">
            Bu ölçütlere uyan bir rehber yok. Filtreyi değiştir.
          </p>
        )}
      </div>
    </>
  );
}
