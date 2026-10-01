// 종별 급여 안내. 개·고양이는 열량 계산(plan.ts), 그 외 종은 구성 비율 중심의 예시 안내.
// 개·고양이 외 수치는 일반적으로 알려진 사육 관행을 단순화한 값이며 원문과 대조하지 않았다 → 화면에 '예시'로 표시.
import type { Bi } from './data.ts'
import { petPlan, type Pet } from './plan.ts'

const b = (ko: string, en: string): Bi => ({ ko, en })

export type SpeciesId = 'dog' | 'cat' | 'rabbit' | 'guinea' | 'hamster' | 'ferret' | 'bird' | 'turtle' | 'other'

// young: 이 나이(년) 미만은 성장기, senior: 이 나이 이상은 노령기. 종·품종에 따라 차이가 큰 단순화.
export const SPECIES: { id: SpeciesId; name: Bi; emoji: string; young: number; senior: number }[] = [
  { id: 'dog', name: b('개', 'Dog'), emoji: '🐶', young: 1, senior: 7 },
  { id: 'cat', name: b('고양이', 'Cat'), emoji: '🐱', young: 1, senior: 11 },
  { id: 'rabbit', name: b('토끼', 'Rabbit'), emoji: '🐰', young: 0.6, senior: 6 },
  { id: 'guinea', name: b('기니피그', 'Guinea pig'), emoji: '🐹', young: 0.5, senior: 5 },
  { id: 'hamster', name: b('햄스터', 'Hamster'), emoji: '🐹', young: 0.25, senior: 1.5 },
  { id: 'ferret', name: b('페럿', 'Ferret'), emoji: '🦦', young: 1, senior: 4 },
  { id: 'bird', name: b('앵무새·소형 조류', 'Parrot / small bird'), emoji: '🦜', young: 1, senior: 999 },
  { id: 'turtle', name: b('거북·파충류', 'Turtle / reptile'), emoji: '🐢', young: 3, senior: 999 },
  { id: 'other', name: b('기타 (직접 입력)', 'Other (type in)'), emoji: '🐾', young: 0, senior: 999 },
]

export const speciesOf = (p: Pet) => SPECIES.find(s => s.id === p.species) ?? SPECIES[SPECIES.length - 1]
export const usesEnergyModel = (p: Pet) => p.species === 'dog' || p.species === 'cat'

type Line = { emoji: string; text: Bi }
export type Guide = {
  stage: 'young' | 'adult' | 'senior'
  stageName: Bi
  headline: Bi // 사진 아래 한 줄 요약
  lines: Line[] // 1) 급여 구성
  stats: { value: string; label: Bi }[] // 2) 급여량과 주요 정보
  reasons: Bi[] // 3) 추천 이유
  assumption: Bi // 수치의 가정·한계
  excluded: Bi[] // 알레르기로 제외한 단백질원
}

const g = (n: number) => Math.max(1, Math.round(n))
const WATER: Line = { emoji: '💧', text: b('깨끗한 물은 항상 마실 수 있게 해 주세요.', 'Keep fresh water available at all times.') }
const EXAMPLE = b(
  '개·고양이 외 종의 수치는 일반적으로 알려진 사육 관행을 단순화한 예시예요. 원문과 대조하지 않았으니 특수동물 진료 수의사에게 확인하세요.',
  'Numbers for species other than dogs and cats are examples simplified from common husbandry practice, not checked against sources. Confirm with an exotic-animal vet.',
)

