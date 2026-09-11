import Link from "next/link";
import { AppBar } from "@/components/app-bar";
import { AuthForm } from "@/components/auth-form";
import { signUp } from "@/lib/auth/actions";

export default function KayitPage() {
  return (
    <>
      <AppBar />
      <div className="mx-auto w-full max-w-md px-7 py-16">
        <p className="mb-2 font-mono text-[11px] tracking-wide text-brand uppercase">
          Kayıt
        </p>
        <h1 className="mb-6 font-display text-3xl text-balance">Üye ol</h1>
        <AuthForm
          action={signUp}
          submitLabel="Üye Ol"
          pendingLabel="Kaydediliyor…"
          showName
        />
        <p className="mt-5 text-sm text-ink-faint">
          Zaten üye misin?{" "}
          <Link href="/giris" className="font-medium text-brand">
            Giriş yap
          </Link>
        </p>
      </div>
    </>
  );
}
