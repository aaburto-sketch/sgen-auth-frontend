import { useLayoutEffect } from 'react'
import { useMatches } from 'react-router'
import { useTranslation } from 'react-i18next'
import { resolveLocale } from '../../shared/i18n/create-i18n'
import { readRouteMetadata } from './route-metadata'

export function DocumentMetadata() {
  const { t, i18n } = useTranslation()
  const matches = useMatches()
  const metadata = matches.map((match) => readRouteMetadata(match.handle)).findLast((value) => value !== undefined)
  const language = resolveLocale([i18n.resolvedLanguage ?? i18n.language])
  const title = metadata
    ? t('app.documentTitle', { title: t('app.name'), module: t(`modules.${metadata.module}`) })
    : t('app.name')

  useLayoutEffect(() => {
    document.documentElement.lang = language
    document.title = title
  }, [language, title])

  return null
}
