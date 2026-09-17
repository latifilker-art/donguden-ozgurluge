import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApprovalNotice } from "@/components/approval-notice";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/giris");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", user.id)
    .single();

  if (profile?.status === "pending" || profile?.status === "rejected") {
    return <ApprovalNotice status={profile.status} />;
  }

  return <>{children}</>;
}
