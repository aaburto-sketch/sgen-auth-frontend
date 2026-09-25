import { useTranslation } from 'react-i18next'
import { TextField } from '../../../shared/ui/TextField'
import type { TenantRegistration } from '../model/tenant-registration'

interface TenantFieldsProps {
  value: TenantRegistration
  onChange: (value: TenantRegistration) => void
}

export function TenantFields({ value, onChange }: Readonly<TenantFieldsProps>) {
  const { t } = useTranslation()
  return (
    <>
      <TextField
        label={t('onboarding.fullNameLabel')}
        name="fullName"
        type="text"
        placeholder={t('onboarding.fullNamePlaceholder')}
        autoComplete="name"
        value={value.fullName}
        onChange={(event) => onChange({ ...value, fullName: event.target.value })}
        required
      />
      <TextField
        label={t('onboarding.legalNameLabel')}
        name="legalName"
        type="text"
        placeholder={t('onboarding.legalNamePlaceholder')}
        autoComplete="organization"
        value={value.legalName}
        onChange={(event) => onChange({ ...value, legalName: event.target.value })}
        required
      />
      <TextField
        label={t('onboarding.masterTaxIdLabel')}
        name="masterTaxId"
        type="text"
        placeholder={t('onboarding.masterTaxIdPlaceholder')}
        value={value.masterTaxId}
        onChange={(event) => onChange({ ...value, masterTaxId: event.target.value })}
        required
        minLength={12}
        maxLength={13}
      />
    </>
  )
}
