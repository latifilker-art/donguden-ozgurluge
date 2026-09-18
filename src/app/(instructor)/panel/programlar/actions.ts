"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addProgram(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const title = String(formData.get("title") ?? "").trim();
  const format = String(formData.get("format") ?? "").trim();
  const sessionCountRaw = String(formData.get("sessionCount") ?? "").trim();
  if (!title || !format) return;

  const { error } = await supabase.from("taught_programs").insert({
    instructor_id: user.id,
    title,
    format,
    session_count: sessionCountRaw ? Number(sessionCountRaw) : null,
  });

  if (error) {
    console.error("addProgram failed:", error.message);
    return;
  }

  revalidatePath("/panel/programlar");
  revalidatePath("/egitmenler/[slug]", "page");
}

export async function updateProgram(
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
    console.error("updateProgram failed:", error.message);
    return;
  }

  revalidatePath("/panel/programlar");
  revalidatePath("/egitmenler/[slug]", "page");
}

export async function deleteProgram(programId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("taught_programs")
    .delete()
    .eq("id", programId);

  if (error) {
    console.error("deleteProgram failed:", error.message);
    return;
  }

  revalidatePath("/panel/programlar");
  revalidatePath("/egitmenler/[slug]", "page");
}
