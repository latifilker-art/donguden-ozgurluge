"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function uploadMemberPhoto(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0 || file.size > 8 * 1024 * 1024) return;
  if (!file.type.startsWith("image/")) return;
  const caption = String(formData.get("caption") ?? "").trim().slice(0, 140) || null;

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${user.id}/${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("event-photos")
    .upload(path, file, { contentType: file.type });
  if (upErr) {
    console.error("uploadMemberPhoto upload:", upErr.message);
    return;
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from("event-photos").getPublicUrl(path);
  const { error } = await supabase
    .from("photos")
    .insert({ image_path: publicUrl, caption, uploaded_by: user.id });
  if (error) console.error("uploadMemberPhoto insert:", error.message);
  revalidatePath("/fotograflar");
}

export async function deleteMyPhoto(photoId: string, imagePath: string): Promise<void> {
  const supabase = await createClient();
  const marker = "/event-photos/";
  const key = imagePath.includes(marker) ? imagePath.split(marker)[1] : null;
  if (key) await supabase.storage.from("event-photos").remove([key]);
  await supabase.from("photos").delete().eq("id", photoId);
  revalidatePath("/fotograflar");
}
