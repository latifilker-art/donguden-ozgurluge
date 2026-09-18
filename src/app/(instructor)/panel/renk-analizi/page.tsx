import { notFound } from "next/navigation";
import Link from "next/link";
import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";
import { createColorAnalysis } from "./actions";

export const maxDuration = 800;

type MemberOption = { id: string; display_name: string };
type AnalysisRow = { id: string; full_name: string; created_at: string };

const ERROR_MESSAGES: Record<string, string> = {
  generation: "Rapor üretilirken bir hata oluştu (ör. API kotası/bakiyesi) — tekrar dene.",
  upload: "Rapor üretildi ama PDF yüklenirken bir hata oluştu — tekrar dene.",
  save: "Rapor üretildi ama kaydedilirken bir hata oluştu — tekrar dene.",
};

export default async function RenkAnaliziPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: instructor } = await supabase
    .from("instructors")
    .select("can_generate_color_analysis")
    .eq("id", user.id)
    .single();
  if (!instructor?.can_generate_color_analysis) notFound();

  const [{ data: memberData }, { data: analysisData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name")
      .eq("role", "member")
      .eq("status", "approved")
      .order("display_name"),
    supabase
      .from("color_analyses")
      .select("id, full_name, created_at")
      .eq("instructor_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const members = (memberData ?? []) as MemberOption[];
  const analyses = (analysisData ?? []) as AnalysisRow[];

  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-2xl px-7 py-8">
        <p className="mb-2 font-mono text-[11px] tracking-wide text-brand uppercase">
          Eğitmen Paneli
        </p>
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="font-display text-[25px]">Renk Analizi Oluştur</h1>
          <Link href="/panel" className="text-sm font-semibold text-brand hover:underline">
            Randevu talepleri
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-neg-soft px-3.5 py-2.5 text-xs font-semibold text-neg">
            {ERROR_MESSAGES[error] ?? "Bir hata oluştu — tekrar dene."}
          </div>
        )}

        <form
          action={createColorAnalysis}
          className="mb-8 flex flex-col gap-4 rounded-xl border border-line bg-card p-6 shadow-sm"
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">
              Üye
            </label>
            <select
              name="memberId"
              required
              className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm"
            >
              <option value="">Üye seç…</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.display_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">
              Ad Soyad (analizde kullanılacak, gerçek/legal isim)
            </label>
            <input
              name="fullName"
              required
              placeholder="Örn. Ayşe Yılmaz"
              className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">
              Doğum Tarihi
            </label>
            <input
              type="date"
              name="birthDate"
              required
              className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm"
            />
          </div>
          <p className="text-[11px] text-ink-faint">
            Rapor oluşturma 3-7 dakika sürebilir — sayfadan ayrılma.
          </p>
          <button
            type="submit"
            className="self-start rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-ink"
          >
            Analizi Oluştur
          </button>
        </form>

        <section>
          <h2 className="mb-3 font-display text-[16px]">Geçmiş Analizlerim</h2>
          <div className="rounded-xl border border-line bg-card shadow-sm">
            {analyses.map((a) => (
              <Link
                key={a.id}
                href={`/panel/renk-analizi/${a.id}`}
                className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-3.5 text-sm last:border-b-0 hover:bg-brand-soft/40"
              >
                <span className="font-semibold">{a.full_name}</span>
                <span className="text-xs text-ink-faint">
                  {new Date(a.created_at).toLocaleDateString("tr-TR")}
                </span>
              </Link>
            ))}
            {analyses.length === 0 && (
              <p className="p-5 text-sm text-ink-faint">
                Henüz bir analiz oluşturmadın.
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
