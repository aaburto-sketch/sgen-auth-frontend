import type { TFunction } from 'i18next'
import { ApiError } from '../api/errors'

const codes = {
  INVALID_CREDENTIALS: 'invalidCredentials',
  SESSION_INVALID: 'sessionExpired',
  CSRF_INVALID: 'csrf',
  PLATFORM_REQUIRED: 'forbidden',
  ACCESS_DENIED: 'forbidden',
  MFA_REQUIRED: 'mfa',
  FEDERATED_LOGIN_REQUIRED: 'federated',
  PASSWORD_CHANGE_REQUIRED: 'passwordChange',
  ORGANIZATION_NOT_FOUND: 'notFound',
  DUPLICATE_RECORD: 'duplicate',
  MFA_POLICY_CONFLICT: 'policy',
  POLICY_MISSING: 'policy',
  REQUEST_FAILED: 'validation',
  INVALID_DATA: 'validation',
  RATE_LIMITED: 'rateLimit',
  INVALID_RESPONSE: 'invalidResponse',
} as const
export function translateError(error: unknown, t: TFunction): string {
  if (error instanceof ApiError) {
    const key = Object.hasOwn(codes, error.code) ? codes[error.code as keyof typeof codes] : 'unknown'
    return t(`errors.${key}`)
  }
  if (error instanceof SyntaxError) return t('errors.invalidResponse')
  if (error instanceof TypeError) return t('errors.network')
  if (error instanceof Error && error.message === 'WEB_LOCKS_UNAVAILABLE') return t('errors.browser')
  return t('errors.unknown')
}
