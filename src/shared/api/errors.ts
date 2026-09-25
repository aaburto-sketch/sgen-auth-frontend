export type ErrorCode =
  | 'unknown'
  | 'authenticationFailed'
  | 'invalidIdentityResponse'
  | 'invalidCredentials'
  | 'emailExists'
  | 'invalidEmail'
  | 'weakPassword'
  | 'tooManyAttempts'
  | 'disabledAccount'
  | 'operationNotAllowed'
  | 'sessionExpired'
  | 'identityConfiguration'
  | 'network'
  | 'invalidResponse'
  | 'registrationFailed'
  | 'registrationReverted'
  | 'invalidRegistration'
  | 'registrationConflict'
  | 'forbidden'

/** Keep diagnostics separate from the localized message presented by the UI. */
export class ApplicationError extends Error {
  readonly code: ErrorCode

  constructor(code: ErrorCode, diagnostic: string = code) {
    super(diagnostic)
    this.name = 'ApplicationError'
    this.code = code
  }
}

export function identityErrorCode(message: string): ErrorCode {
  const code = message.split(':', 1)[0]?.trim()
  switch (code) {
    case 'INVALID_LOGIN_CREDENTIALS':
    case 'INVALID_PASSWORD':
    case 'EMAIL_NOT_FOUND': return 'invalidCredentials'
    case 'EMAIL_EXISTS': return 'emailExists'
    case 'INVALID_EMAIL': return 'invalidEmail'
    case 'WEAK_PASSWORD': return 'weakPassword'
    case 'TOO_MANY_ATTEMPTS_TRY_LATER': return 'tooManyAttempts'
    case 'USER_DISABLED': return 'disabledAccount'
    case 'OPERATION_NOT_ALLOWED':
    case 'PASSWORD_LOGIN_DISABLED': return 'operationNotAllowed'
    case 'TOKEN_EXPIRED':
    case 'INVALID_ID_TOKEN': return 'sessionExpired'
    case 'API_KEY_INVALID':
    case 'INVALID_API_KEY': return 'identityConfiguration'
    default: return 'authenticationFailed'
  }
}

export function registrationErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400:
    case 422: return 'invalidRegistration'
    case 401: return 'sessionExpired'
    case 403: return 'forbidden'
    case 409: return 'registrationConflict'
    case 429: return 'tooManyAttempts'
    default: return 'registrationFailed'
  }
}
