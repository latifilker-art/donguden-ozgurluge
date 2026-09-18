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

export async function saveEveningAnswer(
  entryId: string,
  formData: FormData,
): Promise<void> {
  const supabase = await createClient();
  const answerText = String(formData.get("answerText") ?? "").trim();
  if (!answerText) return;

  const { data: entry } = await supabase
    .from("rhythm_entries")
    .select("unlock_at")
    .eq("id", entryId)
    .single();

  if (entry?.unlock_at && new Date(entry.unlock_at) > new Date()) {
    console.error("saveEveningAnswer: henüz açılmadı");
    return;
  }

  const { error } = await supabase
    .from("rhythm_entries")
    .update({ answer_text: answerText, completed_at: new Date().toISOString() })
    .eq("id", entryId);

  if (error) {
    console.error("saveEveningAnswer failed:", error.message);
    return;
  }

  revalidatePath("/bugun");
  revalidatePath("/profilim");
}
