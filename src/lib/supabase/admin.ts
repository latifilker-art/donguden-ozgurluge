import { createClient } from "@supabase/supabase-js";

// Sadece sunucu tarafında, kullanıcı oturumundan bağımsız statik/paylaşılan
// verilere (ör. renk analizi kaynak metinleri) erişmek için. RLS'i atlar —
// asla istemciye veya kullanıcıya özel sorgularda kullanma.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
