import { describe, expect, it, vi } from 'vitest'
import { createServices } from '../src/app/services/create-services'

const config = { apiBaseUrl: 'http://localhost:3000/api/v1' }
const credentials = { email: 'test@example.test', password: 'test-password' }
const tenant = { fullName: 'Test Person', legalName: 'Test Company', masterTaxId: 'AAA010101AAA' }
const token = 'test-access-token'

function response(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('local authentication flows', () => {
  it('calls login endpoint and then fetches profile', async () => {
    const onAuthenticated = vi.fn()
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response({ access_token: token }))
      .mockImplementationOnce(async () => {
        expect(onAuthenticated).toHaveBeenCalledWith(token)
        return response({ success: true, profile: { 'nombre_completo': 'Test Person' } })
      })

    const result = await createServices(config, fetcher).login(credentials, onAuthenticated)
    expect(result).toEqual({ success: true, profile: { 'nombre_completo': 'Test Person' } })
    expect(fetcher).toHaveBeenNthCalledWith(1,
      'http://localhost:3000/api/v1/auth/login',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(credentials) }))
    expect(fetcher).toHaveBeenNthCalledWith(2, 'http://localhost:3000/api/v1/auth/me',
      expect.objectContaining({ method: 'GET', headers: { Authorization: `Bearer ${token}` } }))
  })

  it('stops when the backend rejects authentication', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({ message: 'INVALID_CREDENTIALS' }, 401))
    const callback = vi.fn()
    await expect(createServices(config, fetcher).login(credentials, callback)).rejects.toThrow('INVALID_CREDENTIALS')
    expect(callback).not.toHaveBeenCalled()
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('registers by calling register-tenant with all fields', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response({ success: true, tenantId: 1, access_token: token }, 201))
    
    await createServices(config, fetcher).register(credentials, tenant)
    
    expect(fetcher).toHaveBeenNthCalledWith(1,
      'http://localhost:3000/api/v1/auth/register-tenant',
      expect.objectContaining({ 
        method: 'POST', 
        body: JSON.stringify({
          'nombreCompleto': 'Test Person',
          'razonSocial': 'Test Company',
          'rfcMaestro': 'AAA010101AAA',
          'email': 'test@example.test',
          'password': 'test-password',
        })
      })
    )
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('rejects on registration failure', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response({ message: 'Registration failed' }, 500))
      
    await expect(createServices(config, fetcher).register(credentials, tenant)).rejects.toThrow('Registration failed')
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})
