export type Level = "baslangic" | "temel" | "ileri";

export const LEVELS: Record<Level, { label: string; color: string; bg: string; hint: string }> = {
  baslangic: {
    label: "Başlangıç",
    color: "#3f7fb5",
    bg: "#e3eef8",
    hint: "Frekans dinleyebilir, fotoğrafları görebilir, renk analizi talep edebilirsin. Programlardan talepte bulununca Temel seviyeye geçersin.",
  },
  temel: {
    label: "Temel",
    color: "#4f8a5b",
    bg: "#e2f0e5",
    hint: "Renk analizi dışında bir programa katıldın. Kalbin Rehberliği çalışmasını alınca İleri seviyeye geçersin.",
  },
  ileri: {
    label: "İleri",
    color: "#b8903a",
    bg: "#f6ecd2",
    hint: "Kalbin Rehberliği sahibisin. Fotoğraflar sayfasına kendi görsellerini ekleyebilirsin.",
  },
};

export function asLevel(v: unknown): Level {
  return v === "temel" || v === "ileri" ? v : "baslangic";
}
