export const CHAKRAS = [
  { key: "kok", name: "Kök Çakra", hz: 396, color: "#c0504a", desc: "Güven, topraklanma, korkulardan arınma" },
  { key: "sakral", name: "Sakral Çakra", hz: 417, color: "#d9822b", desc: "Yaratıcılık, duygusal akış, değişim" },
  { key: "solar", name: "Solar Pleksus", hz: 528, color: "#d6b429", desc: "Öz güven, irade, dönüşüm" },
  { key: "kalp", name: "Kalp Çakrası", hz: 639, color: "#4f8a5b", desc: "Sevgi, ilişkiler, uyum" },
  { key: "bogaz", name: "Boğaz Çakrası", hz: 741, color: "#3f7fb5", desc: "İfade, dürüstlük, arınma" },
  { key: "ucuncu-goz", name: "Üçüncü Göz", hz: 852, color: "#4a4a9c", desc: "Sezgi, içgörü, farkındalık" },
  { key: "tepe", name: "Tepe Çakrası", hz: 963, color: "#8a5aa8", desc: "Bilinç, bütünlük, ruhsal bağ" },
];

export const COLOR_TO_CHAKRA: Record<string, string> = {
  Kırmızı: "kok",
  Turuncu: "sakral",
  Sarı: "solar",
  Yeşil: "kalp",
  Mavi: "bogaz",
  İndigo: "ucuncu-goz",
  Menekşe: "tepe",
  Gülkurusu: "kalp",
  Altın: "tepe",
};
