import type { IdentityApi } from '../../features/auth/api/identity-api'
import type { ProfileApi } from '../../features/auth/api/profile-api'
import type { Credentials } from '../../features/auth/model/credentials'
import type { TenantApi } from '../../features/onboarding/api/tenant-api'
import type { TenantRegistration } from '../../features/onboarding/model/tenant-registration'
import { responseMessage } from '../../shared/api/response'
import { ApplicationError, registrationErrorCode } from '../../shared/api/errors'

export interface AuthenticationService {
  login(credentials: Credentials, onAuthenticated: (idToken: string) => void): Promise<unknown>
  register(credentials: Credentials, tenant: TenantRegistration): Promise<void>
}

/** Coordinates existing flows; adapters own transport, components own presentation. */
export function createAuthenticationService(identity: IdentityApi, profile: ProfileApi, tenants: TenantApi): AuthenticationService {
  return {
    async login(credentials, onAuthenticated) {
      const token = await identity.signIn(credentials)
      onAuthenticated(token)
      return profile.getProfile(token)
    },
    async register(credentials, tenant) {
      const token = await identity.signUp(credentials)
      const response = await tenants.register(token, tenant)
      if (!response.ok) {
        // Retain the existing compensation trigger and ordering, without automatic retries.
        await identity.deleteAccount(token)
        const message = responseMessage(response.data)
        throw new ApplicationError(message ? registrationErrorCode(response.status) : 'registrationReverted', message || undefined)
      }
    },
  }
}
