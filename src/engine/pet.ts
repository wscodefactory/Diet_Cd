// Rule-based stand-in for the pet recommender. It picks example sources by
// species and life stage the way the real AI is meant to.

import { PET_FOODS } from '../data/petFoods';
import { SOURCES } from '../data/sources';
import { ACTIVITIES, LIFE_STAGES, PET_ALLERGENS, PET_HEALTH, SPECIES } from '../i18n';
import type { DayPlan, FoodDef, L, LifeStage, Meal, PetInput, Plan, Reason } from '../types';
import { keywords, lx, rotatePick, scaleItem } from './common';

export function lifeStage(pet: PetInput): LifeStage {
  if (pet.ageYears < 1) return 'young';
  if (pet.species === 'dog') return pet.ageYears >= 7 ? 'senior' : 'adult';
  return pet.ageYears >= 11 ? 'senior' : 'adult';
}

export function petTargets(pet: PetInput) {
  const stage = lifeStage(pet);
  const rer = 70 * Math.pow(Math.max(0.5, pet.weightKg), 0.75);
  let factor: number;
  if (pet.species === 'dog') {
    factor = stage === 'young' ? 2.5 : stage === 'senior' ? 1.4 : pet.neutered ? 1.6 : 1.8;
  } else {
    factor = stage === 'young' ? 2.5 : stage === 'senior' ? 1.1 : pet.neutered ? 1.2 : 1.4;
  }
  if (pet.health === 'overweight') factor = pet.species === 'dog' ? 1.0 : 0.8;
  if (pet.activity === 'high' && pet.health !== 'overweight') factor += 0.2;
  if (pet.activity === 'low') factor -= 0.1;
  const kcal = Math.round((rer * factor) / 5) * 5;
  const mealsPerDay = stage === 'young' ? 3 : 2;
  return { rer: Math.round(rer), factor, kcal, mealsPerDay, stage };
}

function allowed(pet: PetInput, food: FoodDef): boolean {
  if (food.species && !food.species.includes(pet.species)) return false;
  if (food.allergens.some((a) => (pet.allergies as string[]).includes(a))) return false;
  if (pet.health === 'kidney' && food.id === 'pet-egg') return false;
  if (pet.health === 'sensitiveStomach' && food.fat >= 10) return false;
  return true;
}

function score(pet: PetInput, food: FoodDef): number {
  let s = 0;
  if (pet.health === 'overweight' && food.tags.includes('lowFat')) s += 3;
  if (pet.health === 'sensitiveStomach' && food.tags.includes('gentle')) s += 3;
  if (pet.health === 'joint' && food.tags.includes('joint')) s += 3;
  if (pet.allergies.length && food.tags.includes('novel')) s += 2;
  if (lifeStage(pet) === 'senior' && food.tags.includes('gentle')) s += 1;
  return s;
}

export function petCandidates(pet: PetInput, slot: string): FoodDef[] {
  return PET_FOODS.filter((f) => f.slots.includes(slot) && allowed(pet, f)).sort((a, b) => score(pet, b) - score(pet, a));
}

function slotsFor(pet: PetInput): { slot: string; share: number }[] {
  if (pet.species === 'cat') return [{ slot: 'protein', share: 0.92 }, { slot: 'topping', share: 0.08 }];
  return [
    { slot: 'protein', share: 0.55 },
    { slot: 'carb', share: 0.35 },
    { slot: 'veg', share: 0.1 },
  ];
}

/** Build one day: the same bowl repeated for each meal, sized to the energy target. */
export function composePetDay(pet: PetInput, label: L, foods: FoodDef[]): DayPlan {
  const { kcal, mealsPerDay } = petTargets(pet);
  const perMeal = kcal / mealsPerDay;
  const shares = slotsFor(pet);
  const items = foods.map((f) => {
    const share = shares.find((s) => f.slots.includes(s.slot))?.share ?? 0.1;
    // Toppings are fixed small amounts; others are sized by energy share.
    const factor = f.slots.includes('topping') && pet.species === 'cat' ? 1 : (perMeal * share) / f.kcal;
    return scaleItem(f, factor);
  });
  const meals: Meal[] = Array.from({ length: mealsPerDay }, (_, k) => ({
    slot: `meal${k + 1}`,
    label: lx(`${k + 1}회차`, `Meal ${k + 1}`),
    items,
  }));
  return { label, meals };
}

