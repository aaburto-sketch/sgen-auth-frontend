import type { HttpClient, JsonResponse } from '../../../shared/api/http-client'
import type { TenantRegistration } from '../model/tenant-registration'
import type { Credentials } from '../../auth/model/credentials'

export interface TenantApi {
  register(credentials: Credentials, data: TenantRegistration): Promise<JsonResponse>
}

export function createTenantApi(http: HttpClient): TenantApi {
  return {
    register: (credentials, data) => http.json('/auth/register-tenant', {
      method: 'POST',
      body: {
        'nombreCompleto': data.fullName,
        'razonSocial': data.legalName,
        'rfcMaestro': data.masterTaxId,
        'email': credentials.email,
        'password': credentials.password,
      },
    }),
  }
}
