"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function uploadAvatar(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) return;

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;

  // path zaten Date.now() ile eşsiz — upsert'e gerek yok (ve upsert:true,
  // burada storage RLS'inin UPDATE politikasını da devreye soktuğu için
  // "new row violates row-level security policy" hatası veriyordu).
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    console.error("uploadAvatar failed:", uploadError.message);
    return;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) {
    console.error("uploadAvatar profile update failed:", updateError.message);
    return;
  }

  revalidatePath("/profilim");
}

export async function updateProfile(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const displayName = String(formData.get("displayName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const birthDate = String(formData.get("birthDate") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const emergencyContact = String(formData.get("emergencyContact") ?? "").trim();
  if (!displayName) return;

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      bio: bio || null,
      phone: phone || null,
      birth_date: birthDate || null,
      address: address || null,
      emergency_contact: emergencyContact || null,
    })
    .eq("id", user.id);

  if (error) {
    console.error("updateProfile failed:", error.message);
    return;
  }

  revalidatePath("/profilim");
}
