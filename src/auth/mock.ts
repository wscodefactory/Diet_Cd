// 브라우저 전용 인증 목업. 프로토타입일 뿐 실제 보안이 아님:
// 데이터가 이 브라우저 localStorage에만 있고, 메일을 보내지 않으며, 누구나 개발자 도구로 값을 바꿀 수 있음.
// 그래도 비밀번호는 평문으로 두지 않고 PBKDF2(SHA-256)로 해시해서 저장함.
import { normEmail, validEmail, validId, validPw } from './rules.ts'
import type { AuthService, CodeSent, Result, User } from './service.ts'

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
type Hash = { salt: string; hash: string; iter: number }
type Account = User & { pw: Hash }
type Pending = { id: string; email: string; pw: Hash; code: Hash; expiresAt: number; resendAt: number; tries: number }
type Fails = Record<string, { n: number; until: number }>

export const CODE_TTL = 10 * 60_000
export const RESEND_GAP = 60_000
export const MAX_CODE_TRIES = 5
export const MAX_LOGIN_FAILS = 5
export const LOCK_TIME = 5 * 60_000

// 미리 넣어 둔 테스트용 관리자 계정. 가입·이메일 인증 없이 어느 브라우저에서나 로그인됨.
// 저장소가 공개라서 비밀번호는 평문 없이 솔트 붙인 해시만 둠 (그래도 공개 코드에서 보이므로 테스트 전용)
const SEED: Record<string, Account> = {
  tlreks1234: {
    id: 'tlreks1234', email: 'admin@diet.test', createdAt: Date.UTC(2026, 9, 2), role: 'admin',
    pw: { salt: 'Qek/azV9tpRxmy23/zcm2Q==', hash: 'bXQvShCilmE+9iqHnS6NkIOWn1PgHFaTc0jA3yG0Yd8=', iter: 600_000 },
  },
}

const K = { users: 'auth.users', pending: 'auth.pending', session: 'auth.session', fails: 'auth.fails' }

const b64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf)))
const unb64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0))

async function pbkdf2(secret: string, salt: Uint8Array<ArrayBuffer>, iter: number) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveBits'])
  return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, key, 256))
}

async function makeHash(secret: string, iter: number): Promise<Hash> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return { salt: b64(salt), hash: await pbkdf2(secret, salt, iter), iter }
}

async function matches(secret: string, h: Hash) {
  const got = await pbkdf2(secret, unb64(h.salt), h.iter)
  // 길이가 같은 문자열을 끝까지 비교 (타이밍 차이 줄이기)
  let diff = got.length ^ h.hash.length
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ h.hash.charCodeAt(i % h.hash.length)
  return diff === 0
}

const newCode = () => String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0')
const secs = (ms: number) => Math.max(1, Math.ceil(ms / 1000))
const fail = <T,>(error: Exclude<Result<T>, { ok: true }>['error'], wait?: number): Result<T> => ({ ok: false, error, wait })

