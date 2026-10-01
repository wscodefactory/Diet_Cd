// 목(mock) 데이터. 영양값·가격은 손으로 적은 근사값이며 실제 DB 연동은 docs/paid-items.md 참고.

export type Bi = { ko: string; en: string }
export type Role = 'staple' | 'main' | 'side'
export type Allergen = 'egg' | 'milk' | 'wheat' | 'soy' | 'nuts' | 'fish' | 'shellfish'

export const ALLERGENS: Record<Allergen, Bi> = {
  egg: { ko: '달걀', en: 'Egg' },
  milk: { ko: '우유', en: 'Milk' },
  wheat: { ko: '밀', en: 'Wheat' },
  soy: { ko: '대두', en: 'Soy' },
  nuts: { ko: '견과류', en: 'Nuts' },
  fish: { ko: '생선', en: 'Fish' },
  shellfish: { ko: '갑각류', en: 'Shellfish' },
}

export type Item = {
  id: string
  role: Role
  name: Bi
  emoji: string
  g: number // 기준 제공량(g)
  kcal: number
  p: number
  c: number
  f: number
  price: number // 원, 가상 가격
  allergens: Allergen[]
}

const it = (
  id: string, role: Role, ko: string, en: string, emoji: string,
  g: number, kcal: number, p: number, c: number, f: number, price: number,
  allergens: Allergen[] = [],
): Item => ({ id, role, name: { ko, en }, emoji, g, kcal, p, c, f, price, allergens })

export const ITEMS: Item[] = [
  it('brown-rice', 'staple', '현미밥', 'Brown rice', '🍚', 150, 230, 5, 48, 2, 800),
  it('multigrain', 'staple', '잡곡밥', 'Multigrain rice', '🍚', 150, 225, 5, 47, 1.5, 800),
  it('sweet-potato', 'staple', '고구마', 'Sweet potato', '🍠', 150, 190, 2, 45, 0.3, 1000),
  it('wheat-bread', 'staple', '통밀빵', 'Whole-wheat bread', '🍞', 70, 180, 7, 33, 2.5, 1200, ['wheat']),
  it('soba', 'staple', '메밀국수', 'Soba noodles', '🍜', 180, 230, 9, 46, 1, 1500, ['wheat']),

  it('chicken', 'main', '닭가슴살 구이', 'Grilled chicken breast', '🍗', 120, 180, 35, 0, 4, 2500),
  it('salmon', 'main', '연어 구이', 'Grilled salmon', '🐟', 100, 210, 21, 0, 13, 4500, ['fish']),
  it('tofu-steak', 'main', '두부 스테이크', 'Tofu steak', '🧈', 150, 170, 15, 5, 10, 1800, ['soy']),
  it('bulgogi', 'main', '소불고기', 'Beef bulgogi', '🥩', 100, 220, 18, 8, 13, 4000, ['soy', 'wheat']),
  it('omelet', 'main', '달걀말이', 'Rolled omelet', '🍳', 100, 160, 11, 2, 12, 1200, ['egg']),
  it('shrimp', 'main', '새우 볶음', 'Stir-fried shrimp', '🍤', 100, 130, 20, 4, 3, 3800, ['shellfish']),
  it('pork', 'main', '돼지 안심 수육', 'Boiled pork tenderloin', '🍖', 100, 150, 24, 0, 5, 2800),
  it('mackerel', 'main', '고등어 구이', 'Grilled mackerel', '🐟', 100, 230, 20, 0, 16, 3000, ['fish']),
  it('chickpea', 'main', '병아리콩 샐러드', 'Chickpea salad', '🥗', 150, 200, 10, 28, 5, 2200),

  it('broccoli', 'side', '브로콜리 찜', 'Steamed broccoli', '🥦', 80, 28, 2.5, 5, 0.3, 700),
  it('spinach', 'side', '시금치 나물', 'Seasoned spinach', '🥬', 80, 40, 3, 4, 2, 600),
  it('tomato', 'side', '방울토마토', 'Cherry tomatoes', '🍅', 100, 18, 1, 4, 0.2, 900),
  it('kimchi', 'side', '김치', 'Kimchi', '🌶️', 50, 15, 1, 3, 0.2, 400, ['fish', 'shellfish']),
  it('mushroom', 'side', '버섯 볶음', 'Sautéed mushrooms', '🍄', 80, 45, 3, 6, 2, 900),
  it('yogurt', 'side', '그릭요거트', 'Greek yogurt', '🥛', 100, 100, 9, 4, 5, 1500, ['milk']),
  it('nuts', 'side', '견과류 한 줌', 'Handful of nuts', '🥜', 20, 120, 4, 4, 10, 800, ['nuts']),
  it('boiled-egg', 'side', '삶은 달걀', 'Boiled egg', '🥚', 50, 75, 6, 0.5, 5, 500, ['egg']),
  it('carrot', 'side', '당근 라페', 'Carrot rapé', '🥕', 70, 50, 0.7, 7, 2.5, 700),
  it('apple', 'side', '사과 반 개', 'Half an apple', '🍎', 100, 55, 0.3, 14, 0.2, 900),
  it('tofu-soup', 'side', '두부 된장국', 'Tofu soybean-paste soup', '🍲', 200, 70, 6, 5, 3, 800, ['soy']),
]

