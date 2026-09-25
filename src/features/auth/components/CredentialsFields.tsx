import { useTranslation } from 'react-i18next'
import { TextField } from '../../../shared/ui/TextField'
import type { Credentials } from '../model/credentials'

interface CredentialsFieldsProps {
  value: Credentials
  onChange: (value: Credentials) => void
  newPassword?: boolean
}

export function CredentialsFields({ value, onChange, newPassword = false }: Readonly<CredentialsFieldsProps>) {
  const { t } = useTranslation()
  return (
    <>
      <TextField
        label={t('auth.emailLabel')}
        name="email"
        type="email"
        placeholder={t('auth.emailPlaceholder')}
        autoComplete="email"
        value={value.email}
        onChange={(event) => onChange({ ...value, email: event.target.value })}
        required
      />
      <TextField
        label={t('auth.passwordLabel')}
        name="password"
        type="password"
        placeholder={t('auth.passwordPlaceholder')}
        autoComplete={newPassword ? 'new-password' : 'current-password'}
        value={value.password}
        onChange={(event) => onChange({ ...value, password: event.target.value })}
        required
        minLength={6}
      />
    </>
  )
}
