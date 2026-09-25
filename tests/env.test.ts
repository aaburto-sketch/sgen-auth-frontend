import { describe, expect, it } from 'vitest'
import { readConfig } from '../src/config/env'

describe('frontend configuration', () => {
  it('preserves the default API and missing-key state', () => {
    expect(readConfig({})).toEqual({ apiBaseUrl: 'http://localhost:3000/api/v1', identityApiKey: '' })
  })
  it('allows deployment without changing application code', () => {
    expect(readConfig({ VITE_GCIP_API_KEY: 'key', VITE_API_BASE_URL: 'https://example.test/api/v1/' }))
      .toEqual({ identityApiKey: 'key', apiBaseUrl: 'https://example.test/api/v1' })
  })
  it.each([
    ['https://example.test/', 'https://example.test'],
    ['https://example.test/api//v1///', 'https://example.test/api//v1'],
    ['https://example.test/api/%2F/', 'https://example.test/api/%2F'],
    ['https://example.test/api/v1', 'https://example.test/api/v1'],
    [`https://example.test/api/v1${'/'.repeat(20000)}`, 'https://example.test/api/v1'],
  ])('removes only trailing slashes from configuration %#', (url, expected) => {
    expect(readConfig({ VITE_API_BASE_URL: url }).apiBaseUrl).toBe(expected)
  })
  it.each(['javascript:alert(1)', 'https://user:secret@example.test', 'https://example.test?key=value'])('rejects invalid API configuration %s', (url) => {
    expect(() => readConfig({ VITE_API_BASE_URL: url })).toThrow()
  })
})
