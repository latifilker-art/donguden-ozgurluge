"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function joinEvent(eventId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/giris");
  }

  const { error } = await supabase.rpc("join_event", { p_event_id: eventId });

  if (error) {
    console.error("joinEvent failed:", error.message);
    return;
  }

  revalidatePath("/duyurular");
}
