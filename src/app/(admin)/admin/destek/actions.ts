"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function logMemberAccess(
  memberId: string,
  formData: FormData,
): Promise<void> {
  const supabase = await createClient();
  const reason = String(formData.get("reason") ?? "").trim();
  const scope = String(formData.get("scope") ?? "").trim();

  if (!reason || !scope) {
    return;
  }

  const { error } = await supabase.rpc("log_admin_access", {
    p_member_id: memberId,
    p_reason: reason,
    p_scope: scope,
  });

  if (error) {
    console.error("logMemberAccess failed:", error.message);
    return;
  }

  redirect(`/admin/destek/${memberId}?viewed=1`);
}
