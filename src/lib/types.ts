// Supabase proje şeması `supabase gen types` ile üretilene kadar elle
// tutulan domain tipleri (bkz. src/lib/supabase/types.ts).

export type RhythmItem =
  | "morning_affirmation"
  | "breath"
  | "noon_affirmation"
  | "evening_questions";

export type RhythmEntry = {
  id: string;
  member_id: string;
  entry_date: string;
  item: RhythmItem;
  unlock_at: string | null;
  completed_at: string | null;
};

export type WorkStatus = "not_started" | "in_progress" | "completed";

export type ExternalWork = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  member_work_progress: { status: WorkStatus; result_file_path: string | null }[];
};

export type AccessLogEntry = {
  id: string;
  reason: string;
  scope: string;
  accessed_at: string;
  admin_id: string;
};
