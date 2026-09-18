"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeColorAnalysis } from "@/lib/color-analysis/numerology";
import { generateColorAnalysisReport } from "@/lib/color-analysis/generate-report";
import { renderColorAnalysisPdf } from "@/lib/color-analysis/render-pdf";

export async function createColorAnalysis(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: instructor } = await supabase
    .from("instructors")
    .select("can_generate_color_analysis")
    .eq("id", user.id)
    .single();
  if (!instructor?.can_generate_color_analysis) return;

  const memberId = String(formData.get("memberId") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const birthDateRaw = String(formData.get("birthDate") ?? "");
  if (!memberId || !fullName || !birthDateRaw) return;

  const birthDate = new Date(`${birthDateRaw}T00:00:00`);
  const computation = computeColorAnalysis(fullName, birthDate);

  let report;
  try {
    report = await generateColorAnalysisReport(computation);
  } catch (err) {
    console.error("generateColorAnalysisReport failed:", err);
    redirect("/panel/renk-analizi?error=generation");
  }
  const pdfBuffer = await renderColorAnalysisPdf(fullName, report);

  const pdfPath = `${memberId}/renk-analizi-${Date.now()}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("work-results")
    .upload(pdfPath, pdfBuffer, { contentType: "application/pdf" });

  if (uploadError) {
    console.error("createColorAnalysis upload failed:", uploadError.message);
    redirect("/panel/renk-analizi?error=upload");
  }

  const { data: analysisId, error: rpcError } = await supabase.rpc(
    "save_color_analysis",
    {
      p_member_id: memberId,
      p_full_name: fullName,
      p_birth_date: birthDateRaw,
      p_computation: computation,
      p_report: report,
      p_pdf_path: pdfPath,
    },
  );

  if (rpcError) {
    console.error("save_color_analysis failed:", rpcError.message);
    redirect("/panel/renk-analizi?error=save");
  }

  revalidatePath("/panel/renk-analizi");
  redirect(`/panel/renk-analizi/${analysisId}`);
}
