import { createContext, useContext, useSyncExternalStore } from 'react'
import type { Services } from './create-services'
export const ServicesContext = createContext<Services | null>(null)
export function useServices(): Services {
  const services = useContext(ServicesContext)
  if (!services) throw new Error('Services provider missing')
  return services
}
export function useSession() {
  const { auth } = useServices()
  return useSyncExternalStore(auth.subscribe, auth.getSnapshot)
}
