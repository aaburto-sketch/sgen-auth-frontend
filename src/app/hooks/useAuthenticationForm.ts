import { useState, type SubmitEvent } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import type { Credentials } from '../../features/auth/model/credentials'
import type { TenantRegistration } from '../../features/onboarding/model/tenant-registration'
import { translateError } from '../../shared/i18n/translate-error'
import type { AuthenticationService } from '../services/authentication-service'

export type AuthMode = 'login' | 'register'

export function useAuthenticationForm(service: AuthenticationService) {
  const { t } = useTranslation()
  const [credentials, setCredentials] = useState<Credentials>({ email: '', password: '' })
  const [tenant, setTenant] = useState<TenantRegistration>({ fullName: '', legalName: '', masterTaxId: '' })
  const [loading, setLoading] = useState(false)

  async function submit(event: SubmitEvent<HTMLFormElement>, mode: AuthMode) {
    event.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const profile = await service.login(credentials, (idToken) => {
          toast.success(t('auth.loginSuccess'))
        })
        console.log('Backend data:', profile)
      } else {
        await service.register(credentials, tenant)
        toast.success(t('auth.registrationSuccess'))
      }
    } catch (error: unknown) {
      toast.error(t('auth.errorMessage', { message: translateError(error, t) }))
    } finally {
      setLoading(false)
    }
  }

  return { credentials, setCredentials, tenant, setTenant, loading, submit }
}
