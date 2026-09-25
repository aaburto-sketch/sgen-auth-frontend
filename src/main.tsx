import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import './index.css'
import { createAppRoutes } from './app/router/create-app-routes'
import { createServices } from './app/services/create-services'
import { readConfig } from './config/env'
import { createI18n } from './shared/i18n/create-i18n'

const config = readConfig(import.meta.env)
const service = createServices(config)
const i18n = createI18n(navigator.languages.length ? navigator.languages : [navigator.language])
const router = createBrowserRouter(createAppRoutes({ configured: Boolean(config.identityApiKey), service }))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <RouterProvider router={router} />
    </I18nextProvider>
  </StrictMode>,
)
