import { Outlet } from 'react-router'
import { Toaster } from 'react-hot-toast'
import { useAuthenticationForm } from '../hooks/useAuthenticationForm'
import type { AuthenticationService } from '../services/authentication-service'
import styles from './AuthLayout.module.css'

export interface AuthLayoutProps {
  configured: boolean
  service: AuthenticationService
}

export interface AuthFormContext {
  configured: boolean
  form: ReturnType<typeof useAuthenticationForm>
}

export function AuthLayout({ configured, service }: Readonly<AuthLayoutProps>) {
  const form = useAuthenticationForm(service)
  return (
    <div className={styles.viewport}>
      <div className={styles.content}>
        <Outlet context={{ configured, form } satisfies AuthFormContext} />
      </div>
      <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
    </div>
  )
}
