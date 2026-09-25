import { Trans, useTranslation } from 'react-i18next'
import { NavLink, useOutletContext } from 'react-router'
import { CredentialsFields } from '../../features/auth/components/CredentialsFields'
import { TenantFields } from '../../features/onboarding/components/TenantFields'
import { Button } from '../../shared/ui/Button'
import { Notice } from '../../shared/ui/Notice'
import type { AuthMode } from '../hooks/useAuthenticationForm'
import type { AuthFormContext } from '../layouts/AuthLayout'
import { routePaths } from '../router/route-paths'
import styles from './AuthPage.module.css'

interface AuthPageProps {
  mode: AuthMode
}

export function AuthPage({ mode }: Readonly<AuthPageProps>) {
  const { t } = useTranslation()
  const { configured, form } = useOutletContext<AuthFormContext>()
  const isLogin = mode === 'login'
  const actionLabelKey = isLogin ? 'auth.loginButton' : 'auth.registerButton'
  const submitLabel = t(form.loading ? 'auth.processing' : actionLabelKey)

  return (
    <main className={styles.panel}>
      <h1 className={styles.title}>{t('app.title')}</h1>

      {!configured && (
        <Notice className={styles.configurationMessage} variant="warning" role="alert">
          <Trans
            t={t}
            i18nKey="app.missingApiKey"
            values={{ variable: 'VITE_GCIP_API_KEY', file: '.env' }}
            components={{ key: <strong /> }}
          />
        </Notice>
      )}

      <div className={styles.tabs} role="group" aria-label={t('auth.modeLabel')}>
        <NavLink to={routePaths.login} className={styles.tab} end>
          {t('auth.loginTab')}
        </NavLink>
        <NavLink to={routePaths.register} className={styles.tab} end>
          {t('auth.registerTab')}
        </NavLink>
      </div>

      <form onSubmit={(event) => form.submit(event, mode)} aria-label={t(isLogin ? 'auth.loginForm' : 'auth.registerForm')} aria-busy={form.loading}>
        <CredentialsFields value={form.credentials} onChange={form.setCredentials} newPassword={!isLogin} />
        {!isLogin && <TenantFields value={form.tenant} onChange={form.setTenant} />}
        <Button className={styles.submitButton} type="submit" disabled={form.loading || !configured}>
          {submitLabel}
        </Button>
      </form>

      {form.message && <Notice className={styles.feedbackMessage} role="status">{form.message}</Notice>}
    </main>
  )
}
