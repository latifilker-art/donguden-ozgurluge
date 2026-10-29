import type { SupabaseClient } from "@supabase/supabase-js";
import { computeColorAnalysis } from "./numerology";
import { generateColorAnalysisReport } from "./generate-report";
import { renderColorAnalysisPdf } from "./render-pdf";

// Hesapla → AI raporu → PDF → Storage → save_color_analysis RPC. Analiz id döner.
export async function generateAndSaveColorAnalysis(
  supabase: SupabaseClient,
  p: { memberId: string; fullName: string; birthDate: string },
): Promise<string> {
  const computation = computeColorAnalysis(p.fullName, new Date(`${p.birthDate}T00:00:00`));
  const report = await generateColorAnalysisReport(computation);
  const pdf = await renderColorAnalysisPdf(p.fullName, report);

  const pdfPath = `${p.memberId}/renk-analizi-${Date.now()}.pdf`;
  const { error: upErr } = await supabase.storage
    .from("work-results")
    .upload(pdfPath, pdf, { contentType: "application/pdf" });
  if (upErr) throw new Error(`upload: ${upErr.message}`);

  const { data, error } = await supabase.rpc("save_color_analysis", {
    p_member_id: p.memberId,
    p_full_name: p.fullName,
    p_birth_date: p.birthDate,
    p_computation: computation,
    p_report: report,
    p_pdf_path: pdfPath,
  });
  if (error) throw new Error(`rpc: ${error.message}`);
  return data as string;
}