export function petGuide(p: Pet): Guide {
  const sp = speciesOf(p)
  const r = petPlan(p) // 열량 수치는 개·고양이에만 사용, 단백질원 필터는 공통 사용
  const stage: Guide['stage'] = p.age < sp.young ? 'young' : p.age >= sp.senior ? 'senior' : 'adult'
  const young = stage === 'young'
  const kg = p.weight
  const gramsBW = kg * 1000
  const proteins: Line = {
    emoji: '🥩',
    text: b(`권장 단백질원: ${r.proteins.map(x => x.name.ko).join(', ')}`, `Suggested proteins: ${r.proteins.map(x => x.name.en).join(', ')}`),
  }
  const common = {
    stage,
    stageName: { young: b('성장기', 'Growing'), adult: b('성체', 'Adult'), senior: b('노령기', 'Senior') }[stage],
    assumption: EXAMPLE,
    excluded: r.excluded.map(x => x.name),
  }

  switch (sp.id) {
    case 'dog':
    case 'cat': {
      const dog = sp.id === 'dog'
      const per = (n: number) => Math.round(n / r.mealsPerDay)
      const food = [
        r.dryG > 0 && b(`건식 사료 ${r.dryG} g`, `Dry food ${r.dryG} g`),
        r.wetG > 0 && b(`습식 사료 ${r.wetG} g`, `Wet food ${r.wetG} g`),
      ].filter(Boolean) as Bi[]
      const perKo = [r.dryG > 0 && `건식 ${per(r.dryG)} g`, r.wetG > 0 && `습식 ${per(r.wetG)} g`].filter(Boolean).join(' + ')
      const perEn = [r.dryG > 0 && `dry ${per(r.dryG)} g`, r.wetG > 0 && `wet ${per(r.wetG)} g`].filter(Boolean).join(' + ')
      const stageName = {
        young: dog ? b('성장기 (퍼피)', 'Growth (puppy)') : b('성장기 (키튼)', 'Growth (kitten)'),
        adult: dog ? b('성견', 'Adult dog') : b('성묘', 'Adult cat'),
        senior: dog ? b('노령견', 'Senior dog') : b('노령묘', 'Senior cat'),
      }[r.stage]
      return {
        ...common,
        stage: r.stage,
        stageName,
        headline: b(food.map(f => f.ko).join(' + ') + ' / 하루', food.map(f => f.en).join(' + ') + ' / day'),
        lines: [
          ...food.map(f => ({ emoji: '🥣', text: b(`${f.ko} / 하루`, `${f.en} / day`) })),
          { emoji: '🍽️', text: b(`하루 ${r.mealsPerDay}회로 나눠서: 1회 ${perKo}`, `Split into ${r.mealsPerDay} meals: ${perEn} each`) },
          proteins,
          WATER,
        ],
        stats: [
          { value: String(r.kcal), label: b('하루 필요 열량 (kcal)', 'Daily energy (kcal)') },
          { value: String(r.rer), label: b('기초 필요량 RER (kcal)', 'Resting need RER (kcal)') },
          { value: `× ${r.factor}`, label: b('생애단계·활동 계수', 'Life-stage and activity factor') },
          { value: String(r.mealsPerDay), label: b('하루 급여 횟수', 'Meals per day') },
        ],
        reasons: [
          b(`체중 ${kg} kg의 기초 필요량에 ${stageName.ko} 기준 계수를 곱했어요.`, `Multiplied the resting need at ${kg} kg by a factor for: ${stageName.en}.`),
          r.stage === 'young'
            ? b('성장기라 소화 부담을 줄이려고 하루 3회로 나눴어요.', 'Growing animals get three smaller meals a day.')
            : b('하루 2회로 나눠 공복 시간을 고르게 했어요.', 'Two meals a day keep fasting gaps even.'),
        ],
        assumption: b(
          '사료 열량은 건식 3.5, 습식 0.9 kcal/g로 가정한 예시 값이에요. 실제 제품 라벨의 열량으로 다시 계산해야 해요.',
          'Assumes 3.5 kcal/g dry and 0.9 kcal/g wet as sample values. Recalculate with the actual product label.',
        ),
      }
    }

    case 'rabbit': {
      const pellets = young ? b('자율 급여', 'Free-fed') : b(`약 ${g(25 * kg)} g`, `~${g(25 * kg)} g`)
      const cups = Math.max(0.5, Math.round(kg * 2) / 2)
      return {
        ...common,
        headline: b(`건초 무제한 + 펠릿 ${pellets.ko}`, `Unlimited hay + pellets ${pellets.en}`),
        lines: [
          { emoji: '🌾', text: young ? b('알팔파 건초: 무제한', 'Alfalfa hay: unlimited') : b('티모시 등 목초 건초: 무제한 (식단의 대부분)', 'Grass hay such as timothy: unlimited (most of the diet)') },
          { emoji: '🥣', text: b(`펠릿: ${pellets.ko} / 하루`, `Pellets: ${pellets.en} / day`) },
          { emoji: '🥬', text: young ? b('잎채소: 소량부터 한 가지씩 천천히 시작', 'Leafy greens: introduce slowly, one at a time') : b(`잎채소: 약 ${cups}컵 / 하루`, `Leafy greens: ~${cups} cup(s) / day`) },
          { emoji: '🍎', text: b('과일·당근은 간식으로 아주 조금만', 'Fruit and carrot only as small treats') },
          WATER,
        ],
        stats: [
          { value: '∞', label: b('건초', 'Hay') },
          { value: young ? '∞' : `${g(25 * kg)} g`, label: b('펠릿 / 하루', 'Pellets / day') },
          { value: young ? '-' : String(cups), label: b('잎채소 (컵 / 하루)', 'Greens (cups / day)') },
        ],
        reasons: [
          b('토끼는 섬유질이 장 운동과 치아 마모에 꼭 필요해서 건초를 중심에 뒀어요.', 'Rabbits need fibre for gut movement and tooth wear, so hay is the centre of the diet.'),
          young ? b('성장기라 열량과 칼슘이 많은 알팔파와 펠릿을 넉넉히 잡았어요.', 'Growing rabbits get richer alfalfa and free pellets.') : b('성체는 비만을 막으려고 펠릿을 체중에 맞춰 제한했어요.', 'Adult pellets are limited by body weight to prevent obesity.'),
        ],
      }
    }

    case 'guinea':
      return {
        ...common,
        headline: b('건초 무제한 + 펠릿 약 25 g + 비타민 C', 'Unlimited hay + ~25 g pellets + vitamin C'),
        lines: [
          { emoji: '🌾', text: young ? b('건초: 무제한 (알팔파 섞어서)', 'Hay: unlimited (with some alfalfa)') : b('티모시 등 목초 건초: 무제한', 'Grass hay such as timothy: unlimited') },
          { emoji: '🥣', text: b('기니피그 전용 펠릿: 약 25 g / 하루', 'Guinea-pig pellets: ~25 g / day') },
          { emoji: '🫑', text: b('채소: 약 1컵 / 하루 (파프리카 등 비타민 C가 많은 것)', 'Vegetables: ~1 cup / day (vitamin-C-rich, e.g. bell pepper)') },
          { emoji: '💊', text: b(`비타민 C: 하루 약 ${g(10 * kg)}~${g(30 * kg)} mg`, `Vitamin C: ~${g(10 * kg)}–${g(30 * kg)} mg / day`) },
          WATER,
        ],
        stats: [
          { value: '∞', label: b('건초', 'Hay') },
          { value: '25 g', label: b('펠릿 / 하루', 'Pellets / day') },
          { value: `${g(10 * kg)}~${g(30 * kg)}`, label: b('비타민 C (mg / 하루)', 'Vitamin C (mg / day)') },
        ],
        reasons: [
          b('기니피그는 비타민 C를 몸에서 만들지 못해 먹이로 꼭 채워야 해요.', 'Guinea pigs cannot make vitamin C and must get it from food.'),
          b('섬유질을 위해 건초를 무제한으로 뒀어요.', 'Hay is unlimited for fibre.'),
        ],
      }

    case 'hamster': {
      const food = g(gramsBW * 0.08)
      return {
        ...common,
        headline: b(`햄스터 전용 사료 약 ${food} g / 하루`, `Hamster food ~${food} g / day`),
        lines: [
          { emoji: '🥣', text: b(`햄스터 전용 사료(펠릿·곡물 혼합): 약 ${food} g / 하루`, `Hamster pellets or seed mix: ~${food} g / day`) },
          { emoji: '🥕', text: b('채소: 손톱만 한 크기로 조금', 'Vegetables: a fingernail-sized piece') },
          { emoji: '🌙', text: b('야행성이라 저녁에 한 번 주는 게 좋아요.', 'Nocturnal, so feed once in the evening.') },
          WATER,
        ],
        stats: [
          { value: `${food} g`, label: b('사료 / 하루', 'Food / day') },
          { value: '1', label: b('하루 급여 횟수', 'Meals per day') },
        ],
        reasons: [
          b(`체중 ${g(gramsBW)} g의 약 8%를 하루 양으로 잡았어요.`, `Set the daily amount at about 8% of the ${g(gramsBW)} g body weight.`),
          b('볼주머니에 저장하는 습성이 있어 남긴 양을 보고 조절해야 해요.', 'Hamsters hoard food, so adjust by what is left over.'),
        ],
      }
    }

    case 'ferret': {
      const food = g(gramsBW * 0.06)
      return {
        ...common,
        headline: b(`고단백 사료 약 ${food} g / 하루`, `High-protein food ~${food} g / day`),
        lines: [
          { emoji: '🥣', text: b(`페럿 전용 고단백·고지방 사료: 약 ${food} g / 하루`, `Ferret high-protein, high-fat food: ~${food} g / day`) },
          { emoji: '🍽️', text: b('소화가 빨라서 조금씩 여러 번, 또는 자율 급여', 'Fast digestion: many small meals or free-feeding') },
          proteins,
          { emoji: '🚫', text: b('곡물·과일·당분은 피해 주세요.', 'Avoid grains, fruit and sugar.') },
          WATER,
        ],
        stats: [
          { value: `${food} g`, label: b('사료 / 하루', 'Food / day') },
          { value: '6%', label: b('체중 대비 하루 양', 'Daily amount vs. body weight') },
        ],
        reasons: [
          b('페럿은 육식동물이라 동물성 단백질과 지방 위주로 구성했어요.', 'Ferrets are carnivores, so the diet is animal protein and fat.'),
          b(`체중 ${kg} kg의 약 6%를 하루 양으로 잡았어요.`, `Set the daily amount at about 6% of the ${kg} kg body weight.`),
        ],
      }
    }

    case 'bird': {
      const total = gramsBW * 0.12
      return {
        ...common,
        headline: b(`펠릿 약 ${g(total * 0.7)} g + 채소·과일 약 ${g(total * 0.25)} g`, `Pellets ~${g(total * 0.7)} g + veg and fruit ~${g(total * 0.25)} g`),
        lines: [
          { emoji: '🥣', text: b(`조류 전용 펠릿: 약 ${g(total * 0.7)} g / 하루 (약 70%)`, `Bird pellets: ~${g(total * 0.7)} g / day (~70%)`) },
          { emoji: '🥦', text: b(`채소·과일: 약 ${g(total * 0.25)} g / 하루 (약 25%)`, `Vegetables and fruit: ~${g(total * 0.25)} g / day (~25%)`) },
          { emoji: '🌻', text: b('씨앗·견과: 간식으로 조금만 (약 5%)', 'Seeds and nuts: small treats only (~5%)') },
          { emoji: '🚫', text: b('아보카도, 초콜릿, 카페인은 주면 안 돼요.', 'Never give avocado, chocolate or caffeine.') },
          WATER,
        ],
        stats: [
          { value: `${g(total)} g`, label: b('하루 전체 양', 'Total / day') },
          { value: '70%', label: b('펠릿 비율', 'Pellet share') },
          { value: '2', label: b('하루 급여 횟수', 'Meals per day') },
        ],
        reasons: [
          b('씨앗만 먹이면 지방이 많고 영양이 치우쳐서 펠릿을 중심에 뒀어요.', 'Seed-only diets are fatty and unbalanced, so pellets are the base.'),
          b(`체중 ${g(gramsBW)} g의 약 12%를 하루 양으로 잡았어요. 종에 따라 차이가 커요.`, `Set the daily total at about 12% of the ${g(gramsBW)} g body weight. This varies a lot by species.`),
        ],
      }
    }

    case 'turtle':
      return {
        ...common,
        headline: young ? b('매일 1회, 머리 크기만큼', 'Once a day, a head-sized portion') : b('2~3일에 1회, 머리 크기만큼', 'Every 2–3 days, a head-sized portion'),
        lines: [
          { emoji: '🗓️', text: young ? b('급여 간격: 매일 1회', 'Schedule: once a day') : b('급여 간격: 2~3일에 1회', 'Schedule: once every 2–3 days') },
          { emoji: '🥣', text: b('한 번 양: 머리 크기 정도', 'Portion: about the size of the head') },
          { emoji: '🔎', text: b('초식·잡식·육식 여부가 종마다 달라요. 정확한 종을 먼저 확인하세요.', 'Herbivore, omnivore or carnivore depends on the species. Identify the exact species first.') },
          { emoji: '☀️', text: b('칼슘 보충과 자외선(UVB) 조명이 함께 필요해요.', 'Calcium supplementation and UVB lighting are needed together.') },
          WATER,
        ],
        stats: [
          { value: young ? '1' : '2~3', label: young ? b('하루 급여 횟수', 'Meals per day') : b('급여 간격 (일)', 'Days between meals') },
          { value: '-', label: b('g 단위 양: 종마다 달라 계산 안 함', 'Grams: not calculated, species-specific') },
        ],
        reasons: [
          b('파충류는 종에 따라 먹이가 완전히 달라서 g 수치 대신 간격과 양의 기준만 보여드려요.', 'Reptile diets differ completely by species, so only schedule and portion rules are shown, not grams.'),
          young ? b('성장기는 매일 먹여요.', 'Growing animals eat daily.') : b('성체는 과식하기 쉬워 간격을 뒀어요.', 'Adults overeat easily, so meals are spaced out.'),
        ],
      }

    default:
      return {
        ...common,
        stageName: b('단계 구분 없음', 'No stage data'),
        headline: b('이 종의 급여 자료가 아직 없어요', 'No feeding data for this species yet'),
        lines: [
          { emoji: '📋', text: b('입력한 정보는 저장해 두었어요. 종별 자료가 준비되면 급여 정보가 표시돼요.', 'Your entry is saved. Feeding info will appear once data for this species is added.') },
          { emoji: '🩺', text: b('그 전에는 특수동물 진료 수의사나 전문 사육 자료를 확인하세요.', 'Until then, check with an exotic-animal vet or a specialist care guide.') },
        ],
        stats: [{ value: '-', label: b('급여량: 자료 없음', 'Amount: no data') }],
        reasons: [b('근거 없이 수치를 만들지 않으려고 급여량을 비워 뒀어요.', 'The amount is left blank rather than made up without evidence.')],
      }
  }
}
