// 실행: npm run check  (Node 24의 TypeScript 직접 실행 사용)
import { petGuide } from './pet.ts'
import { alternatives, buildPlan, humanTarget, mealTotals, petPlan, type Human, type Pet } from './plan.ts'

const ok = (cond: boolean, msg: string) => {
  if (!cond) throw new Error('FAIL: ' + msg)
}

const h: Human = {
  sex: 'm', age: 30, height: 175, weight: 70, goal: 'keep', activity: 'mid',
  likes: '연어', dislikes: '버섯, broccoli', allergies: ['egg', 'wheat'], budget: 7000,
  mode: 'days', days: 5, weekdays: [],
}

ok(humanTarget(h).bmr === 1649, 'Mifflin-St Jeor BMR')
ok(humanTarget(h).kcal === 2560, 'TDEE target')
ok(humanTarget({ ...h, weight: 35, height: 140, sex: 'f', goal: 'loss', activity: 'low' }).kcal === 1200, 'kcal floor')

const plan = buildPlan(h)
ok(plan.length === 5, 'day count')
for (const day of plan)
  for (const meal of day.meals) {
    ok(meal.items.length === (meal.slot === 1 ? 4 : 3), 'meal composition')
    ok(new Set(meal.items).size === meal.items.length, 'no duplicate item in a meal')
    for (const it of meal.items) {
      ok(!it.allergens.includes('egg') && !it.allergens.includes('wheat'), `allergen leaked: ${it.id}`)
      ok(it.id !== 'mushroom' && it.id !== 'broccoli', `disliked item leaked: ${it.id}`)
    }
    ok(mealTotals(meal, 2560).price <= h.budget, 'budget respected')
    meal.items.forEach((_, k) =>
      alternatives(h, meal, k).forEach(a => {
        ok(a.role === meal.items[k].role && !a.allergens.includes('egg'), 'alternative keeps conditions')
        ok(mealTotals(meal, 2560).price - meal.items[k].price + a.price <= h.budget, 'alternative keeps budget')
      }),
    )
  }
ok(plan.some(d => d.meals.some(m => m.items.some(i => i.id === 'salmon'))), 'liked item appears')
ok(buildPlan({ ...h, mode: 'weekdays', weekdays: [4, 0] }).map(d => d.label.en).join() === 'Mon,Fri', 'weekday order')

const pet: Pet = { id: '1', name: '', species: 'dog', age: 3, weight: 10, activity: 'mid', neutered: true, health: 'none', allergies: ['chicken'], diet: 'mixed' }
const pp = petPlan(pet)
ok(pp.rer === 394 && pp.kcal === 630, 'dog RER and MER')
ok(pp.stage === 'adult' && petPlan({ ...pet, species: 'cat', age: 12 }).stage === 'senior', 'life stage')
ok(pp.dryG === 90 && pp.wetG === 350, 'mixed feeding grams')
ok(!pp.proteins.some(x => x.allergen === 'chicken'), 'pet allergen excluded')

const rabbit = petGuide({ ...pet, species: 'rabbit', weight: 2, age: 2 })
ok(rabbit.stage === 'adult' && rabbit.headline.ko.includes('50 g'), 'rabbit pellets 25 g/kg')
ok(petGuide({ ...pet, species: 'hamster', weight: 0.12, age: 2 }).stage === 'senior', 'hamster senior')
ok(petGuide(pet).stats[0].value === '630', 'dog guide uses energy model')
ok(petGuide({ ...pet, species: 'other' }).stats[0].value === '-', 'unknown species gets no made-up amount')

console.log('plan.check: all passed')
