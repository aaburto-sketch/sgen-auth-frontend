import type { AppConfig } from '../../config/env'
import { createIdentityApi } from '../../features/auth/api/identity-api'
import { createProfileApi } from '../../features/auth/api/profile-api'
import { createTenantApi } from '../../features/onboarding/api/tenant-api'
import { createHttpClient } from '../../shared/api/http-client'
import { createAuthenticationService } from './authentication-service'

export function createServices(config: AppConfig, fetcher: typeof fetch = fetch) {
  const backend = createHttpClient(config.apiBaseUrl, fetcher)
  const google = createHttpClient('https://identitytoolkit.googleapis.com/v1', fetcher)
  return createAuthenticationService(
    createIdentityApi(google, config.identityApiKey),
    createProfileApi(backend),
    createTenantApi(backend),
  )
}
