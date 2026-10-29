export type Technique = {
  name: string;
  pattern: string;
  steps: string[];
  benefit: string;
};

export const TECHNIQUES: Technique[] = [
  { name: "4-7-8 Nefesi", pattern: "4 al · 7 tut · 8 ver", benefit: "Sinir sistemini yatıştırır, uykuya hazırlar", steps: ["4 saniye burnundan nefes al", "7 saniye tut", "8 saniye ağzından yavaşça ver", "4 tur tekrarla"] },
  { name: "Kutu Nefesi", pattern: "4 al · 4 tut · 4 ver · 4 tut", benefit: "Odak ve sakinlik, stres anı için", steps: ["4 saniye nefes al", "4 saniye tut", "4 saniye ver", "4 saniye boş kal, 5 tur"] },
  { name: "Nadi Shodhana (Dönüşümlü Burun Nefesi)", pattern: "Sağ-sol dönüşümlü", benefit: "Zihinsel dengeyi sağlar", steps: ["Sağ burnu kapat, soldan nefes al", "Sol burnu kapat, sağdan ver", "Sağdan al, soldan ver", "10 tur yavaşça sürdür"] },
  { name: "Kalp Uyumu Nefesi", pattern: "5 al · 5 ver", benefit: "Kalp ritmini dengeler, duygusal sakinlik", steps: ["Elini kalbine koy", "5 saniye al, 5 saniye ver", "Kalbine minnet düşün", "3 dakika sürdür"] },
  { name: "Karın (Diyafram) Nefesi", pattern: "Derin karından nefes", benefit: "Gevşeme ve topraklanma", steps: ["Bir elini karnına koy", "Nefes alırken karnın şişsin", "Verirken yavaşça insin", "10 nefes boyunca devam et"] },
  { name: "Uzatılmış Nefes Verme", pattern: "4 al · 6-8 ver", benefit: "Hızlı rahatlama", steps: ["4 saniye burundan al", "6-8 saniye uzun ver", "Omuzlarını bırak", "8 tur tekrarla"] },
  { name: "Enerji Nefesi", pattern: "Kısa güçlü nefesler", benefit: "Sabah canlanma", steps: ["Dik otur", "Burundan 20 kısa nefes al-ver", "Sonra derin bir nefes tut", "Yavaşça bırak"] },
];

const DAY = 86400000;
export function dayIndex(d = new Date()) {
  return Math.floor(d.getTime() / DAY);
}

export function todaysReminders(d = new Date()) {
  const i = dayIndex(d);
  return [
    { when: "Sabah 08:00", tech: TECHNIQUES[i % TECHNIQUES.length] },
    { when: "Öğle 13:00", tech: TECHNIQUES[(i + 3) % TECHNIQUES.length] },
    { when: "Akşam 21:00", tech: TECHNIQUES[(i + 5) % TECHNIQUES.length] },
  ];
}
