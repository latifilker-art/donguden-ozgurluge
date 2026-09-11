import Link from "next/link";
import { AppBar } from "@/components/app-bar";
import { createClient } from "@/lib/supabase/server";
import { joinEvent } from "./actions";

type EventRow = {
  id: string;
  type: "online" | "camp";
  title: string;
  starts_at: string;
  ends_at: string | null;
  location: string;
  capacity: number;
  description: string | null;
  host: { profile: { display_name: string } | null } | null;
};

function dayMonth(d: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
  }).format(d);
}

function timeOf(d: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatWhen(startIso: string, endIso: string | null, type: string) {
  const start = new Date(startIso);
  if (type === "camp" && endIso) {
    return `${dayMonth(start)} – ${dayMonth(new Date(endIso))}`;
  }
  return `${dayMonth(start)} · ${timeOf(start)}`;
}

function chipClass(active: boolean) {
  return (
    "rounded-full border px-3.5 py-1.5 text-xs font-semibold " +
    (active
      ? "border-brand bg-brand text-brand-ink"
      : "border-line bg-card text-ink-soft hover:border-brand hover:text-brand")
  );
}

export default async function DuyurularPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("events")
    .select(
      "id, type, title, starts_at, ends_at, location, capacity, description, host:instructors(profile:profiles(display_name))",
    )
    .order("starts_at");

  if (t === "online" || t === "camp") {
    query = query.eq("type", t);
  }

  const [{ data }, { data: counts }, { data: mine }] = await Promise.all([
    query,
    supabase.rpc("event_joined_counts"),
    user
      ? supabase
          .from("event_participants")
          .select("event_id, status")
          .eq("member_id", user.id)
      : Promise.resolve({ data: [] as { event_id: string; status: string }[] }),
  ]);

  const events = (data ?? []) as unknown as EventRow[];
  const joinedCountByEvent = new Map<string, number>(
    (counts ?? []).map((c: { event_id: string; joined_count: number }) => [
      c.event_id,
      Number(c.joined_count),
    ]),
  );
  const myStatusByEvent = new Map<string, string>(
    (mine ?? []).map((m: { event_id: string; status: string }) => [
      m.event_id,
      m.status,
    ]),
  );

  return (
    <>
      <AppBar active="/duyurular" />
      <div className="mx-auto max-w-5xl px-7 py-8">
        <div className="mb-6">
          <h1 className="font-display text-[27px]">Duyurular</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Yaklaşan online eğitimler ve fiziki kamplar. Katıl&apos;a
            bastığında katılım talebin iletilir.
          </p>
        </div>

        <div className="mb-6 flex gap-2">
          <Link href="/duyurular" className={chipClass(!t)}>
            Tümü
          </Link>
          <Link href="/duyurular?t=online" className={chipClass(t === "online")}>
            Online Eğitimler
          </Link>
          <Link href="/duyurular?t=camp" className={chipClass(t === "camp")}>
            Fiziki Kamplar
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => {
            const joinedCount = joinedCountByEvent.get(ev.id) ?? 0;
            const spotsLeft = ev.capacity - joinedCount;
            const isFull = spotsLeft <= 0;
            const myStatus = myStatusByEvent.get(ev.id);
            const hostName = ev.host?.profile?.display_name ?? "Sükunet";

            return (
              <div
                key={ev.id}
                className="flex flex-col gap-3 rounded-xl border border-line bg-card p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[10.5px] font-bold text-ink-soft">
                    {ev.type === "online" ? "Online Eğitim" : "Fiziki Kamp"}
                  </span>
                  {isFull && !myStatus && (
                    <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold text-background">
                      Kontenjan Doldu
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-[15px] font-bold">{ev.title}</div>
                  <div className="mt-0.5 text-[11.5px] text-ink-faint">
                    {hostName} ile
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-[12.5px] text-ink-soft">
                  <div>{formatWhen(ev.starts_at, ev.ends_at, ev.type)}</div>
                  <div>{ev.location}</div>
                </div>

                <div className="mt-auto">
                  <div className="mb-1 flex justify-between font-mono text-[11px] text-ink-faint">
                    <span>
                      {joinedCount} / {ev.capacity} katıldı
                    </span>
                    {!isFull && spotsLeft <= 3 && (
                      <span className="font-semibold text-gold">
                        {spotsLeft === 1 ? "son 1 yer!" : `${spotsLeft} yer kaldı`}
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={
                        "h-full rounded-full " +
                        (isFull ? "bg-ink-faint" : "bg-brand")
                      }
                      style={{
                        width: `${Math.min(100, (joinedCount / ev.capacity) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {myStatus ? (
                  <div className="rounded-lg bg-surface-2 py-2.5 text-center text-sm font-semibold text-brand">
                    {myStatus === "waitlisted"
                      ? "Bekleme Listesindesin"
                      : "Katıldın ✓"}
                  </div>
                ) : (
                  <form action={joinEvent.bind(null, ev.id)}>
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-brand-ink"
                    >
                      {isFull ? "Bekleme Listesine Katıl" : "Katıl"}
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>

        {events.length === 0 && (
          <p className="text-sm text-ink-faint">Bu ölçütlere uyan bir etkinlik yok.</p>
        )}
      </div>
    </>
  );
}
