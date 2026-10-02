import { speciesOf } from './pet.ts'
import type { Human as H, Pet as P } from './plan.ts'
import { useT } from './ui.tsx'

type Target = 'human' | 'pet'

// 각 화면이 useLocal로 저장한 입력값을 읽기만 함 (없으면 아직 입력 전)
function read<T>(key: string): T | null {
  try {
    const s = localStorage.getItem(key)
    return s ? (JSON.parse(s) as T) : null
  } catch {
    return null
  }
}

// 결과 화면의 접시(Hero)와 같은 모양: 가운데를 비우고 둘레에 음식을 놓음
function Plate({ emojis }: { emojis: string[] }) {
  return (
    <span className="plate" aria-hidden="true">
      {emojis.map((e, i) => {
        const a = (i / emojis.length) * Math.PI * 2 - Math.PI / 2
        return <span key={i} style={{ left: `${50 + Math.cos(a) * 30}%`, top: `${50 + Math.sin(a) * 30}%` }}>{e}</span>
      })}
    </span>
  )
}

/** 로그인 후 첫 화면: 사람/반려동물 식단으로 들어가는 도시락 통 */
export default function Home({ userId, onGo }: { userId: string; onGo: (m: Target) => void }) {
  const t = useT()
  const h = read<H>('diet.human')
  const pets = read<{ pets: P[] }>('diet.pets')?.pets ?? []

  const goal = h && { loss: t('체중 감량', 'Lose weight'), keep: t('유지', 'Maintain'), gain: t('근육·체중 증가', 'Gain') }[h.goal]
  const period = h && (h.mode === 'days' ? t(`${h.days}일`, `${h.days} days`) : t(`요일 ${h.weekdays.length}개`, `${h.weekdays.length} weekdays`))

  return (
    <>
      <div className="intro">
        <h1>{t(`${userId}님, 오늘은 누구의 식단을 짜 볼까요?`, `Hi ${userId}, whose meals shall we plan today?`)}</h1>
        <p>{t('사람 식단과 반려동물 급여 정보를 한곳에서 만들어요.', 'Plan meals for people and feeding for pets in one place.')}</p>
      </div>

      <div className="tray home-tray">
        <button type="button" className="card go go-human" onClick={() => onGo('human')}>
          <Plate emojis={['🍚', '🥗', '🍳', '🥕']} />
          <span className="go-text">
            <b>{t('🧑 사람', '🧑 People')}</b>
            <strong>{t('나에게 맞는 식단·도시락', 'Meals and lunch boxes for you')}</strong>
            <span>{t('신체 정보, 목표, 알레르기, 예산을 반영해 주기별로 구성해요.', 'Built for your body, goal, allergies and budget, for any period.')}</span>
            <em className="btn">{t('식단 만들기 →', 'Plan meals →')}</em>
          </span>
        </button>

        <button type="button" className="card go go-pet" onClick={() => onGo('pet')}>
          <Plate emojis={['🐶', '🐱', '🐰', '🦜']} />
          <span className="go-text">
            <b>{t('🐾 반려동물', '🐾 Pets')}</b>
            <strong>{t('우리 아이 급여 정보', 'Feeding guidance for your pet')}</strong>
            <span>{t('개·고양이부터 토끼, 새, 파충류까지 종과 생애단계에 맞춰요.', 'From dogs and cats to rabbits, birds and reptiles, by species and life stage.')}</span>
            <em className="btn">{t('급여 정보 보기 →', 'See feeding →')}</em>
          </span>
        </button>

        <section className="card home-recent">
          <h2>{t('최근 입력한 조건', 'Your recent conditions')}</h2>
          <ul className="rows">
            <li>
              <span className="grow">🧑 {h ? `${goal} · ${period} · ${t(`한 끼 ${h.budget.toLocaleString()}원`, `${h.budget.toLocaleString()} KRW/meal`)}` : t('아직 입력 전이에요', 'Nothing entered yet')}</span>
              <button type="button" className="btn ghost small" onClick={() => onGo('human')}>{h ? t('이어서', 'Continue') : t('시작', 'Start')}</button>
            </li>
            <li>
              <span className="grow">🐾 {pets.length
                ? pets.map((p, i) => `${speciesOf(p).emoji} ${p.name || t(`동물 ${i + 1}`, `Pet ${i + 1}`)}`).join(', ')
                : t('등록한 동물이 없어요', 'No pets registered')}</span>
              <button type="button" className="btn ghost small" onClick={() => onGo('pet')}>{pets.length ? t('이어서', 'Continue') : t('시작', 'Start')}</button>
            </li>
          </ul>
        </section>

        <section className="card home-how">
          <h2>{t('이렇게 만들어요', 'How it works')}</h2>
          <ol className="how">
            <li><b>{t('조건 입력', 'Enter conditions')}</b><span>{t('목표, 활동량, 피해야 할 식재료', 'Goal, activity, foods to avoid')}</span></li>
            <li><b>{t('식단 구성', 'Build the plan')}</b><span>{t('제공량과 주요 영양까지', 'With portions and key nutrients')}</span></li>
            <li><b>{t('근거 확인', 'Check the evidence')}</b><span>{t('참고한 연구·자료와 AI 판단을 나눠서', 'Sources and AI judgment shown apart')}</span></li>
          </ol>
        </section>
      </div>
    </>
  )
}
