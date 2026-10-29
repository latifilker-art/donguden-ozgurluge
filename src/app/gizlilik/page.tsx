import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikası — Döngüden Özgürlüğe",
  description: "Döngüden Özgürlüğe üyelik sitesi ve uygulaması için gizlilik politikası.",
};

const CONTACT_EMAIL = "latifilker@gmail.com";
const UPDATED = "29 Ekim 2026";

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. Kapsam",
    body: (
      <p>
        Bu politika, &quot;Döngüden Özgürlüğe&quot; kapalı üyelik platformu için (web sitesi{" "}
        <b>dongudenozgurluge.app</b> ve Android uygulaması) geçerlidir. Platform yalnızca yönetici
        tarafından onaylanan üyelere ve eğitmenlere açıktır.
      </p>
    ),
  },
  {
    title: "2. Topladığımız bilgiler",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Hesap bilgileri: e-posta adresi, şifre (şifreli olarak saklanır), görünen ad.</li>
        <li>
          İsteğe bağlı profil bilgileri: telefon, doğum tarihi, adres, acil durum iletişim kişisi,
          kısa biyografi ve profil fotoğrafı.
        </li>
        <li>
          Platform içi içerik: üyeler arası mesajlar, randevu ve eğitim talepleri, eğitmenlerin
          paylaştığı sonuç metinleri ve PDF dosyaları, yüklenen fotoğraflar.
        </li>
        <li>
          Renk analizi: talep ettiğinde ad-soyad ve doğum tarihinden üretilen kişisel analiz raporu.
        </li>
        <li>Kullanım kayıtları: yönetim ekibinin hesabına eriştiği zamanların erişim günlüğü.</li>
      </ul>
    ),
  },
  {
    title: "3. Bilgileri neden kullanırız",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Üyeliği yönetmek, giriş yapmanızı sağlamak ve kişiselleştirilmiş günlük içerik sunmak.</li>
        <li>Eğitim, randevu ve renk analizi taleplerinizi karşılamak.</li>
        <li>Üyeler ve eğitmenler arasında mesajlaşmayı sağlamak.</li>
        <li>Platformun güvenliğini sağlamak ve kötüye kullanımı önlemek.</li>
      </ul>
    ),
  },
  {
    title: "4. Kimler neyi görebilir",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <b>Telefon, doğum tarihi, adres ve acil durum bilgisi</b> ayrı ve korumalı bir alanda
          saklanır. Yalnızca siz ve (destek amacıyla, erişim günlüğüne kaydedilerek) platform
          yöneticisi görebilir. Diğer üyeler ve eğitmenler bu bilgileri göremez; sadece size mesaj
          gönderebilir.
        </li>
        <li>
          Diğer üyeler yalnızca görünen adınızı ve varsa profil fotoğrafınızı görür. Mesajlarınızı
          yalnızca yazıştığınız kişi görür.
        </li>
        <li>
          Bir eğitim talebinde bulunduğunuzda, o eğitimi veren eğitmen talebinizi ve adınızı görür.
        </li>
        <li>İçeriklere yalnızca giriş yapmış, onaylı hesaplar erişebilir.</li>
      </ul>
    ),
  },
  {
    title: "5. Hizmet sağlayıcılar",
    body: (
      <>
        <p className="mb-2">Verileriniz yalnızca hizmeti çalıştırmak için aşağıdaki sağlayıcılarla işlenir:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Supabase — veritabanı, kimlik doğrulama ve dosya depolama (Güney Kore, Seul).</li>
          <li>Vercel — web sitesi barındırma.</li>
          <li>
            Anthropic (Claude) — yalnızca renk analizi talep ettiğinizde, analiz raporunu üretmek için
            ad ve doğum tarihiniz gönderilir. Bu veriler reklam amacıyla kullanılmaz.
          </li>
        </ul>
        <p className="mt-2">
          Verilerinizi satmaz, reklam amacıyla üçüncü taraflarla paylaşmayız. Uygulamada reklam veya
          üçüncü taraf izleme aracı bulunmaz.
        </p>
      </>
    ),
  },
  {
    title: "6. Saklama süresi",
    body: (
      <p>
        Bilgileriniz hesabınız açık olduğu sürece saklanır. Hesabınızın silinmesini istediğinizde
        profiliniz, mesajlarınız, talepleriniz ve yüklediğiniz dosyalar silinir.
      </p>
    ),
  },
  {
    title: "7. Haklarınız ve hesap silme",
    body: (
      <>
        <p className="mb-2">
          6698 sayılı KVKK kapsamında verilerinize erişme, düzeltme, silme ve işlenmesine itiraz etme
          hakkına sahipsiniz. Profil sayfanızdan bilgilerinizi dilediğiniz zaman güncelleyebilir veya
          silebilirsiniz.
        </p>
        <p>
          <b>Hesabınızın ve tüm verilerinizin silinmesi için</b> kayıtlı e-posta adresinizden{" "}
          <a className="font-semibold text-brand underline" href={`mailto:${CONTACT_EMAIL}?subject=Hesap%20silme%20talebi`}>
            {CONTACT_EMAIL}
          </a>{" "}
          adresine &quot;Hesap silme talebi&quot; konulu bir e-posta göndermeniz yeterlidir. Talebiniz en geç
          30 gün içinde yerine getirilir.
        </p>
      </>
    ),
  },
  {
    title: "8. Güvenlik",
    body: (
      <p>
        Veriler şifreli bağlantı (HTTPS) üzerinden iletilir; erişim, satır düzeyinde yetkilendirme
        kurallarıyla sınırlandırılır. Hiçbir sistem tamamen risksiz değildir; şüpheli bir durum
        fark ederseniz bize bildirin.
      </p>
    ),
  },
  {
    title: "9. Çocuklar",
    body: <p>Platform 18 yaşından küçüklere yönelik değildir.</p>,
  },
  {
    title: "10. Değişiklikler ve iletişim",
    body: (
      <p>
        Bu politika güncellenebilir; güncel sürüm her zaman bu sayfada yayınlanır. Sorularınız için:{" "}
        <a className="font-semibold text-brand underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </p>
    ),
  },
];

export default function GizlilikPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/" className="font-display text-base italic text-brand">
        Döngüden Özgürlüğe
      </Link>
      <p className="mt-8 mb-2 font-mono text-[11px] tracking-wide text-brand uppercase">Yasal</p>
      <h1 className="mb-1 font-display text-[28px]">Gizlilik Politikası</h1>
      <p className="mb-8 text-xs text-ink-faint">Son güncelleme: {UPDATED}</p>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-ink-soft">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="mb-2 font-display text-[17px] text-ink">{s.title}</h2>
            {s.body}
          </section>
        ))}
      </div>
    </main>
  );
}
