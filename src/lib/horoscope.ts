type Sign = { name: string; symbol: string; element: string; trait: string };

const SIGNS: Sign[] = [
  { name: "Oğlak", symbol: "♑", element: "Toprak", trait: "disiplinin ve sabrın bugün seni bir adım öne taşıyor" },
  { name: "Kova", symbol: "♒", element: "Hava", trait: "özgün fikirlerin çevrendekilere ilham verebilir" },
  { name: "Balık", symbol: "♓", element: "Su", trait: "sezgilerin bugün her zamankinden daha net konuşuyor" },
  { name: "Koç", symbol: "♈", element: "Ateş", trait: "girişkenliğin kapıları açmaya hazır" },
  { name: "Boğa", symbol: "♉", element: "Toprak", trait: "istikrarın ve sakinliğin sana güç veriyor" },
  { name: "İkizler", symbol: "♊", element: "Hava", trait: "merakın ve iletişim becerin öne çıkıyor" },
  { name: "Yengeç", symbol: "♋", element: "Su", trait: "şefkatin ve koruyuculuğun bugün değerli" },
  { name: "Aslan", symbol: "♌", element: "Ateş", trait: "ışığın ve cömertliğin etrafını ısıtıyor" },
  { name: "Başak", symbol: "♍", element: "Toprak", trait: "detaylara verdiğin özen karşılığını buluyor" },
  { name: "Terazi", symbol: "♎", element: "Hava", trait: "denge ve uyum arayışın bugün kolaylaşıyor" },
  { name: "Akrep", symbol: "♏", element: "Su", trait: "derinliğin ve kararlılığın dönüştürücü" },
  { name: "Yay", symbol: "♐", element: "Ateş", trait: "iyimserliğin ufkunu genişletiyor" },
];
const CUTOFF = [20, 19, 20, 20, 21, 21, 22, 22, 22, 23, 22, 22]; // ay başı → bir sonraki burç geçişi

export function getSign(birthDate: string): Sign {
  const d = new Date(birthDate);
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  const idx = day < CUTOFF[m] ? m : (m + 1) % 12;
  return SIGNS[idx];
}

function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}
const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)];

const OPEN = [
  "Bugün gökyüzü yavaşlamayı ve içine dönmeyi fısıldıyor.",
  "Enerji akışı bugün hareketli; küçük adımlar büyük fark yaratır.",
  "Ay'ın etkisiyle duygular yüzeye çıkabilir, onları yargılamadan izle.",
  "Zihnin berrak, kalbin açık bir gün seni bekliyor.",
  "Bugün ertelediğin bir konuyu çözmek için uygun bir pencere açık.",
  "Çevrendekilerle kuracağın içten bir bağ gününe renk katacak.",
  "Sabırlı davrandığında bugün sürprizler seni bulabilir.",
  "Yaratıcılığın yüksek; bir fikre şans vermenin tam zamanı.",
];
const FOCUS = [
  "İş ve üretkenlik tarafında odaklanman ödüllendirilecek.",
  "İlişkilerde dinlemek, konuşmaktan daha çok kazandıracak.",
  "Bedenine kulak ver; kısa bir mola enerjini toparlayacak.",
  "Maddi konularda acele etme, bir gün daha düşün.",
  "Kendine ayıracağın sessiz bir an iç huzurunu güçlendirecek.",
  "Sosyal çevrenden gelen bir davet ya da mesaj seni sevindirebilir.",
];
const ADVICE = [
  "Akşam için 5 dakikalık bir nefes çalışması planla.",
  "Bugün minnettar olduğun üç şeyi yaz.",
  "Telefonu bir saat kenara bırakıp bir yürüyüşe çık.",
  "Bir yakınına içten bir teşekkür et.",
  "Su içmeyi ve dinlenmeyi ihmal etme.",
  "Yarın için tek bir net niyet belirle.",
];
const MOODS = ["Dingin", "Cesur", "Meraklı", "Şefkatli", "Odaklı", "Neşeli", "Sezgisel", "Sakin"];
const COLORS = ["Yeşil", "Mavi", "Altın", "Menekşe", "Turuncu", "Gülkurusu", "İndigo", "Sarı"];

export function dailyHoroscope(birthDate: string, today = new Date()) {
  const sign = getSign(birthDate);
  const key = `${sign.name}-${today.toISOString().slice(0, 10)}`;
  const r = rng(key);
  return {
    sign,
    text: `${pick(r, OPEN)} Seni özel kılan yön: ${sign.trait}. ${pick(r, FOCUS)}`,
    advice: pick(r, ADVICE),
    mood: pick(r, MOODS),
    luckyColor: pick(r, COLORS),
    luckyNumber: 1 + Math.floor(r() * 9),
  };
}
