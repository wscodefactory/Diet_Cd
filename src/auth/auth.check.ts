// 실행: npm run check
import { createMockAuth, CODE_TTL, LOCK_TIME, MAX_CODE_TRIES, RESEND_GAP } from './mock.ts'
import { validEmail, validId, validPw } from './rules.ts'

const ok = (cond: boolean, msg: string) => {
  if (!cond) throw new Error('FAIL: ' + msg)
}

ok(validId('diet_user1') && !validId('short1') && !validId('1startsnum') && !validId('Upper_case1'), 'id rules')
ok(validId('a'.repeat(20)) && !validId('a'.repeat(21)), 'id length')
ok(validPw('apple123!@') && validPw('Apple123!@'), 'pw ok (uppercase optional)')
ok(!validPw('apple12!@'), 'pw too short')
ok(!validPw('APPLE123!@#'), 'pw needs lowercase')
ok(!validPw('applepie!@#'), 'pw needs digit')
ok(!validPw('applepie123'), 'pw needs special')
ok(!validPw('apple 123!@'), 'pw no spaces')
ok(validEmail('a@b.co') && !validEmail('a@b') && !validEmail('a b@c.com'), 'email rules')

const mem = new Map<string, string>()
const storage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) }
let t = 1_000_000
const auth = createMockAuth({ storage, now: () => t, iterations: 1000 })
const PW = 'apple123!@'

ok(!(await auth.startSignup({ id: 'diet_user1', email: 'x@y.com', password: 'weak' })).ok, 'weak pw rejected')
const s1 = await auth.startSignup({ id: 'diet_user1', email: ' Me@Example.com ', password: PW })
ok(s1.ok && s1.value.email === 'me@example.com' && /^\d{6}$/.test(s1.value.devCode ?? ''), 'code sent')
if (!s1.ok) throw new Error()
ok(!(await auth.login('diet_user1', PW)).ok, 'no account before verification')
ok(!mem.get('auth.pending')!.includes(PW) && !mem.get('auth.pending')!.includes(s1.value.devCode!), 'nothing stored in plaintext')

const again = await auth.resendCode('me@example.com')
ok(!again.ok && again.error === 'resend_wait', 'resend cooldown')
t += RESEND_GAP
const s2 = await auth.resendCode('me@example.com')
ok(s2.ok, 'resend after gap')
if (!s2.ok) throw new Error()
const wrong = s2.value.devCode === '000000' ? '000001' : '000000'
ok((await auth.verifySignup('me@example.com', wrong)).ok === false, 'wrong code')
t += CODE_TTL
const late = await auth.verifySignup('me@example.com', s2.value.devCode!)
ok(!late.ok && late.error === 'code_expired', 'code expires')
t += RESEND_GAP
const s3 = await auth.resendCode('me@example.com')
if (!s3.ok) throw new Error('resend failed')
const u = await auth.verifySignup('ME@example.com', s3.value.devCode!)
ok(u.ok && u.value.id === 'diet_user1', 'verified signup creates account')
ok((await auth.current())?.id === 'diet_user1', 'logged in after signup')
ok(!mem.get('auth.users')!.includes(PW), 'password hashed')

const dupId = await auth.startSignup({ id: 'diet_user1', email: 'other@example.com', password: PW })
ok(!dupId.ok && dupId.error === 'id_taken', 'id unique')
const dupEmail = await auth.startSignup({ id: 'diet_user2', email: 'me@example.com', password: PW })
ok(!dupEmail.ok && dupEmail.error === 'email_taken', 'email unique')

await auth.logout()
ok((await auth.current()) === null, 'logout')
const bad = await auth.login('diet_user1', 'apple123!#')
ok(!bad.ok && bad.error === 'bad_login', 'bad password')
ok((await auth.login('diet_user1', PW)).ok, 'login')

for (let i = 0; i < 5; i++) await auth.login('diet_user1', 'nope')
const locked = await auth.login('diet_user1', PW)
ok(!locked.ok && locked.error === 'locked', 'locked after 5 fails')
t += LOCK_TIME
ok((await auth.login('diet_user1', PW)).ok, 'unlocked later')

const s4 = await auth.startSignup({ id: 'diet_user3', email: 'z@example.com', password: PW })
if (!s4.ok) throw new Error()
for (let i = 0; i < MAX_CODE_TRIES; i++) await auth.verifySignup('z@example.com', '999999' === s4.value.devCode ? '999998' : '999999')
const tooMany = await auth.verifySignup('z@example.com', s4.value.devCode!)
ok(!tooMany.ok && tooMany.error === 'too_many_tries', 'code tries limited')

const seeded = await auth.startSignup({ id: 'tlreks1234', email: 'new@example.com', password: PW })
ok(!seeded.ok && seeded.error === 'id_taken', 'seeded admin id is reserved')
const notAdmin = await auth.login('tlreks1234', PW)
ok(!notAdmin.ok, 'seeded admin rejects a wrong password')
ok(!mem.get('auth.users')!.includes('tlreks1234'), 'seed is not copied into storage')

console.log('auth.check: all passed')
