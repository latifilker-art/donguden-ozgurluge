"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function uploadAudioTrack(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const file = formData.get("audio");
  if (!(file instanceof File) || file.size === 0) return;

  const category = String(formData.get("category") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title || (category !== "cakra_dengeleme" && category !== "olumlama")) return;

  const ext = file.name.split(".").pop() || "mp3";
  const path = `${category}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("audio-library")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    console.error("uploadAudioTrack upload failed:", uploadError.message);
    return;
  }

  const { error: insertError } = await supabase.from("audio_tracks").insert({
    category,
    title,
    description: description || null,
    storage_path: path,
  });

  if (insertError) {
    console.error("uploadAudioTrack insert failed:", insertError.message);
    return;
  }

  revalidatePath("/admin/ses-kutuphanesi");
  revalidatePath("/frekans");
}

export async function deleteAudioTrack(
  trackId: string,
  storagePath: string,
): Promise<void> {
  const supabase = await createClient();

  await supabase.storage.from("audio-library").remove([storagePath]);

  const { error } = await supabase.from("audio_tracks").delete().eq("id", trackId);
  if (error) {
    console.error("deleteAudioTrack failed:", error.message);
    return;
  }

  revalidatePath("/admin/ses-kutuphanesi");
  revalidatePath("/frekans");
}
