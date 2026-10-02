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
  // undefined: 로그인 상태를 아직 확인하는 중
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const ko = lang === 'ko'
  const modes: [Mode, string][] = [['human', ko ? '🧑 사람' : '🧑 People'], ['pet', ko ? '🐾 반려동물' : '🐾 Pets']]
  const account = user ? user.id : ko ? '로그인' : 'Log in'
  // 서비스는 로그인한 뒤에만: 로그아웃 상태면 어떤 메뉴를 눌러도 로그인 화면
  const gated = user === null
  const showAuth = gated || view === 'auth'
  const onUser = (u: User | null, fresh?: boolean) => {
    setUser(u)
    // 로그인하면 보던 대상(사람/반려동물) 화면으로 돌아감. 방금 가입했으면 환영 화면을 먼저 보여줌
    setView(u && !fresh ? 'plan' : 'auth')
  }

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
        {user && (
          <div className="mode-top">
            <Seg label={ko ? '대상' : 'Target'} value={showAuth ? ('' as Mode) : mode} onChange={go} options={modes} />
          </div>
        )}
        <Seg label="Language" value={lang} onChange={setLang} options={[['ko', '한국어'], ['en', 'EN']]} />
        <button type="button" className="btn ghost small account-top" aria-pressed={showAuth} onClick={openAuth}>👤 {account}</button>
      </header>
      <main>
        {user === undefined ? null
          : showAuth ? <Auth user={user} onUser={onUser} onClose={() => go(mode)} />
          : mode === 'human' ? <Human /> : <Pet />}
      </main>
      {/* 휴대폰: 사람/반려동물 전환과 계정은 엄지가 닿는 아래 탭바로 */}
      <nav className="tabbar" aria-label={ko ? '메뉴' : 'Menu'}>
        {user && modes.map(([v, text]) => (
          <button key={v} type="button" aria-pressed={!showAuth && v === mode} onClick={() => go(v)}>{text}</button>
        ))}
        <button type="button" aria-pressed={showAuth} onClick={openAuth}>👤 {user ? (ko ? '내 계정' : 'Account') : account}</button>
      </nav>
    </LangCtx.Provider>
  )
}
