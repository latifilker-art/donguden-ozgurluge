"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function adminAddProgram(
  instructorId: string,
  formData: FormData,
): Promise<void> {
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const format = String(formData.get("format") ?? "").trim();
  const sessionCountRaw = String(formData.get("sessionCount") ?? "").trim();
  if (!title || !format) return;

  const { error } = await supabase.from("taught_programs").insert({
    instructor_id: instructorId,
    title,
    format,
    session_count: sessionCountRaw ? Number(sessionCountRaw) : null,
  });

  if (error) {
    console.error("adminAddProgram failed:", error.message);
    return;
  }

  revalidatePath(`/admin/egitmenler/${instructorId}`);
  revalidatePath("/egitmenler/[slug]", "page");
}

export async function adminUpdateProgram(
  instructorId: string,
  programId: string,
  formData: FormData,
): Promise<void> {
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const format = String(formData.get("format") ?? "").trim();
  const sessionCountRaw = String(formData.get("sessionCount") ?? "").trim();
  if (!title || !format) return;

  const { error } = await supabase
    .from("taught_programs")
    .update({
      title,
      format,
      session_count: sessionCountRaw ? Number(sessionCountRaw) : null,
    })
    .eq("id", programId);

  if (error) {
    console.error("adminUpdateProgram failed:", error.message);
    return;
  }

  revalidatePath(`/admin/egitmenler/${instructorId}`);
  revalidatePath("/egitmenler/[slug]", "page");
}

export async function adminDeleteProgram(
  instructorId: string,
  programId: string,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("taught_programs")
    .delete()
    .eq("id", programId);

  if (error) {
    console.error("adminDeleteProgram failed:", error.message);
    return;
  }

  revalidatePath(`/admin/egitmenler/${instructorId}`);
  revalidatePath("/egitmenler/[slug]", "page");
}
