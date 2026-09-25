import { en } from '../../shared/i18n/locales/en'

export interface RouteMetadata {
  module: keyof typeof en.modules
}

export function readRouteMetadata(handle: unknown): RouteMetadata | undefined {
  if (handle === null || typeof handle !== 'object' || !('module' in handle)) return undefined
  if (typeof handle.module !== 'string' || !Object.hasOwn(en.modules, handle.module)) return undefined
  return { module: handle.module as RouteMetadata['module'] }
}
