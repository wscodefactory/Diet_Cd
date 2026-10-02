import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'
import type { Bi } from './data.ts'
import { auth, type User } from './auth/index.ts'
import type { AuthError, CodeSent } from './auth/service.ts'
import { allOk, idRules, pwRules, validEmail, type Rule } from './auth/rules.ts'
import { Section, Seg, useT } from './ui.tsx'

const ERR: Record<AuthError, Bi> = {
  invalid_id: { ko: '아이디 규칙을 확인해 주세요.', en: 'Check the ID rules.' },
  invalid_pw: { ko: '비밀번호 규칙을 확인해 주세요.', en: 'Check the password rules.' },
  invalid_email: { ko: '이메일 주소를 확인해 주세요.', en: 'Check the email address.' },
  id_taken: { ko: '이미 쓰고 있는 아이디예요.', en: 'That ID is already taken.' },
  email_taken: { ko: '이미 가입된 이메일이에요. 로그인해 주세요.', en: 'That email is already registered. Please log in.' },
  no_pending: { ko: '인증 요청이 없어요. 가입 정보를 다시 입력해 주세요.', en: 'No pending verification. Please fill in the form again.' },
  code_wrong: { ko: '인증 코드가 맞지 않아요.', en: 'The code is not correct.' },
  code_expired: { ko: '인증 코드가 만료됐어요. 코드를 다시 받아 주세요.', en: 'The code has expired. Request a new one.' },
  too_many_tries: { ko: '여러 번 틀려서 이 코드는 더 쓸 수 없어요. 코드를 다시 받아 주세요.', en: 'Too many wrong tries. Request a new code.' },
  resend_wait: { ko: '잠시 후 다시 보낼 수 있어요.', en: 'You can resend shortly.' },
  bad_login: { ko: '아이디 또는 비밀번호가 맞지 않아요.', en: 'Wrong ID or password.' },
  locked: { ko: '로그인을 여러 번 실패해서 잠시 막혔어요.', en: 'Too many failed logins. Locked for a while.' },
}

/** on이 바뀔 때마다(코드를 새로 받을 때) 현재 시각을 다시 잡고 1초마다 갱신 */
function useNow(on: unknown) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (!on) return
    setNow(Date.now())
    const h = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(h)
  }, [on])
  return now
}

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function Input(p: {
  label: string; value: string; onChange: (v: string) => void; type?: string; autoComplete?: string
  inputMode?: 'numeric' | 'email'; maxLength?: number; hint?: ReactNode; invalid?: boolean; trailing?: ReactNode
}) {
  // 라벨에는 이름만 두고, 규칙 안내는 aria-describedby로 연결 (스크린리더가 이름을 길게 읽지 않게)
  const id = useId()
  return (
    <div className="field wide">
      <label htmlFor={id}>{p.label}</label>
      <div className="input-row">
        <input id={id} type={p.type ?? 'text'} value={p.value} autoComplete={p.autoComplete} inputMode={p.inputMode} maxLength={p.maxLength}
          aria-invalid={p.invalid || undefined} aria-describedby={p.hint ? id + '-hint' : undefined}
          autoCapitalize="none" spellCheck={false} onChange={e => p.onChange(e.target.value)} />
        {p.trailing}
      </div>
      {p.hint && <div id={id + '-hint'}>{p.hint}</div>}
    </div>
  )
}

function Rules({ rules, show }: { rules: Rule[]; show: boolean }) {
  const t = useT()
  return (
    <ul className="rules">
      {rules.map((r, i) => (
        <li key={i} className={r.ok ? 'ok' : show ? 'bad' : ''}>
          <i aria-hidden>{r.ok ? '✓' : '·'}</i>
          {t(r.text)}
          <span className="sr-only">{r.ok ? t(' 충족', ' met') : t(' 미충족', ' not met')}</span>
        </li>
      ))}
    </ul>
  )
}

function Err({ e }: { e: { error: AuthError; wait?: number } | null }) {
  const t = useT()
  if (!e) return null
  return (
    <p className="err" role="alert">
      {t(ERR[e.error])}
      {e.wait ? t(` (${mmss(e.wait * 1000)} 후)`, ` (in ${mmss(e.wait * 1000)})`) : ''}
    </p>
  )
}

function PwToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  const t = useT()
  return (
    <button type="button" className="btn ghost small" aria-pressed={show} onClick={onToggle}>
      {show ? t('숨기기', 'Hide') : t('보기', 'Show')}
    </button>
  )
}

