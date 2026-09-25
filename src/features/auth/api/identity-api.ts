import type { HttpClient } from '../../../shared/api/http-client'
import { isRecord, responseMessage } from '../../../shared/api/response'
import type { Credentials } from '../model/credentials'
import { ApplicationError, identityErrorCode } from '../../../shared/api/errors'

export interface IdentityApi {
  signIn(credentials: Credentials): Promise<string>
  signUp(credentials: Credentials): Promise<string>
  deleteAccount(idToken: string): Promise<void>
}

/** GCIP REST adapter. Tokens stay local to each submit operation. */
export function createIdentityApi(http: HttpClient, apiKey: string): IdentityApi {
  const path = (operation: string) => `/accounts:${operation}?key=${encodeURIComponent(apiKey)}`

  async function authenticate(operation: 'signInWithPassword' | 'signUp', credentials: Credentials): Promise<string> {
    const { data } = await http.json(path(operation), {
      method: 'POST',
      body: { ...credentials, returnSecureToken: true },
    })
    if (isRecord(data) && data.error) {
      const message = responseMessage(data.error)
      throw new ApplicationError(identityErrorCode(message ?? ''), message)
    }
    if (!isRecord(data) || typeof data.idToken !== 'string') {
      throw new ApplicationError('invalidIdentityResponse')
    }
    return data.idToken
  }

  return {
    signIn: (credentials) => authenticate('signInWithPassword', credentials),
    signUp: (credentials) => authenticate('signUp', credentials),
    deleteAccount: (idToken) => http.send(path('delete'), { method: 'POST', body: { idToken } }),
  }
}
