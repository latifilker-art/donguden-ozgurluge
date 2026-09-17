import { AppBar } from "@/components/app-bar";
import { signOut } from "@/lib/auth/actions";

export function ApprovalNotice({
  status,
}: {
  status: "pending" | "rejected";
}) {
  const copy =
    status === "pending"
      ? {
          eyebrow: "Onay bekleniyor",
          title: "Hesabın inceleniyor",
          body: "Üyeliğin admin tarafından onaylandığında bu sayfaların tamamına erişebileceksin. Genelde kısa sürer — biraz sonra tekrar dene.",
        }
      : {
          eyebrow: "Başvuru reddedildi",
          title: "Bu hesap onaylanmadı",
          body: "Üyelik başvurun onaylanmadı. Bunun bir yanlışlık olduğunu düşünüyorsan bizimle iletişime geç.",
        };

  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-md px-7 py-20 text-center">
        <p className="mb-2 font-mono text-[11px] tracking-wide text-brand uppercase">
          {copy.eyebrow}
        </p>
        <h1 className="mb-3 font-display text-2xl text-balance">
          {copy.title}
        </h1>
        <p className="mb-6 text-sm text-ink-soft">{copy.body}</p>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink-soft"
          >
            Çıkış Yap
          </button>
        </form>
      </div>
    </>
  );
}