function Login({ onDone }: { onDone: (u: User) => void }) {
  const t = useT()
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<{ error: AuthError; wait?: number } | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const r = await auth.login(id, pw)
    setBusy(false)
    if (r.ok) onDone(r.value)
    else setErr(r)
  }

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <Input label={t('아이디', 'ID')} value={id} autoComplete="username" onChange={v => setId(v.toLowerCase())} />
      <Input label={t('비밀번호', 'Password')} value={pw} type={show ? 'text' : 'password'} autoComplete="current-password" onChange={setPw}
        trailing={<PwToggle show={show} onToggle={() => setShow(!show)} />} />
      <Err e={err} />
      <button className="btn block" disabled={busy || !id || !pw}>{busy ? t('확인 중…', 'Checking…') : t('로그인', 'Log in')}</button>
    </form>
  )
}

function Signup({ onDone }: { onDone: (u: User) => void }) {
  const t = useT()
  const [f, setF] = useState({ id: '', email: '', pw: '', pw2: '' })
  const [show, setShow] = useState(false)
  const [touched, setTouched] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<{ error: AuthError; wait?: number } | null>(null)
  const [sent, setSent] = useState<CodeSent | null>(null)
  const [code, setCode] = useState('')
  const now = useNow(!!sent && sent.expiresAt)

  const ir = idRules(f.id)
  const pr = pwRules(f.pw)
  const emailOk = validEmail(f.email.trim())
  const same = f.pw.length > 0 && f.pw === f.pw2
  const ready = allOk(ir) && allOk(pr) && emailOk && same
  const set = (patch: Partial<typeof f>) => { setF({ ...f, ...patch }); setErr(null) }

  const run = async <T,>(fn: () => Promise<{ ok: true; value: T } | { ok: false; error: AuthError; wait?: number }>, then: (v: T) => void) => {
    setBusy(true)
    const r = await fn()
    setBusy(false)
    if (r.ok) { setErr(null); then(r.value) } else setErr(r)
  }

  const start = (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (ready) run(() => auth.startSignup({ id: f.id, email: f.email, password: f.pw }), v => { setSent(v); setCode('') })
  }

  if (sent) {
    const left = sent.expiresAt - now
    const wait = sent.resendAt - now
    return (
      <form className="auth-form" noValidate onSubmit={e => { e.preventDefault(); run(() => auth.verifySignup(sent.email, code), onDone) }}>
        <ol className="steps" aria-label={t('가입 단계', 'Sign-up steps')}>
          <li>{t('정보 입력', 'Details')}</li>
          <li aria-current="step">{t('이메일 인증', 'Verify email')}</li>
        </ol>
        <p><b>{sent.email}</b>{t(' 으로 6자리 인증 코드를 보냈어요. 인증을 마쳐야 가입이 완료돼요.', ': we sent a 6-digit code. Sign-up completes after you verify.')}</p>
        {sent.devCode && (
          <div className="devbox" role="status">
            <span className="badge ex">{t('개발용', 'Dev only')}</span>
            <p>{t('프로토타입이라 실제 메일은 보내지 않아요. 메일 대신 여기에 코드를 보여드려요.', 'This prototype does not send real email. The code is shown here instead.')}</p>
            <strong>{sent.devCode}</strong>
          </div>
        )}
        <Input label={t('인증 코드', 'Verification code')} value={code} inputMode="numeric" autoComplete="one-time-code" maxLength={6}
          onChange={v => { setCode(v.replace(/\D/g, '')); setErr(null) }}
          hint={<small className={left > 0 ? 'muted' : 'err'}>{left > 0 ? t(`남은 시간 ${mmss(left)}`, `Expires in ${mmss(left)}`) : t('코드가 만료됐어요', 'Code expired')}</small>} />
        <Err e={err} />
        <button className="btn block" disabled={busy || code.length !== 6}>{t('인증하고 가입 완료', 'Verify and finish')}</button>
        <div className="row">
          <button type="button" className="btn ghost small" disabled={busy || wait > 0}
            onClick={() => run(() => auth.resendCode(sent.email), v => { setSent(v); setCode('') })}>
            {wait > 0 ? t(`코드 다시 받기 (${mmss(wait)})`, `Resend code (${mmss(wait)})`) : t('코드 다시 받기', 'Resend code')}
          </button>
          <button type="button" className="btn ghost small" onClick={() => { setSent(null); setErr(null) }}>{t('정보 수정', 'Edit details')}</button>
        </div>
      </form>
    )
  }

  return (
    <form className="auth-form" onSubmit={start} noValidate>
      <ol className="steps" aria-label={t('가입 단계', 'Sign-up steps')}>
        <li aria-current="step">{t('정보 입력', 'Details')}</li>
        <li>{t('이메일 인증', 'Verify email')}</li>
      </ol>
      <Input label={t('아이디', 'ID')} value={f.id} autoComplete="username" maxLength={20}
        onChange={v => set({ id: v.toLowerCase() })} invalid={touched && !allOk(ir)} hint={<Rules rules={ir} show={touched || f.id.length > 0} />} />
      <Input label={t('이메일', 'Email')} value={f.email} type="email" inputMode="email" autoComplete="email"
        onChange={v => set({ email: v })} invalid={touched && !emailOk}
        hint={touched && !emailOk ? <small className="err">{t('이메일 주소 형식이 아니에요.', 'Not a valid email address.')}</small> : undefined} />
      <Input label={t('비밀번호', 'Password')} value={f.pw} type={show ? 'text' : 'password'} autoComplete="new-password" maxLength={64}
        onChange={v => set({ pw: v })} invalid={touched && !allOk(pr)}
        trailing={<PwToggle show={show} onToggle={() => setShow(!show)} />} hint={<Rules rules={pr} show={touched || f.pw.length > 0} />} />
      <Input label={t('비밀번호 확인', 'Confirm password')} value={f.pw2} type={show ? 'text' : 'password'} autoComplete="new-password" maxLength={64}
        onChange={v => set({ pw2: v })} invalid={(touched || f.pw2.length > 0) && !same}
        hint={(touched || f.pw2.length > 0) && !same ? <small className="err">{t('비밀번호가 서로 달라요.', 'Passwords do not match.')}</small> : undefined} />
      <Err e={err} />
      <button className="btn block" disabled={busy}>{busy ? t('확인 중…', 'Checking…') : t('이메일 인증 코드 받기', 'Send verification code')}</button>
    </form>
  )
}

