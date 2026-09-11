import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";

/**
 * Server-side Supabase client (Server Components, Server Actions, Route
 * Handlers). Faz 1'de Supabase projesi bağlanana kadar bu dosya
 * çağrılmamalı — env değişkenleri henüz yok.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component'ten çağrıldığında cookie yazılamaz —
            // middleware oturumu zaten tazelediği için görmezden gelinebilir.
          }
        },
      },
    },
  );
}
