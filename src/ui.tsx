import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { REFS, type Bi } from './data.ts'

export type Lang = 'ko' | 'en'
export const LangCtx = createContext<Lang>('ko')

/** t('한국어', 'English') 또는 t(bi) */
export function useT() {
  const lang = useContext(LangCtx)
  return (ko: string | Bi, en?: string) => (typeof ko === 'string' ? (lang === 'ko' ? ko : en ?? ko) : ko[lang])
}

// 백엔드 대신 브라우저에 저장 (docs/paid-items.md)
export function useLocal<T>(key: string, init: T) {
  const [v, set] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key)
      return s ? { ...init, ...JSON.parse(s) } : init
    } catch {
      return init
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v))
    } catch {
      /* 저장 불가 환경에서는 메모리 상태만 사용 */
    }
  }, [key, v])
  return [v, set] as const
}

export function Seg<T extends string>(p: { value: T; options: [T, string][]; onChange: (v: T) => void; label?: string }) {
  return (
    <div className="seg" role="group" aria-label={p.label}>
      {p.options.map(([v, text]) => (
        <button key={v} type="button" aria-pressed={v === p.value} onClick={() => p.onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  )
}

export function Field(p: { label: string; wide?: boolean; children: ReactNode }) {
  // 그룹형 입력(Seg, Chips)도 담으므로 label 대신 div + 텍스트
  return (
    <div className={'field' + (p.wide ? ' wide' : '')}>
      <span>{p.label}</span>
      {p.children}
    </div>
  )
}

export function Num(p: { label: string; value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <label className="field">
      <span>{p.label}</span>
      <input type="number" inputMode="decimal" value={p.value || ''} min={p.min ?? 0} max={p.max} step={p.step ?? 1}
        onChange={e => p.onChange(Number(e.target.value) || 0)} />
    </label>
  )
}

export function Text(p: { label: string; value: string; onChange: (s: string) => void; placeholder?: string; wide?: boolean }) {
  return (
    <label className={'field' + (p.wide ? ' wide' : '')}>
      <span>{p.label}</span>
      <input type="text" value={p.value} placeholder={p.placeholder} onChange={e => p.onChange(e.target.value)} />
    </label>
  )
}

export function Chips<T extends string | number>(p: { value: T[]; options: [T, string][]; onChange: (v: T[]) => void }) {
  return (
    <div className="chips">
      {p.options.map(([v, text]) => {
        const on = p.value.includes(v)
        return (
          <button key={v} type="button" className="chip" aria-pressed={on}
            onClick={() => p.onChange(on ? p.value.filter(x => x !== v) : [...p.value, v])}>
            {text}
          </button>
        )
      })}
    </div>
  )
}

/** area: 결과 도시락 통(.tray) 안에서 차지할 칸 이름 */
export function Section(p: { no?: number; title: string; area?: string; children: ReactNode }) {
  return (
    <section className={'card' + (p.area ? ` a-${p.area}` : '')}>
      <h2>
        {p.no && <span className="no">{p.no}</span>}
        {p.title}
      </h2>
      {p.children}
    </section>
  )
}

/** 실제 음식 사진 대신 쓰는 자리표시 접시 (docs/paid-items.md) — 결과 도시락 통의 첫 칸 */
export function Hero(p: { emojis: string[]; kicker: string; big: string; unit?: string; caption: string }) {
  const t = useT()
  const n = p.emojis.length
  return (
    <figure className="card hero a-hero">
      <div className="plate" role="img" aria-label={p.caption}>
        {p.emojis.map((e, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2
          const r = n > 1 ? 30 : 0
          return <span key={i} style={{ left: `${50 + Math.cos(a) * r}%`, top: `${50 + Math.sin(a) * r}%` }}>{e}</span>
        })}
      </div>
      <figcaption>
        <small>{t('예시 이미지 · 실제 음식 사진은 추후 연결', 'Sample image · real food photos later')}</small>
        <b>{p.kicker}</b>
        <strong>{p.big}</strong>
        {p.unit && <em>{p.unit}</em>}
        <span>{p.caption}</span>
      </figcaption>
    </figure>
  )
}

/** 5) 참고한 연구 및 자료 보기 — 펼치면 요약 카드 */
export function Evidence({ target, species }: { target: 'human' | 'animal'; species?: string }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const refs = REFS.filter(r => r.target === target && (!species || !r.species || r.species.includes(species)))
  return (
    <Section no={5} area="refs" title={t('근거 확인', 'Check the evidence')}>
      <button className="btn ghost block" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? t('참고한 연구 및 자료 접기', 'Hide studies and sources') : t(`참고한 연구 및 자료 보기 (${refs.length})`, `View studies and sources (${refs.length})`)}
      </button>
      {open && (
        <div className="refs">
          <p className="warn">
            {t(
              '아래 출처는 모두 ‘예시’예요. 실제 기관 자료·논문을 적었지만 이 프로토타입에서는 원문을 다시 대조하지 않았고, 신뢰도 점수는 매기지 않았어요.',
              'All sources below are marked “Example”. They name real publications, but the originals were not re-checked in this prototype, and no reliability score is assigned.',
            )}
          </p>
          {refs.map(r => (
            <article key={r.id} className="ref">
              <div className="meta">
                <span className="badge ex">{t('예시', 'Example')}</span>
                <span className="badge">{r.target === 'human' ? t('대상: 사람', 'For: humans') : t('대상: 동물', 'For: animals')}</span>
                <span>{r.year}</span>
                <span>· {t(r.source)}</span>
              </div>
              <h3>{r.title}</h3>
              <dl>
                <div>
                  <dt>{t('식단에 반영된 내용', 'What it changed in the plan')}</dt>
                  <dd>{t(r.applied)}</dd>
                </div>
                <div className="split">
                  <div>
                    <dt>{t('자료에서 확인한 내용', 'Stated in the source')}</dt>
                    <dd>{t(r.confirmed)}</dd>
                  </div>
                  <div className="ai">
                    <dt>{t('AI의 판단', 'AI judgment')}</dt>
                    <dd>{t(r.ai)}</dd>
                  </div>
                </div>
                <div>
                  <dt>{t('적용 범위와 한계', 'Scope and limits')}</dt>
                  <dd>{t(r.limits)}</dd>
                </div>
              </dl>
              <a href={r.url} target="_blank" rel="noreferrer">{t('원문 링크 열기 ↗', 'Open source link ↗')}</a>
            </article>
          ))}
        </div>
      )}
    </Section>
  )
}
