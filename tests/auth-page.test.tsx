import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { AuthenticationService } from '../src/app/services/authentication-service'
import { render } from './render'

function service(): AuthenticationService {
  return { login: vi.fn(), register: vi.fn() }
}

describe('authentication screen', () => {
  it('keeps the missing-key warning and disabled submission, without emojis or automatic calls', () => {
    const api = service()
    const { container } = render({ configured: false, service: api })
    expect(screen.getByRole('alert')).toHaveTextContent('Falta configurar VITE_GCIP_API_KEY')
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled()
    expect(container.textContent).not.toMatch(/\p{Extended_Pictographic}/u)
    expect(api.login).not.toHaveBeenCalled()
    expect(api.register).not.toHaveBeenCalled()
  })

  it('preserves credentials and tenant fields when switching modes', async () => {
    const user = userEvent.setup()
    render({ configured: true, service: service() })
    await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.test')
    await user.type(screen.getByLabelText('Contraseña'), 'password123')
    await user.click(screen.getByRole('link', { name: 'Registrarse' }))
    await user.type(screen.getByLabelText('Nombre completo'), 'Test Person')
    await user.click(screen.getByRole('link', { name: 'Iniciar Sesión' }))
    expect(screen.queryByLabelText('Nombre completo')).not.toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Registrarse' }))
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('test@example.test')
    expect(screen.getByLabelText('Contraseña')).toHaveValue('password123')
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Test Person')
    expect(screen.getByLabelText('RFC maestro')).toHaveAttribute('minlength', '12')
    expect(screen.getByLabelText('RFC maestro')).toHaveAttribute('maxlength', '13')
  })

  it('retains the existing login message, loading state and diagnostic profile output', async () => {
    const user = userEvent.setup()
    const token = '12345678901234567890-remainder'
    const profile = { success: true, profile: {} }
    let complete: ((value: unknown) => void) | undefined
    const api: AuthenticationService = {
      login: vi.fn((_credentials, callback) => {
        callback(token)
        return new Promise((resolve) => { complete = resolve })
      }),
      register: vi.fn(),
    }
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    render({ configured: true, service: api })
    await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.test')
    await user.type(screen.getByLabelText('Contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(screen.getByRole('button', { name: 'Procesando...' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('¡Login Exitoso! JWT Obtenido. 12345678901234567890...')
    complete?.(profile)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled())
    expect(log).toHaveBeenCalledWith('Backend data:', profile)
  })

  it('keeps the registration form and its success message after submitting', async () => {
    const user = userEvent.setup()
    const api = service()
    render({ configured: true, service: api })
    await user.click(screen.getByRole('link', { name: 'Registrarse' }))
    await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.test')
    await user.type(screen.getByLabelText('Contraseña'), 'password123')
    await user.type(screen.getByLabelText('Nombre completo'), 'Test Person')
    await user.type(screen.getByLabelText('Razón social'), 'Test Company')
    await user.type(screen.getByLabelText('RFC maestro'), 'AAA010101AAA')
    await user.click(screen.getByRole('button', { name: /^Registrar$/ }))
    expect(api.register).toHaveBeenCalledWith(
      { email: 'test@example.test', password: 'password123' },
      { fullName: 'Test Person', legalName: 'Test Company', masterTaxId: 'AAA010101AAA' },
    )
    expect(screen.getByRole('status')).toHaveTextContent('¡Registro exitoso en Google y en Base de Datos!')
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Test Person')
  })

  it('shows the existing error presentation and releases the submit button', async () => {
    const user = userEvent.setup()
    const api = service()
    api.login = vi.fn().mockRejectedValue(new Error('INVALID_LOGIN_CREDENTIALS'))
    render({ configured: true, service: api })
    await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.test')
    await user.type(screen.getByLabelText('Contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(screen.getByRole('status')).toHaveTextContent('Error: El correo electrónico o la contraseña no son correctos.')
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled()
  })

  it('localizes labels, placeholders, configuration and document metadata in English without a language control', async () => {
    const user = userEvent.setup()
    render({ configured: false, service: service() }, ['en-US'])
    expect(document.documentElement.lang).toBe('en')
    expect(document.title).toBe('SGEn | Sign in')
    expect(screen.getByRole('alert')).toHaveTextContent('Set VITE_GCIP_API_KEY in the .env file')
    expect(screen.getByRole('group', { name: 'Access options' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toHaveAttribute('placeholder', 'Email Address')
    expect(screen.getByLabelText('Password')).toHaveAttribute('placeholder', 'Password')
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Sign up' }))
    expect(screen.getByRole('form', { name: 'Create account' })).toBeInTheDocument()
    expect(screen.getByLabelText('Full name')).toHaveAttribute('placeholder', 'Full Name')
    expect(screen.getByLabelText('Legal name')).toHaveAttribute('placeholder', 'Legal Name (e.g. Company Ltd.)')
    expect(screen.getByLabelText('Master RFC')).toHaveAttribute('placeholder', 'Master RFC (12 or 13 characters)')
    expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled()
  })

  it('localizes login feedback and updates existing messages without resetting the form', async () => {
    const user = userEvent.setup()
    const api = service()
    api.login = vi.fn(async (_credentials, callback) => {
      callback('12345678901234567890-remainder')
      return {}
    })
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const { i18n } = render({ configured: true, service: api }, ['en'])
    await user.type(screen.getByLabelText('Email address'), 'test@example.test')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(within(screen.getByRole('form', { name: 'Sign in' })).getByRole('button', { name: 'Sign in' }))
    expect(screen.getByRole('status')).toHaveTextContent('Login successful! JWT received. 12345678901234567890...')
    await act(async () => { await i18n.changeLanguage('es') })
    expect(document.documentElement.lang).toBe('es')
    expect(document.title).toBe('SGEn | Inicio de sesión')
    expect(screen.getByRole('status')).toHaveTextContent('¡Login Exitoso! JWT Obtenido. 12345678901234567890...')
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('test@example.test')
    expect(api.login).toHaveBeenCalledTimes(1)
  })

  it('localizes registration success while keeping the existing submission', async () => {
    const user = userEvent.setup()
    const api = service()
    render({ configured: true, service: api }, ['en'])
    await user.click(screen.getByRole('link', { name: 'Sign up' }))
    await user.type(screen.getByLabelText('Email address'), 'test@example.test')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Full name'), 'Test Person')
    await user.type(screen.getByLabelText('Legal name'), 'Test Company')
    await user.type(screen.getByLabelText('Master RFC'), 'AAA010101AAA')
    await user.click(screen.getByRole('button', { name: 'Register' }))
    expect(screen.getByRole('status')).toHaveTextContent('Successfully registered with Google and the database!')
    expect(api.register).toHaveBeenCalledWith(
      { email: 'test@example.test', password: 'password123' },
      { fullName: 'Test Person', legalName: 'Test Company', masterTaxId: 'AAA010101AAA' },
    )
  })

  it('localizes provider errors in English', async () => {
    const user = userEvent.setup()
    const api = service()
    api.login = vi.fn().mockRejectedValue(new Error('INVALID_LOGIN_CREDENTIALS'))
    render({ configured: true, service: api }, ['en'])
    await user.type(screen.getByLabelText('Email address'), 'test@example.test')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(within(screen.getByRole('form', { name: 'Sign in' })).getByRole('button', { name: 'Sign in' }))
    expect(screen.getByRole('status')).toHaveTextContent('Error: The email address or password is incorrect.')
  })
})
