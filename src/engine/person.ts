// Rule-based stand-in for the AI recommender. The real service would call an
// LLM with retrieved papers (paid, see docs/paid-items.md); this keeps the
// same Plan shape so the UI can be swapped over later.

import { PERSON_FOODS } from '../data/personFoods';
import { ACTIVITIES, GOALS, PERSON_ALLERGENS, SLOT_LABELS, WEEKDAYS } from '../i18n';
import type { DayPlan, FoodDef, L, Meal, PersonInput, Plan, Reason } from '../types';
import { keywords, lx, matchesAny, rotatePick, scaleItem, sumItems } from './common';

const ACTIVITY_FACTOR = { low: 1.375, mid: 1.55, high: 1.725 } as const;
const PROTEIN_PER_KG = { lose: 1.6, maintain: 1.2, gain: 1.8, health: 1.2 } as const;

export function personTargets(input: PersonInput) {
  const { sex, age, heightCm, weightKg, goal, activity } = input;
  // Mifflin-St Jeor style estimate (see source card 'p-energy', marked as example).
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);
  let kcal = bmr * ACTIVITY_FACTOR[activity];
  if (goal === 'lose') kcal -= 400;
  if (goal === 'gain') kcal += 300;
  kcal = Math.max(sex === 'male' ? 1500 : 1200, Math.round(kcal / 10) * 10);
  const protein = Math.round(weightKg * PROTEIN_PER_KG[goal]);
  return { bmr: Math.round(bmr), kcal, protein };
}

const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
type Slot = (typeof MEAL_SLOTS)[number];

function allowed(input: PersonInput, food: FoodDef): boolean {
  if (food.allergens.some((a) => (input.allergies as string[]).includes(a))) return false;
  if (matchesAny(food, keywords(input.dislikes))) return false;
  return true;
}

function score(input: PersonInput, food: FoodDef, slot: Slot): number {
  let s = 0;
  const likes = keywords(input.likes);
  if (matchesAny(food, likes)) s += 5;
  if (input.goal === 'lose' && food.tags.includes('lowCal')) s += 2;
  if ((input.goal === 'lose' || input.goal === 'gain') && food.tags.includes('highProtein')) s += 2;
  if (input.goal === 'gain' && food.tags.includes('gain')) s += 2;
  if (input.goal === 'health' && (food.tags.includes('fiber') || food.tags.includes('omega3'))) s += 2;
  if (food.tags.includes('fiber')) s += 1;
  if (slot === 'lunch' && input.lunchbox && food.tags.includes('lunchboxFriendly')) s += 3;
  // Cheaper wins ties when the budget is tight.
  if (input.budgetKRW < 15000) s -= (food.costKRW ?? 0) / 4000;
  return s;
}

export function personCandidates(input: PersonInput, slot: string, role: 'main' | 'side'): FoodDef[] {
  return PERSON_FOODS.filter((f) => f.slots.includes(slot) && f.role === role && allowed(input, f)).sort(
    (a, b) => score(input, b, slot as Slot) - score(input, a, slot as Slot),
  );
}

function dayLabels(input: PersonInput): L[] {
  if (input.periodMode === 'weekdays') {
    const order = Object.keys(WEEKDAYS) as (keyof typeof WEEKDAYS)[];
    const picked = order.filter((d) => input.weekdays.includes(d));
    return (picked.length ? picked : ['mon']).map((d) => WEEKDAYS[d as keyof typeof WEEKDAYS]);
  }
  const n = Math.min(14, Math.max(1, Math.round(input.days || 1)));
  return Array.from({ length: n }, (_, k) => lx(`${k + 1}일차`, `Day ${k + 1}`));
}

/** Scale a day's picks so total kcal lands near the target. */
export function composePersonDay(input: PersonInput, label: L, picks: { slot: string; foods: FoodDef[] }[]): DayPlan {
  const { kcal: target } = personTargets(input);
  const base = picks.flatMap((p) => p.foods).reduce((a, f) => a + f.kcal, 0) || 1;
  const factor = Math.min(1.45, Math.max(0.7, target / base));
  const meals: Meal[] = picks.map((p) => ({
    slot: p.slot,
    label: SLOT_LABELS[p.slot],
    lunchbox: p.slot === 'lunch' && input.lunchbox,
    // Sides keep their natural size; mains absorb the calorie adjustment.
    items: p.foods.map((f) => scaleItem(f, f.role === 'main' ? factor : 1)),
  }));
  return { label, meals };
}

function fitBudget(input: PersonInput, picks: { slot: string; foods: FoodDef[] }[]) {
  const cost = () => picks.flatMap((p) => p.foods).reduce((a, f) => a + (f.costKRW ?? 0), 0);
  for (let guard = 0; guard < 8 && cost() > input.budgetKRW; guard++) {
    // Replace the priciest item with the cheapest allowed alternative in its slot.
    let worst: { pi: number; fi: number; food: FoodDef } | null = null;
    picks.forEach((p, pi) =>
      p.foods.forEach((food, fi) => {
        if (!worst || (food.costKRW ?? 0) > (worst.food.costKRW ?? 0)) worst = { pi, fi, food };
      }),
    );
    if (!worst) break;
    const w: { pi: number; fi: number; food: FoodDef } = worst;
    const cheaper = personCandidates(input, picks[w.pi].slot, w.food.role)
      .filter((f) => (f.costKRW ?? 0) < (w.food.costKRW ?? 0))
      .sort((a, b) => (a.costKRW ?? 0) - (b.costKRW ?? 0))[0];
    if (!cheaper) break;
    picks[w.pi].foods[w.fi] = cheaper;
  }
}

