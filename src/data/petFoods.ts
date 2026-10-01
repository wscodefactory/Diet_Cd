import type { FoodDef } from '../types';

// Prototype ingredient database for home-cooked pet meals.
// Nutrition values are rough examples, not from a verified database.
// Slots: 'protein' | 'carb' | 'veg' | 'topping'.

const i = (ko: string, en: string) => ({ ko, en });

export const PET_FOODS: FoodDef[] = [
  // ----- proteins -----
  {
    id: 'pet-chicken', name: i('삶은 닭가슴살', 'Boiled chicken breast'), emoji: '🍗',
    slots: ['protein'], role: 'main', baseGrams: 100, kcal: 165, protein: 31, carbs: 0, fat: 4,
    ingredients: [i('닭고기', 'chicken')], allergens: ['chicken'], tags: ['lowFat', 'gentle'], species: ['dog', 'cat'],
  },
  {
    id: 'pet-turkey', name: i('삶은 칠면조', 'Boiled turkey'), emoji: '🦃',
    slots: ['protein'], role: 'main', baseGrams: 100, kcal: 150, protein: 29, carbs: 0, fat: 3,
    ingredients: [i('칠면조', 'turkey')], allergens: [], tags: ['lowFat', 'novel'], species: ['dog', 'cat'],
  },
  {
    id: 'pet-beef', name: i('살코기 소고기', 'Lean beef'), emoji: '🥩',
    slots: ['protein'], role: 'main', baseGrams: 100, kcal: 200, protein: 27, carbs: 0, fat: 10,
    ingredients: [i('소고기', 'beef')], allergens: ['beef'], tags: [], species: ['dog', 'cat'],
  },
  {
    id: 'pet-salmon', name: i('익힌 연어', 'Cooked salmon'), emoji: '🐟',
    slots: ['protein'], role: 'main', baseGrams: 100, kcal: 206, protein: 22, carbs: 0, fat: 12,
    ingredients: [i('연어', 'salmon')], allergens: ['fish'], tags: ['omega3', 'joint'], species: ['dog', 'cat'],
  },
  {
    id: 'pet-whitefish', name: i('익힌 흰살 생선(대구)', 'Cooked white fish (cod)'), emoji: '🐠',
    slots: ['protein'], role: 'main', baseGrams: 100, kcal: 105, protein: 23, carbs: 0, fat: 1,
    ingredients: [i('대구', 'cod')], allergens: ['fish'], tags: ['lowFat', 'gentle'], species: ['dog', 'cat'],
  },
  {
    id: 'pet-duck', name: i('익힌 오리고기', 'Cooked duck'), emoji: '🦆',
    slots: ['protein'], role: 'main', baseGrams: 100, kcal: 200, protein: 24, carbs: 0, fat: 11,
    ingredients: [i('오리고기', 'duck')], allergens: [], tags: ['novel'], species: ['dog', 'cat'],
  },
  {
    id: 'pet-egg', name: i('완숙 달걀', 'Hard-boiled egg'), emoji: '🥚',
    slots: ['protein'], role: 'main', baseGrams: 50, kcal: 78, protein: 6, carbs: 1, fat: 5,
    ingredients: [i('달걀', 'egg')], allergens: ['egg'], tags: [], species: ['dog'],
  },
  // ----- carbs (dogs; small amounts for cats via topping) -----
  {
    id: 'pet-rice', name: i('흰쌀밥', 'White rice'), emoji: '🍚',
    slots: ['carb'], role: 'side', baseGrams: 100, kcal: 130, protein: 3, carbs: 28, fat: 0,
    ingredients: [i('쌀', 'rice')], allergens: ['grain'], tags: ['gentle'], species: ['dog'],
  },
  {
    id: 'pet-sweetpotato', name: i('찐 고구마', 'Steamed sweet potato'), emoji: '🍠',
    slots: ['carb'], role: 'side', baseGrams: 100, kcal: 86, protein: 2, carbs: 20, fat: 0,
    ingredients: [i('고구마', 'sweet potato')], allergens: [], tags: ['fiber', 'grainFree'], species: ['dog'],
  },
  {
    id: 'pet-oats', name: i('익힌 귀리', 'Cooked oats'), emoji: '🌾',
    slots: ['carb'], role: 'side', baseGrams: 100, kcal: 70, protein: 3, carbs: 12, fat: 1,
    ingredients: [i('귀리', 'oats')], allergens: ['grain'], tags: ['fiber'], species: ['dog'],
  },
  // ----- vegetables -----
  {
    id: 'pet-pumpkin', name: i('찐 단호박', 'Steamed pumpkin'), emoji: '🎃',
    slots: ['veg', 'topping'], role: 'side', baseGrams: 40, kcal: 14, protein: 0, carbs: 3, fat: 0,
    ingredients: [i('단호박', 'pumpkin')], allergens: [], tags: ['fiber', 'gentle'], species: ['dog', 'cat'],
  },
  {
    id: 'pet-carrot', name: i('익힌 당근', 'Cooked carrot'), emoji: '🥕',
    slots: ['veg'], role: 'side', baseGrams: 40, kcal: 14, protein: 0, carbs: 3, fat: 0,
    ingredients: [i('당근', 'carrot')], allergens: [], tags: ['fiber'], species: ['dog'],
  },
  {
    id: 'pet-broccoli', name: i('데친 브로콜리', 'Blanched broccoli'), emoji: '🥦',
    slots: ['veg'], role: 'side', baseGrams: 30, kcal: 10, protein: 1, carbs: 2, fat: 0,
    ingredients: [i('브로콜리', 'broccoli')], allergens: [], tags: ['fiber'], species: ['dog'],
  },
  {
    id: 'pet-blueberry', name: i('블루베리 몇 알', 'A few blueberries'), emoji: '🫐',
    slots: ['veg'], role: 'side', baseGrams: 15, kcal: 9, protein: 0, carbs: 2, fat: 0,
    ingredients: [i('블루베리', 'blueberry')], allergens: [], tags: [], species: ['dog'],
  },
  // ----- cat toppings -----
  {
    id: 'pet-fishoil', name: i('피쉬오일 소량', 'A little fish oil'), emoji: '💧',
    slots: ['topping'], role: 'side', baseGrams: 2, kcal: 18, protein: 0, carbs: 0, fat: 2,
    ingredients: [i('어유', 'fish oil')], allergens: ['fish'], tags: ['omega3', 'joint'], species: ['dog', 'cat'],
  },
  {
    id: 'pet-water', name: i('수분 보충용 육수(무염)', 'Unsalted broth for hydration'), emoji: '🥣',
    slots: ['topping'], role: 'side', baseGrams: 30, kcal: 3, protein: 0, carbs: 0, fat: 0,
    ingredients: [i('무염 육수', 'unsalted broth')], allergens: [], tags: ['hydration'], species: ['cat', 'dog'],
  },
];
