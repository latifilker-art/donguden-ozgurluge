/**
 * Geçici tip. Supabase projesi bağlandıktan ve `supabase/migrations` içindeki
 * şema uygulandıktan sonra şununla değiştirilecek:
 *
 *   npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
