import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";
import { activateMembership, cancelMembership } from "./actions";

type MemberRow = {
  id: string;
  display_name: string;
  subscriptions: {
    plan: string;
    status: "active" | "past_due" | "cancelled";
    current_period_end: string | null;
  } | null;
};

const STATUS_LABEL: Record<string, { label: string; pill: string }> = {
  active: { label: "Aktif", pill: "bg-brand-soft text-brand" },
  past_due: { label: "Gecikmiş", pill: "bg-gold-soft text-gold" },
  cancelled: { label: "İptal", pill: "bg-surface-2 text-ink-faint" },
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
          alındıktan sonra üyeliği burada elle aktif edersin.
        </p>

        <div className="rounded-xl border border-line bg-card shadow-sm">
          {members.map((m) => {
            const sub = m.subscriptions;
            const meta = sub ? STATUS_LABEL[sub.status] : null;
            const isActive = sub?.status === "active";

            return (
              <div
                key={m.id}
                className="flex items-center justify-between gap-4 border-b border-line-soft px-5 py-4 last:border-b-0"
              >
                <div>
                  <div className="text-sm font-bold">{m.display_name}</div>
                  <div className="mt-0.5 text-xs text-ink-faint">
                    {sub?.current_period_end
                      ? `${formatDate(sub.current_period_end)}'e kadar`
                      : "Üyelik yok"}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {meta && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.pill}`}
                    >
                      {meta.label}
                    </span>
                  )}
                  {isActive ? (
                    <form action={cancelMembership.bind(null, m.id)}>
                      <button
                        type="submit"
                        className="rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-ink-soft hover:border-neg hover:text-neg"
                      >
                        İptal Et
                      </button>
                    </form>
                  ) : (
                    <form action={activateMembership.bind(null, m.id)}>
                      <button
                        type="submit"
                        className="rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-brand-ink"
                      >
                        Premium Yap (30 gün)
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
          {members.length === 0 && (
            <p className="p-5 text-sm text-ink-faint">Henüz üye yok.</p>
          )}
        </div>
      </div>
    </>
  );
}
