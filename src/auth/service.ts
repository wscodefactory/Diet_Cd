// 인증 서비스 인터페이스. 화면은 이 인터페이스만 알고, 실제 구현(Firebase Auth, Supabase Auth, 자체 서버 등)은
// 나중에 갈아 끼움 (docs/paid-items.md). 지금은 브라우저 안에서만 도는 목업(mock.ts)을 씀.

export type User = { id: string; email: string; createdAt: number }

export type AuthError =
  | 'invalid_id' | 'invalid_pw' | 'invalid_email'
  | 'id_taken' | 'email_taken'
  | 'no_pending' | 'code_wrong' | 'code_expired' | 'too_many_tries' | 'resend_wait'
  | 'bad_login' | 'locked'

/** wait: 다시 시도할 수 있을 때까지 남은 초 (resend_wait, locked) */
export type Result<T> = { ok: true; value: T } | { ok: false; error: AuthError; wait?: number }

export type CodeSent = {
  email: string
  expiresAt: number
  resendAt: number
  /** 목업 전용: 메일 대신 화면에 보여줄 인증 코드. 실제 서비스에서는 절대 내려주지 않음 */
  devCode?: string
}

export interface AuthService {
  current(): Promise<User | null>
  /** 1단계: 가입 정보 확인 후 인증 코드 발송. 이때는 아직 계정이 만들어지지 않음 */
  startSignup(input: { id: string; email: string; password: string }): Promise<Result<CodeSent>>
  resendCode(email: string): Promise<Result<CodeSent>>
  /** 2단계: 코드가 맞으면 그때 계정 생성 + 로그인 */
  verifySignup(email: string, code: string): Promise<Result<User>>
  login(id: string, password: string): Promise<Result<User>>
  logout(): Promise<void>
}
