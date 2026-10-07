import { useState } from 'react'
import { NavLink, Navigate, Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useServices, useSession } from '../services/services-context'
import { Button } from '../../shared/ui/Button'
import { ErrorNotice } from '../../shared/ui/ErrorNotice'
import { LanguageSelector } from '../../shared/ui/LanguageSelector'
import styles from './ProtectedLayout.module.css'

export function ProtectedLayout() {
  const { t } = useTranslation()
  const { auth } = useServices()
  const state = useSession()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<unknown>()
  async function logout() {
    setBusy(true)
    setError(undefined)
    try {
      await auth.logout()
    } catch (failure) {
      setError(failure)
    } finally {
      setBusy(false)
    }
  }
  if (state.status === 'anonymous') return <Navigate to="/login" replace />
  if (state.status === 'loading')
    return (
      <main className={styles.main}>
        <p role="status">{t('app.loading')}</p>
      </main>
    )
  if (state.status === 'error')
    return (
      <main className={styles.main}>
        <ErrorNotice error={state.error} />
        <Button
          onClick={() => {
            void auth.restore()
          }}
        >
          {t('app.retry')}
        </Button>
      </main>
    )
  const { session } = state
  const platform = session.context.mod === 'SUPERADMIN_PLATAFORMA'
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <NavLink to="/organizations" className={styles.brand}>
          SGEn<span>{t('app.title')}</span>
        </NavLink>
        <nav aria-label={t('app.name')}>
          <NavLink to="/organizations">
            {platform ? t('organizations.title') : t('organizations.current')}
          </NavLink>
          <NavLink to="/session">{t('session.title')}</NavLink>
        </nav>
        <div className={styles.actions}>
          <LanguageSelector />
          <Button
            onClick={() => {
              void logout()
            }}
            disabled={busy}
          >
            {busy ? t('auth.signingOut') : t('auth.logout')}
          </Button>
        </div>
      </header>
      <main className={styles.main} key={session.context.sid}>
        <div className={styles.identity}>
          <span>{session.identity.name}</span>
          <span>{platform ? t('auth.platform') : t('auth.tenant')}</span>
        </div>
        {error !== undefined && <ErrorNotice error={error} />}
        <Outlet />
      </main>
    </div>
  )
}
