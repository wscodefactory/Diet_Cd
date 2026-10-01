import type { FoodDef, L, PlanItem } from '../types';

export const lx = (ko: string, en: string): L => ({ ko, en });

export function scaleItem(food: FoodDef, factor: number): PlanItem {
  const f = Math.max(0.3, factor);
  return {
    foodId: food.id,
    name: food.name,
    emoji: food.emoji,
    grams: Math.round(food.baseGrams * f),
    kcal: Math.round(food.kcal * f),
    protein: Math.round(food.protein * f),
    carbs: Math.round(food.carbs * f),
    fat: Math.round(food.fat * f),
    costKRW: Math.round(((food.costKRW ?? 0) * f) / 100) * 100,
  };
}

/** Split free text like "브로콜리, 오이 / cucumber" into lowercase keywords. */
export function keywords(text: string): string[] {
  return text
    .split(/[,/\n·、]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
}

export function matchesAny(food: FoodDef, words: string[]): boolean {
  if (words.length === 0) return false;
  const hay = [food.name.ko, food.name.en, ...food.ingredients.flatMap((g) => [g.ko, g.en])]
    .join(' ')
    .toLowerCase();
  return words.some((w) => hay.includes(w));
}

/** Stable pick that rotates through candidates by day index. */
export function rotatePick<T>(sorted: T[], day: number, offset = 0): T | undefined {
  if (sorted.length === 0) return undefined;
  // Only rotate among the better half so variety doesn't sacrifice fit.
  const pool = sorted.slice(0, Math.max(1, Math.ceil(sorted.length * 0.6)));
  return pool[(day + offset) % pool.length];
}

export function sumItems(items: PlanItem[]) {
  return items.reduce(
    (a, it) => ({
      kcal: a.kcal + it.kcal,
      protein: a.protein + it.protein,
      carbs: a.carbs + it.carbs,
      fat: a.fat + it.fat,
      costKRW: a.costKRW + it.costKRW,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0, costKRW: 0 },
  );
}
