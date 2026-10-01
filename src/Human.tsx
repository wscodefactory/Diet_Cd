import { useRef, useState } from 'react'
import { ALLERGENS, ITEMS, type Allergen } from './data.ts'
import {
  SLOTS, WEEKDAYS, alternatives, buildPlan, grams, humanTarget, isExcluded, mealTotals, pickMeal,
  type DayPlan, type Human as H,
} from './plan.ts'
import { Chips, Evidence, Field, Num, Photo, Section, Seg, Text, useLocal, useT } from './ui.tsx'

const INIT: H = {
  sex: 'f', age: 30, height: 165, weight: 60, goal: 'keep', activity: 'mid',
  likes: '', dislikes: '', allergies: [], budget: 8000, mode: 'days', days: 3, weekdays: [0, 1, 2, 3, 4],
}

export default function Human() {
  const t = useT()
  const [h, setH] = useLocal<H>('diet.human', INIT)
  const set = (patch: Partial<H>) => setH({ ...h, ...patch })
  // 추천받은 시점의 조건과 식단을 함께 보관 (입력을 고쳐도 결과가 멋대로 바뀌지 않게)
  const [res, setRes] = useState<{ h: H; plan: DayPlan[] } | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const valid = h.age > 0 && h.height > 0 && h.weight > 0 && h.budget > 0 && (h.mode === 'days' ? h.days >= 1 : h.weekdays.length > 0)

  const submit = () => {
    setRes({ h, plan: buildPlan(h) })
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 0)
  }

  return (
    <>
      <div className="intro">
        <h1>{t('나에게 맞는 식단과 도시락', 'Meals and lunch boxes that fit you')}</h1>
        <p>{t('조건을 입력하면 주기별 식단을 구성해 드려요.', 'Enter your conditions to get a plan for your period.')}</p>
      </div>

      <Section title={t('신체 정보와 목표', 'Body and goal')}>
        <div className="form">
          <Field label={t('성별', 'Sex')}>
            <Seg value={h.sex} onChange={sex => set({ sex })} options={[['f', t('여성', 'Female')], ['m', t('남성', 'Male')]]} />
          </Field>
          <Num label={t('나이', 'Age')} value={h.age} min={1} max={120} onChange={age => set({ age })} />
          <Num label={t('키 (cm)', 'Height (cm)')} value={h.height} min={50} max={250} onChange={height => set({ height })} />
          <Num label={t('체중 (kg)', 'Weight (kg)')} value={h.weight} min={10} max={300} step={0.1} onChange={weight => set({ weight })} />
          <Field label={t('식사 목표', 'Goal')} wide>
            <Seg value={h.goal} onChange={goal => set({ goal })}
              options={[['loss', t('체중 감량', 'Lose weight')], ['keep', t('유지', 'Maintain')], ['gain', t('근육·체중 증가', 'Gain')]]} />
          </Field>
          <Field label={t('활동량', 'Activity')} wide>
            <Seg value={h.activity} onChange={activity => set({ activity })}
              options={[['low', t('적음 (주로 앉아서)', 'Low (mostly sitting)')], ['mid', t('보통 (주 3~5회 운동)', 'Moderate (3–5×/wk)')], ['high', t('많음 (매일 운동)', 'High (daily)')]]} />
          </Field>
        </div>
      </Section>

      <Section title={t('식품 조건과 예산', 'Food conditions and budget')}>
        <div className="form">
          <Text wide label={t('선호 식품 (쉼표로 구분)', 'Liked foods (comma-separated)')} value={h.likes} placeholder={t('예: 연어, 고구마', 'e.g. salmon, sweet potato')} onChange={likes => set({ likes })} />
          <Text wide label={t('비선호 식품 (쉼표로 구분)', 'Disliked foods (comma-separated)')} value={h.dislikes} placeholder={t('예: 버섯, 김치', 'e.g. mushroom, kimchi')} onChange={dislikes => set({ dislikes })} />
          <Field label={t('알레르기', 'Allergies')} wide>
            <Chips value={h.allergies} onChange={allergies => set({ allergies })}
              options={(Object.keys(ALLERGENS) as Allergen[]).map(a => [a, t(ALLERGENS[a])])} />
          </Field>
          <Num label={t('한 끼 예산 (원)', 'Budget per meal (KRW)')} value={h.budget} min={1000} step={500} onChange={budget => set({ budget })} />
        </div>
      </Section>

      <Section title={t('추천 주기', 'Period')}>
        <div className="form">
          <Field label={t('방식', 'Mode')} wide>
            <Seg value={h.mode} onChange={mode => set({ mode })} options={[['days', t('일수로', 'By days')], ['weekdays', t('요일로', 'By weekdays')]]} />
          </Field>
          {h.mode === 'days' ? (
            <Num label={t('일수 (1~14)', 'Days (1–14)')} value={h.days} min={1} max={14} onChange={days => set({ days: Math.min(14, days) })} />
          ) : (
            <Field label={t('요일 선택', 'Weekdays')} wide>
              <Chips value={h.weekdays} onChange={weekdays => set({ weekdays })} options={WEEKDAYS.map((w, i) => [i, t(w)])} />
            </Field>
          )}
        </div>
      </Section>

      <button className="btn block" disabled={!valid} onClick={submit}>
        {t('식단 추천 받기', 'Get my plan')}
      </button>

      <div ref={resultRef} style={{ scrollMarginTop: 70, display: 'grid', gap: 16 }}>
        {res && <Result h={res.h} plan={res.plan} setPlan={plan => setRes({ h: res.h, plan })} />}
      </div>
    </>
  )
}

