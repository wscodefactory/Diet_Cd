// 추천 계산. LLM 호출 대신 단순 규칙으로 대체 (docs/paid-items.md).
import { ITEMS, PROTEINS, type Allergen, type Bi, type Item, type PetAllergen, type Role } from './data.ts'

// ---------- 사람 ----------
export type Goal = 'loss' | 'keep' | 'gain'
export type Level = 'low' | 'mid' | 'high'

export type Human = {
  sex: 'm' | 'f'
  age: number
  height: number // cm
  weight: number // kg
  goal: Goal
  activity: Level
  likes: string // 쉼표로 구분
  dislikes: string
  allergies: Allergen[]
  budget: number // 한 끼 예산(원)
  mode: 'days' | 'weekdays'
  days: number
  weekdays: number[] // 0=월 … 6=일
}

export const SLOTS: { name: Bi; share: number; roles: Role[] }[] = [
  { name: { ko: '아침', en: 'Breakfast' }, share: 0.3, roles: ['staple', 'main', 'side'] },
  { name: { ko: '점심 도시락', en: 'Lunch box' }, share: 0.4, roles: ['staple', 'main', 'side', 'side'] },
  { name: { ko: '저녁', en: 'Dinner' }, share: 0.3, roles: ['staple', 'main', 'side'] },
]

export const WEEKDAYS: Bi[] = [
  { ko: '월', en: 'Mon' }, { ko: '화', en: 'Tue' }, { ko: '수', en: 'Wed' }, { ko: '목', en: 'Thu' },
  { ko: '금', en: 'Fri' }, { ko: '토', en: 'Sat' }, { ko: '일', en: 'Sun' },
]

// 아래 계수들은 논문 값이 아니라 프로토타입이 정한 값 (근거 카드의 'AI의 판단'에 표시)
const ACTIVITY: Record<Level, number> = { low: 1.2, mid: 1.55, high: 1.725 }
const DELTA: Record<Goal, number> = { loss: -400, keep: 0, gain: 300 }
// 탄수화물/단백질/지방 에너지 비율(%). 한국인 영양소 섭취기준 범위 안에서 선택
export const RATIO: Record<Goal, { c: number; p: number; f: number }> = {
  loss: { c: 55, p: 20, f: 25 },
  keep: { c: 60, p: 15, f: 25 },
  gain: { c: 55, p: 20, f: 25 },
}

export function humanTarget(h: Human) {
  // Mifflin-St Jeor
  const bmr = 10 * h.weight + 6.25 * h.height - 5 * h.age + (h.sex === 'm' ? 5 : -161)
  const tdee = bmr * ACTIVITY[h.activity]
  const kcal = Math.max(1200, Math.round((tdee + DELTA[h.goal]) / 10) * 10)
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, ratio: RATIO[h.goal] }
}

const words = (s: string) => s.split(',').map(w => w.trim().toLowerCase()).filter(Boolean)
const hit = (it: Item, ws: string[]) => ws.some(w => it.name.ko.includes(w) || it.name.en.toLowerCase().includes(w))

export const isExcluded = (h: Human, it: Item) =>
  it.allergens.some(a => h.allergies.includes(a)) || hit(it, words(h.dislikes))

/** 조건에 맞는 후보. 선호 식품은 앞에 한 번 더 넣어 더 자주 뽑히게 한다. */
function candidates(h: Human, role: Role) {
  const ok = ITEMS.filter(i => i.role === role && !isExcluded(h, i))
  return [...ok.filter(i => hit(i, words(h.likes))), ...ok]
}

export type Meal = { slot: number; items: Item[] }
export type DayPlan = { label: Bi; meals: Meal[] }

const price = (items: Item[]) => items.reduce((s, i) => s + i.price, 0)

export function pickMeal(h: Human, day: number, slot: number, seed = 0): Meal {
  const items: Item[] = []
  SLOTS[slot].roles.forEach((role, k) => {
    const c = candidates(h, role).filter(i => !items.includes(i))
    if (c.length) items.push(c[(day * 2 + slot + k * 3 + seed) % c.length])
  })
  // 예산 초과 시: 가장 많이 아낄 수 있는 구성부터 더 싼 후보로 교체
  while (price(items) > h.budget) {
    let bestK = -1
    let bestItem: Item | undefined
    let bestSave = 0
    for (let k = 0; k < items.length; k++) {
      const cheap = candidates(h, items[k].role).filter(i => !items.includes(i)).sort((a, b) => a.price - b.price)[0]
      if (cheap && items[k].price - cheap.price > bestSave) {
        bestK = k
        bestItem = cheap
        bestSave = items[k].price - cheap.price
      }
    }
    if (!bestItem) break // 더 줄일 수 없음 → 화면에서 예산 초과 안내
    items[bestK] = bestItem
  }
  return { slot, items }
}

