import type { HttpClient } from '../../../shared/api/http-client'
import type { Envelope } from '../../../shared/api/response'
import type { Credentials } from '../model/credentials'
import type { Session } from '../model/session'

export function createAuthApi(http: HttpClient) {
  return {
    async profile() {
      return (await http.request<Envelope<Session>>('/auth/me')).data
    },
    async login(credentials: Credentials, tenantId?: string) {
      await http.request('/auth/login', {
        method: 'POST',
        authenticated: false,
        body: { ...credentials, ...(tenantId ? { tenantId } : {}) },
      })
    },
    async logout() {
      await http.request('/auth/logout', { method: 'POST' })
    },
    async refresh() {
      await http.refresh(true)
    },
  }
}
export type AuthApi = ReturnType<typeof createAuthApi>