export function buildPetPlan(pet: PetInput): Plan {
  const targets = petTargets(pet);
  const stage = targets.stage;
  const dayCount = 3;

  const days: DayPlan[] = Array.from({ length: dayCount }, (_, d) => {
    const foods: FoodDef[] = [];
    for (const { slot } of slotsFor(pet)) {
      let pick = rotatePick(petCandidates(pet, slot), d, slot === 'protein' ? 0 : 1);
      if (slot === 'topping') {
        // Senior cats and kidney care get broth; joint care gets fish oil when allowed.
        const want = pet.health === 'joint' ? 'pet-fishoil' : stage === 'senior' || pet.health === 'kidney' ? 'pet-water' : null;
        pick = petCandidates(pet, slot).find((f) => f.id === want) ?? pick;
      }
      if (pick) foods.push(pick);
    }
    return composePetDay(pet, lx(`${d + 1}일차`, `Day ${d + 1}`), foods);
  });

  // ----- sources: AI picks only those that fit species and life stage -----
  const energyId = `${pet.species === 'dog' ? 'd' : 'c'}-${stage === 'adult' ? 'energy' : stage}`;
  const reasons: Reason[] = [
    {
      text: lx(
        `${SPECIES[pet.species].ko} ${LIFE_STAGES[stage].ko} 기준으로 하루 약 ${targets.kcal}kcal를 ${targets.mealsPerDay}번에 나눠 주도록 했어요.`,
        `Based on ${stage === 'adult' ? 'an' : 'a'} ${LIFE_STAGES[stage].en.toLowerCase()} ${SPECIES[pet.species].en.toLowerCase()}, about ${targets.kcal} kcal a day split into ${targets.mealsPerDay} meals.`,
      ),
      sourceIds: [energyId],
    },
  ];
  if (pet.species === 'cat') {
    reasons.push({
      text: lx('고양이는 육식성이라 단백질 위주로 구성하고 곡물은 뺐어요.', 'Cats are obligate carnivores, so meals centre on protein with no grains.'),
      sourceIds: ['c-energy'],
    });
  }
  if (pet.allergies.length) {
    reasons.push({
      text: lx('알레르기 재료를 빼고, 하루에는 단백질원을 하나만 사용했어요.', 'Allergens are excluded and each day uses a single protein.'),
      sourceIds: ['pet-allergy'],
    });
  }
  const healthSource: Partial<Record<PetInput['health'], string>> = {
    overweight: 'pet-weight',
    kidney: 'pet-kidney',
    joint: 'pet-joint',
    sensitiveStomach: 'pet-gentle',
  };
  const hs = healthSource[pet.health];
  if (hs) {
    reasons.push({
      text: lx(`'${PET_HEALTH[pet.health].ko}' 상태를 반영해 재료와 양을 조정했어요.`, `Ingredients and amounts adjusted for "${PET_HEALTH[pet.health].en}".`),
      sourceIds: [hs],
    });
  }
  const sourceIds = [...new Set(reasons.flatMap((r) => r.sourceIds))].filter((id) => SOURCES[id]);

  const conditions: L[] = [
    lx(
      `${SPECIES[pet.species].ko} · ${pet.ageYears}살 (${LIFE_STAGES[stage].ko}) · ${pet.weightKg}kg`,
      `${SPECIES[pet.species].en} · ${pet.ageYears} y (${LIFE_STAGES[stage].en}) · ${pet.weightKg} kg`,
    ),
    lx(`활동량: ${ACTIVITIES[pet.activity].ko}`, `Activity: ${ACTIVITIES[pet.activity].en}`),
    lx(pet.neutered ? '중성화 완료' : '중성화 안 함', pet.neutered ? 'Neutered' : 'Not neutered'),
    lx(`건강 상태: ${PET_HEALTH[pet.health].ko}`, `Health: ${PET_HEALTH[pet.health].en}`),
  ];
  if (pet.traits.trim()) conditions.push(lx(`식이 특성: ${pet.traits}`, `Habits: ${pet.traits}`));

  const excluded: L[] = pet.allergies.map((a) => lx(`${PET_ALLERGENS[a].ko} (알레르기)`, `${PET_ALLERGENS[a].en} (allergy)`));
  if (pet.species === 'cat') excluded.push(lx('곡물 (고양이 식단)', 'Grains (cat diet)'));
  if (pet.health === 'kidney') excluded.push(lx('달걀 (인 함량)', 'Egg (phosphorus)'));
  excluded.push(
    pet.species === 'dog'
      ? lx('양파·마늘·포도·초콜릿·자일리톨 (위험 식품)', 'Onion, garlic, grapes, chocolate, xylitol (unsafe foods)')
      : lx('양파·마늘·초콜릿·백합류 (위험 식품)', 'Onion, garlic, chocolate, lilies (unsafe foods)'),
  );

  const perMeal = days[0].meals[0].items.reduce((a, it) => a + it.grams, 0);
  const feeding: L[] = [
    lx(`하루 ${targets.mealsPerDay}번, 한 번에 약 ${perMeal}g씩 주세요.`, `Feed ${targets.mealsPerDay} times a day, about ${perMeal} g each.`),
    lx('모든 재료는 양념 없이 익혀서 식힌 뒤 잘게 잘라 주세요.', 'Cook everything without seasoning, cool it and cut it small.'),
    lx('새 재료는 소량부터 시작해 며칠간 변 상태를 확인하세요.', 'Introduce new ingredients slowly and watch stools for a few days.'),
    lx('2주마다 체중을 재고 급여량을 조정하세요.', 'Weigh every two weeks and adjust amounts.'),
  ];
  if (keywords(pet.traits).some((w) => w.includes('습식') || w.includes('wet'))) {
    feeding.push(lx('습식을 좋아하면 무염 육수를 조금 섞어 주세요.', 'If it prefers wet food, mix in a little unsalted broth.'));
  }

  const notes: L[] = [
    lx(
      '자가 조리 식단만으로는 필수 영양소(칼슘, 타우린 등)를 맞추기 어려워요. 완전사료와 함께 쓰거나 수의사와 상의하세요.',
      'Home-cooked food alone rarely covers essential nutrients (calcium, taurine…). Combine with complete food or consult a vet.',
    ),
    lx('영양 수치는 프로토타입용 예시 값이에요.', 'Nutrition values are prototype examples.'),
  ];
  if (pet.health === 'kidney') {
    notes.unshift(lx('신장 질환은 처방식이 우선이에요. 이 식단은 참고용입니다.', 'Kidney disease needs a prescription diet first; this plan is for reference.'));
  }

  return {
    kind: 'pet',
    targetKcal: targets.kcal,
    targetProtein: 0,
    days,
    reasons,
    conditions,
    excluded,
    notes,
    sourceIds,
    feeding,
  };
}

export function petFoodById(id: string): FoodDef | undefined {
  return PET_FOODS.find((f) => f.id === id);
}
