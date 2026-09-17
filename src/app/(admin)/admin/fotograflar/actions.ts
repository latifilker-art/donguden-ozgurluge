"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function uploadPhoto(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return;

  const eventId = String(formData.get("eventId") ?? "") || null;
  const caption = String(formData.get("caption") ?? "").trim() || null;

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("event-photos")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    console.error("uploadPhoto failed:", uploadError.message);
    return;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("event-photos").getPublicUrl(path);

  const { error: insertError } = await supabase.from("photos").insert({
    event_id: eventId,
    image_path: publicUrl,
    caption,
    uploaded_by: user.id,
  });

  if (insertError) {
    console.error("uploadPhoto insert failed:", insertError.message);
    return;
  }

  revalidatePath("/admin/fotograflar");
  revalidatePath("/fotograflar");
}

export async function deletePhoto(
  photoId: string,
  imagePath: string,
): Promise<void> {
  const supabase = await createClient();

  const fileName = imagePath.split("/").pop();
  if (fileName) {
    await supabase.storage.from("event-photos").remove([fileName]);
  }

  const { error } = await supabase.from("photos").delete().eq("id", photoId);
  if (error) {
    console.error("deletePhoto failed:", error.message);
    return;
  }

  revalidatePath("/admin/fotograflar");
  revalidatePath("/fotograflar");
}
