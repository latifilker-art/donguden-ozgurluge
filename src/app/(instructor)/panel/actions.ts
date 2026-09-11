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
