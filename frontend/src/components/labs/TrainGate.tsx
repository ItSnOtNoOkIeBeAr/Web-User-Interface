import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { lab5 } from '../../api/labs'
import { ErrorNote } from '../playground/Status'

/** Shows children once the eigenface model is trained; otherwise a Train button + live progress. */
export default function TrainGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ status: string; message: string }>({ status: 'checking', message: '' })
  const [err, setErr] = useState<string | null>(null)

  const poll = useCallback(async () => {
    try { setState(await lab5.status()); setErr(null) } catch (e) { setErr((e as Error).message) }
  }, [])
  useEffect(() => { poll() }, [poll])
  useEffect(() => {
    if (state.status !== 'training') return
    const t = setInterval(poll, 2000)
    return () => clearInterval(t)
  }, [state.status, poll])

  if (state.status === 'ready') return <>{children}</>
  return (
    <div className="rounded-2xl bg-black/5 p-6 text-center dark:bg-white/5">
      <ErrorNote message={err} />
      {state.status === 'training' ? (
        <>
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
          <p className="font-semibold">Training…</p>
          <p className="text-sm opacity-70">{state.message || 'working'}</p>
          <p className="mt-2 text-xs opacity-60">First run downloads LFW (~200 MB). The trained model is cached afterwards.</p>
        </>
      ) : (
        <>
          <p className="mb-1 font-semibold">👻 The eigenface model has not been trained yet</p>
          {state.status === 'error' && <ErrorNote message={state.message} />}
          <p className="mb-3 text-sm opacity-70">Loads LFW, fits PCA (150 components) and an RBF-SVM. Cached after the first run.</p>
          <button className="btn-solid" onClick={async () => { await lab5.train(state.status === 'error'); poll() }}>▶ Train model</button>
        </>
      )}
    </div>
  )
}
