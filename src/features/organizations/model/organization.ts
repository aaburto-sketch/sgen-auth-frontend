export interface Organization {
  id: string
  razonSocial: string
  rfcMaestro: string
  sectorIndustrial: string | null
  domicilioFiscal: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}
export interface OrganizationInput {
  razonSocial: string
  rfcMaestro: string
  sectorIndustrial?: string
  domicilioFiscal?: string
}
export interface OrganizationList {
  data: Organization[]
  meta: { page: number; limit: number; total: number }
}
