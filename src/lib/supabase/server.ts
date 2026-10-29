import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";

/**
 * Server-side Supabase client. `cache` sayesinde aynı istek içinde (layout +
 * sayfa + AppBar) tek bir istemci paylaşılır ve auth.getUser çağrısı yerelde
 * doğrulanan JWT claim'lerinden (getClaims, ağ isteği yok) tek sefer yapılır.
 */
export const createClient = cache(async () => {
  const cookieStore = await cookies();

  const client = createServerClient<Database>(
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
            // proxy oturumu zaten tazelediği için görmezden gelinebilir.
          }
        },
      },
    },
  );

  const originalGetUser = client.auth.getUser.bind(client.auth);
  let pending: ReturnType<typeof originalGetUser> | undefined;
  client.auth.getUser = ((...args: Parameters<typeof originalGetUser>) => {
    if (args.length > 0) return originalGetUser(...args); // açık JWT verilmişse dokunma
    pending ??= (async () => {
      try {
        const { data } = await client.auth.getClaims();
        if (data?.claims?.sub) {
          return {
            data: {
              user: {
                id: data.claims.sub,
                email: (data.claims as { email?: string }).email,
              },
            },
            error: null,
          };
        }
      } catch {
        // claims doğrulanamazsa gerçek getUser'a düş
      }
      return originalGetUser();
    })() as ReturnType<typeof originalGetUser>;
    return pending;
  }) as typeof client.auth.getUser;

  return client;
});
