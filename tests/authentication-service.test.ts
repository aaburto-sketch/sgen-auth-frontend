import { describe, expect, it, vi } from 'vitest'
import { createServices } from '../src/app/services/create-services'

const config = { apiBaseUrl: 'http://localhost:3000/api/v1', identityApiKey: 'test-key' }
const credentials = { email: 'test@example.test', password: 'test-password' }
const tenant = { fullName: 'Test Person', legalName: 'Test Company', masterTaxId: 'AAA010101AAA' }
const token = 'test-id-token-only'

function response(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('existing authentication flows', () => {
  it('announces Google login before requesting the profile and sends its Bearer token', async () => {
    const onAuthenticated = vi.fn()
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response({ idToken: token }))
      .mockImplementationOnce(async () => {
        expect(onAuthenticated).toHaveBeenCalledWith(token)
        return response({ success: true, profile: { 'nombre_completo': 'Test Person' } })
      })

    const result = await createServices(config, fetcher).login(credentials, onAuthenticated)
    expect(result).toEqual({ success: true, profile: { 'nombre_completo': 'Test Person' } })
    expect(fetcher).toHaveBeenNthCalledWith(1,
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=test-key',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ ...credentials, returnSecureToken: true }) }))
    expect(fetcher).toHaveBeenNthCalledWith(2, 'http://localhost:3000/api/v1/auth/me',
      expect.objectContaining({ method: 'GET', headers: { Authorization: `Bearer ${token}` } }))
  })

  it('preserves diagnostic /me HTTP errors without converting them into a failed login', async () => {
    const data = { statusCode: 404, message: 'No local profile' }
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response({ idToken: token }))
      .mockResolvedValueOnce(response(data, 404))
    await expect(createServices(config, fetcher).login(credentials, vi.fn())).resolves.toEqual(data)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('stops before the backend when Google rejects authentication', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({ error: { message: 'INVALID_LOGIN_CREDENTIALS' } }, 400))
    const callback = vi.fn()
    await expect(createServices(config, fetcher).login(credentials, callback)).rejects.toThrow('INVALID_LOGIN_CREDENTIALS')
    expect(callback).not.toHaveBeenCalled()
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('registers Google first and sends only the existing tenant fields to the backend', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response({ idToken: token }))
      .mockResolvedValueOnce(response({ success: true, tenantId: 1 }, 201))
    await createServices(config, fetcher).register(credentials, tenant)
    expect(fetcher).toHaveBeenNthCalledWith(1,
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=test-key',
      expect.objectContaining({ body: JSON.stringify({ ...credentials, returnSecureToken: true }) }))
    expect(fetcher).toHaveBeenNthCalledWith(2, 'http://localhost:3000/api/v1/auth/register-tenant',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({
        'nombreCompleto': 'Test Person',
        'razonSocial': 'Test Company',
        'rfcMaestro': 'AAA010101AAA',
      }), headers: {
        Authorization: `Bearer ${token}`, 'Content-Type': 'application/json',
      } }))
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('retains compensation exactly once after a non-2xx JSON response from registration', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response({ idToken: token }))
      .mockResolvedValueOnce(response({ message: 'Registration failed' }, 500))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
    await expect(createServices(config, fetcher).register(credentials, tenant)).rejects.toThrow('Registration failed')
    expect(fetcher).toHaveBeenNthCalledWith(3,
      'https://identitytoolkit.googleapis.com/v1/accounts:delete?key=test-key',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ idToken: token }) }))
    expect(fetcher).toHaveBeenCalledTimes(3)
  })

  it('preserves validation message arrays after compensation', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response({ idToken: token }))
      .mockResolvedValueOnce(response({ message: ['Invalid name', 'Invalid RFC'] }, 400))
      .mockResolvedValueOnce(response({}))
    await expect(createServices(config, fetcher).register(credentials, tenant)).rejects.toThrow('Invalid name,Invalid RFC')
  })

  it('does not add compensation or retries to a registration network failure', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response({ idToken: token }))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(createServices(config, fetcher).register(credentials, tenant)).rejects.toThrow('Failed to fetch')
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('does not add compensation when the registration response is not JSON', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response({ idToken: token }))
      .mockResolvedValueOnce(new Response('unavailable', { status: 502 }))
    await expect(createServices(config, fetcher).register(credentials, tenant)).rejects.toThrow()
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('preserves the original handling of an unsuccessful delete response', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response({ idToken: token }))
      .mockResolvedValueOnce(response({}, 500))
      .mockResolvedValueOnce(new Response('unavailable', { status: 500 }))
    await expect(createServices(config, fetcher).register(credentials, tenant)).rejects.toMatchObject({ code: 'registrationReverted' })
    expect(fetcher).toHaveBeenCalledTimes(3)
  })

  it('surfaces a compensation network failure without another delete attempt', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response({ idToken: token }))
      .mockResolvedValueOnce(response({}, 500))
      .mockRejectedValueOnce(new TypeError('Delete failed'))
    await expect(createServices(config, fetcher).register(credentials, tenant)).rejects.toThrow('Delete failed')
    expect(fetcher).toHaveBeenCalledTimes(3)
  })
})
