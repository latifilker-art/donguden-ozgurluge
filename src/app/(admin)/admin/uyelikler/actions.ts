"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function activateMembership(memberId: string): Promise<void> {
  const supabase = await createClient();
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 30);

  const { error } = await supabase.from("subscriptions").upsert(
    {
      member_id: memberId,
      plan: "premium",
      status: "active",
      current_period_end: periodEnd.toISOString(),
    },
    { onConflict: "member_id" },
  );

  if (error) {
    console.error("activateMembership failed:", error.message);
    return;
  }

  revalidatePath("/admin/uyelikler");
}

export async function cancelMembership(memberId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("member_id", memberId);

  if (error) {
    console.error("cancelMembership failed:", error.message);
    return;
  }

  revalidatePath("/admin/uyelikler");
}
