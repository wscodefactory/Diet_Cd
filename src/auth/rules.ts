// 아이디·비밀번호·이메일 규칙. 화면과 인증 서비스가 같은 규칙을 씀 (실제 서버를 붙여도 서버에서 한 번 더 검사해야 함)
import type { Bi } from '../data.ts'

export const ID_MIN = 8
export const ID_MAX = 20
export const PW_MIN = 10
export const PW_MAX = 64

export type Rule = { ok: boolean; text: Bi }

/** 아이디: 영문 소문자로 시작, 소문자·숫자·밑줄(_)만, 8~20자 */
export function idRules(id: string): Rule[] {
  return [
    { ok: id.length >= ID_MIN && id.length <= ID_MAX, text: { ko: `${ID_MIN}~${ID_MAX}자`, en: `${ID_MIN}–${ID_MAX} characters` } },
    { ok: /^[a-z][a-z0-9_]*$/.test(id), text: { ko: '영문 소문자로 시작, 소문자·숫자·밑줄(_)만', en: 'Starts with a-z; only a-z, 0-9 and _' } },
  ]
}

/** 비밀번호: 10자 이상, 영문 소문자 + 숫자 + 특수문자 모두 포함, 공백 없음 (대문자는 써도 되고 안 써도 됨) */
export function pwRules(pw: string): Rule[] {
  return [
    { ok: pw.length >= PW_MIN && pw.length <= PW_MAX, text: { ko: `${PW_MIN}자 이상`, en: `At least ${PW_MIN} characters` } },
    { ok: /[a-z]/.test(pw), text: { ko: '영문 소문자', en: 'Lowercase letter' } },
    { ok: /[0-9]/.test(pw), text: { ko: '숫자', en: 'Number' } },
    { ok: /[^A-Za-z0-9\s]/.test(pw), text: { ko: '특수문자 (!@#$ 등)', en: 'Special character (!@#$ …)' } },
    { ok: pw.length > 0 && !/\s/.test(pw), text: { ko: '공백 없음', en: 'No spaces' } },
  ]
}

export const allOk = (rules: Rule[]) => rules.every(r => r.ok)
export const validId = (id: string) => allOk(idRules(id))
export const validPw = (pw: string) => allOk(pwRules(pw))
export const validEmail = (email: string) => email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
export const normEmail = (email: string) => email.trim().toLowerCase()
