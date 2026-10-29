"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function respondToAppointment(
  appointmentId: string,
  status: "approved" | "declined",
  formData: FormData,
): Promise<void> {
  const supabase = await createClient();
  const responseNote = String(formData.get("responseNote") ?? "").trim() || null;

  const { error } = await supabase
    .from("appointments")
    .update({ status, response_note: responseNote })
    .eq("id", appointmentId);

  if (error) {
    // RLS sadece kendine gelen talebi yanıtlamaya izin veriyor.
    console.error("respondToAppointment failed:", error.message);
    return;
  }

  revalidatePath("/panel");
}

export async function fulfillRequest(requestId: string, formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: req } = await supabase
    .from("work_requests")
    .select("member_id")
    .eq("id", requestId)
    .single();
  if (!req) return;

  const text = String(formData.get("resultText") ?? "").trim();
  const file = formData.get("pdf");
  const hasFile = file instanceof File && file.size > 0;
  if (!text && !hasFile) return;

  let path = "";
  if (hasFile) {
    path = `${req.member_id}/${Date.now()}-calisma.pdf`;
    const { error: upErr } = await supabase.storage
      .from("work-results")
      .upload(path, file, { contentType: "application/pdf" });
    if (upErr) {
      console.error("fulfillRequest upload:", upErr.message);
      return;
    }
  }
  const { error } = await supabase.rpc("instructor_fulfill_request", {
    p_request_id: requestId,
    p_text: text,
    p_path: path,
  });
  if (error) console.error("instructor_fulfill_request:", error.message);
  revalidatePath("/panel");
}
