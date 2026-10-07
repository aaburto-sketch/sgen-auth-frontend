import { useEffect, useState } from 'react'
export function useResource<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState<{ load: typeof load; revision: number; value?: T; error?: unknown }>()
  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setResult({ load, revision, value })
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResult({ load, revision, error })
      })
    return () => {
      controller.abort()
    }
  }, [load, revision])
  const current = result?.load === load && result.revision === revision ? result : undefined
  return {
    value: current?.value,
    error: current?.error,
    loading: !current,
    retry: () => setRevision((value) => value + 1),
  }
}
