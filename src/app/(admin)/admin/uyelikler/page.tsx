import { AppBar } from "@/components/app-bar";
import { Avatar } from "@/components/avatar";
import { LevelBadge } from "@/components/level-badge";
import { createClient } from "@/lib/supabase/server";
import { asLevel } from "@/lib/level";
import { setMemberLevel } from "./actions";

type Row = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  level_override: string | null;
};

export default async function UyeliklerPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, level_override")
    .eq("role", "member")
    .eq("status", "approved")
    .order("display_name");
  const members = (data ?? []) as Row[];

  const levels = await Promise.all(
    members.map(async (m) => {
      const { data: l } = await supabase.rpc("member_level", { p_member: m.id });
      return asLevel(l);
    }),
  );

  const counts = { baslangic: 0, temel: 0, ileri: 0 };
  levels.forEach((l) => (counts[l] += 1));

  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-3xl px-7 py-8">
        <p className="mb-2 font-mono text-[11px] tracking-wide text-brand uppercase">Admin</p>
        <h1 className="mb-2 font-display text-[27px]">Üye Seviyeleri</h1>
        <p className="mb-6 text-sm text-ink-soft">
          Seviyeler otomatik hesaplanır: <b>Başlangıç</b> (yeni üye), <b>Temel</b> (renk analizi dışında bir
          programa talep/katılım), <b>İleri</b> (Kalbin Rehberliği). Gerekirse elle sabitleyebilirsin.
        </p>

        <div className="mb-6 grid grid-cols-3 gap-3">
          {(["baslangic", "temel", "ileri"] as const).map((k) => (
            <div key={k} className="rounded-2xl border border-line bg-card p-4 text-center shadow-sm">
              <div className="font-display text-[28px]">{counts[k]}</div>
              <LevelBadge level={k} />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-line bg-card shadow-sm">
          {members.map((m, i) => (
            <form
              key={m.id}
              action={setMemberLevel.bind(null, m.id)}
              className="flex flex-wrap items-center gap-3 border-b border-line-soft px-4 py-3 last:border-b-0"
            >
              <Avatar name={m.display_name} avatarUrl={m.avatar_url} size={36} className="text-xs" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{m.display_name}</div>
                <LevelBadge level={levels[i]} />
              </div>
              <select
                name="level"
                defaultValue={m.level_override ?? ""}
                className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs"
              >
                <option value="">Otomatik</option>
                <option value="baslangic">Başlangıç</option>
                <option value="temel">Temel</option>
                <option value="ileri">İleri</option>
              </select>
              <button className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-ink">Kaydet</button>
            </form>
          ))}
          {members.length === 0 && <p className="p-5 text-sm text-ink-faint">Henüz onaylı üye yok.</p>}
        </div>
      </div>
    </>
  );
}
