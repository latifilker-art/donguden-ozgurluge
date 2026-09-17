"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveMember(memberId: string): Promise<void> {
  const supabase = await createClient();

  const { error: statusError } = await supabase
    .from("profiles")
    .update({ status: "approved" })
    .eq("id", memberId);

  if (statusError) {
    console.error("approveMember status update failed:", statusError.message);
    return;
  }

  // Onaylanan her üyeye varsayılan Temel kademe açılır — admin isterse
  // Üyelikler sayfasından yükseltir.
  const { error: subError } = await supabase.from("subscriptions").upsert(
    { member_id: memberId, plan: "temel", status: "active" },
    { onConflict: "member_id" },
  );

  if (subError) {
    console.error("approveMember subscription upsert failed:", subError.message);
  }

  revalidatePath("/admin/uyeler");
}

export async function rejectMember(memberId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ status: "rejected" })
    .eq("id", memberId);

  if (error) {
    console.error("rejectMember failed:", error.message);
    return;
  }

  revalidatePath("/admin/uyeler");
}
