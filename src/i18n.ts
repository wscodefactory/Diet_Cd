import type { Activity, Goal, L, Lang, PersonAllergen, PetAllergen, PetHealth, Species, Weekday, LifeStage } from './types';

const i = (ko: string, en: string): L => ({ ko, en });

export const t = (text: L, lang: Lang) => text[lang];

export const UI = {
  brand: i('근거식단', 'EvidenceDiet'),
  tagline: i('연구자료를 참고해 구성하는 AI 맞춤 식단', 'AI meal plans built with research in mind'),
  person: i('사람', 'People'),
  pet: i('반려동물', 'Pets'),
  prototypeBanner: i(
    '프로토타입입니다. AI·논문 검색은 연결되지 않았고, 모든 식단과 참고자료는 예시 데이터입니다.',
    'Prototype. No AI or paper search is connected; every plan and reference is example data.',
  ),

  // person form
  personFormTitle: i('나에게 맞는 식단 만들기', 'Build a plan that fits you'),
  bodyInfo: i('신체 정보', 'Body'),
  sex: i('성별', 'Sex'),
  male: i('남성', 'Male'),
  female: i('여성', 'Female'),
  age: i('나이', 'Age'),
  height: i('키 (cm)', 'Height (cm)'),
  weight: i('체중 (kg)', 'Weight (kg)'),
  goal: i('식사 목표', 'Goal'),
  activity: i('활동량', 'Activity'),
  preferences: i('선호와 제한', 'Preferences & limits'),
  likes: i('선호 식품', 'Foods you like'),
  dislikes: i('비선호 식품', 'Foods you avoid'),
  commaHint: i('쉼표로 구분 (예: 브로콜리, 연어)', 'Comma separated (e.g. broccoli, salmon)'),
  allergies: i('알레르기', 'Allergies'),
  budget: i('하루 예산 (원)', 'Daily budget (KRW)'),
  period: i('추천 주기', 'Plan period'),
  byDays: i('일수로', 'By days'),
  byWeekdays: i('요일로', 'By weekdays'),
  daysCount: i('일수', 'Days'),
  lunchbox: i('점심은 도시락으로 구성', 'Pack lunch as a lunchbox'),
  makePlan: i('식단 추천받기', 'Get my plan'),
  editInput: i('조건 수정', 'Edit inputs'),

  // pet
  petListTitle: i('내 반려동물', 'My pets'),
  addPet: i('반려동물 추가', 'Add a pet'),
  removePet: i('삭제', 'Remove'),
  petName: i('이름', 'Name'),
  species: i('종', 'Species'),
  ageYears: i('나이 (년)', 'Age (years)'),
  neutered: i('중성화 완료', 'Neutered / spayed'),
  health: i('건강 상태', 'Health'),
  traits: i('식이 특성', 'Eating habits'),
  traitsHint: i('예: 습식 선호, 빨리 먹음', 'e.g. prefers wet food, eats fast'),
  makePetPlan: i('이 아이 식단 추천받기', 'Get a plan for this pet'),
  noPets: i('등록된 반려동물이 없어요. 먼저 추가해 주세요.', 'No pets yet. Add one to start.'),
  separateNote: i('반려동물마다 조건과 식단이 따로 저장됩니다.', 'Each pet keeps its own inputs and plan.'),

  // results
  resultTitle: i('추천 결과', 'Your plan'),
  s1: i('추천 식단과 도시락 구성', 'Meals and lunchbox'),
  s1pet: i('식단 구성', 'Meal composition'),
  s2: i('제공량과 주요 영양정보', 'Portions and key nutrition'),
  s2pet: i('급여량과 주요 영양정보', 'Feeding amounts and key nutrition'),
  s3person: i('나에게 추천한 이유', 'Why this plan for you'),
  s3pet: i('이 아이에게 추천한 이유', 'Why this plan for your pet'),
  s4: i('반영된 조건과 제외한 식재료', 'Conditions applied and ingredients excluded'),
  s5: i('참고한 연구 및 자료 보기', 'View research and references'),
  s5hide: i('참고 자료 접기', 'Hide references'),
  change: i('변경', 'Swap'),
  alternatives: i('조건에 맞는 대안', 'Alternatives that fit your conditions'),
  noAlternatives: i('조건에 맞는 다른 메뉴가 없어요.', 'No other menu fits your conditions.'),
  close: i('닫기', 'Close'),
  select: i('선택', 'Choose'),
  dayTotal: i('하루 합계', 'Daily total'),
  target: i('목표', 'Target'),
  kcal: i('kcal', 'kcal'),
  protein: i('단백질', 'Protein'),
  carbs: i('탄수화물', 'Carbs'),
  fat: i('지방', 'Fat'),
  estCost: i('예상 비용(예시 가격)', 'Est. cost (example prices)'),
  conditions: i('반영된 조건', 'Applied'),
  excluded: i('제외한 식재료', 'Excluded'),
  none: i('없음', 'None'),
  photoNote: i('사진 자리 · 실제 음식 사진은 추후 연결', 'Photo placeholder · real food photos later'),
  lunchboxBadge: i('도시락', 'Lunchbox'),
  notes: i('꼭 확인하세요', 'Please note'),
  feeding: i('급여 방법', 'How to feed'),
  emptyResult: i('조건을 입력하고 추천을 받아보세요.', 'Enter your conditions to get a plan.'),

  // research
  researchIntro: i(
    '아래 자료는 모두 디자인 시안용 예시입니다. 실제 논문이 아니며, 실제 서비스에서는 검증된 자료만 표시합니다.',
    'All references below are design placeholders, not real papers. The real service will show verified sources only.',
  ),
  exampleBadge: i('예시', 'Example'),
  rTarget: i('대상', 'Subject'),
  rYear: i('발행 연도', 'Year'),
  rPublisher: i('출처', 'Source'),
  rLink: i('원문 링크', 'Original link'),
  rNoLink: i('예시 자료라 링크 없음', 'No link (example)'),
  rApplied: i('식단에 반영된 내용', 'What went into the plan'),
  rFinding: i('연구에서 확인한 내용', 'What the research found'),
  rAi: i('AI가 식단에 적용한 판단', 'How the AI applied it'),
  rScope: i('적용 범위', 'Applies to'),
  rLimits: i('한계', 'Limitations'),
  more: i('자세히', 'Details'),
  less: i('접기', 'Less'),
} as const;

