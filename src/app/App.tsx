import { useEffect } from 'react'
import { Outlet } from 'react-router'
import { DocumentMetadata } from './router/DocumentMetadata'
import { ServicesContext } from './services/services-context'
import type { Services } from './services/create-services'

export function App({ services }: Readonly<{ services: Services }>) {
  useEffect(() => {
    void services.auth.restore()
    if (typeof BroadcastChannel === 'undefined') return
    const channel = new BroadcastChannel('sgen-session-state')
    const disconnect = services.auth.setBroadcast(() => {
      channel.postMessage('changed')
    })
    channel.onmessage = (event) => {
      if (event.data === 'changed') void services.auth.externalChange()
    }
    return () => {
      disconnect()
      channel.close()
    }
  }, [services])
  return (
    <ServicesContext value={services}>
      <DocumentMetadata />
      <Outlet />
    </ServicesContext>
  )
}
