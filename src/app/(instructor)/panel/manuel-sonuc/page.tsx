import { notFound } from "next/navigation";
import Link from "next/link";
import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";
import { saveManualWorkResult } from "./actions";

type MemberOption = { id: string; display_name: string };
type WorkOption = { id: string; title: string };

export default async function ManuelSonucPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: instructor } = await supabase
    .from("instructors")
    .select("can_write_manual_results")
    .eq("id", user.id)
    .single();
  if (!instructor?.can_write_manual_results) notFound();

  const [{ data: memberData }, { data: workData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name")
      .eq("role", "member")
      .eq("status", "approved")
      .order("display_name"),
    supabase.from("external_works").select("id, title").order("sort_order"),
  ]);

  const members = (memberData ?? []) as MemberOption[];
  const works = (workData ?? []) as WorkOption[];

  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-2xl px-7 py-8">
        <p className="mb-2 font-mono text-[11px] tracking-wide text-brand uppercase">
          Eğitmen Paneli
        </p>
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="font-display text-[25px]">Çalışma Sonucu Gir</h1>
          <Link href="/panel" className="text-sm font-semibold text-brand hover:underline">
            Randevu talepleri
          </Link>
        </div>

        {success && (
          <div className="mb-6 rounded-lg bg-brand-soft px-3.5 py-2.5 text-xs font-semibold text-brand">
            Sonuç kaydedildi — üye kendi profilinde görebilir.
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-lg bg-neg-soft px-3.5 py-2.5 text-xs font-semibold text-neg">
            Bir hata oluştu — tekrar dene.
          </div>
        )}

        <form
          action={saveManualWorkResult}
          className="flex flex-col gap-4 rounded-xl border border-line bg-card p-6 shadow-sm"
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
              Çalışma
            </label>
            <select
              name="workTitle"
              required
              className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm"
            >
              <option value="">Çalışma seç…</option>
              {works.map((w) => (
                <option key={w.id} value={w.title}>
                  {w.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">
              Sonuç Metni
            </label>
            <textarea
              name="resultText"
              required
              rows={10}
              placeholder="Üyenin test/seans sonucunu buraya yaz…"
              className="w-full resize-y rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
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
