import { useState, type SubmitEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router'
import { CredentialsFields } from '../../features/auth/components/CredentialsFields'
import { tenantChoices, type TenantChoice } from '../../features/auth/model/session'
import { Button } from '../../shared/ui/Button'
import { ErrorNotice } from '../../shared/ui/ErrorNotice'
import { useServices, useSession } from '../services/services-context'
import styles from './AuthPage.module.css'

export function AuthPage() {
  const { t } = useTranslation()
  const { auth } = useServices()
  const state = useSession()
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [choices, setChoices] = useState<TenantChoice[]>([])
  const [tenantId, setTenantId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<unknown>()

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(undefined)
    try {
      await auth.login(credentials, tenantId || undefined)
      setCredentials({ email: '', password: '' })
      setChoices([])
    } catch (failure) {
      const tenants = tenantChoices(failure)
      if (tenants.length) {
        setChoices(tenants)
        setTenantId('')
      } else {
        setError(failure)
        setChoices([])
        setTenantId('')
        setCredentials((current) => ({ ...current, password: '' }))
      }
    } finally {
      setBusy(false)
    }
  }
  function cancel() {
    setChoices([])
    setTenantId('')
    setCredentials((current) => ({ ...current, password: '' }))
    setError(undefined)
  }
  const actionLabel = choices.length ? t('auth.continue') : t('auth.loginButton')
  if (state.status === 'authenticated') return <Navigate to="/organizations" replace />
  if (state.status === 'loading')
    return (
      <main className={styles.panel}>
        <p role="status">{t('app.loading')}</p>
      </main>
    )
  return (
    <main className={styles.panel}>
      <p className={styles.brand}>SGEn</p>
      <h1>{choices.length ? t('auth.tenantHeading') : t('auth.heading')}</h1>
      <p className={styles.subtitle}>{choices.length ? t('auth.tenantHint') : t('auth.subtitle')}</p>
      <form onSubmit={submit} aria-label={t('auth.loginForm')} aria-busy={busy}>
        <fieldset disabled={busy}>
          {choices.length ? (
            <>
              <p>{credentials.email}</p>
              <label htmlFor="tenant-choice">{t('auth.tenantLabel')}</label>
              <select
                id="tenant-choice"
                value={tenantId}
                onChange={(event) => setTenantId(event.target.value)}
                required
              >
                <option value="">{t('auth.tenantPlaceholder')}</option>
                {choices.map((item) => (
                  <option key={item.tenantId} value={item.tenantId}>
                    {item.razonSocial}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <CredentialsFields value={credentials} onChange={setCredentials} />
          )}
          <Button className={styles.submitButton} type="submit">
            {busy ? t('auth.processing') : actionLabel}
          </Button>
          {choices.length > 0 && (
            <Button className={styles.cancel} onClick={cancel}>
              {t('app.cancel')}
            </Button>
          )}
        </fieldset>
      </form>
      {error !== undefined && <ErrorNotice error={error} />}
      {state.status === 'error' && error === undefined && <ErrorNotice error={state.error} />}
    </main>
  )
}
