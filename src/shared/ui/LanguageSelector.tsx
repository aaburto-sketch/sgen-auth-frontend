import { useTranslation } from 'react-i18next'
export function LanguageSelector() {
  const { t, i18n } = useTranslation()
  return (
    <label>
      {t('app.language')}{' '}
      <select
        value={i18n.resolvedLanguage ?? 'es'}
        onChange={(event) => {
          void i18n.changeLanguage(event.target.value)
        }}
      >
        <option value="es">Español</option>
        <option value="en">English</option>
      </select>
    </label>
  )
}
