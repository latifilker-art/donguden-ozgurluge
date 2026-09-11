"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error: string | null;
  message: string | null;
};

export async function signUp(
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });

  if (error) {
    return { error: error.message, message: null };
  }

  // Proje "e-posta onayı" istiyorsa signUp bir oturum döndürmez —
  // bu durumda üyeyi hemen içeri almak yerine onay mesajı gösteriyoruz.
  if (!data.session) {
    return {
      error: null,
      message:
        "E-postana gönderdiğimiz bağlantıyla hesabını onayla, sonra giriş yapabilirsin.",
    };
  }

  redirect("/profilim");
}

export async function signIn(
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message, message: null };
  }

  redirect("/profilim");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
