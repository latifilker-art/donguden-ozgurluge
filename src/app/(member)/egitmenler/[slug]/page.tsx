import { notFound } from "next/navigation";
import { AppBar } from "@/components/app-bar";
import { Avatar } from "@/components/avatar";
import { InstructorBadge } from "@/components/instructor-badge";
import { BookingForm } from "@/components/booking-form";
import { createClient } from "@/lib/supabase/server";
import { requestAppointment } from "./actions";

type InstructorProfile = {
  id: string;
  slug: string;
  tagline: string;
  bio: string;
  specialties: string[];
  years_experience: number | null;
  website_url: string | null;
  profile: { display_name: string; avatar_url: string | null } | null;
  diplomas: {
    id: string;
    name: string;
    issuer: string;
    year: number | null;
    verified: boolean;
  }[];
  taught_programs: {
    id: string;
    title: string;
    format: string;
    session_count: number | null;
  }[];
};

export default async function EgitmenProfilPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("instructors")
    .select(
      "id, slug, tagline, bio, specialties, years_experience, website_url, profile:profiles(display_name, avatar_url), diplomas(id, name, issuer, year, verified), taught_programs(id, title, format, session_count)",
    )
    .eq("slug", slug)
    .single();

  if (!data) notFound();
  const inst = data as unknown as InstructorProfile;

  const name = inst.profile?.display_name ?? "Eğitmen";
  const diplomas = inst.diplomas ?? [];
  const programs = inst.taught_programs ?? [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const sessionOptions =
    programs.length > 0 ? programs.map((p) => p.title) : ["Bireysel Seans"];

  return (
    <>
      <AppBar active="/egitmenler" />
      <div className="mx-auto max-w-3xl px-7 py-8">
        <p className="mb-5 text-xs text-ink-faint">
          Eğitmenler / <span className="font-medium text-ink-soft">{name}</span>
        </p>

        <div className="mb-6 flex gap-5 rounded-xl border border-line bg-card p-6 shadow-sm">
          <Avatar
            name={name}
            avatarUrl={inst.profile?.avatar_url}
            size={96}
            rounded="rounded-2xl"
            className="text-3xl"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl">{name}</h1>
              <InstructorBadge />
            </div>
            <div className="mt-1 mb-3 text-sm text-ink-soft">{inst.tagline}</div>
            <div className="flex flex-wrap gap-1.5">
              {(inst.specialties ?? []).map((s: string) => (
                <span
                  key={s}
                  className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand"
                >
                  {s}
                </span>
              ))}
            </div>
            {(inst.years_experience || inst.website_url) && (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-faint">
                {inst.years_experience && (
                  <span>{inst.years_experience} yıl deneyim</span>
                )}
                {inst.website_url && (
                  <a
                    href={inst.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand hover:underline"
                  >
                    Web sitesi ↗
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <section className="mb-6">
          <h2 className="mb-3 font-display text-[17px]">Hakkında</h2>
          <div className="rounded-xl border border-line bg-card p-5 text-sm text-ink-soft shadow-sm">
            {inst.bio}
          </div>
        </section>

        {diplomas.length > 0 && (
          <section className="mb-6">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-[17px]">Diplomalar &amp; Sertifikalar</h2>
              <span className="font-mono text-[11px] text-ink-faint">
                isteğe bağlı
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {diplomas.map(
                (d: {
                  id: string;
                  name: string;
                  issuer: string;
                  year: number | null;
                  verified: boolean;
                }) => (
                  <div
                    key={d.id}
                    className="rounded-xl border border-line bg-card p-4 shadow-sm"
                  >
                    <div className="text-[13.5px] font-semibold">{d.name}</div>
                    <div className="mt-0.5 text-[11.5px] text-ink-faint">
                      {d.issuer}
                      {d.year ? ` · ${d.year}` : ""}
                    </div>
                    {d.verified && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand">
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
                        Doğrulandı
                      </span>
                    )}
                  </div>
                ),
              )}
            </div>
          </section>
        )}

        <section className="mb-6">
          <h2 className="mb-3 font-display text-[17px]">Verdiği Çalışmalar</h2>
          <div className="rounded-xl border border-line bg-card p-1.5 shadow-sm">
            {programs.map(
              (
                p: {
                  id: string;
                  title: string;
                  format: string;
                  session_count: number | null;
                },
                i: number,
              ) => (
                <div
                  key={p.id}
                  className="grid grid-cols-[34px_1fr_auto] items-center gap-4 border-b border-line-soft px-4 py-3.5 last:border-b-0"
                >
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-brand-soft font-mono text-xs font-semibold text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="text-[13.5px] font-semibold">{p.title}</div>
                    <div className="mt-0.5 text-[11.5px] text-ink-faint">
                      {p.format}
                      {p.session_count ? ` · ${p.session_count} oturum` : ""}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-[17px]">
            Bireysel Randevu İste
          </h2>
          <div className="rounded-xl border border-line bg-card p-5 shadow-sm">
            {user?.id === inst.id ? (
              <p className="text-sm text-ink-faint">
                Kendi profiline randevu isteyemezsin.
              </p>
            ) : (
              <BookingForm
                instructorId={inst.id}
                sessionOptions={sessionOptions}
                action={requestAppointment}
              />
            )}
          </div>
        </section>
      </div>
    </>
  );
}
