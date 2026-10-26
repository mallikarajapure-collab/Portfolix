import { useCallback, useRef, useState } from 'react'
export function useAsync(fn) {
  const [s, set] = useState({ loading: false, error: null, data: null })
  const busy = useRef(false)
  const run = useCallback(async (...args) => {
    if (busy.current) return null // prevents duplicate submissions
    busy.current = true
    set((p) => ({ ...p, loading: true, error: null }))
    try { const data = await fn(...args); set({ loading: false, error: null, data }); return data }
    catch (e) { set({ loading: false, error: e.message, data: null }); return null }
    finally { busy.current = false }
  }, [fn])
  return { ...s, run }
}
