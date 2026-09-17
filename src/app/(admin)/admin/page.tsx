import Link from "next/link";
import { AppBar } from "@/components/app-bar";

const SECTIONS = [
  {
    href: "/admin/uyeler",
    title: "Üye Onayı",
    desc: "Yeni kayıtlar admin onayına düşer — onayla/reddet, tüm üyeleri durumlarıyla gör.",
  },
  {
    href: "/admin/destek",
    title: "Destek Görünümü",
    desc: "Bir üyeyi görüntülemek için önce sebep gir — her erişim üyenin kendi erişim günlüğüne yazılır.",
  },
  {
    href: "/admin/diplomalar",
    title: "Diploma Onayı",
    desc: "Eğitmenlerin eklediği diploma/sertifikaları doğrula.",
  },
  {
    href: "/admin/etkinlikler",
    title: "Etkinlik Yönetimi",
    desc: "Online eğitim ve fiziki kamp oluştur, mevcutları listele.",
  },
  {
    href: "/admin/uyelikler",
    title: "Üyelik Yönetimi",
    desc: "Temel, Premium ve VIP kademeleri arasında elle geçiş yap.",
  },
  {
    href: "/admin/fotograflar",
    title: "Fotoğraf Galerisi",
    desc: "Etkinlik ve kamp fotoğrafları yükle, herkese açık galeriyi yönet.",
  },
];

export default function AdminPage() {
  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-2xl px-7 py-8">
        <p className="mb-2 font-mono text-[11px] tracking-wide text-brand uppercase">
          Admin
        </p>
        <h1 className="mb-6 font-display text-[25px]">Yönetim Paneli</h1>
        <div className="flex flex-col gap-3">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-xl border border-line bg-card p-5 shadow-sm transition hover:border-brand"
            >
              <div className="text-[15px] font-bold">{s.title}</div>
              <div className="mt-1 text-sm text-ink-soft">{s.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
