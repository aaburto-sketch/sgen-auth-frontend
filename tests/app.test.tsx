import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { render } from './render'
import { alpha, beta, fixture, platform, tenantSession } from './fixtures'

async function signIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText('Correo electrónico'), 'test@example.test')
  await user.type(screen.getByLabelText('Contraseña'), crypto.randomUUID())
  await user.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('current backend flows', () => {
  it('requires a session for protected routes and removes public registration', async () => {
    const setup = fixture()
    const { router } = render(setup.services, '/organizations/new')
    await screen.findByRole('form', { name: 'Iniciar sesión' })
    expect(router.state.location.pathname).toBe('/login')
    expect(screen.queryByRole('link', { name: 'Registrarse' })).not.toBeInTheDocument()
    await act(async () => {
      await router.navigate('/register')
    })
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  })
  it('logs platform in, creates an organization and shows its detail', async () => {
    const user = userEvent.setup()
    const setup = fixture()
    render(setup.services)
    await signIn(user)
    await screen.findByText('Development Alpha')
    await user.click(screen.getByRole('link', { name: 'Nueva organización' }))
    await user.type(screen.getByLabelText('Razón social'), 'Live Test Organization')
    await user.type(screen.getByLabelText('RFC maestro'), 'CCC010101CC1')
    await user.click(screen.getByRole('button', { name: 'Crear organización' }))
    await screen.findByRole('heading', { name: 'Live Test Organization' })
    expect(screen.getByRole('status')).toHaveTextContent('Organización creada correctamente.')
    expect(setup.rows).toHaveLength(3)
    expect(sessionStorage).toHaveLength(0)
    expect(localStorage).toHaveLength(0)
  })
  it('shows duplicate RFC error while retaining entered fields', async () => {
    const user = userEvent.setup()
    render(fixture({ initial: platform }).services, '/organizations/new')
    await user.type(await screen.findByLabelText('Razón social'), 'Duplicate Organization')
    await user.type(screen.getByLabelText('RFC maestro'), 'AAA010101AA1')
    await user.click(screen.getByRole('button', { name: 'Crear organización' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe una organización con este RFC.')
    expect(screen.getByLabelText('Razón social')).toHaveValue('Duplicate Organization')
  })
  it('requires tenant selection before showing a shared identity session', async () => {
    const user = userEvent.setup()
    const setup = fixture({ shared: true })
    const { router } = render(setup.services)
    await signIn(user)
    await screen.findByRole('heading', { name: 'Elige una organización' })
    expect(router.state.location.pathname).toBe('/login')
    await user.selectOptions(screen.getByLabelText('Organización'), beta)
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await screen.findByRole('heading', { name: 'Development Beta' })
    expect(screen.queryByRole('link', { name: 'Nueva organización' })).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe(`/organizations/${beta}`)
  })
  it('restores a tenant session and respects denied cross-tenant detail', async () => {
    const { router } = render(fixture({ initial: tenantSession() }).services, '/organizations')
    await screen.findByRole('heading', { name: 'Development Alpha' })
    expect(router.state.location.pathname).toBe(`/organizations/${alpha}`)
    await act(async () => {
      await router.navigate('/organizations/new')
    })
    await waitFor(() => expect(router.state.location.pathname).toBe(`/organizations/${alpha}`))
    await act(async () => {
      await router.navigate(`/organizations/${beta}`)
    })
    expect(await screen.findByRole('alert')).toHaveTextContent('Organización no encontrada')
  })
  it.each(['INVALID_CREDENTIALS', 'MFA_REQUIRED', 'FEDERATED_LOGIN_REQUIRED', 'PASSWORD_CHANGE_REQUIRED'])(
    'does not authenticate when backend returns %s',
    async (code) => {
      const user = userEvent.setup()
      const { router } = render(fixture({ loginError: code }).services)
      await signIn(user)
      expect(await screen.findByRole('alert')).toBeInTheDocument()
      expect(router.state.location.pathname).toBe('/login')
      expect(screen.getByLabelText('Contraseña')).toHaveValue('')
    },
  )
  it('renews and closes the current session', async () => {
    const user = userEvent.setup()
    render(fixture({ initial: platform }).services, '/session')
    await user.click(await screen.findByRole('button', { name: 'Renovar sesión' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Sesión renovada correctamente.')
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    await screen.findByRole('form', { name: 'Iniciar sesión' })
    expect(screen.getByLabelText('Contraseña')).toHaveValue('')
  })
  it('searches organizations and changes visible language', async () => {
    const user = userEvent.setup()
    render(fixture({ initial: platform }).services, '/organizations')
    await screen.findByText('Development Beta')
    await user.type(screen.getByRole('textbox', { name: 'Buscar por nombre o RFC' }), 'Beta')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await waitFor(() => expect(screen.queryByText('Development Alpha')).not.toBeInTheDocument())
    await screen.findByText('Development Beta')
    await user.selectOptions(screen.getByLabelText('Idioma'), 'en')
    expect(screen.getByRole('heading', { name: 'Organizations' })).toBeInTheDocument()
    expect(document.title).toBe('SGEn | Organizations')
  })
})
