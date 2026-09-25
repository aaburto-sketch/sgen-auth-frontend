import type { TFunction } from 'i18next'
import { ApplicationError, identityErrorCode } from '../api/errors'

export function translateError(error: unknown, t: TFunction): string {
  if (error instanceof ApplicationError) return t(`errors.${error.code}`)
  if (error instanceof SyntaxError) return t('errors.invalidResponse')
  if (error instanceof TypeError) return t('errors.network')
  if (error instanceof Error) {
    const code = identityErrorCode(error.message)
    if (code !== 'authenticationFailed') return t(`errors.${code}`)
  }
  return t('errors.unknown')
}
