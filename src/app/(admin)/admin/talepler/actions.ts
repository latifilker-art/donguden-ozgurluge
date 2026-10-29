"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateAndSaveColorAnalysis } from "@/lib/color-analysis/create";

export async function approveColorRequest(requestId: string): Promise<void> {
  const supabase = await createClient();
  const { data: req } = await supabase
    .from("color_analysis_requests")
    .select("member_id, full_name, birth_date, status")
    .eq("id", requestId)
    .single();
  if (!req || req.status !== "pending") return;

  let analysisId: string;
  try {
    analysisId = await generateAndSaveColorAnalysis(supabase, {
      memberId: req.member_id,
      fullName: req.full_name,
      birthDate: req.birth_date,
    });
  } catch (err) {
    console.error("approveColorRequest failed:", err);
    redirect("/admin/talepler?error=1");
  }
  await supabase
    .from("color_analysis_requests")
    .update({ status: "approved", analysis_id: analysisId })
    .eq("id", requestId);
  revalidatePath("/admin/talepler");
  revalidatePath("/profilim");
  redirect("/admin/talepler?done=1");
}

export async function rejectColorRequest(requestId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("color_analysis_requests").update({ status: "rejected" }).eq("id", requestId);
  revalidatePath("/admin/talepler");
}

export async function fulfillWorkRequest(requestId: string, formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: req } = await supabase
    .from("work_requests")
    .select("member_id, work_title")
    .eq("id", requestId)
    .single();
  if (!req) return;

  const text = String(formData.get("resultText") ?? "").trim();
  const file = formData.get("pdf");
  const hasFile = file instanceof File && file.size > 0;
  if (!text && !hasFile) return;

  if (hasFile) {
    const path = `${req.member_id}/${Date.now()}-calisma.pdf`;
    const { error: upErr } = await supabase.storage
      .from("work-results")
      .upload(path, file, { contentType: "application/pdf" });
    if (upErr) {
      console.error("fulfillWorkRequest upload:", upErr.message);
      return;
    }
    await supabase.rpc("admin_set_work_file", {
      p_member_id: req.member_id,
      p_work_title: req.work_title,
      p_path: path,
    });
  }
  if (text) {
    await supabase.rpc("save_manual_work_result", {
      p_member_id: req.member_id,
      p_work_title: req.work_title,
      p_result_text: text,
    });
  }

  await supabase.from("work_requests").update({ status: "approved" }).eq("id", requestId);
  revalidatePath("/admin/talepler");
  revalidatePath("/profilim");
}

export async function rejectWorkRequest(requestId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("work_requests").update({ status: "rejected" }).eq("id", requestId);
  revalidatePath("/admin/talepler");
}
