"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateInstructorProfile(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const tagline = String(formData.get("tagline") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const specialties = String(formData.get("specialties") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const yearsExperienceRaw = String(formData.get("yearsExperience") ?? "").trim();
  const yearsExperience = yearsExperienceRaw ? Number(yearsExperienceRaw) : null;
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim() || null;

  const { error } = await supabase
    .from("instructors")
    .update({
      tagline: tagline || null,
      bio: bio || null,
      specialties,
      years_experience:
        yearsExperience !== null && Number.isFinite(yearsExperience)
          ? yearsExperience
          : null,
      website_url: websiteUrl,
    })
    .eq("id", user.id);

  if (error) {
    console.error("updateInstructorProfile failed:", error.message);
    return;
  }

  revalidatePath("/panel/profil");
  revalidatePath("/egitmenler");
  revalidatePath("/egitmenler/[slug]", "page");
}
