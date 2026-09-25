export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function responseMessage(data: unknown): string | undefined {
  if (!isRecord(data)) return undefined
  if (typeof data.message === 'string') return data.message
  if (Array.isArray(data.message) && data.message.every((item) => typeof item === 'string')) {
    return data.message.join(',')
  }
  return undefined
}