export function createMockAuth(opt: { storage: Store; now?: () => number; iterations?: number }): AuthService {
  const { storage } = opt
  const now = opt.now ?? Date.now
  const iter = opt.iterations ?? 600_000 // OWASP 권장값 (PBKDF2-HMAC-SHA256)

  const read = <T,>(k: string, init: T): T => {
    try {
      const s = storage.getItem(k)
      return s ? (JSON.parse(s) as T) : init
    } catch {
      return init
    }
  }
  const write = (k: string, v: unknown) => storage.setItem(k, JSON.stringify(v))
  const stored = () => read<Record<string, Account>>(K.users, {})
  const users = () => ({ ...stored(), ...SEED })
  const pendings = () => read<Record<string, Pending>>(K.pending, {})
  const pub = (a: Account): User => ({ id: a.id, email: a.email, createdAt: a.createdAt, ...(a.role && { role: a.role }) })

  async function send(p: Pending): Promise<CodeSent> {
    const code = newCode()
    const t = now()
    p.code = await makeHash(code, 1000) // 6자리 코드는 짧게 살아서 반복 횟수를 낮춤
    p.expiresAt = t + CODE_TTL
    p.resendAt = t + RESEND_GAP
    p.tries = 0
    write(K.pending, { ...pendings(), [p.email]: p })
    // 실제 서비스라면 여기서 메일 발송 API 호출 (docs/paid-items.md)
    return { email: p.email, expiresAt: p.expiresAt, resendAt: p.resendAt, devCode: code }
  }

  return {
    async current() {
      const id = read<string | null>(K.session, null)
      const a = id ? users()[id] : undefined
      return a ? pub(a) : null
    },

    async startSignup(input) {
      const id = input.id.trim()
      const email = normEmail(input.email)
      if (!validId(id)) return fail('invalid_id')
      if (!validEmail(email)) return fail('invalid_email')
      if (!validPw(input.password)) return fail('invalid_pw')
      const all = Object.values(users())
      if (all.some(a => a.id === id)) return fail('id_taken')
      if (all.some(a => a.email === email)) return fail('email_taken')
      const old = pendings()[email]
      if (old && old.resendAt > now()) return fail('resend_wait', secs(old.resendAt - now()))
      const p: Pending = { id, email, pw: await makeHash(input.password, iter), code: { salt: '', hash: '', iter: 0 }, expiresAt: 0, resendAt: 0, tries: 0 }
      return { ok: true, value: await send(p) }
    },

    async resendCode(raw) {
      const p = pendings()[normEmail(raw)]
      if (!p) return fail('no_pending')
      if (p.resendAt > now()) return fail('resend_wait', secs(p.resendAt - now()))
      return { ok: true, value: await send(p) }
    },

    async verifySignup(raw, code) {
      const email = normEmail(raw)
      const all = pendings()
      const p = all[email]
      if (!p) return fail('no_pending')
      if (p.expiresAt <= now()) return fail('code_expired')
      if (p.tries >= MAX_CODE_TRIES) return fail('too_many_tries')
      if (!(await matches(code.trim(), p.code))) {
        p.tries++
        write(K.pending, { ...all, [email]: p })
        return fail(p.tries >= MAX_CODE_TRIES ? 'too_many_tries' : 'code_wrong')
      }
      // 코드를 기다리는 동안 같은 아이디·이메일로 다른 가입이 끝났을 수 있음
      const us = users()
      if (us[p.id]) return fail('id_taken')
      if (Object.values(us).some(a => a.email === email)) return fail('email_taken')
      const acc: Account = { id: p.id, email, pw: p.pw, createdAt: now() }
      write(K.users, { ...stored(), [acc.id]: acc })
      delete all[email]
      write(K.pending, all)
      write(K.session, acc.id)
      return { ok: true, value: pub(acc) }
    },

    async login(rawId, password) {
      const id = rawId.trim()
      const fails = read<Fails>(K.fails, {})
      const f = fails[id]
      if (f && f.until > now()) return fail('locked', secs(f.until - now()))
      const a = users()[id]
      // 없는 아이디도 해시를 한 번 계산해서 응답 시간으로 아이디 존재 여부가 드러나지 않게
      const good = a ? await matches(password, a.pw) : (await makeHash(password, iter), false)
      if (!good) {
        const n = (f && f.until <= now() && f.n >= MAX_LOGIN_FAILS ? 0 : f?.n ?? 0) + 1
        write(K.fails, { ...fails, [id]: { n, until: n >= MAX_LOGIN_FAILS ? now() + LOCK_TIME : 0 } })
        return n >= MAX_LOGIN_FAILS ? fail('locked', secs(LOCK_TIME)) : fail('bad_login')
      }
      delete fails[id]
      write(K.fails, fails)
      write(K.session, a.id)
      return { ok: true, value: pub(a) }
    },

    async logout() {
      storage.removeItem(K.session)
    },
  }
}
