import { describe, expect, it } from 'vitest'
import { ApplicationError, identityErrorCode, registrationErrorCode } from '../src/shared/api/errors'
import { createI18n, resolveLocale, supportedLocales } from '../src/shared/i18n/create-i18n'
import { en } from '../src/shared/i18n/locales/en'
import { es } from '../src/shared/i18n/locales/es'
import { translateError } from '../src/shared/i18n/translate-error'

function flatten(value: object, prefix = ''): Record<string, string> {
  return Object.fromEntries(Object.entries(value).flatMap(([key, entry]: [string, unknown]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof entry === 'string') return [[path, entry]]
    if (entry !== null && typeof entry === 'object') return Object.entries(flatten(entry, path))
    throw new Error(`Unexpected catalog value at ${path}`)
  }))
}

describe('language configuration and catalogs', () => {
  it.each([
    { preferences: ['en-US'], expected: 'en' },
    { preferences: ['EN_gb'], expected: 'en' },
    { preferences: ['es-MX'], expected: 'es' },
    { preferences: ['es-ES', 'en'], expected: 'es' },
    { preferences: ['fr-FR', 'en-US', 'es'], expected: 'en' },
    { preferences: ['fr-FR'], expected: 'es' },
    { preferences: [], expected: 'es' },
  ])('resolves $preferences to $expected', ({ preferences, expected }) => {
    expect(resolveLocale(preferences)).toBe(expected)
    const i18n = createI18n(preferences)
    expect(i18n.isInitialized).toBe(true)
    expect(i18n.resolvedLanguage).toBe(expected)
  })

  it('ships only complete English and Spanish catalogs with matching interpolation parameters', () => {
    expect(supportedLocales).toEqual(['en', 'es'])
    const english = flatten(en)
    const spanish = flatten(es)
    const compareStrings = (first: string, second: string) => first.localeCompare(second)
    expect(Object.keys(spanish).sort(compareStrings)).toEqual(Object.keys(english).sort(compareStrings))
    const parameters = (value: string) => [...value.matchAll(/{{\s*(\w+)\s*}}/g)]
      .map(([, parameter = '']) => parameter).sort(compareStrings)
    for (const [key, value] of Object.entries(english)) {
      const translation = spanish[key] ?? ''
      expect(translation.trim(), key).not.toBe('')
      expect(parameters(translation), key).toEqual(parameters(value))
      expect(value + translation, key).not.toMatch(/\p{Extended_Pictographic}/u)
    }
    expect(Object.keys(createI18n().options.resources ?? {})).toEqual(['en', 'es'])
  })

  it('falls back to Spanish for unsupported programmatic language changes', async () => {
    const i18n = createI18n(['en'])
    await i18n.changeLanguage('fr')
    expect(i18n.resolvedLanguage).toBe('es')
    expect(i18n.t('auth.loginButton')).toBe('Entrar')
  })

  it('interpolates feedback values instead of exposing translation keys', () => {
    const i18n = createI18n(['en'])
    expect(i18n.t('auth.loginSuccess', { tokenPreview: 'test-token' })).toBe('Login successful! JWT received. test-token...')
  })
})

describe('localized errors', () => {
  it.each([
    { locale: 'en', expected: 'The email address or password is incorrect.' },
    { locale: 'es', expected: 'El correo electrónico o la contraseña no son correctos.' },
  ])('translates provider codes in $locale', ({ locale, expected }) => {
    const i18n = createI18n([locale])
    const error = new ApplicationError(identityErrorCode('INVALID_LOGIN_CREDENTIALS'), 'INVALID_LOGIN_CREDENTIALS')
    expect(translateError(error, i18n.t)).toBe(expected)
    expect(error.message).toBe('INVALID_LOGIN_CREDENTIALS')
  })

  it('translates password errors that contain provider-specific details', () => {
    const i18n = createI18n(['es'])
    expect(translateError(new ApplicationError(identityErrorCode('WEAK_PASSWORD : Password should be stronger')), i18n.t))
      .toBe('La contraseña no cumple los requisitos de seguridad.')
  })

  it('keeps arbitrary backend text out of localized feedback', () => {
    const error = new ApplicationError(registrationErrorCode(500), 'Error SQL interno no traducido')
    expect(translateError(error, createI18n(['en']).t)).toBe('Registration could not be completed.')
    expect(translateError(error, createI18n(['es']).t)).toBe('No se pudo completar el registro.')
    expect(error.message).toBe('Error SQL interno no traducido')
  })

  it('localizes network failures, unreadable responses and unknown errors', () => {
    const { t } = createI18n(['en'])
    expect(translateError(new TypeError('Failed to fetch'), t)).toBe('Unable to connect to the service. Check your connection.')
    expect(translateError(new SyntaxError('Unexpected token'), t)).toBe('The service returned an unreadable response.')
    expect(translateError(new Error('Untranslated details'), t)).toBe('The operation could not be completed.')
    expect(translateError(null, t)).toBe('The operation could not be completed.')
  })
})
