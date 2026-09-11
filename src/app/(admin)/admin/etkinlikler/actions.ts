"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createEvent(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const type = String(formData.get("type") ?? "online");
  const title = String(formData.get("title") ?? "").trim();
  const hostInstructorId = String(formData.get("hostInstructorId") ?? "") || null;
  const startsAt = String(formData.get("startsAt") ?? "");
  const endsAt = String(formData.get("endsAt") ?? "") || null;
  const location = String(formData.get("location") ?? "").trim();
  const capacity = Number(formData.get("capacity") ?? 0);
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!title || !startsAt || !location || !capacity) {
    return;
  }

  const { error } = await supabase.from("events").insert({
    type,
    title,
    host_instructor_id: hostInstructorId,
    starts_at: new Date(startsAt).toISOString(),
    ends_at: endsAt ? new Date(endsAt).toISOString() : null,
    location,
    capacity,
    description,
    created_by: user.id,
  });

  if (error) {
    console.error("createEvent failed:", error.message);
    return;
  }

  revalidatePath("/admin/etkinlikler");
  revalidatePath("/duyurular");
}
