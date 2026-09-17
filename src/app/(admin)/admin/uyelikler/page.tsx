import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";
import { setMembershipTier } from "./actions";

type MemberRow = {
  id: string;
  display_name: string;
  subscriptions: {
    plan: "temel" | "premium" | "vip";
    status: "active" | "past_due" | "cancelled";
    current_period_end: string | null;
  } | null;
};

const TIER_PILL: Record<string, string> = {
  temel: "bg-surface-2 text-ink-soft",
  premium: "bg-brand-soft text-brand",
  vip: "bg-gold-soft text-gold",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function UyeliklerPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, subscriptions(plan, status, current_period_end)")
    .eq("role", "member")
    .eq("status", "approved")
    .order("display_name");

  const members = (data ?? []) as unknown as MemberRow[];

  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-2xl px-7 py-8">
        <p className="mb-5 text-xs text-ink-faint">
          Admin / <span className="font-medium text-ink-soft">Üyelikler</span>
        </p>
        <h1 className="mb-2 font-display text-[25px]">Üyelik Yönetimi</h1>
        <p className="mb-6 text-sm text-ink-soft">
          Online ödeme entegrasyonu yok — ödeme elden/havale gibi kanallardan
          alındıktan sonra kademeyi burada elle değiştirirsin.
        </p>

        <div className="rounded-xl border border-line bg-card shadow-sm">
          {members.map((m) => {
            const tier = m.subscriptions?.plan ?? "temel";
            const pill = TIER_PILL[tier] ?? TIER_PILL.temel;
            return (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-4 last:border-b-0"
              >
                <div>
                  <div className="text-sm font-bold">{m.display_name}</div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${pill}`}
                    >
                      {tier === "temel" ? "Temel" : tier === "premium" ? "Premium" : "VIP"}
                    </span>
                    {m.subscriptions?.current_period_end && (
                      <span className="text-xs text-ink-faint">
                        {formatDate(m.subscriptions.current_period_end)}&apos;e
                        kadar
                      </span>
                    )}
                  </div>
                </div>
                <form
                  action={setMembershipTier.bind(null, m.id)}
                  className="flex shrink-0 items-center gap-2"
                >
                  <select
                    name="tier"
                    defaultValue={tier}
                    className="rounded-lg border border-line bg-card px-2.5 py-2 text-xs"
                  >
                    <option value="temel">Temel</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-brand-ink"
                  >
                    Kaydet
                  </button>
                </form>
              </div>
            );
          })}
          {members.length === 0 && (
            <p className="p-5 text-sm text-ink-faint">Henüz onaylı üye yok.</p>
          )}
        </div>
      </div>
    </>
  );
}
