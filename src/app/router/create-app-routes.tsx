import { Navigate, type RouteObject } from 'react-router'
import { App } from '../App'
import { AuthLayout, type AuthLayoutProps } from '../layouts/AuthLayout'
import { AuthPage } from '../pages/AuthPage'
import type { RouteMetadata } from './route-metadata'
import { routePaths } from './route-paths'

export function createAppRoutes(dependencies: AuthLayoutProps): RouteObject[] {
  return [
    {
      path: '/',
      element: <App />,
      children: [
        { index: true, element: <Navigate to={routePaths.login} replace /> },
        {
          element: <AuthLayout {...dependencies} />,
          children: [
            {
              path: routePaths.login,
              element: <AuthPage mode="login" />,
              handle: { module: 'login' } satisfies RouteMetadata,
            },
            {
              path: routePaths.register,
              element: <AuthPage mode="register" />,
              handle: { module: 'register' } satisfies RouteMetadata,
            },
          ],
        },
        { path: '*', element: <Navigate to={routePaths.login} replace /> },
      ],
    },
  ]
}
