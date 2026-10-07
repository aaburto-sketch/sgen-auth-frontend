import type { HttpClient } from '../../../shared/api/http-client'
import type { Envelope } from '../../../shared/api/response'
import type { Organization, OrganizationInput, OrganizationList } from '../model/organization'

export function createOrganizationsApi(http: HttpClient) {
  return {
    list(page: number, search: string, signal?: AbortSignal) {
      const query = new URLSearchParams({ page: String(page), limit: '10', search })
      return http.request<OrganizationList>(`/organizations?${query}`, { signal })
    },
    async detail(id: string, signal?: AbortSignal) {
      return (
        await http.request<Envelope<Organization>>(`/organizations/${encodeURIComponent(id)}`, { signal })
      ).data
    },
    async create(input: OrganizationInput) {
      return (await http.request<Envelope<Organization>>('/organizations', { method: 'POST', body: input }))
        .data
    },
  }
}
