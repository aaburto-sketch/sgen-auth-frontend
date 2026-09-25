import type { HttpClient } from '../../../shared/api/http-client'

export interface ProfileApi {
  getProfile(token: string): Promise<unknown>
}

export function createProfileApi(http: HttpClient): ProfileApi {
  return {
    // Preserve the current flow: /me JSON is diagnostic, even for non-2xx responses.
    async getProfile(token) { return (await http.json('/auth/me', { token })).data },
  }
}