export function buildPersonPlan(input: PersonInput): Plan {
  const targets = personTargets(input);
  const labels = dayLabels(input);

  const days = labels.map((label, d) => {
    const picks: { slot: string; foods: FoodDef[] }[] = [];
    const used = () => picks.flatMap((p) => p.foods.map((f) => f.id));
    for (const slot of MEAL_SLOTS) {
      const foods: FoodDef[] = [];
      if (slot !== 'snack') {
        const main = rotatePick(personCandidates(input, slot, 'main'), d, slot === 'dinner' ? 2 : 0);
        if (main) foods.push(main);
      }
      const side = rotatePick(
        personCandidates(input, slot, 'side').filter((f) => !foods.some((m) => m.id === f.id) && !used().includes(f.id)),
        d,
        slot.length,
      );
      if (side) foods.push(side);
      if (foods.length) picks.push({ slot, foods });
    }
    fitBudget(input, picks);
    return composePersonDay(input, label, picks);
  });

  // ----- explanation -----
  const reasons: Reason[] = [
    {
      text: lx(
        `하루 ${targets.kcal.toLocaleString()}kcal를 목표로 했어요. 신체 정보로 추정한 기초대사량(약 ${targets.bmr}kcal)에 활동량과 '${GOALS[input.goal].ko}' 목표를 반영했어요.`,
        `We aimed for ${targets.kcal.toLocaleString()} kcal a day: an estimated resting energy of about ${targets.bmr} kcal, adjusted for your activity and the "${GOALS[input.goal].en}" goal.`,
      ),
      sourceIds: ['p-energy'],
    },
    {
      text: lx(
        `단백질은 하루 약 ${targets.protein}g을 목표로 단백질이 많은 메뉴를 우선 골랐어요.`,
        `Protein target is about ${targets.protein} g a day, so high-protein menus came first.`,
      ),
      sourceIds: ['p-protein'],
    },
    {
      text: lx('포만감을 위해 통곡물과 채소 반찬을 자주 넣었어요.', 'Whole grains and vegetable sides are included often to help you feel full.'),
      sourceIds: ['p-fiber'],
    },
  ];
  if (input.allergies.length) {
    reasons.push({
      text: lx('입력한 알레르기 성분이 들어간 메뉴는 모두 뺐어요.', 'Every menu with your listed allergens was removed.'),
      sourceIds: ['p-allergy'],
    });
  }
  if (input.lunchbox) {
    reasons.push({
      text: lx('점심 도시락은 들고 다니기 좋고 쉽게 상하지 않는 메뉴로 골랐어요.', 'Lunchbox menus were chosen to travel and keep well.'),
      sourceIds: ['p-lunchbox'],
    });
  }

  const conditions: L[] = [
    lx(`${input.sex === 'male' ? '남성' : '여성'} · ${input.age}세 · ${input.heightCm}cm · ${input.weightKg}kg`, `${input.sex === 'male' ? 'Male' : 'Female'} · ${input.age} y · ${input.heightCm} cm · ${input.weightKg} kg`),
    lx(`목표: ${GOALS[input.goal].ko}`, `Goal: ${GOALS[input.goal].en}`),
    lx(`활동량: ${ACTIVITIES[input.activity].ko}`, `Activity: ${ACTIVITIES[input.activity].en}`),
    lx(`하루 예산 ${input.budgetKRW.toLocaleString()}원`, `Budget ₩${input.budgetKRW.toLocaleString()}/day`),
    lx(`${labels.length}일 구성`, `${labels.length}-day plan`),
  ];
  if (input.likes.trim()) conditions.push(lx(`선호: ${input.likes}`, `Likes: ${input.likes}`));

  const excluded: L[] = [
    ...input.allergies.map((a) => lx(`${PERSON_ALLERGENS[a].ko} (알레르기)`, `${PERSON_ALLERGENS[a].en} (allergy)`)),
    ...keywords(input.dislikes).map((w) => lx(`${w} (비선호)`, `${w} (disliked)`)),
  ];

  const overBudget = days.some((d) => sumItems(d.meals.flatMap((m) => m.items)).costKRW > input.budgetKRW);
  const notes: L[] = [
    lx('영양 수치와 가격은 프로토타입용 예시 값이에요.', 'Nutrition values and prices are prototype examples.'),
    lx('질환이 있거나 임신 중이라면 전문가와 상의하세요.', 'If you have a medical condition or are pregnant, consult a professional.'),
  ];
  if (overBudget) {
    notes.unshift(lx('일부 날은 예산 안에 맞는 메뉴를 찾지 못했어요.', 'Some days could not fit the budget with the available menus.'));
  }

  return {
    kind: 'person',
    targetKcal: targets.kcal,
    targetProtein: targets.protein,
    days,
    reasons,
    conditions,
    excluded,
    notes,
    sourceIds: [...new Set(reasons.flatMap((r) => r.sourceIds))],
  };
}

export function personFoodById(id: string): FoodDef | undefined {
  return PERSON_FOODS.find((f) => f.id === id);
}
