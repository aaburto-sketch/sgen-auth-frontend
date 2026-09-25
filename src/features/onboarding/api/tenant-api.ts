import type { HttpClient, JsonResponse } from '../../../shared/api/http-client'
import type { TenantRegistration } from '../model/tenant-registration'

export interface TenantApi {
  register(token: string, data: TenantRegistration): Promise<JsonResponse>
}

export function createTenantApi(http: HttpClient): TenantApi {
  return {
    register: (token, data) => http.json('/auth/register-tenant', {
      method: 'POST',
      token,
      // Preserve the backend's field names at the transport boundary.
      body: {
        'nombreCompleto': data.fullName,
        'razonSocial': data.legalName,
        'rfcMaestro': data.masterTaxId,
      },
    }),
  }
}