// ---- 반려동물 ----
export type PetAllergen = 'chicken' | 'beef' | 'fish' | 'dairy' | 'grain'

export const PET_ALLERGENS: Record<PetAllergen, Bi> = {
  chicken: { ko: '닭고기', en: 'Chicken' },
  beef: { ko: '소고기', en: 'Beef' },
  fish: { ko: '생선', en: 'Fish' },
  dairy: { ko: '유제품', en: 'Dairy' },
  grain: { ko: '곡물', en: 'Grain' },
}

export const PROTEINS: { name: Bi; allergen?: PetAllergen }[] = [
  { name: { ko: '닭고기', en: 'Chicken' }, allergen: 'chicken' },
  { name: { ko: '소고기', en: 'Beef' }, allergen: 'beef' },
  { name: { ko: '연어', en: 'Salmon' }, allergen: 'fish' },
  { name: { ko: '양고기', en: 'Lamb' } },
  { name: { ko: '오리고기', en: 'Duck' } },
  { name: { ko: '칠면조', en: 'Turkey' } },
]

// ---- 참고 자료 ----
// 모두 실제로 존재하는 것으로 알려진 기관 자료·논문이지만, 이 프로토타입에서는 원문을 다시 대조하지 않았다.
// 그래서 화면에 전부 '예시' 배지를 붙인다. 신뢰도 점수 같은 임의 수치는 넣지 않는다.
export type Ref = {
  id: string
  target: 'human' | 'animal'
  species?: string[] // 동물 자료가 해당하는 종. 없으면 전체
  title: string
  year: string
  source: Bi
  url: string
  applied: Bi // 식단에 반영된 내용
  confirmed: Bi // 자료에서 확인한 내용
  ai: Bi // AI(프로토타입 규칙)의 판단
  limits: Bi // 적용 범위와 한계
}

