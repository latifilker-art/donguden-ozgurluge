export const COLOR_NAMES = [
  "Kırmızı",
  "Turuncu",
  "Sarı",
  "Yeşil",
  "Mavi",
  "İndigo",
  "Menekşe",
  "Gülkurusu",
  "Altın",
] as const;

export type ColorName = (typeof COLOR_NAMES)[number];

function colorForDigit(digit: number): ColorName {
  return COLOR_NAMES[digit - 1];
}

const LETTER_VALUES: Record<string, number> = {
  A: 1, H: 1, Ö: 1, Y: 1,
  B: 2, I: 2, P: 2, Z: 2,
  C: 3, İ: 3, R: 3,
  Ç: 4, J: 4, S: 4,
  D: 5, K: 5, Ş: 5,
  E: 6, L: 6, T: 6,
  F: 7, M: 7, U: 7,
  G: 8, N: 8, Ü: 8,
  Ğ: 9, O: 9, V: 9,
};

const VOWELS = new Set(["A", "E", "I", "İ", "O", "Ö", "U", "Ü"]);

function reduceToSingleDigit(n: number): number {
  let v = n;
  while (v > 9) {
    v = String(v)
      .split("")
      .reduce((sum, d) => sum + Number(d), 0);
  }
  return v;
}

function normalizeName(fullName: string): string[] {
  return fullName
    .toLocaleUpperCase("tr-TR")
    .split("")
    .filter((ch) => ch in LETTER_VALUES);
}

export type LetterEntry = { letter: string; value: number; color: ColorName };

export type ColorAnalysisComputation = {
  fullName: string;
  birthDate: string;
  lifePath: { digitSum: number; reducedDigit: number; color: ColorName };
  barcode: LetterEntry[];
  rawNameTotal: number;
  colorCounts: Record<ColorName, number>;
  missingColors: ColorName[];
  dominantColors: { color: ColorName; count: number }[];
  potential: { rawTotal: number; reducedDigit: number; color: ColorName };
  innerSelf: { rawTotal: number; reducedDigit: number; color: ColorName };
  mask: { rawTotal: number; reducedDigit: number; color: ColorName };
};

export function computeLifePathColor(birthDate: Date) {
  const dd = String(birthDate.getDate()).padStart(2, "0");
  const mm = String(birthDate.getMonth() + 1).padStart(2, "0");
  const yyyy = String(birthDate.getFullYear()).padStart(4, "0");
  const digits = `${dd}${mm}${yyyy}`.split("").map(Number);
  const digitSum = digits.reduce((a, b) => a + b, 0);
  const reducedDigit = reduceToSingleDigit(digitSum);
  return { digitSum, reducedDigit, color: colorForDigit(reducedDigit) };
}

export function computeColorAnalysis(
  fullName: string,
  birthDate: Date,
): ColorAnalysisComputation {
  const letters = normalizeName(fullName);

  const barcode: LetterEntry[] = letters.map((letter) => {
    const value = LETTER_VALUES[letter];
    return { letter, value, color: colorForDigit(value) };
  });

  const colorCounts = Object.fromEntries(
    COLOR_NAMES.map((c) => [c, 0]),
  ) as Record<ColorName, number>;
  for (const entry of barcode) colorCounts[entry.color] += 1;

  const missingColors = COLOR_NAMES.filter((c) => colorCounts[c] === 0);
  const dominantColors = COLOR_NAMES.map((color) => ({
    color,
    count: colorCounts[color],
  }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const consonantTotal = barcode
    .filter((e) => !VOWELS.has(e.letter))
    .reduce((sum, e) => sum + e.value, 0);
  const vowelTotal = barcode
    .filter((e) => VOWELS.has(e.letter))
    .reduce((sum, e) => sum + e.value, 0);

  const potentialReduced = reduceToSingleDigit(consonantTotal);
  const innerSelfReduced = reduceToSingleDigit(vowelTotal);
  const maskRawTotal = consonantTotal + vowelTotal;
  const maskReduced = reduceToSingleDigit(maskRawTotal);

  return {
    fullName,
    birthDate: birthDate.toISOString().slice(0, 10),
    lifePath: computeLifePathColor(birthDate),
    barcode,
    rawNameTotal: consonantTotal + vowelTotal,
    colorCounts,
    missingColors,
    dominantColors,
    potential: {
      rawTotal: consonantTotal,
      reducedDigit: potentialReduced,
      color: colorForDigit(potentialReduced),
    },
    innerSelf: {
      rawTotal: vowelTotal,
      reducedDigit: innerSelfReduced,
      color: colorForDigit(innerSelfReduced),
    },
    mask: {
      rawTotal: maskRawTotal,
      reducedDigit: maskReduced,
      color: colorForDigit(maskReduced),
    },
  };
}
