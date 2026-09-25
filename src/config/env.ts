export interface AppConfig {
  apiBaseUrl: string
  identityApiKey: string
}

export function readConfig(env: Record<string, unknown>): AppConfig {
  const identityApiKey = typeof env.VITE_GCIP_API_KEY === 'string' ? env.VITE_GCIP_API_KEY : ''
  const base = typeof env.VITE_API_BASE_URL === 'string' ? env.VITE_API_BASE_URL.trim() : ''
  const url = new URL(base || 'http://localhost:3000/api/v1')
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('VITE_API_BASE_URL must be an HTTP(S) URL without credentials, query parameters, or fragments.')
  }
  const normalizedUrl = url.href
  let end = normalizedUrl.length
  while (end > 0 && normalizedUrl[end - 1] === '/') end -= 1
  return { identityApiKey, apiBaseUrl: normalizedUrl.slice(0, end) }
}
