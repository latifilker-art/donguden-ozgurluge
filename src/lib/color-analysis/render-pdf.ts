import path from "node:path";
import PDFDocument from "pdfkit";
import type { ColorAnalysisReport } from "./generate-report";

const FONTS_DIR = path.join(process.cwd(), "src/lib/color-analysis/fonts");
const REGULAR_FONT = path.join(FONTS_DIR, "Karla-Regular.ttf");
const BOLD_FONT = path.join(FONTS_DIR, "Karla-Bold.ttf");

const BRAND_COLOR = "#3f6f5e";
const INK_COLOR = "#2b2b26";

export async function renderColorAnalysisPdf(
  fullName: string,
  report: ColorAnalysisReport,
): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 56 });
  doc.registerFont("Karla", REGULAR_FONT);
  doc.registerFont("Karla-Bold", BOLD_FONT);

  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc
    .font("Karla-Bold")
    .fontSize(20)
    .fillColor(BRAND_COLOR)
    .text(`${fullName}`, { align: "left" });
  doc
    .font("Karla-Bold")
    .fontSize(13)
    .fillColor(INK_COLOR)
    .text("DETAYLI RENK PROFİLİ ANALİZİ", { align: "left" });
  doc.moveDown(1.2);

  for (const section of report.sections) {
    if (doc.y > doc.page.height - 140) doc.addPage();
    doc
      .font("Karla-Bold")
      .fontSize(13)
      .fillColor(BRAND_COLOR)
      .text(section.title);
    doc.moveDown(0.3);
    doc
      .font("Karla")
      .fontSize(10.5)
      .fillColor(INK_COLOR)
      .text(section.body, { align: "left", lineGap: 3 });
    doc.moveDown(1);
  }

  doc.end();
  return done;
}
