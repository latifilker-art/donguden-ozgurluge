import Link from "next/link";
import { AppBar } from "@/components/app-bar";
import { AuthForm } from "@/components/auth-form";
import { signIn } from "@/lib/auth/actions";

export default function GirisPage() {
  return (
    <>
      <AppBar />
      <div className="mx-auto w-full max-w-md px-7 py-16">
        <p className="mb-2 font-mono text-[11px] tracking-wide text-brand uppercase">
          Giriş
        </p>
        <h1 className="mb-6 font-display text-3xl text-balance">
          Tekrar hoş geldin
        </h1>
        <AuthForm action={signIn} submitLabel="Giriş Yap" pendingLabel="Giriş yapılıyor…" />
        <p className="mt-5 text-sm text-ink-faint">
          Hesabın yok mu?{" "}
          <Link href="/kayit" className="font-medium text-brand">
            Üye ol
          </Link>
        </p>
      </div>
    </>
  );
}
