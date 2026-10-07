export type SessionLock = <T>(work: () => Promise<T>) => Promise<T>

// All cookie-changing requests share this lock, including requests from other tabs.
export function browserSessionLock(apiUrl: string): SessionLock {
  return (work) => {
    if (!navigator.locks) return Promise.reject(new Error('WEB_LOCKS_UNAVAILABLE'))
    return navigator.locks.request(`sgen-session:${apiUrl}`, work)
  }
}
