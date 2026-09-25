interface RequestOptions {
  token?: string
  method?: 'GET' | 'POST'
  body?: unknown
}

export interface JsonResponse {
  ok: boolean
  status: number
  data: unknown
}

export interface HttpClient {
  json(path: string, options?: RequestOptions): Promise<JsonResponse>
  send(path: string, options?: RequestOptions): Promise<void>
}

/** Transport only: each feature owns its existing HTTP status handling. No retries. */
export function createHttpClient(baseUrl: string, fetcher: typeof fetch = fetch): HttpClient {
  function request(path: string, options: RequestOptions = {}): Promise<Response> {
    return fetcher(`${baseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  }

  return {
    async json(path, options) {
      const response = await request(path, options)
      const data: unknown = await response.json()
      return { ok: response.ok, status: response.status, data }
    },
    async send(path, options) {
      await request(path, options)
    },
  }
}
