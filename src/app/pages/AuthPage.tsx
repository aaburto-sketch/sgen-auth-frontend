import { useState, type SubmitEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router'
import { tenantChoices, type TenantChoice } from '../../features/auth/model/session'
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
  const [step, setStep] = useState<'email' | 'password'>('email')
  const [showPwd, setShowPwd] = useState(false)

  const handleContinueEmail = () => {
    if (!credentials.email.trim()) return
    setStep('password')
  }

  const handleBackToEmail = () => {
    setStep('email')
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(undefined)
    try {
      await auth.login(credentials, tenantId || undefined)
      setCredentials({ email: '', password: '' })
      setChoices([])
      setStep('email')
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
        setStep('password')
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
    setStep('email')
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
      <img src="/assets/logo-completo.png" alt="Enegence" className={styles.logo} onError={(e) => e.currentTarget.style.display = 'none'} />

      <form onSubmit={step === 'email' && choices.length === 0 ? (e) => { e.preventDefault(); handleContinueEmail(); } : submit} aria-busy={busy}>
        <fieldset disabled={busy} style={{ border: 'none', padding: 0, margin: 0 }}>
          {choices.length ? (
            <div className={styles.stepContainer}>
              <button type="button" onClick={cancel} className={styles.backButton}>&larr; {credentials.email}</button>
              <h1 className={styles.title} style={{ textAlign: 'left', margin: 0 }}>{t('auth.tenantHeading')}</h1>
              <p className={styles.subtitle} style={{ textAlign: 'left' }}>{t('auth.tenantHint')}</p>
              
              <div className={styles.inputGroup}>
                <label htmlFor="tenant-choice" className={styles.label}>{t('auth.tenantLabel')}</label>
                <select
                  id="tenant-choice"
                  value={tenantId}
                  onChange={(event) => setTenantId(event.target.value)}
                  required
                  className={styles.input}
                >
                  <option value="">{t('auth.tenantPlaceholder')}</option>
                  {choices.map((item) => (
                    <option key={item.tenantId} value={item.tenantId}>
                      {item.razonSocial}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className={styles.buttonPrimary} disabled={busy || !tenantId}>
                {busy ? t('auth.processing') : actionLabel}
              </button>
            </div>
          ) : step === 'email' ? (
            <div className={styles.stepContainer}>
              <div className={styles.headerBox}>
                <h1 className={styles.title}>{t('auth.loginStep1Title')}</h1>
                <p className={styles.subtitle}>{t('auth.loginStep1Subtitle')}</p>
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="emailInput" className={styles.label}>{t('auth.emailLabel')}</label>
                <input 
                  id="emailInput" 
                  type="email" 
                  autoComplete="username" 
                  placeholder="nombre@empresa.com" 
                  className={styles.input} 
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({...prev, email: e.target.value}))}
                  required
                />
              </div>
              <button type="submit" className={styles.buttonPrimary} disabled={!credentials.email.trim()}>{t('auth.continueEmail')}</button>
            </div>
          ) : (
            <div className={styles.stepContainer}>
              <button type="button" onClick={handleBackToEmail} className={styles.backButton}>&larr; {credentials.email}</button>
              <h1 className={styles.title} style={{ textAlign: 'left', margin: 0 }}>{t('auth.loginStep2Title')}</h1>
              <div className={styles.inputGroup}>
                <label htmlFor="pwdInput" className={styles.label}>{t('auth.passwordLabel')}</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    id="pwdInput" 
                    type={showPwd ? 'text' : 'password'} 
                    autoComplete="current-password" 
                    className={styles.input} 
                    style={{ paddingRight: '48px', width: '100%', boxSizing: 'border-box' }}
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({...prev, password: e.target.value}))}
                    required
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} aria-label="Mostrar u ocultar contraseña" className={styles.togglePwdButton} style={{ position: 'absolute', right: '4px', top: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5A6178" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </div>
              </div>
              
              <button type="submit" className={styles.buttonPrimary} disabled={busy || !credentials.password.trim()}>
                {busy ? t('auth.processing') : t('auth.loginButton')}
              </button>
            </div>
          )}
        </fieldset>
      </form>
      {error !== undefined && <ErrorNotice error={error} />}
      {state.status === 'error' && error === undefined && <ErrorNotice error={state.error} />}
    </main>
  )
}
