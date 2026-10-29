import type { ColorAnalysisComputation, ColorName } from "./numerology";

type ColorContent = {
  hex: string;
  theme: string;
  affirmation: string;
  todos: string[];
};

export const COLOR_CONTENT: Record<ColorName, ColorContent> = {
  Kırmızı: {
    hex: "#c0504a",
    theme: "Eylem, beden, cesaret",
    affirmation: "Bedenimdeyim, güçlüyüm ve harekete geçmeye hazırım.",
    todos: ["10 dakika tempolu yürüyüş yap", "Bugün ertelediğin tek bir işi başlat", "Ayaklarını yere basarak 3 derin nefes al"],
  },
  Turuncu: {
    hex: "#d9822b",
    theme: "Duygu, bağ, keyif",
    affirmation: "Hissetmeye izin veriyorum, bağ kurmak bana iyi geliyor.",
    todos: ["Sevdiğin birini ara ya da ona yaz", "Kendine küçük bir keyif ayır", "Bugün hissettiğin duyguyu bir cümleyle yaz"],
  },
  Sarı: {
    hex: "#d6b429",
    theme: "Sadelik, öncelik, düzen",
    affirmation: "Karmaşık olanı sadeleştirebilirim, önceliğimi biliyorum.",
    todos: ["Bugünün 3 önceliğini yaz", "Bir konuyu üç cümleyle özetle", "Yapılacaklar listendeki bir maddeyi sil"],
  },
  Yeşil: {
    hex: "#4f8a5b",
    theme: "Denge, doğa, kalp",
    affirmation: "Merkezime dönüyorum; dengede ve huzurdayım.",
    todos: ["10 dakika doğada ya da pencere önünde vakit geçir", "Yemeğini telefonsuz ye", "Kalbine el koyup 5 yavaş nefes al"],
  },
  Mavi: {
    hex: "#3f7fb5",
    theme: "İfade, dürüstlük, iletişim",
    affirmation: "İçimden geçeni açık ve sade bir şekilde ifade ediyorum.",
    todos: ["Söylemek isteyip ertelediğin bir şeyi söyle", "Bugünü 5 cümleyle günlüğüne yaz", "Bir kişiyi sözünü kesmeden dinle"],
  },
  İndigo: {
    hex: "#4a4a9c",
    theme: "Sezgi, derinlik, farkındalık",
    affirmation: "Sezgime güveniyorum, derinliğimi hayatı kolaylaştırmak için kullanıyorum.",
    todos: ["5 dakika sessizce otur ve zihnini izle", "Bugün aklına gelen ilk sezgiyi not et", "Her şeyi çözmek zorunda olmadığını hatırla"],
  },
  Menekşe: {
    hex: "#8a5aa8",
    theme: "Özgünlük, yaratıcılık, vizyon",
    affirmation: "Farklı olmam bir kusur değil, benim katkım.",
    todos: ["Yaratıcı bir şey yap: çiz, yaz ya da çal", "Bugün kendine özgü bir fikri not et", "Alışılmışın dışında bir yol dene"],
  },
  Gülkurusu: {
    hex: "#c98a96",
    theme: "Şefkat, destek, sınır",
    affirmation: "Şefkatliyim ve sınırlarımı sevgiyle koruyorum.",
    todos: ["Kendine nazik bir cümle söyle", "Bugün bir kez 'hayır' de", "Birine içten bir teşekkür et"],
  },
  Altın: {
    hex: "#b8903a",
    theme: "Bilgelik, değer, tamamlanma",
    affirmation: "Yaşadıklarım beni bilgeleştiriyor, değerimi görüyorum.",
    todos: ["Bugün öğrendiğin bir şeyi yaz", "Bir başarını kendine hatırlat", "Minnettar olduğun 3 şeyi say"],
  },
};

export type DailyPlan = {
  affirmations: { label: string; color: ColorName; text: string }[];
  todos: { color: ColorName; text: string }[];
  focusColor: ColorName;
};

export function buildDailyPlan(c: ColorAnalysisComputation): DailyPlan {
  const focusColor = (c.missingColors[0] ?? c.mask.color) as ColorName;
  const affirmations = [
    { label: "Sabah — Yaşam Yolun", color: c.lifePath.color, text: COLOR_CONTENT[c.lifePath.color].affirmation },
    { label: "Öğlen — İç Benliğin", color: c.innerSelf.color, text: COLOR_CONTENT[c.innerSelf.color].affirmation },
    { label: "Akşam — Çalışma Rengin", color: focusColor, text: COLOR_CONTENT[focusColor].affirmation },
  ];
  const todos = [
    { color: focusColor, text: COLOR_CONTENT[focusColor].todos[0] },
    { color: focusColor, text: COLOR_CONTENT[focusColor].todos[1] },
    { color: c.lifePath.color, text: COLOR_CONTENT[c.lifePath.color].todos[2] },
    { color: c.potential.color, text: COLOR_CONTENT[c.potential.color].todos[0] },
  ];
  return { affirmations, todos, focusColor };
}
