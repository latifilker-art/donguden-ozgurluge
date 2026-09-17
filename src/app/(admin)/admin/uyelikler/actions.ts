"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setMembershipTier(
  memberId: string,
  formData: FormData,
): Promise<void> {
  const supabase = await createClient();
  const tier = String(formData.get("tier") ?? "temel");

  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 30);

  const { error } = await supabase.from("subscriptions").upsert(
    {
      member_id: memberId,
      plan: tier,
      status: "active",
      current_period_end: tier === "temel" ? null : periodEnd.toISOString(),
    },
    { onConflict: "member_id" },
  );

  if (error) {
    console.error("setMembershipTier failed:", error.message);
    return;
  }

  revalidatePath("/admin/uyelikler");
}
