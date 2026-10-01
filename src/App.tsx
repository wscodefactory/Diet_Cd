import { useEffect, useState } from 'react'
import Human from './Human.tsx'
import Pet from './Pet.tsx'
import { LangCtx, Seg, type Lang } from './ui.tsx'

type Mode = 'human' | 'pet'

export default function App() {
  const [lang, setLang] = useState<Lang>('ko')
  const [mode, setMode] = useState<Mode>('human')
  const ko = lang === 'ko'

  useEffect(() => {
    document.body.dataset.mode = mode
    document.documentElement.lang = lang
  }, [mode, lang])

  return (
    <LangCtx.Provider value={lang}>
      <header className="top">
        <div className="logo">AI <span>{ko ? '식단' : 'Diet'}</span></div>
        <Seg label={ko ? '대상' : 'Target'} value={mode} onChange={setMode}
          options={[['human', ko ? '🧑 사람' : '🧑 People'], ['pet', ko ? '🐾 반려동물' : '🐾 Pets']]} />
        <Seg label="Language" value={lang} onChange={setLang} options={[['ko', '한국어'], ['en', 'EN']]} />
      </header>
      <main>
        {mode === 'human' ? <Human /> : <Pet />}
      </main>
    </LangCtx.Provider>
  )
}