export const REFS: Ref[] = [
  {
    id: 'mifflin',
    target: 'human',
    title: 'A new predictive equation for resting energy expenditure in healthy individuals',
    year: '1990',
    source: { ko: 'Mifflin MD 외, The American Journal of Clinical Nutrition 51(2)', en: 'Mifflin MD et al., The American Journal of Clinical Nutrition 51(2)' },
    url: 'https://pubmed.ncbi.nlm.nih.gov/2305711/',
    applied: { ko: '키·체중·나이·성별로 기초대사량을 계산해 하루 목표 칼로리의 출발점으로 썼어요.', en: 'Used height, weight, age and sex to estimate resting energy as the starting point for the daily calorie target.' },
    confirmed: { ko: '건강한 성인의 안정 시 에너지 소비량을 체중·키·나이·성별로 추정하는 식을 제시했어요.', en: 'Proposes an equation estimating resting energy expenditure of healthy adults from weight, height, age and sex.' },
    ai: { ko: '활동량 계수(1.2 / 1.55 / 1.725)와 목표별 가감(감량 −400, 증량 +300 kcal)은 이 논문이 아니라 프로토타입이 정한 값이에요.', en: 'The activity multipliers (1.2 / 1.55 / 1.725) and goal adjustments (−400 / +300 kcal) are set by this prototype, not by the paper.' },
    limits: { ko: '건강한 성인 기준의 추정식이라 개인 오차가 있어요. 청소년, 임신·수유 중, 질환이 있는 경우엔 맞지 않을 수 있어요.', en: 'An estimate for healthy adults with individual error. May not fit adolescents, pregnancy or lactation, or medical conditions.' },
  },
  {
    id: 'kdris',
    target: 'human',
    title: '2020 한국인 영양소 섭취기준 (Dietary Reference Intakes for Koreans 2020)',
    year: '2020',
    source: { ko: '보건복지부 · 한국영양학회', en: 'Ministry of Health and Welfare · The Korean Nutrition Society' },
    url: 'https://www.kns.or.kr/',
    applied: { ko: '탄수화물·단백질·지방의 에너지 비율을 권장 범위 안에서 잡았어요.', en: 'Set the carbohydrate, protein and fat energy shares inside the recommended ranges.' },
    confirmed: { ko: '성인의 에너지적정비율을 탄수화물 55~65%, 단백질 7~20%, 지방 15~30%로 제시해요.', en: 'Gives adult energy distribution ranges of 55–65% carbohydrate, 7–20% protein and 15–30% fat.' },
    ai: { ko: '범위 안에서 목표별로 어느 지점을 고를지(예: 감량 시 단백질 20%)는 프로토타입의 판단이에요.', en: 'Which point inside the range to pick per goal (e.g. 20% protein for weight loss) is the prototype’s judgment.' },
    limits: { ko: '건강한 인구 집단을 위한 기준이에요. 개인 치료식이나 질환 관리에는 그대로 쓸 수 없어요. 링크는 기관 홈페이지예요.', en: 'A reference for healthy populations, not for therapeutic diets. The link points to the institution home page.' },
  },
  {
    id: 'who',
    target: 'human',
    title: 'Healthy diet (Fact sheet)',
    year: '2020',
    source: { ko: '세계보건기구(WHO)', en: 'World Health Organization' },
    url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet',
    applied: { ko: '끼니마다 채소·과일 반찬을 넣는 구성 원칙에 반영했어요.', en: 'Reflected in the rule that every meal includes vegetable or fruit sides.' },
    confirmed: { ko: '하루 채소·과일 400 g 이상, 지방은 총에너지의 30% 미만, 소금은 5 g 미만을 권고해요.', en: 'Recommends at least 400 g of fruit and vegetables a day, fat under 30% of energy and salt under 5 g.' },
    ai: { ko: '한 끼에 반찬을 몇 개, 몇 g 넣을지는 프로토타입이 정했어요.', en: 'How many sides and how many grams per meal is decided by the prototype.' },
    limits: { ko: '일반 인구를 위한 권고예요. 현재 식단의 나트륨 양은 계산하지 않아요.', en: 'General population advice. This prototype does not calculate sodium.' },
  },
  {
    id: 'wsava',
    target: 'animal',
    species: ['dog', 'cat'],
    title: 'WSAVA Nutritional Assessment Guidelines',
    year: '2011',
    source: { ko: '세계소동물수의사회(WSAVA) Global Nutrition Committee', en: 'WSAVA Global Nutrition Committee' },
    url: 'https://wsava.org/global-guidelines/global-nutrition-guidelines/',
    applied: { ko: '나이·체중·활동량·건강상태·식이를 개체별로 입력받아 따로 관리하는 구조에 반영했어요.', en: 'Reflected in collecting age, weight, activity, health and diet per animal and managing each individually.' },
    confirmed: { ko: '동물, 식이, 급여 관리 요인을 개체마다 평가하고, 진료 때마다 영양 평가를 하도록 권고해요.', en: 'Recommends assessing animal, diet and feeding-management factors per patient at every visit.' },
    ai: { ko: '급여량은 흔히 쓰이는 식(RER = 70 × 체중^0.75)에 생애단계 계수를 곱한 출발값이며, 계수 선택은 프로토타입의 판단이에요.', en: 'The amount is a starting value from the commonly used RER = 70 × BW^0.75 times a life-stage factor; the factor choice is the prototype’s judgment.' },
    limits: { ko: '수의사의 평가를 돕는 지침이지 대체가 아니에요. 개체차가 커서 체중 변화를 보며 조정해야 해요.', en: 'Supports, not replaces, veterinary assessment. Individual variation is large; adjust by weight trend.' },
  },
  {
    id: 'aafco',
    target: 'animal',
    species: ['dog', 'cat'],
    title: 'AAFCO Dog and Cat Food Nutrient Profiles',
    year: '2016 (개정 프로필)',
    source: { ko: '미국사료관리협회(AAFCO) Official Publication', en: 'Association of American Feed Control Officials, Official Publication' },
    url: 'https://www.aafco.org/',
    applied: { ko: '종과 생애단계(성장기 / 성견·성묘)를 나눠 자료와 급여 안내를 구분했어요.', en: 'Used to separate guidance by species and life stage (growth vs. adult maintenance).' },
    confirmed: { ko: '성장·번식기와 성체 유지기의 영양 기준을 따로 둬요. 건물 기준 조단백 최소치는 개 18%(성장기 22.5%), 고양이 26%(성장기 30%)예요.', en: 'Sets separate profiles for growth/reproduction and adult maintenance. Minimum crude protein (dry matter): dogs 18% (growth 22.5%), cats 26% (growth 30%).' },
    ai: { ko: '노령기를 따로 구분한 것(개 7세, 고양이 11세 이상)은 이 자료가 아니라 프로토타입의 구분이에요.', en: 'Treating seniors separately (dogs 7+, cats 11+) is the prototype’s grouping, not from this source.' },
    limits: { ko: '사료 제품의 영양 기준이지 개체별 급여량 기준이 아니에요. 링크는 기관 홈페이지예요.', en: 'A standard for pet food products, not individual feeding amounts. The link points to the institution home page.' },
  },
  {
    id: 'nrc',
    target: 'animal',
    species: ['dog', 'cat'],
    title: 'Nutrient Requirements of Dogs and Cats',
    year: '2006',
    source: { ko: 'National Research Council, The National Academies Press', en: 'National Research Council, The National Academies Press' },
    url: 'https://nap.nationalacademies.org/catalog/10668/nutrient-requirements-of-dogs-and-cats',
    applied: { ko: '체중에 비례하지 않고 대사체중(체중^0.75)으로 에너지 필요량을 잡는 방식에 반영했어요.', en: 'Reflected in scaling energy needs by metabolic body weight (BW^0.75) rather than linearly.' },
    confirmed: { ko: '개와 고양이의 에너지·영양소 요구량을 생애단계와 생리 상태별로 정리한 참고서예요.', en: 'A reference compiling energy and nutrient requirements of dogs and cats by life stage and physiological state.' },
    ai: { ko: '사료 칼로리 밀도(건식 3.5, 습식 0.9 kcal/g)는 가정값이에요. 실제 제품 라벨 값으로 바꿔야 해요.', en: 'Food energy density (dry 3.5, wet 0.9 kcal/g) is an assumption; replace with the actual product label.' },
    limits: { ko: '건강한 동물 기준이에요. 신장·소화기 등 질환이 있으면 처방식과 수의사 지시가 우선이에요.', en: 'For healthy animals. With kidney, GI or other disease, prescription diets and veterinary advice come first.' },
  },
  {
    id: 'msd',
    target: 'animal',
    species: ['rabbit', 'guinea', 'hamster', 'ferret', 'bird', 'turtle', 'other'],
    title: 'MSD Veterinary Manual — Exotic and Laboratory Animals',
    year: '온라인판 (수시 개정)',
    source: { ko: 'Merck & Co. (MSD Veterinary Manual)', en: 'Merck & Co. (MSD Veterinary Manual)' },
    url: 'https://www.msdvetmanual.com/exotic-and-laboratory-animals',
    applied: { ko: '종마다 먹이 구성이 다르다는 점을 반영해 토끼·기니피그·햄스터·페럿·조류·파충류를 따로 안내했어요.', en: 'Reflected in giving separate guidance for rabbits, guinea pigs, hamsters, ferrets, birds and reptiles.' },
    confirmed: { ko: '토끼, 설치류, 페럿, 조류, 파충류 등의 사육과 영양 관리를 종별로 다루는 수의학 참고서예요.', en: 'A veterinary reference covering husbandry and nutrition of rabbits, rodents, ferrets, birds and reptiles by species.' },
    ai: { ko: '화면의 g·% 수치(예: 펠릿 체중 1 kg당 25 g, 체중의 6~12%)는 일반적으로 알려진 사육 관행을 프로토타입이 단순화한 값이에요. 이 자료의 수치와 대조하지 않았어요.', en: 'The gram and percent figures on screen (e.g. 25 g pellets per kg, 6–12% of body weight) are the prototype’s simplification of common husbandry practice, not checked against this source.' },
    limits: { ko: '같은 분류 안에서도 종에 따라 먹이가 크게 달라요. 특수동물 진료 수의사의 확인이 필요해요. 링크는 해당 섹션 첫 페이지예요.', en: 'Diets vary widely between species within a group. Confirm with an exotic-animal vet. The link points to the section landing page.' },
  },
  {
    id: 'nrc-lab',
    target: 'animal',
    species: ['guinea', 'hamster'],
    title: 'Nutrient Requirements of Laboratory Animals, Fourth Revised Edition',
    year: '1995',
    source: { ko: 'National Research Council, The National Academies Press', en: 'National Research Council, The National Academies Press' },
    url: 'https://nap.nationalacademies.org/catalog/4758/nutrient-requirements-of-laboratory-animals-fourth-revised-edition-1995',
    applied: { ko: '기니피그에게 비타민 C를 따로 챙기도록 한 안내에 반영했어요.', en: 'Reflected in the reminder to provide vitamin C for guinea pigs.' },
    confirmed: { ko: '기니피그, 햄스터 등 설치류의 영양소 요구량을 정리한 참고서이며, 기니피그는 먹이로 비타민 C를 섭취해야 해요.', en: 'A reference on nutrient requirements of rodents including guinea pigs and hamsters; guinea pigs require dietary vitamin C.' },
    ai: { ko: '하루 체중 1 kg당 10~30 mg이라는 범위는 프로토타입이 쓴 예시 값이에요.', en: 'The 10–30 mg per kg per day range is an example value used by the prototype.' },
    limits: { ko: '실험동물 사육 조건을 기준으로 한 자료라 가정의 반려동물과 조건이 다를 수 있어요.', en: 'Based on laboratory conditions, which may differ from household pets.' },
  },
]
