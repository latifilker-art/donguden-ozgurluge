import Link from "next/link";
import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";

const SECTIONS = [
  { href: "/admin/uyeler", title: "Üye Onayı", desc: "Yeni kayıtları onayla veya reddet", tone: "#c0603f" },
  { href: "/admin/uyelikler", title: "Üyelik Kademeleri", desc: "Temel / Premium / VIP geçişleri", tone: "#b8903a" },
  { href: "/admin/destek", title: "Destek Görünümü", desc: "Üye profili, dosya ve PDF ekleme (loglu)", tone: "#3f7fb5" },
  { href: "/admin/egitmenler", title: "Eğitmenler", desc: "Verdikleri çalışmaları düzenle", tone: "#8a5aa8" },
  { href: "/admin/diplomalar", title: "Diploma Onayı", desc: "Sertifikaları doğrula", tone: "#4f8a5b" },
  { href: "/admin/etkinlikler", title: "Etkinlikler", desc: "Online eğitim ve kamp oluştur", tone: "#d9822b" },
  { href: "/admin/ses-kutuphanesi", title: "Ses Kütüphanesi", desc: "Çakra ve olumlama frekansları", tone: "#4a4a9c" },
  { href: "/admin/fotograflar", title: "Fotoğraf Galerisi", desc: "Etkinlik fotoğrafları yükle", tone: "#c98a96" },
];

async function count(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  filter?: (q: any) => any, // eslint-disable-line @typescript-eslint/no-explicit-any
) {
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count: c } = await q;
  return c ?? 0;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const [members, pending, premium, requests, appts, tracks, photos, analyses] =
    await Promise.all([
      count(supabase, "profiles", (q) => q.eq("role", "member").eq("status", "approved")),
      count(supabase, "profiles", (q) => q.eq("role", "member").eq("status", "pending")),
      count(supabase, "subscriptions", (q) => q.in("plan", ["premium", "vip"]).eq("status", "active")),
      count(supabase, "color_analysis_requests", (q) => q.eq("status", "pending")),
      count(supabase, "appointments", (q) => q.eq("status", "pending")),
      count(supabase, "audio_tracks"),
      count(supabase, "photos"),
      count(supabase, "color_analyses"),
    ]);

  const STATS = [
    { label: "Aktif Üye", value: members, tone: "#3f6f5e", href: "/admin/uyeler" },
    { label: "Onay Bekleyen", value: pending, tone: "#c0603f", href: "/admin/uyeler", alert: pending > 0 },
    { label: "Premium / VIP", value: premium, tone: "#b8903a", href: "/admin/uyelikler" },
    { label: "Renk Analizi Talebi", value: requests, tone: "#8a5aa8", href: "/panel/renk-analizi", alert: requests > 0 },
    { label: "Bekleyen Randevu", value: appts, tone: "#3f7fb5", href: "/admin/destek" },
    { label: "Üretilen Analiz", value: analyses, tone: "#4f8a5b", href: "/admin/destek" },
    { label: "Ses Kaydı", value: tracks, tone: "#4a4a9c", href: "/admin/ses-kutuphanesi" },
    { label: "Fotoğraf", value: photos, tone: "#c98a96", href: "/admin/fotograflar" },
  ];

  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-4xl px-7 py-8">
        <p className="mb-2 font-mono text-[11px] tracking-wide text-brand uppercase">Admin</p>
        <h1 className="mb-6 font-display text-[27px]">Yönetim Paneli</h1>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="relative overflow-hidden rounded-2xl border border-line bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="absolute inset-x-0 top-0 h-1" style={{ background: s.tone }} />
              <div className="font-display text-[30px] leading-none" style={{ color: s.tone }}>
                {s.value}
                {s.alert && <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-neg align-middle" />}
              </div>
              <div className="mt-2 text-xs text-ink-soft">{s.label}</div>
            </Link>
          ))}
        </div>

        <h2 className="mb-3 font-display text-[17px]">Yönetim Alanları</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4 shadow-sm transition hover:border-brand"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-lg text-white"
                style={{ background: s.tone }}
              >
                {s.title[0]}
              </div>
              <div>
                <div className="text-[14.5px] font-bold">{s.title}</div>
                <div className="text-xs text-ink-soft">{s.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
