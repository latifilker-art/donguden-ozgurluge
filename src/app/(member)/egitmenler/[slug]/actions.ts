"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type RequestAppointmentState = { error: string | null };

export async function requestAppointment(
  instructorId: string,
  formData: FormData,
): Promise<RequestAppointmentState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/giris");
  }

  const sessionType = String(formData.get("sessionType") ?? "");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!sessionType || !date || !time) {
    return { error: "Seans türü, tarih ve saat gerekli." };
  }

  const requestedAt = new Date(`${date}T${time}:00`);
  if (Number.isNaN(requestedAt.getTime())) {
    return { error: "Tarih ya da saat geçersiz." };
  }

  const { error } = await supabase.from("appointments").insert({
    member_id: user.id,
    instructor_id: instructorId,
    session_type: sessionType,
    requested_at: requestedAt.toISOString(),
    note: note || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/randevularim");
  redirect("/randevularim");
}
