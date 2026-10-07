import { vi } from 'vitest'
import { createServices } from '../src/app/services/create-services'
import type { Session } from '../src/features/auth/model/session'
import type { Organization } from '../src/features/organizations/model/organization'
import type { SessionLock } from '../src/shared/api/session-lock'

export const alpha = '00000000-0000-4000-8000-000000000011'
export const beta = '00000000-0000-4000-8000-000000000012'
export const platform: Session = {
  identity: {
    id: 'identity',
    email: 'platform@example.test',
    name: 'Platform Admin',
    type: 'SUPERADMIN_PLATAFORMA',
    active: true,
  },
  context: { sub: 'identity', sid: 'session', tid: null, mid: null, rbv: null, mod: 'SUPERADMIN_PLATAFORMA' },
  permissions: [],
}
export function tenantSession(id = alpha): Session {
  return {
    ...platform,
    identity: { ...platform.identity, name: 'Tenant Admin', type: 'CLIENTE' },
    context: { ...platform.context, mod: 'USUARIO_CLIENTE', tid: id, mid: 'membership', rbv: 2 },
    permissions: [{ module: 'SEGURIDAD', code: 'GESTIONAR_USUARIOS' }],
  }
}
export const organization = (id: string, name: string, rfc = 'AAA010101AA1'): Organization => ({
  id,
  razonSocial: name,
  rfcMaestro: rfc,
  sectorIndustrial: null,
  domicilioFiscal: null,
  active: true,
  createdAt: '2026-10-07T12:00:00.000Z',
  updatedAt: '2026-10-07T12:00:00.000Z',
})
export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
export const denied = (code = 'SESSION_INVALID', status = 401, details?: unknown) =>
  json({ error: { code, details }, requestId: 'test-request' }, status)
export function serialLock(): SessionLock {
  let tail = Promise.resolve()
  return (work) => {
    const operation = tail.then(work)
    tail = operation.then(
      () => {},
      () => {},
    )
    return operation
  }
}
export function fixture(
  options: { initial?: Session; loginAs?: Session; loginError?: string; shared?: boolean } = {},
) {
  let session = options.initial
  const rows = [
    organization(alpha, 'Development Alpha'),
    organization(beta, 'Development Beta', 'BBB010101BB1'),
  ]
  function login(body: Record<string, string>): Response {
    if (options.loginError)
      return denied(options.loginError, options.loginError === 'INVALID_CREDENTIALS' ? 401 : 403)
    if (options.shared && !body.tenantId)
      return denied(
        'TENANT_SELECTION_REQUIRED',
        409,
        rows.map((row) => ({ tenantId: row.id, razonSocial: row.razonSocial })),
      )
    session = options.shared ? tenantSession(body.tenantId) : (options.loginAs ?? platform)
    return json({ data: { ...session, csrfToken: 'session-csrf', expiresIn: 600 } })
  }
  const fetcher = vi.fn<typeof fetch>(async (input, init) => {
    const url = new URL(String(input))
    const body = init?.body ? (JSON.parse(String(init.body)) as Record<string, string>) : {}
    if (url.pathname.endsWith('/auth/csrf')) return json({ data: { csrfToken: 'test-csrf' } })
    if (url.pathname.endsWith('/auth/login')) return login(body)
    if (url.pathname.endsWith('/auth/refresh'))
      return session ? json({ data: { csrfToken: 'rotated-csrf' } }) : denied()
    if (!session) return denied()
    if (url.pathname.endsWith('/auth/me')) return json({ data: session })
    if (url.pathname.endsWith('/auth/logout')) {
      session = undefined
      return json({ data: { success: true } })
    }
    return organizationResponse(rows, session, url, init?.method, body)
  })
  const services = createServices({ apiBaseUrl: 'http://localhost:3000/api/v1' }, fetcher, serialLock())
  return { services, fetcher, rows }
}

function organizationResponse(
  rows: Organization[],
  session: Session,
  url: URL,
  method: string | undefined,
  body: Record<string, string>,
): Response {
  if (!url.pathname.endsWith('/organizations')) {
    const id = url.pathname.split('/').at(-1)
    const item = rows.find((row) => row.id === id)
    const tenantId = session.context.tid
    const allowed = session.context.mod === 'SUPERADMIN_PLATAFORMA' ||
      (typeof tenantId === 'string' && tenantId === id)
    return item && allowed ? json({ data: item }) : denied('ORGANIZATION_NOT_FOUND', 404)
  }
  if (session.context.mod !== 'SUPERADMIN_PLATAFORMA') return denied('PLATFORM_REQUIRED', 403)
  if (method === 'POST') return createOrganization(rows, body)
  const search = url.searchParams.get('search')?.toLowerCase() ?? ''
  const filtered = rows.filter(
    (row) => row.razonSocial.toLowerCase().includes(search) || row.rfcMaestro.toLowerCase().includes(search),
  )
  return json({ data: filtered, meta: { page: 1, limit: 10, total: filtered.length } })
}
function createOrganization(rows: Organization[], body: Record<string, string>): Response {
  if (rows.some((row) => row.rfcMaestro === body.rfcMaestro)) return denied('DUPLICATE_RECORD', 409)
  const item = {
    ...organization('00000000-0000-4000-8000-000000000013', body.razonSocial ?? '', body.rfcMaestro),
    sectorIndustrial: body.sectorIndustrial ?? null,
    domicilioFiscal: body.domicilioFiscal ?? null,
  }
  rows.push(item)
  return json({ data: item }, 201)
}
