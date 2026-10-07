import { StrictMode } from 'react'
import { render as renderUi } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { afterEach } from 'vitest'
import { createAppRoutes } from '../src/app/router/create-app-routes'
import type { Services } from '../src/app/services/create-services'
import { createI18n } from '../src/shared/i18n/create-i18n'
const routers = new Set<ReturnType<typeof createMemoryRouter>>()
afterEach(() => {
  for (const router of routers) {
    router.dispose()
  }
  routers.clear()
})
export function render(services: Services, path = '/login', preferences: readonly string[] = ['es']) {
  const i18n = createI18n(preferences)
  const router = createMemoryRouter(createAppRoutes(services), { initialEntries: [path] })
  routers.add(router)
  return {
    ...renderUi(
      <StrictMode>
        <I18nextProvider i18n={i18n}>
          <RouterProvider router={router} />
        </I18nextProvider>
      </StrictMode>,
    ),
    i18n,
    router,
  }
}
