import { Outlet } from 'react-router'
import { useAuthenticationForm } from '../hooks/useAuthenticationForm'
import type { AuthenticationService } from '../services/authentication-service'

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
  return <Outlet context={{ configured, form } satisfies AuthFormContext} />
}
