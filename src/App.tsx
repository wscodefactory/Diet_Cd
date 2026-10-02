import { useEffect, useState } from 'react'
import Human from './Human.tsx'
import Pet from './Pet.tsx'
import { LangCtx, Seg, type Lang } from './ui.tsx'

type Mode = 'human' | 'pet'

export default function App() {
  const [lang, setLang] = useState<Lang>('ko')
  const [mode, setMode] = useState<Mode>('human')
  const ko = lang === 'ko'
  const modes: [Mode, string][] = [['human', ko ? '🧑 사람' : '🧑 People'], ['pet', ko ? '🐾 반려동물' : '🐾 Pets']]

  useEffect(() => {
    document.body.dataset.mode = mode
    document.documentElement.lang = lang
  }, [mode, lang])

  return (
    <LangCtx.Provider value={lang}>
      <header className="top">
        <div className="logo">AI <span>{ko ? '식단' : 'Diet'}</span></div>
        <div className="mode-top">
          <Seg label={ko ? '대상' : 'Target'} value={mode} onChange={setMode} options={modes} />
        </div>
        <Seg label="Language" value={lang} onChange={setLang} options={[['ko', '한국어'], ['en', 'EN']]} />
      </header>
      <main>
        {mode === 'human' ? <Human /> : <Pet />}
      </main>
      {/* 휴대폰: 사람/반려동물 전환은 엄지가 닿는 아래 탭바로 */}
      <nav className="tabbar" aria-label={ko ? '대상' : 'Target'}>
        {modes.map(([v, text]) => (
          <button key={v} type="button" aria-pressed={v === mode} onClick={() => { setMode(v); window.scrollTo({ top: 0 }) }}>{text}</button>
        ))}
      </nav>
    </LangCtx.Provider>
  )
}
