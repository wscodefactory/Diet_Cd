import { useEffect, useState } from 'react'
import Auth from './Auth.tsx'
import Human from './Human.tsx'
import Pet from './Pet.tsx'
import { auth, type User } from './auth/index.ts'
import { LangCtx, Seg, type Lang } from './ui.tsx'

type Mode = 'human' | 'pet'

export default function App() {
  const [lang, setLang] = useState<Lang>('ko')
  const [mode, setMode] = useState<Mode>('human')
  const [view, setView] = useState<'plan' | 'auth'>('plan')
  const [user, setUser] = useState<User | null>(null)
  const ko = lang === 'ko'
  const modes: [Mode, string][] = [['human', ko ? '🧑 사람' : '🧑 People'], ['pet', ko ? '🐾 반려동물' : '🐾 Pets']]
  const account = user ? user.id : ko ? '로그인' : 'Log in'

  useEffect(() => {
    auth.current().then(setUser)
  }, [])

  useEffect(() => {
    document.body.dataset.mode = mode
    document.documentElement.lang = lang
  }, [mode, lang])

  const go = (m: Mode) => { setMode(m); setView('plan'); window.scrollTo({ top: 0 }) }
  const openAuth = () => { setView('auth'); window.scrollTo({ top: 0 }) }

  return (
    <LangCtx.Provider value={lang}>
      <header className="top">
        <div className="logo">AI <span>{ko ? '식단' : 'Diet'}</span></div>
        <div className="mode-top">
          <Seg label={ko ? '대상' : 'Target'} value={view === 'plan' ? mode : ('' as Mode)} onChange={go} options={modes} />
        </div>
        <Seg label="Language" value={lang} onChange={setLang} options={[['ko', '한국어'], ['en', 'EN']]} />
        <button type="button" className="btn ghost small account-top" aria-pressed={view === 'auth'} onClick={openAuth}>👤 {account}</button>
      </header>
      <main>
        {view === 'auth'
          ? <Auth user={user} onUser={setUser} onClose={() => go(mode)} />
          : mode === 'human' ? <Human /> : <Pet />}
      </main>
      {/* 휴대폰: 사람/반려동물 전환과 계정은 엄지가 닿는 아래 탭바로 */}
      <nav className="tabbar" aria-label={ko ? '메뉴' : 'Menu'}>
        {modes.map(([v, text]) => (
          <button key={v} type="button" aria-pressed={view === 'plan' && v === mode} onClick={() => go(v)}>{text}</button>
        ))}
        <button type="button" aria-pressed={view === 'auth'} onClick={openAuth}>👤 {user ? (ko ? '내 계정' : 'Account') : account}</button>
      </nav>
    </LangCtx.Provider>
  )
}
