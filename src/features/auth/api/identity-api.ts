import type { HttpClient } from '../../../shared/api/http-client'
import { isRecord, responseMessage } from '../../../shared/api/response'
import type { Credentials } from '../model/credentials'
import { ApplicationError, identityErrorCode } from '../../../shared/api/errors'

export interface IdentityApi {
  signIn(credentials: Credentials): Promise<string>
}

export function createIdentityApi(http: HttpClient): IdentityApi {
  return {
    signIn: async (credentials) => {
      const { data } = await http.json('/auth/login', {
        method: 'POST',
        body: credentials,
      })
      if (isRecord(data) && data.error) {
        const message = responseMessage(data)
        throw new ApplicationError(identityErrorCode(message ?? ''), message)
      }
      if (!isRecord(data) || typeof data.access_token !== 'string') {
        throw new ApplicationError('invalidIdentityResponse')
      }
      return data.access_token
    },
  }
}
