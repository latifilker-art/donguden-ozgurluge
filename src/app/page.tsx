import Link from "next/link";
import { AppBar } from "@/components/app-bar";

export default function HomePage() {
  return (
    <>
      <AppBar />
      <div className="mx-auto flex max-w-3xl flex-1 flex-col items-start justify-center gap-6 px-7 py-24">
        <p className="font-mono text-[11px] tracking-wide text-brand uppercase">
          Premium Farkındalık Üyeliği
        </p>
        <h1 className="font-display text-4xl leading-tight text-balance">
          Kendi ritmini bul, <em>sessizce</em> ilerle.
        </h1>
        <p className="max-w-[60ch] text-ink-soft">
          Günlük olumlamalar, nefes çalışmaları ve akşam sorularıyla kişiye özel
          bir pratik; sadece sana ve gerektiğinde desteğine görünen bir profil;
          uzmanlık alanına göre bireysel randevu alabileceğin eğitmenler.
        </p>
        <div className="flex gap-3">
          <Link
            href="/kayit"
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-ink"
          >
            Üye Ol
          </Link>
          <Link
            href="/giris"
            className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink-soft"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    </>
  );
}