function Result({ h, plan, setPlan }: { h: H; plan: DayPlan[]; setPlan: (p: DayPlan[]) => void }) {
  const t = useT()
  const [day, setDay] = useState(0)
  const [open, setOpen] = useState<string | null>(null) // 대안을 펼친 구성: "끼니-순서"
  const [seed, setSeed] = useState(1)
  const d = Math.min(day, plan.length - 1)
  const target = humanTarget(h)
  const meals = plan[d].meals
  const totals = meals.map(m => mealTotals(m, target.kcal))
  const sum = (k: 'kcal' | 'p' | 'c' | 'f' | 'price') => totals.reduce((s, x) => s + x[k], 0)
  const excluded = ITEMS.filter(i => isExcluded(h, i))

  const replaceMeal = (s: number, items: DayPlan['meals'][number]['items']) => {
    setPlan(plan.map((dp, i) => (i !== d ? dp : { ...dp, meals: dp.meals.map((m, j) => (j !== s ? m : { ...m, items })) })))
    setOpen(null)
  }

  const goalText = { loss: t('체중 감량', 'Lose weight'), keep: t('유지', 'Maintain'), gain: t('증가', 'Gain') }[h.goal]
  const actText = { low: t('활동 적음', 'Low activity'), mid: t('활동 보통', 'Moderate activity'), high: t('활동 많음', 'High activity') }[h.activity]
  const delta = target.kcal - target.tdee

  return (
    <>
      <Seg label={t('날짜', 'Day')} value={String(d)} onChange={v => { setDay(Number(v)); setOpen(null) }}
        options={plan.map((dp, i) => [String(i), t(dp.label)])} />

      {/* 음식 사진과 구성을 먼저 */}
      <div className="photos">
        {meals.map(m => (
          <Photo key={m.slot} emojis={m.items.map(i => i.emoji)} title={t(SLOTS[m.slot].name)} caption={m.items.map(i => t(i.name)).join(' · ')} />
        ))}
      </div>

      <Section no={1} title={t('추천 식단과 도시락 구성', 'Recommended meals and lunch box')}>
        {meals.map((m, s) => (
          <div className="meal" key={s}>
            <div className="meal-head">
              <h3>{t(SLOTS[s].name)}</h3>
              <button className="btn ghost small" onClick={() => { replaceMeal(s, pickMeal(h, d, s, seed).items); setSeed(seed + 1) }}>
                {t('메뉴 전체 바꾸기', 'Swap whole meal')}
              </button>
            </div>
            <ul className="rows">
              {m.items.map((it, k) => {
                const key = `${s}-${k}`
                const alts = open === key ? alternatives(h, m, k) : []
                return (
                  <li key={it.id}>
                    <span>{it.emoji}</span>
                    <span className="grow">{t(it.name)} <span className="muted">{grams(it, totals[s].factor)} g</span></span>
                    <button className="btn ghost small" aria-expanded={open === key} onClick={() => setOpen(open === key ? null : key)}>
                      {t('변경', 'Change')}
                    </button>
                    {open === key && (
                      <div className="alts">
                        {alts.length ? (
                          <>
                            <span>{t('알레르기·비선호·예산 조건에 맞는 대안이에요.', 'Alternatives that fit your allergy, dislike and budget conditions.')}</span>
                            <div className="chips">
                              {alts.map(a => (
                                <button key={a.id} className="chip" onClick={() => replaceMeal(s, m.items.map((x, j) => (j === k ? a : x)))}>
                                  {a.emoji} {t(a.name)} · {a.kcal} kcal
                                </button>
                              ))}
                            </div>
                          </>
                        ) : (
                          <span>{t('조건에 맞는 대안이 없어요. 예산이나 제외 조건을 조정해 보세요.', 'No alternative fits. Try adjusting budget or exclusions.')}</span>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
            {totals[s].price > h.budget && (
              <p className="warn">{t('조건에 맞는 식품만으로는 예산을 맞추지 못했어요.', 'Could not meet the budget with eligible foods.')}</p>
            )}
          </div>
        ))}
      </Section>

      <Section no={2} title={t('제공량과 주요 영양정보', 'Portions and key nutrition')}>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>{t('끼니', 'Meal')}</th><th>kcal</th><th>{t('탄수화물', 'Carbs')}</th><th>{t('단백질', 'Protein')}</th><th>{t('지방', 'Fat')}</th><th>{t('가격', 'Price')}</th>
              </tr>
            </thead>
            <tbody>
              {totals.map((x, s) => (
                <tr key={s}>
                  <td>{t(SLOTS[s].name)}</td><td>{x.kcal}</td><td>{x.c} g</td><td>{x.p} g</td><td>{x.f} g</td><td>₩{x.price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>{t('하루 합계', 'Daily total')}</td><td>{sum('kcal')}</td><td>{sum('c')} g</td><td>{sum('p')} g</td><td>{sum('f')} g</td><td>₩{sum('price').toLocaleString()}</td>
              </tr>
              <tr>
                <td>{t('하루 목표', 'Daily target')}</td><td>{target.kcal}</td>
                <td>{Math.round((target.kcal * target.ratio.c) / 400)} g</td>
                <td>{Math.round((target.kcal * target.ratio.p) / 400)} g</td>
                <td>{Math.round((target.kcal * target.ratio.f) / 900)} g</td><td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>
          {t('영양값과 가격은 예시 값이에요. 구성별 제공량(g)은 위 1번에 표시돼요.', 'Nutrition and prices are sample values. Portions (g) per item are shown in section 1.')}
        </p>
      </Section>

      <Section no={3} title={t('추천 이유', 'Why this plan')}>
        <ul className="reasons">
          <li>
            {t(
              `하루 소비량 약 ${target.tdee} kcal에서 ${goalText} 목표에 맞춰 ${delta === 0 ? '그대로' : (delta > 0 ? '+' : '') + delta + ' kcal 조정해'} ${target.kcal} kcal로 잡았어요.`,
              `From about ${target.tdee} kcal burned per day, ${delta === 0 ? 'kept as is' : `adjusted ${delta > 0 ? '+' : ''}${delta} kcal`} for your goal: ${target.kcal} kcal.`,
            )}
          </li>
          <li>
            {t(
              `탄수화물 ${target.ratio.c} : 단백질 ${target.ratio.p} : 지방 ${target.ratio.f} 비율을 목표로 했어요.`,
              `Aimed for carbs ${target.ratio.c} : protein ${target.ratio.p} : fat ${target.ratio.f}.`,
            )}
          </li>
          <li>{t('끼니마다 주식, 단백질 반찬, 채소·과일 반찬을 함께 넣었어요.', 'Each meal pairs a staple, a protein dish and vegetable or fruit sides.')}</li>
        </ul>
      </Section>

      <Section no={4} title={t('반영된 조건과 제외 식재료', 'Applied conditions and excluded foods')}>
        <div className="chips">
          <span className="chip soft">{goalText}</span>
          <span className="chip soft">{actText}</span>
          <span className="chip soft">{t(`한 끼 ₩${h.budget.toLocaleString()} 이내`, `≤ ₩${h.budget.toLocaleString()} per meal`)}</span>
          {h.allergies.map(a => <span key={a} className="chip soft">{t(`${ALLERGENS[a].ko} 알레르기`, `${ALLERGENS[a].en} allergy`)}</span>)}
          {h.likes.trim() && <span className="chip soft">{t('선호', 'Likes')}: {h.likes}</span>}
        </div>
        <p className="muted" style={{ margin: '12px 0 6px' }}>{t('제외한 식재료', 'Excluded foods')}</p>
        <div className="chips">
          {excluded.length ? excluded.map(i => <span key={i.id} className="chip out">{t(i.name)}</span>) : <span className="muted">{t('없음', 'None')}</span>}
        </div>
      </Section>

      <Evidence target="human" />
      <p className="muted">{t('이 식단은 참고용이며 의학적 진단이나 치료를 대신하지 않아요.', 'This plan is for reference and does not replace medical advice.')}</p>
    </>
  )
}
