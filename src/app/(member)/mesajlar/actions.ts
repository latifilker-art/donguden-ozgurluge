"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function sendMessage(recipientId: string, formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id === recipientId) return;

  const body = String(formData.get("body") ?? "").trim().slice(0, 4000);
  if (!body) return;

  const { error } = await supabase
    .from("messages")
    .insert({ sender_id: user.id, recipient_id: recipientId, body });
  if (error) {
    console.error("sendMessage failed:", error.message);
    return;
  }
  revalidatePath(`/mesajlar/${recipientId}`);
  revalidatePath("/mesajlar");
}
