/**
 * TODO: MOCK TEMPORAL
 * Estos permisos deben ser confirmados y entregados por el backend.
 * Una vez que exista el contrato definitivo, se deben reemplazar.
 */
export const PERMISSIONS = {
  CREATE_TENANT: 'CREAR_TENANT',
  VIEW_TENANTS: 'CONSULTAR_TENANTS',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]
