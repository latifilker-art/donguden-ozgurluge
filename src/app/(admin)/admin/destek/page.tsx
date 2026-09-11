import Link from "next/link";
import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";

export default async function DestekPage() {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("profiles")
    .select("id, display_name, created_at")
    .eq("role", "member")
    .order("created_at", { ascending: false });

  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-2xl px-7 py-8">
        <p className="mb-5 text-xs text-ink-faint">
          Admin / <span className="font-medium text-ink-soft">Destek</span>
        </p>
        <h1 className="mb-2 font-display text-[25px]">Destek Görünümü</h1>
        <p className="mb-6 text-sm text-ink-soft">
          Bir üyeye tıkladığında önce sebep girmen istenecek — üyenin verisi
          ancak sebep kaydedildikten sonra gösterilir.
        </p>

        <div className="rounded-xl border border-line bg-card shadow-sm">
          {(members ?? []).map((m) => (
            <Link
              key={m.id}
              href={`/admin/destek/${m.id}`}
              className="flex items-center justify-between border-b border-line-soft px-5 py-3.5 text-sm last:border-b-0 hover:bg-surface-2"
            >
              <span className="font-semibold">{m.display_name}</span>
              <span className="text-xs text-ink-faint">Görüntüle →</span>
            </Link>
          ))}
          {(members ?? []).length === 0 && (
            <p className="p-5 text-sm text-ink-faint">Henüz üye yok.</p>
          )}
        </div>
      </div>
    </>
  );
}
