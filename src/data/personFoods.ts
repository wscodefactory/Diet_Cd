import type { FoodDef } from '../types';

// Prototype menu database. Nutrition and prices are rough example values,
// not taken from a verified nutrition database (see docs/paid-items.md).

const i = (ko: string, en: string) => ({ ko, en });

export const PERSON_FOODS: FoodDef[] = [
  // ----- breakfast mains -----
  {
    id: 'oat-bowl', name: i('오트밀 베리 볼', 'Oatmeal berry bowl'), emoji: '🥣',
    slots: ['breakfast'], role: 'main', baseGrams: 250, kcal: 340, protein: 13, carbs: 55, fat: 8, costKRW: 2500,
    ingredients: [i('귀리', 'oats'), i('우유', 'milk'), i('블루베리', 'blueberry')],
    allergens: ['milk'], tags: ['fiber', 'quick'],
  },
  {
    id: 'egg-toast', name: i('통밀 달걀 토스트', 'Whole-wheat egg toast'), emoji: '🍳',
    slots: ['breakfast'], role: 'main', baseGrams: 200, kcal: 380, protein: 20, carbs: 38, fat: 15, costKRW: 2800,
    ingredients: [i('통밀빵', 'whole-wheat bread'), i('달걀', 'egg'), i('시금치', 'spinach')],
    allergens: ['wheat', 'egg'], tags: ['highProtein'],
  },
  {
    id: 'tofu-rice-porridge', name: i('두부 채소죽', 'Tofu vegetable porridge'), emoji: '🍚',
    slots: ['breakfast'], role: 'main', baseGrams: 300, kcal: 300, protein: 14, carbs: 46, fat: 6, costKRW: 2200,
    ingredients: [i('쌀', 'rice'), i('두부', 'tofu'), i('애호박', 'zucchini'), i('당근', 'carrot')],
    allergens: ['soy'], tags: ['light', 'lowCal'],
  },
  {
    id: 'sweetpotato-plate', name: i('고구마 닭가슴살 플레이트', 'Sweet potato & chicken plate'), emoji: '🍠',
    slots: ['breakfast', 'snack'], role: 'main', baseGrams: 230, kcal: 320, protein: 25, carbs: 42, fat: 4, costKRW: 3000,
    ingredients: [i('고구마', 'sweet potato'), i('닭가슴살', 'chicken breast')],
    allergens: [], tags: ['highProtein', 'lowCal'],
  },
  // ----- lunch / dinner mains -----
  {
    id: 'bibimbap', name: i('채소 비빔밥', 'Vegetable bibimbap'), emoji: '🥗',
    slots: ['lunch', 'dinner'], role: 'main', baseGrams: 400, kcal: 560, protein: 20, carbs: 85, fat: 14, costKRW: 4500,
    ingredients: [i('현미밥', 'brown rice'), i('콩나물', 'bean sprouts'), i('시금치', 'spinach'), i('달걀', 'egg'), i('고추장', 'gochujang')],
    allergens: ['egg', 'soy', 'wheat'], tags: ['fiber', 'korean'],
  },
  {
    id: 'chicken-salad-rice', name: i('닭가슴살 현미 도시락', 'Chicken & brown rice box'), emoji: '🍱',
    slots: ['lunch', 'dinner'], role: 'main', baseGrams: 380, kcal: 520, protein: 38, carbs: 62, fat: 11, costKRW: 5000,
    ingredients: [i('닭가슴살', 'chicken breast'), i('현미밥', 'brown rice'), i('브로콜리', 'broccoli')],
    allergens: [], tags: ['highProtein', 'lunchboxFriendly'],
  },
  {
    id: 'salmon-bowl', name: i('연어 포케 볼', 'Salmon poke bowl'), emoji: '🐟',
    slots: ['lunch', 'dinner'], role: 'main', baseGrams: 380, kcal: 590, protein: 32, carbs: 60, fat: 22, costKRW: 8500,
    ingredients: [i('연어', 'salmon'), i('잡곡밥', 'mixed-grain rice'), i('아보카도', 'avocado'), i('간장', 'soy sauce')],
    allergens: ['fish', 'soy', 'wheat'], tags: ['omega3'],
  },
  {
    id: 'beef-bulgogi', name: i('소불고기 덮밥', 'Beef bulgogi rice bowl'), emoji: '🥩',
    slots: ['lunch', 'dinner'], role: 'main', baseGrams: 400, kcal: 650, protein: 34, carbs: 78, fat: 20, costKRW: 7000,
    ingredients: [i('소고기', 'beef'), i('양파', 'onion'), i('쌀밥', 'white rice'), i('간장', 'soy sauce')],
    allergens: ['soy', 'wheat'], tags: ['highProtein', 'gain', 'korean', 'lunchboxFriendly'],
  },
  {
    id: 'tofu-stew', name: i('두부 된장찌개 정식', 'Tofu doenjang stew set'), emoji: '🍲',
    slots: ['lunch', 'dinner'], role: 'main', baseGrams: 450, kcal: 480, protein: 24, carbs: 64, fat: 13, costKRW: 4000,
    ingredients: [i('두부', 'tofu'), i('된장', 'doenjang'), i('애호박', 'zucchini'), i('쌀밥', 'white rice')],
    allergens: ['soy'], tags: ['korean', 'lowCal'],
  },
  {
    id: 'pork-kimchi-rice', name: i('돼지고기 김치 볶음밥', 'Pork kimchi fried rice'), emoji: '🍛',
    slots: ['lunch', 'dinner'], role: 'main', baseGrams: 380, kcal: 620, protein: 26, carbs: 80, fat: 21, costKRW: 4500,
    ingredients: [i('돼지고기', 'pork'), i('김치', 'kimchi'), i('쌀밥', 'white rice'), i('달걀', 'egg')],
    allergens: ['egg'], tags: ['korean', 'gain', 'lunchboxFriendly'],
  },
  {
    id: 'shrimp-pasta', name: i('새우 통밀 파스타', 'Shrimp whole-wheat pasta'), emoji: '🍝',
    slots: ['lunch', 'dinner'], role: 'main', baseGrams: 350, kcal: 580, protein: 28, carbs: 76, fat: 16, costKRW: 6500,
    ingredients: [i('새우', 'shrimp'), i('통밀 파스타', 'whole-wheat pasta'), i('토마토', 'tomato'), i('마늘', 'garlic')],
    allergens: ['shellfish', 'wheat'], tags: ['fiber'],
  },
  {
    id: 'mackerel-set', name: i('고등어구이 정식', 'Grilled mackerel set'), emoji: '🐠',
    slots: ['dinner'], role: 'main', baseGrams: 400, kcal: 540, protein: 30, carbs: 58, fat: 19, costKRW: 5500,
    ingredients: [i('고등어', 'mackerel'), i('잡곡밥', 'mixed-grain rice'), i('무', 'radish')],
    allergens: ['fish'], tags: ['omega3', 'korean'],
  },
  // ----- sides -----
  {
    id: 'greek-yogurt', name: i('그릭요거트', 'Greek yogurt'), emoji: '🥛',
    slots: ['breakfast', 'snack'], role: 'side', baseGrams: 120, kcal: 110, protein: 11, carbs: 6, fat: 4, costKRW: 1500,
    ingredients: [i('요거트', 'yogurt')],
    allergens: ['milk'], tags: ['highProtein'],
  },
  {
    id: 'apple', name: i('사과', 'Apple'), emoji: '🍎',
    slots: ['breakfast', 'snack', 'lunch'], role: 'side', baseGrams: 150, kcal: 80, protein: 0, carbs: 21, fat: 0, costKRW: 1000,
    ingredients: [i('사과', 'apple')],
    allergens: [], tags: ['fiber', 'lowCal'],
  },
  {
    id: 'banana', name: i('바나나', 'Banana'), emoji: '🍌',
    slots: ['breakfast', 'snack'], role: 'side', baseGrams: 120, kcal: 105, protein: 1, carbs: 27, fat: 0, costKRW: 500,
    ingredients: [i('바나나', 'banana')],
    allergens: [], tags: ['quick'],
  },
  {
    id: 'nuts', name: i('견과류 한 줌', 'Handful of nuts'), emoji: '🥜',
    slots: ['snack'], role: 'side', baseGrams: 25, kcal: 150, protein: 5, carbs: 5, fat: 13, costKRW: 800,
    ingredients: [i('아몬드', 'almond'), i('호두', 'walnut')],
    allergens: ['treeNut'], tags: ['gain'],
  },
  {
    id: 'edamame', name: i('삶은 풋콩', 'Steamed edamame'), emoji: '🫛',
    slots: ['snack', 'lunch', 'dinner'], role: 'side', baseGrams: 100, kcal: 120, protein: 11, carbs: 9, fat: 5, costKRW: 1200,
    ingredients: [i('풋콩', 'edamame')],
    allergens: ['soy'], tags: ['highProtein', 'fiber'],
  },
  {
    id: 'veg-namul', name: i('나물 3종', 'Three seasoned greens'), emoji: '🥬',
    slots: ['lunch', 'dinner'], role: 'side', baseGrams: 120, kcal: 70, protein: 4, carbs: 8, fat: 3, costKRW: 1500,
    ingredients: [i('시금치', 'spinach'), i('콩나물', 'bean sprouts'), i('고사리', 'bracken')],
    allergens: [], tags: ['fiber', 'lowCal', 'korean', 'lunchboxFriendly'],
  },
  {
    id: 'cherry-tomato', name: i('방울토마토', 'Cherry tomatoes'), emoji: '🍅',
    slots: ['lunch', 'dinner', 'snack'], role: 'side', baseGrams: 150, kcal: 30, protein: 1, carbs: 6, fat: 0, costKRW: 1200,
    ingredients: [i('토마토', 'tomato')],
    allergens: [], tags: ['lowCal', 'lunchboxFriendly'],
  },
  {
    id: 'boiled-egg', name: i('삶은 달걀 2개', 'Two boiled eggs'), emoji: '🥚',
    slots: ['breakfast', 'snack', 'lunch'], role: 'side', baseGrams: 100, kcal: 150, protein: 13, carbs: 1, fat: 10, costKRW: 600,
    ingredients: [i('달걀', 'egg')],
    allergens: ['egg'], tags: ['highProtein', 'lunchboxFriendly'],
  },
];
