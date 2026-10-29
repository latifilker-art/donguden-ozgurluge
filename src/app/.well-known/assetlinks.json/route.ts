// Android uygulamasının (TWA) siteyle doğrulanması — adres çubuğu olmadan tam ekran açılması için.
// Parmak izleri herkese açık bilgidir. Play Console → Uygulama bütünlüğü'nden gelen
// "uygulama imzalama anahtarı" SHA-256 değeri ANDROID_SHA256 env'ine (virgülle) eklenir.
const UPLOAD_KEY_SHA256 =
  "20:76:2F:BD:99:A7:ED:0C:FF:6B:AD:17:2D:F5:02:F8:03:EE:58:BD:52:3A:DF:3F:D7:0F:6D:04:9C:89:84:32";

export function GET() {
  const extra = (process.env.ANDROID_SHA256 ?? "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  return Response.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "app.dongudenozgurluge.twa",
        sha256_cert_fingerprints: [UPLOAD_KEY_SHA256, ...extra],
      },
    },
  ]);
}
