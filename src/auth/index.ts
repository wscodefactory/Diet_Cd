import { createMockAuth } from './mock.ts'
import type { AuthService } from './service.ts'

// 실제 인증 서비스를 붙일 때는 이 한 줄만 바꾸면 됨 (docs/paid-items.md)
export const auth: AuthService = createMockAuth({ storage: localStorage })

export type { AuthService, User } from './service.ts'