export const GOALS: Record<Goal, L> = {
  lose: i('체중 감량', 'Lose weight'),
  maintain: i('체중 유지', 'Maintain'),
  gain: i('근육·체중 증가', 'Gain muscle/weight'),
  health: i('건강한 식습관', 'Eat healthier'),
};

export const ACTIVITIES: Record<Activity, L> = {
  low: i('적음', 'Low'),
  mid: i('보통', 'Moderate'),
  high: i('많음', 'High'),
};

export const PERSON_ALLERGENS: Record<PersonAllergen, L> = {
  egg: i('달걀', 'Egg'),
  milk: i('우유', 'Milk'),
  wheat: i('밀', 'Wheat'),
  soy: i('대두', 'Soy'),
  peanut: i('땅콩', 'Peanut'),
  treeNut: i('견과류', 'Tree nuts'),
  fish: i('생선', 'Fish'),
  shellfish: i('갑각류·조개', 'Shellfish'),
};

export const WEEKDAYS: Record<Weekday, L> = {
  mon: i('월', 'Mon'),
  tue: i('화', 'Tue'),
  wed: i('수', 'Wed'),
  thu: i('목', 'Thu'),
  fri: i('금', 'Fri'),
  sat: i('토', 'Sat'),
  sun: i('일', 'Sun'),
};

export const SPECIES: Record<Species, L> = {
  dog: i('강아지', 'Dog'),
  cat: i('고양이', 'Cat'),
};

export const LIFE_STAGES: Record<LifeStage, L> = {
  young: i('성장기', 'Growing'),
  adult: i('성년기', 'Adult'),
  senior: i('노령기', 'Senior'),
};

export const PET_HEALTH: Record<PetHealth, L> = {
  normal: i('건강함', 'Healthy'),
  overweight: i('과체중', 'Overweight'),
  sensitiveStomach: i('예민한 소화기', 'Sensitive stomach'),
  kidney: i('신장 관리 필요', 'Kidney care'),
  joint: i('관절 관리 필요', 'Joint care'),
};

export const PET_ALLERGENS: Record<PetAllergen, L> = {
  chicken: i('닭고기', 'Chicken'),
  beef: i('소고기', 'Beef'),
  fish: i('생선', 'Fish'),
  grain: i('곡물', 'Grain'),
  dairy: i('유제품', 'Dairy'),
  egg: i('달걀', 'Egg'),
};

export const SLOT_LABELS: Record<string, L> = {
  breakfast: i('아침', 'Breakfast'),
  lunch: i('점심', 'Lunch'),
  dinner: i('저녁', 'Dinner'),
  snack: i('간식', 'Snack'),
};
