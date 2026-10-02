import { useEffect, useState } from 'react'
import Auth from './Auth.tsx'
import Home from './Home.tsx'
import Human from './Human.tsx'
import Pet from './Pet.tsx'
import { auth, type User } from './auth/index.ts'
import { LangCtx, Seg, type Lang } from './ui.tsx'

type Mode = 'home' | 'human' | 'pet'

export default function App() {
  const [lang, setLang] = useState<Lang>('ko')
  const [mode, setMode] = useState<Mode>('home')
  const [view, setView] = useState<'plan' | 'auth'>('plan')
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login')
  // undefined: 로그인 상태를 아직 확인하는 중
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const ko = lang === 'ko'
  const modes: [Mode, string][] = [['home', ko ? '🏠 홈' : '🏠 Home'], ['human', ko ? '🧑 사람' : '🧑 People'], ['pet', ko ? '🐾 반려동물' : '🐾 Pets']]
  const account = user ? user.id : ko ? '로그인' : 'Log in'
  // 홈은 누구나 볼 수 있고, 서비스(사람·반려동물 식단)는 로그인한 뒤에만: 로그아웃 상태에서 누르면 로그인 화면
  const gated = user === null && mode !== 'home'
  const showAuth = gated || view === 'auth'
  const onUser = (u: User | null, fresh?: boolean) => {
    setUser(u)
    // 로그인하면 가려던 화면(누른 메뉴)으로. 방금 가입했으면 환영 화면을 먼저, 로그아웃하면 홈으로
    if (!u) setMode('home')
    setView(u && fresh ? 'auth' : 'plan')
  }

  useEffect(() => {
    auth.current().then(setUser)
  }, [])

  useEffect(() => {
    // 홈은 사람용과 같은 흰 바탕
    document.body.dataset.mode = mode === 'pet' ? 'pet' : 'human'
    document.documentElement.lang = lang
  }, [mode, lang])

  const go = (m: Mode) => { setMode(m); setView('plan'); window.scrollTo({ top: 0 }) }
  const openAuth = (tab: 'login' | 'signup' = 'login') => { setAuthTab(tab); setView('auth'); window.scrollTo({ top: 0 }) }

  return (
    <LangCtx.Provider value={lang}>
      <header className="top">
        <button type="button" className="logo" aria-label={ko ? '홈으로' : 'Go home'} onClick={() => go('home')}>AI <span>{ko ? '식단' : 'Diet'}</span></button>
        <div className="mode-top">
          {/* 상단은 홈 메뉴 없이 로고로 홈 이동 */}
          <Seg label={ko ? '메뉴' : 'Menu'} value={showAuth ? ('' as Mode) : mode} onChange={go} options={modes.filter(([v]) => v !== 'home')} />
        </div>
        <Seg label="Language" value={lang} onChange={setLang} options={[['ko', '한국어'], ['en', 'EN']]} />
        <button type="button" className="btn ghost small account-top" aria-pressed={showAuth} onClick={() => openAuth()}>👤 {account}</button>
      </header>
      <main>
        {user === undefined ? null
          : showAuth ? <Auth key={authTab} start={authTab} user={user} onUser={onUser} onClose={() => go(mode)} />
          : mode === 'home' ? <Home userId={user?.id} onGo={go} onAuth={openAuth} />
          : mode === 'human' ? <Human /> : <Pet />}
      </main>
      {/* 휴대폰: 홈·사람·반려동물 전환과 계정은 엄지가 닿는 아래 탭바로 */}
      <nav className="tabbar" aria-label={ko ? '메뉴' : 'Menu'}>
        {modes.map(([v, text]) => (
          <button key={v} type="button" aria-pressed={!showAuth && v === mode} onClick={() => go(v)}><Tab text={text} /></button>
        ))}
        <button type="button" aria-pressed={showAuth} onClick={() => openAuth()}><Tab text={`👤 ${user ? (ko ? '내 계정' : 'Account') : account}`} /></button>
      </nav>
    </LangCtx.Provider>
  )
}

// 탭바 칸이 4개라 좁은 폰에서도 한 줄에 들어가게 아이콘 위, 글자 아래
function Tab({ text }: { text: string }) {
  const [icon, ...rest] = text.split(' ')
  return <><span aria-hidden="true">{icon}</span>{rest.join(' ')}</>
}