export function buildPlan(h: Human): DayPlan[] {
  const labels: Bi[] =
    h.mode === 'days'
      ? Array.from({ length: Math.min(14, Math.max(1, Math.round(h.days))) }, (_, i) => ({ ko: `${i + 1}일차`, en: `Day ${i + 1}` }))
      : [...h.weekdays].sort((a, b) => a - b).map(d => WEEKDAYS[d])
  return labels.map((label, d) => ({ label, meals: SLOTS.map((_, s) => pickMeal(h, d, s)) }))
}

/** 끼니 합계. 목표 칼로리에 맞춰 제공량 배율(0.6~1.6배)을 곱한다. */
export function mealTotals(meal: Meal, dayKcal: number) {
  const base = meal.items.reduce((s, i) => s + i.kcal, 0)
  const factor = base ? Math.min(1.6, Math.max(0.6, (dayKcal * SLOTS[meal.slot].share) / base)) : 1
  const sum = (key: 'kcal' | 'p' | 'c' | 'f') => Math.round(meal.items.reduce((s, i) => s + i[key], 0) * factor)
  // ponytail: 가격은 배율을 반영하지 않은 기준 제공량 가격. 실제 가격 데이터 연동 시 g당 단가로 바꿀 것
  return { factor, kcal: sum('kcal'), p: sum('p'), c: sum('c'), f: sum('f'), price: price(meal.items) }
}

export const grams = (it: Item, factor: number) => Math.max(5, Math.round((it.g * factor) / 5) * 5)

/** 구성 하나를 바꿀 때 제안할 대안: 같은 역할, 알레르기·비선호 제외, 예산 유지 */
export function alternatives(h: Human, meal: Meal, k: number): Item[] {
  const cur = meal.items[k]
  const room = Math.max(h.budget - price(meal.items), 0) + cur.price
  return [...new Set(candidates(h, cur.role))].filter(i => !meal.items.includes(i) && i.price <= room)
}

// ---------- 반려동물 ----------
export type Health = 'none' | 'overweight' | 'kidney' | 'skin' | 'gi'

export type Pet = {
  id: string
  name: string
  species: string // pet.ts의 SpeciesId
  customSpecies?: string // 종이 '기타'일 때 직접 입력한 이름
  age: number // 년
  weight: number // kg
  activity: Level
  neutered: boolean
  health: Health
  allergies: PetAllergen[]
  diet: 'dry' | 'wet' | 'mixed'
}

// 사료 칼로리 밀도 가정값. 실제로는 제품 라벨 값을 써야 한다.
const DRY_KCAL_PER_G = 3.5
const WET_KCAL_PER_G = 0.9

export function petPlan(p: Pet) {
  const dog = p.species === 'dog'
  // 노령 구분(개 7세, 고양이 11세)은 프로토타입의 단순화. 대형견은 더 이르다.
  const stage: 'young' | 'adult' | 'senior' = p.age < 1 ? 'young' : p.age >= (dog ? 7 : 11) ? 'senior' : 'adult'
  const rer = 70 * Math.pow(p.weight, 0.75)
  // 임상에서 흔히 쓰이는 출발 계수. 개체차가 커서 체중 변화를 보며 조정해야 한다.
  const base = dog
    ? stage === 'young' ? (p.age < 0.34 ? 3 : 2) : p.health === 'overweight' ? 1 : stage === 'senior' ? 1.4 : p.neutered ? 1.6 : 1.8
    : stage === 'young' ? 2.5 : p.health === 'overweight' ? 0.8 : stage === 'senior' ? 1.1 : p.neutered ? 1.2 : 1.4
  const factor = base * { low: 0.9, mid: 1, high: 1.1 }[p.activity]
  const kcal = Math.round(rer * factor)
  const dryShare = { dry: 1, wet: 0, mixed: 0.5 }[p.diet]
  return {
    stage,
    rer: Math.round(rer),
    factor: Math.round(factor * 100) / 100,
    kcal,
    dryG: Math.round((kcal * dryShare) / DRY_KCAL_PER_G),
    wetG: Math.round((kcal * (1 - dryShare)) / WET_KCAL_PER_G),
    mealsPerDay: stage === 'young' ? 3 : 2,
    proteins: PROTEINS.filter(x => !x.allergen || !p.allergies.includes(x.allergen)),
    excluded: PROTEINS.filter(x => x.allergen && p.allergies.includes(x.allergen)),
  }
}
