import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";
import {
  approveColorRequest,
  rejectColorRequest,
  fulfillWorkRequest,
  rejectWorkRequest,
} from "./actions";

export const maxDuration = 800;

type ColorReq = {
  id: string;
  full_name: string;
  birth_date: string;
  created_at: string;
  member: { display_name: string } | null;
};
type WorkReq = {
  id: string;
  work_title: string;
  created_at: string;
  member: { display_name: string } | null;
};

export default async function TaleplerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; done?: string }>;
}) {
  const { error, done } = await searchParams;
  const supabase = await createClient();
  const [{ data: c }, { data: w }] = await Promise.all([
    supabase
      .from("color_analysis_requests")
      .select("id, full_name, birth_date, created_at, member:profiles(display_name)")
      .eq("status", "pending")
      .order("created_at"),
    supabase
      .from("work_requests")
      .select("id, work_title, created_at, member:profiles(display_name)")
      .eq("status", "pending")
      .order("created_at"),
  ]);
  const colorReqs = (c ?? []) as unknown as ColorReq[];
  const workReqs = (w ?? []) as unknown as WorkReq[];
  const fmt = (d: string) => new Date(d).toLocaleDateString("tr-TR");

  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-3xl px-7 py-8">
        <p className="mb-2 font-mono text-[11px] tracking-wide text-brand uppercase">Admin</p>
        <h1 className="mb-6 font-display text-[27px]">Üye Talepleri</h1>
        {done && (
          <div className="mb-5 rounded-lg bg-brand-soft px-3.5 py-2.5 text-xs font-semibold text-brand">
            Analiz üretildi ve üyenin profiline eklendi.
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-lg bg-neg-soft px-3.5 py-2.5 text-xs font-semibold text-neg">
            Üretim sırasında hata oluştu, tekrar dene.
          </div>
        )}

        <h2 className="mb-1 font-display text-[17px]">Renk Analizi Talepleri ({colorReqs.length})</h2>
        <p className="mb-3 text-xs text-ink-faint">
          Onayla dediğinde analiz otomatik üretilir (3-7 dk sürebilir, sayfadan ayrılma).
        </p>
        <div className="mb-8 flex flex-col gap-3">
          {colorReqs.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-line bg-card p-4 shadow-sm"
              style={{ borderLeft: "4px solid #8a5aa8" }}
            >
              <div className="text-sm font-bold">{r.full_name}</div>
              <div className="mb-3 text-xs text-ink-faint">
                Üye: {r.member?.display_name} · Doğum: {fmt(r.birth_date)} · {fmt(r.created_at)}
              </div>
              <div className="flex gap-2">
                <form action={approveColorRequest.bind(null, r.id)}>
                  <button className="rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-brand-ink">
                    Onayla ve Üret
                  </button>
                </form>
                <form action={rejectColorRequest.bind(null, r.id)}>
                  <button className="rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-ink-soft hover:border-neg hover:text-neg">
                    Reddet
                  </button>
                </form>
              </div>
            </div>
          ))}
          {colorReqs.length === 0 && (
            <p className="rounded-xl border border-line bg-card p-4 text-sm text-ink-faint">Bekleyen talep yok.</p>
          )}
        </div>

        <h2 className="mb-3 font-display text-[17px]">Çalışma Talepleri ({workReqs.length})</h2>
        <div className="flex flex-col gap-3">
          {workReqs.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-line bg-card p-4 shadow-sm"
              style={{ borderLeft: "4px solid #b8566b" }}
            >
              <div className="text-sm font-bold">{r.work_title}</div>
              <div className="mb-3 text-xs text-ink-faint">
                Üye: {r.member?.display_name} · {fmt(r.created_at)}
              </div>
              <form action={fulfillWorkRequest.bind(null, r.id)} className="flex flex-col gap-2">
                <textarea
                  name="resultText"
                  rows={4}
                  placeholder="Sonuç metni (opsiyonel)"
                  className="rounded-lg border border-line bg-card px-3 py-2 text-sm"
                />
                <input type="file" name="pdf" accept="application/pdf" className="text-xs" />
                <div className="flex gap-2">
                  <button className="rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-brand-ink">
                    Gönder ve Tamamla
                  </button>
                  <button
                    formAction={rejectWorkRequest.bind(null, r.id)}
                    className="rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-ink-soft hover:border-neg hover:text-neg"
                  >
                    Reddet
                  </button>
                </div>
              </form>
            </div>
          ))}
          {workReqs.length === 0 && (
            <p className="rounded-xl border border-line bg-card p-4 text-sm text-ink-faint">Bekleyen talep yok.</p>
          )}
        </div>
      </div>
    </>
  );
}
