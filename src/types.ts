export type Lang = 'ko' | 'en';
export type Target = 'person' | 'pet';

/** Bilingual text. Every piece of content data carries both languages. */
export interface L {
  ko: string;
  en: string;
}

export type Activity = 'low' | 'mid' | 'high';

// ---------- Person ----------

export type Goal = 'lose' | 'maintain' | 'gain' | 'health';
export type PersonAllergen =
  | 'egg'
  | 'milk'
  | 'wheat'
  | 'soy'
  | 'peanut'
  | 'treeNut'
  | 'fish'
  | 'shellfish';

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface PersonInput {
  sex: 'male' | 'female';
  age: number;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  activity: Activity;
  likes: string;
  dislikes: string;
  allergies: PersonAllergen[];
  budgetKRW: number;
  periodMode: 'days' | 'weekdays';
  days: number;
  weekdays: Weekday[];
  lunchbox: boolean;
}

// ---------- Pet ----------

export type Species = 'dog' | 'cat';
export type LifeStage = 'young' | 'adult' | 'senior';
export type PetHealth = 'normal' | 'overweight' | 'sensitiveStomach' | 'kidney' | 'joint';
export type PetAllergen = 'chicken' | 'beef' | 'fish' | 'grain' | 'dairy' | 'egg';

export interface PetInput {
  id: string;
  name: string;
  species: Species;
  ageYears: number;
  weightKg: number;
  activity: Activity;
  neutered: boolean;
  health: PetHealth;
  allergies: PetAllergen[];
  traits: string;
}

// ---------- Foods ----------

export interface FoodDef {
  id: string;
  name: L;
  emoji: string;
  /** Slots this food can be served in. */
  slots: string[];
  role: 'main' | 'side';
  /** Base portion; nutrition below is for this portion. */
  baseGrams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  /** Example price for the base portion (KRW). Not real market data. */
  costKRW?: number;
  ingredients: L[];
  allergens: string[];
  tags: string[];
  species?: Species[];
}

// ---------- Plan (shared result model) ----------

export interface PlanItem {
  foodId: string;
  name: L;
  emoji: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  costKRW: number;
}

export interface Meal {
  slot: string;
  label: L;
  lunchbox?: boolean;
  items: PlanItem[];
}

export interface DayPlan {
  label: L;
  meals: Meal[];
}

export interface Reason {
  text: L;
  sourceIds: string[];
}

export interface Plan {
  kind: Target;
  targetKcal: number;
  targetProtein: number;
  days: DayPlan[];
  reasons: Reason[];
  conditions: L[];
  excluded: L[];
  notes: L[];
  sourceIds: string[];
  /** Pet only: per-meal feeding guidance. */
  feeding?: L[];
}

export interface SourceDoc {
  id: string;
  title: L;
  year: string;
  publisher: L;
  url: string | null;
  subject: L;
  appliesTo: { target: Target; species?: Species[]; lifeStages?: LifeStage[] };
  applied: L;
  finding: L;
  aiJudgment: L;
  scope: L;
  limits: L;
  /** True for placeholder data. The prototype has no verified sources, so all are examples. */
  example: true;
}
