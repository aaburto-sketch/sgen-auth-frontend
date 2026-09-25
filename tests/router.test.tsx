import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { AuthenticationService } from '../src/app/services/authentication-service'
import { render } from './render'

function dependencies() {
  const service: AuthenticationService = { login: vi.fn(), register: vi.fn() }
  return { configured: true, service }
}

describe('routing and document metadata', () => {
  it.each([
    { path: '/login', locale: 'es-MX', lang: 'es', title: 'SGEn | Inicio de sesión', form: 'Iniciar sesión' },
    { path: '/register', locale: 'es-MX', lang: 'es', title: 'SGEn | Registro', form: 'Registrar cuenta' },
    { path: '/login', locale: 'en-US', lang: 'en', title: 'SGEn | Sign in', form: 'Sign in' },
    { path: '/register', locale: 'en-US', lang: 'en', title: 'SGEn | Registration', form: 'Create account' },
  ])('opens $path directly in $locale with route metadata', ({ path, locale, lang, title, form }) => {
    const props = dependencies()
    document.documentElement.removeAttribute('lang')
    document.title = ''
    const { router } = render(props, [locale], { initialEntries: [path] })
    expect(screen.getByRole('form', { name: form })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe(path)
    expect(document.documentElement.lang).toBe(lang)
    expect(document.title).toBe(title)
    expect(document.querySelectorAll('title')).toHaveLength(1)
    expect(props.service.login).not.toHaveBeenCalled()
    expect(props.service.register).not.toHaveBeenCalled()
  })

  it('updates the route and title while preserving fields through back and forward navigation', async () => {
    const user = userEvent.setup()
    const props = dependencies()
    const { router } = render(props)
    expect(screen.getByRole('link', { name: 'Iniciar Sesión' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Iniciar Sesión' })).toHaveAttribute('aria-current', 'page')
    await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.test')
    await user.type(screen.getByLabelText('Contraseña'), 'password123')
    await user.click(screen.getByRole('link', { name: 'Registrarse' }))
    expect(router.state.location.pathname).toBe('/register')
    expect(document.title).toBe('SGEn | Registro')
    expect(screen.getByRole('link', { name: 'Registrarse' })).toHaveAttribute('aria-current', 'page')
    await user.type(screen.getByLabelText('Nombre completo'), 'Test Person')

    await act(async () => { await router.navigate(-1) })
    expect(router.state.location.pathname).toBe('/login')
    expect(document.title).toBe('SGEn | Inicio de sesión')
    expect(screen.queryByLabelText('Nombre completo')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('test@example.test')

    await act(async () => { await router.navigate(1) })
    expect(router.state.location.pathname).toBe('/register')
    expect(document.title).toBe('SGEn | Registro')
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Test Person')
    expect(screen.getByLabelText('Contraseña')).toHaveValue('password123')
    expect(props.service.login).not.toHaveBeenCalled()
    expect(props.service.register).not.toHaveBeenCalled()
  })

  it('translates the active route module when the language changes without changing the URL or fields', async () => {
    const user = userEvent.setup()
    const { router, i18n } = render(dependencies(), ['en'], { initialEntries: ['/register/?source=test#form'] })
    await user.type(screen.getByLabelText('Full name'), 'Test Person')
    expect(document.title).toBe('SGEn | Registration')

    await act(async () => { await i18n.changeLanguage('es') })
    expect(document.documentElement.lang).toBe('es')
    expect(document.title).toBe('SGEn | Registro')
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Test Person')
    expect(router.state.location).toMatchObject({ pathname: '/register/', search: '?source=test', hash: '#form' })

    await act(async () => { await i18n.changeLanguage('en') })
    expect(document.title).toBe('SGEn | Registration')
    await act(async () => { await i18n.changeLanguage('fr') })
    expect(document.documentElement.lang).toBe('es')
    expect(document.title).toBe('SGEn | Registro')
  })

  it.each(['/', '/unknown/path'])('replaces %s with the login route without trapping browser history', async (path) => {
    const { router } = render(dependencies(), ['en'], { initialEntries: ['/register', path], initialIndex: 1 })
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(document.title).toBe('SGEn | Sign in')
    expect(router.state.historyAction).toBe('REPLACE')
    await act(async () => { await router.navigate(-1) })
    expect(router.state.location.pathname).toBe('/register')
    expect(document.title).toBe('SGEn | Registration')
  })

  it('submits direct registration through the existing service and stays on its route', async () => {
    const user = userEvent.setup()
    const props = dependencies()
    const { router } = render(props, ['en'], { initialEntries: ['/register'] })
    await user.type(screen.getByLabelText('Email address'), 'test@example.test')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Full name'), 'Test Person')
    await user.type(screen.getByLabelText('Legal name'), 'Test Company')
    await user.type(screen.getByLabelText('Master RFC'), 'AAA010101AAA')
    await user.click(screen.getByRole('button', { name: 'Register' }))
    expect(props.service.register).toHaveBeenCalledExactlyOnceWith(
      { email: 'test@example.test', password: 'password123' },
      { fullName: 'Test Person', legalName: 'Test Company', masterTaxId: 'AAA010101AAA' },
    )
    expect(props.service.login).not.toHaveBeenCalled()
    expect(router.state.location.pathname).toBe('/register')
    expect(document.title).toBe('SGEn | Registration')
    expect(screen.getByRole('status')).toHaveTextContent('Successfully registered with Google and the database!')
  })

  it('keeps an in-flight submission and its feedback when navigating between authentication routes', async () => {
    const user = userEvent.setup()
    const props = dependencies()
    let complete: ((value: unknown) => void) | undefined
    props.service.login = vi.fn((_credentials, onAuthenticated) => {
      onAuthenticated('test-token')
      return new Promise((resolve) => { complete = resolve })
    })
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const { router } = render(props, ['en'])
    await user.type(screen.getByLabelText('Email address'), 'test@example.test')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    await user.click(screen.getByRole('link', { name: 'Sign up' }))
    expect(screen.getByRole('button', { name: 'Processing...' })).toBeDisabled()
    complete?.({})
    await waitFor(() => expect(screen.getByRole('button', { name: 'Register' })).toBeEnabled())
    expect(props.service.login).toHaveBeenCalledTimes(1)
    expect(props.service.register).not.toHaveBeenCalled()
    expect(router.state.location.pathname).toBe('/register')
    expect(screen.getByRole('status')).toHaveTextContent('Login successful! JWT received. test-token...')
  })
})
