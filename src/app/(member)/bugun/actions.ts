"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleRhythmItem(entryId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("toggle_rhythm_item", {
    p_entry_id: entryId,
  });

  if (error) {
    // En sık neden: akşam sorusu 21:00'den önce açılmaya çalışıldı —
    // bunu sunucu (Postgres fonksiyonu) reddediyor. UI zaten kilitli
    // öğeyi disabled gösteriyor; burada sessizce günlüğe düşüyoruz.
    console.error("toggleRhythmItem failed:", error.message);
    return;
  }

  revalidatePath("/bugun");
  revalidatePath("/profilim");
}
