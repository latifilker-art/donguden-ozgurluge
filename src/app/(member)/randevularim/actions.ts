"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function cancelAppointment(appointmentId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", appointmentId);

  if (error) {
    // RLS sadece "pending" durumundaki kendi talebini silmeye izin veriyor —
    // başka bir durumda buraya düşerse sessizce günlüğe düşüyoruz.
    console.error("cancelAppointment failed:", error.message);
    return;
  }

  revalidatePath("/randevularim");
}
