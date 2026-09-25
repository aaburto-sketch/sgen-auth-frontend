import { Outlet } from 'react-router'
import { DocumentMetadata } from './router/DocumentMetadata'

export function App() {
  return (
    <>
      <DocumentMetadata />
      <Outlet />
    </>
  )
}
