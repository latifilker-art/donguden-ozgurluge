import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";
import { verifyDiploma } from "./actions";

type PendingDiploma = {
  id: string;
  name: string;
  issuer: string;
  year: number | null;
  instructor: { profile: { display_name: string } | null } | null;
};

export default async function DiplomalarPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("diplomas")
    .select(
      "id, name, issuer, year, instructor:instructors(profile:profiles(display_name))",
    )
    .eq("verified", false);

  const pending = (data ?? []) as unknown as PendingDiploma[];

  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-2xl px-7 py-8">
        <p className="mb-5 text-xs text-ink-faint">
          Admin / <span className="font-medium text-ink-soft">Diplomalar</span>
        </p>
        <h1 className="mb-2 font-display text-[25px]">Diploma Onay Kuyruğu</h1>
        <p className="mb-6 text-sm text-ink-soft">
          Onaylanan diplomalar eğitmenin herkese açık profilinde
          &quot;Doğrulandı&quot; rozetiyle görünür.
        </p>

        <div className="rounded-xl border border-line bg-card shadow-sm">
          {pending.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between gap-4 border-b border-line-soft px-5 py-4 last:border-b-0"
            >
              <div>
                <div className="text-sm font-bold">{d.name}</div>
                <div className="text-xs text-ink-faint">
                  {d.instructor?.profile?.display_name ?? "Eğitmen"} ·{" "}
                  {d.issuer}
                  {d.year ? ` · ${d.year}` : ""}
                </div>
              </div>
              <form action={verifyDiploma.bind(null, d.id)}>
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-brand-ink"
                >
                  Doğrula
                </button>
              </form>
            </div>
          ))}
          {pending.length === 0 && (
            <p className="p-5 text-sm text-ink-faint">
              Onay bekleyen diploma yok.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
