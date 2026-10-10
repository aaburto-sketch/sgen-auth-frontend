import { useServices, useSession } from '../../app/services/services-context'

export function ThemeSelector() {
  const { auth } = useServices()
  const state = useSession()

  const currentTheme = state.status === 'authenticated' ? state.session.identity.theme || 'light' : 'light'

  return (
    <select
      value={currentTheme}
      onChange={(event) => {
        const theme = event.target.value
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        if (state.status === 'authenticated') {
          void auth.updateSettings({ theme })
        }
      }}
      style={{
        padding: '0.5rem',
        borderRadius: '6px',
        border: '1px solid var(--color-border)',
        background: 'transparent',
        color: 'inherit',
        fontFamily: 'inherit',
        cursor: 'pointer'
      }}
    >
      <option value="light">Claro</option>
      <option value="dark">Oscuro</option>
    </select>
  )
}
