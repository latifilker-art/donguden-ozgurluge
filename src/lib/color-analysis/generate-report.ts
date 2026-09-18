import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ColorAnalysisComputation } from "./numerology";

// Kaynak kitapçık ve örnek raporlar gerçek müşteri verisi ve özgün metodoloji
// içerdiği için repoya/git'e değil, private bir Storage bucket'ına konur ve
// sadece sunucu tarafında, service-role ile çalışma zamanında çekilir.
const SOURCE_BUCKET = "color-analysis-source";
let cachedSystemPrompt: string | null = null;

async function readSource(supabase: ReturnType<typeof createAdminClient>, file: string) {
  const { data, error } = await supabase.storage.from(SOURCE_BUCKET).download(file);
  if (error || !data) {
    throw new Error(`Kaynak dosya okunamadı (${file}): ${error?.message}`);
  }
  return data.text();
}

async function buildSystemPrompt(): Promise<string> {
  if (cachedSystemPrompt) return cachedSystemPrompt;

  const supabase = createAdminClient();
  const [kitapcik, ornek1, ornek2] = await Promise.all([
    readSource(supabase, "kaynak-kitapcik.txt"),
    readSource(supabase, "ornek-rapor-1.txt"),
    readSource(supabase, "ornek-rapor-2.txt"),
  ]);

  cachedSystemPrompt = `Sen "Renklerle Dönüşüm" isim-numerolojisi ve renk profili sistemine hakim, deneyimli bir renk analisti ve yazarsın. Aşağıda önce sistemin kaynak kitapçığı, sonra iki gerçek örnek analiz raporu veriliyor. Bu örnekler stil, ton, derinlik ve yapı referansıdır — asla kelimesi kelimesine kopyalama, her raporu o kişinin kendi sayısal verilerine göre baştan sona özgün yaz.

Yazacağın rapor örneklerdeki gibi ~30-34 bölümden oluşmalı: Ana Profil (Yaşam Yolu), İsim Barkodu, Renk Tekrar Tablosu, en baskın renk(ler), potansiyel, iç benlik, maske, dört ana katman özeti, eksik renk(ler) ve anlamı, iç çatışmalar (baskın renkler arasındaki gerilimler), ilişki dinamikleri, kariyer dinamikleri, para ile ilişki, ruhsal potansiyel, aile/atasal sembolizm (bunun kesin bir iddia değil sembolik bir araştırma alanı olduğunu belirt), çalışılması gereken renkler ve somut uygulama örnekleri, artırılmaması gereken renkler, ana renk dinamiği özeti, çalışma sırası ve kişisel dönüşüm ekseni ile bitir.

Kurallar:
- Türkçe yaz, ikinci tekil/üçüncü tekil şahıs ile kişiye hitap et (kişinin adını kullan).
- Her bölüm gerçek, o kişinin kendi hesaplanmış renklerine, tekrar sayılarına ve eksik renklerine dayanmalı — jenerik astroloji dili değil, kaynaktaki fonksiyonel/gölge yapısını kullan.
- Örneklerdeki gibi güçlü, vurgulu cümleler ve kişiye özel "dönüşüm cümleleri" kullan.
- Sonuçları kesin kader iddiaları gibi sunma; "olabilir", "eğilimi taşıyabilir" gibi bir çerçeve kullan.
- Her section'ın body'si düz metin olsun, paragraflar arasında boş satır kullan, madde işaretleri gerektiğinde "- " ile başlasın.

--- KAYNAK KİTAPÇIK ---
${kitapcik}

--- ÖRNEK RAPOR 1 (stil referansı, kopyalama) ---
${ornek1}

--- ÖRNEK RAPOR 2 (stil referansı, kopyalama) ---
${ornek2}`;

  return cachedSystemPrompt;
}

export type ReportSection = { title: string; body: string };
export type ColorAnalysisReport = { sections: ReportSection[] };

const REPORT_SCHEMA = {
  type: "object" as const,
  properties: {
    sections: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          title: { type: "string" as const },
          body: { type: "string" as const },
        },
        required: ["title", "body"],
        additionalProperties: false,
      },
    },
  },
  required: ["sections"],
  additionalProperties: false,
};

export async function generateColorAnalysisReport(
  computation: ColorAnalysisComputation,
): Promise<ColorAnalysisReport> {
  const systemPrompt = await buildSystemPrompt();
  const client = new Anthropic();

  const stream = client.messages.stream({
    model: "claude-sonnet-5",
    max_tokens: 48000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: REPORT_SCHEMA },
    },
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral", ttl: "1h" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Aşağıdaki kişi için, kaynak kitapçık ve örnek raporlardaki yapı ve derinlikte, tamamen kişiye özgü bir Detaylı Renk Profili Analizi yaz.

Ad Soyad: ${computation.fullName}
Doğum Tarihi: ${computation.birthDate}

Hesaplanmış veriler (JSON):
${JSON.stringify(computation, null, 2)}`,
      },
    ],
  });

  const finalMessage = await stream.finalMessage();
  const textBlock = finalMessage.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude'dan metin yanıtı alınamadı.");
  }

  const parsed = JSON.parse(textBlock.text) as ColorAnalysisReport;
  if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
    throw new Error("Rapor beklenen formatta değil.");
  }
  return parsed;
}
