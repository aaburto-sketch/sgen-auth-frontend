import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { es } from './locales/es'

export const supportedLocales = ['en', 'es'] as const
export type Locale = typeof supportedLocales[number]
export const defaultLocale: Locale = 'es'

export function resolveLocale(preferences: readonly string[]): Locale {
  for (const preference of preferences) {
    const language = preference.trim().toLowerCase().split(/[-_]/, 1)[0]
    if (language === 'en' || language === 'es') return language
  }
  return defaultLocale
}

/** Catalogs are bundled, so initialization requires no network or persisted preference. */
export function createI18n(preferences: readonly string[] = []) {
  const instance = createInstance()
  void instance.use(initReactI18next).init({
    resources: { en: { translation: en }, es: { translation: es } },
    lng: resolveLocale(preferences),
    supportedLngs: [...supportedLocales],
    fallbackLng: defaultLocale,
    load: 'languageOnly',
    defaultNS: 'translation',
    initAsync: false,
    returnNull: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })
  return instance
}
