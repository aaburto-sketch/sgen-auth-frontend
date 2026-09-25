import { useState, type SubmitEvent } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import type { Credentials } from '../../features/auth/model/credentials'
import type { TenantRegistration } from '../../features/onboarding/model/tenant-registration'
import { translateError } from '../../shared/i18n/translate-error'
import type { AuthenticationService } from '../services/authentication-service'

export type AuthMode = 'login' | 'register'

type Feedback =
  | { type: 'loginSuccess'; tokenPreview: string }
  | { type: 'registrationSuccess' }
  | { type: 'error'; error: unknown }
  | null

function translateFeedback(feedback: Feedback, t: TFunction): string {
  if (feedback === null) return ''
  switch (feedback.type) {
    case 'loginSuccess': return t('auth.loginSuccess', { tokenPreview: feedback.tokenPreview })
    case 'registrationSuccess': return t('auth.registrationSuccess')
    case 'error': return t('auth.errorMessage', { message: translateError(feedback.error, t) })
  }
}

export function useAuthenticationForm(service: AuthenticationService) {
  const { t } = useTranslation()
  const [credentials, setCredentials] = useState<Credentials>({ email: '', password: '' })
  const [tenant, setTenant] = useState<TenantRegistration>({ fullName: '', legalName: '', masterTaxId: '' })
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const message = translateFeedback(feedback, t)

  async function submit(event: SubmitEvent<HTMLFormElement>, mode: AuthMode) {
    event.preventDefault()
    setLoading(true)
    setFeedback(null)
    try {
      if (mode === 'login') {
        const profile = await service.login(credentials, (idToken) => {
          setFeedback({ type: 'loginSuccess', tokenPreview: idToken.substring(0, 20) })
        })
        console.log('Backend data:', profile)
      } else {
        await service.register(credentials, tenant)
        setFeedback({ type: 'registrationSuccess' })
      }
    } catch (error: unknown) {
      setFeedback({ type: 'error', error })
    } finally {
      setLoading(false)
    }
  }

  return { credentials, setCredentials, tenant, setTenant, loading, message, submit }
}
