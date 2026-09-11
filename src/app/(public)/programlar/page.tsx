import Link from "next/link";
import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";

export default async function ProgramlarPage() {
  const supabase = await createClient();
  const { data: works } = await supabase
    .from("external_works")
    .select("id, title, description, sort_order")
    .order("sort_order");

  return (
    <>
      <AppBar active="/programlar" />
      <div className="mx-auto max-w-3xl px-7 py-8">
        <p className="mb-2 font-mono text-[11px] tracking-wide text-brand uppercase">
          Programlar
        </p>
        <h1 className="mb-2 font-display text-[27px] text-balance">
          Günlük pratiğinin yanına eklediğin özel çalışmalar
        </h1>
        <p className="mb-8 max-w-[60ch] text-sm text-ink-soft">
          Bunlar eğitmenler tarafından bire bir yürütülen, sonucunda kendine
          özel bir dosya bıraktığın çalışmalar. Üye olduğunda ilerlemeni{" "}
          <span className="font-medium text-ink">Profilim</span> sayfandan
          takip edersin.
        </p>

        <div className="rounded-xl border border-line bg-card p-1.5 shadow-sm">
          {(works ?? []).map((work, i) => (
            <div
              key={work.id}
              className="grid grid-cols-[40px_1fr] gap-4 border-b border-line-soft px-5 py-5 last:border-b-0"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft font-mono text-sm font-semibold text-brand">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <h2 className="text-[15px] font-bold">{work.title}</h2>
                <p className="mt-1 text-sm text-ink-soft">
                  {work.description}
                </p>
              </div>
            </div>
          ))}
          {(works ?? []).length === 0 && (
            <p className="p-5 text-sm text-ink-faint">
              Şu an listelenen bir program yok.
            </p>
          )}
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-xl border border-dashed border-line bg-card p-5">
          <p className="flex-1 text-sm text-ink-soft">
            Bu çalışmalardan birine başlamak için önce üye olman, sonra bir
            eğitmenle bireysel randevu alman gerekir.
          </p>
          <Link
            href="/kayit"
            className="shrink-0 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-ink"
          >
            Üye Ol
          </Link>
        </div>
      </div>
    </>
  );
}
