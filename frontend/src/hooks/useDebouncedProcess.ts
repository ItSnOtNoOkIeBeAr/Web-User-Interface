import { useEffect, useRef, useState } from 'react'

/**
 * Run an async job whenever `deps` change, after `delay` ms of quiet.
 * Latest request wins (older ones are aborted) - perfect for knobs that fire many changes.
 */
export function useDebouncedProcess<T>(
  job: (signal: AbortSignal) => Promise<T>,
  deps: unknown[],
  { delay = 250, enabled = true }: { delay?: number; enabled?: boolean } = {},
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const jobRef = useRef(job)
  jobRef.current = job

  useEffect(() => {
    if (!enabled) return
    const ctrl = new AbortController()
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const r = await jobRef.current(ctrl.signal)
        if (!ctrl.signal.aborted) { setData(r); setError(null) }
      } catch (e) {
        if (!ctrl.signal.aborted) setError((e as Error).message)
      } finally {
        if (!ctrl.signal.aborted) setLoading(false)
      }
    }, delay)
    return () => { clearTimeout(t); ctrl.abort() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled])

  return { data, loading, error, setData }
}