export default function Auth({ user, onUser, onClose }: { user: User | null; onUser: (u: User | null) => void; onClose: () => void }) {
  const t = useT()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [welcome, setWelcome] = useState(false)

  return (
    <div className="auth">
      <p className="warn proto">
        {t(
          '프로토타입 안내: 계정 정보는 이 브라우저에만 저장되고 실제 메일은 보내지 않아요. 실제 보안이 적용된 로그인이 아니니 쓰고 있는 비밀번호는 넣지 마세요.',
          'Prototype: accounts are stored only in this browser and no email is sent. This is not secure login, so do not use a real password.',
        )}
      </p>
      {user ? (
        <Section title={welcome ? t('가입 완료! 환영해요 🎉', 'You are signed up! Welcome 🎉') : t('내 계정', 'My account')}>
          <dl className="account">
            <div><dt>{t('아이디', 'ID')}</dt><dd>{user.id}</dd></div>
            <div><dt>{t('이메일', 'Email')}</dt><dd>{user.email} <span className="badge">{t('인증됨', 'Verified')}</span></dd></div>
            <div><dt>{t('가입일', 'Joined')}</dt><dd>{new Date(user.createdAt).toLocaleDateString(t('ko-KR', 'en-US'))}</dd></div>
          </dl>
          <div className="row">
            <button className="btn" onClick={onClose}>{t('식단 만들러 가기', 'Go make a plan')}</button>
            <button className="btn ghost" onClick={async () => { await auth.logout(); setWelcome(false); setTab('login'); onUser(null) }}>{t('로그아웃', 'Log out')}</button>
          </div>
        </Section>
      ) : (
        <Section title={tab === 'login' ? t('로그인', 'Log in') : t('회원가입', 'Sign up')}>
          <Seg label={t('로그인 또는 회원가입', 'Log in or sign up')} value={tab} onChange={setTab}
            options={[['login', t('로그인', 'Log in')], ['signup', t('회원가입', 'Sign up')]]} />
          {tab === 'login'
            ? <Login onDone={u => { setWelcome(false); onUser(u) }} />
            : <Signup onDone={u => { setWelcome(true); onUser(u) }} />}
        </Section>
      )}
    </div>
  )
}
