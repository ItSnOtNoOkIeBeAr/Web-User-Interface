import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { lab5 } from '../../api/labs'
import { useDebouncedProcess } from '../../hooks/useDebouncedProcess'
import KnobSlider from '../playground/KnobSlider'
import ResultImage from '../playground/ResultImage'
import { ErrorNote, Skeleton } from '../playground/Status'

/** Spotlight: rebuild a held-out test face from k eigenfaces, then ask the SVM who it is. */
export default function FaceRebuilder() {
  const [faces, setFaces] = useState<{ index: number; thumb: string }[]>([])
  const [index, setIndex] = useState(0)
  const [k, setK] = useState(20)
  const [guess, setGuess] = useState<{ predicted: string; true: string; correct: boolean } | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => { lab5.faces().then(setFaces).catch(e => setErr(e.message)) }, [])
  useEffect(() => setGuess(null), [index])
  const { data, loading, error } = useDebouncedProcess(s => lab5.reconstruct(index, k, s), [index, k], { delay: 120 })

  return (
    <div className="space-y-4">
      <ErrorNote message={err ?? error} />
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {faces.map(f => (
          <button key={f.index} onClick={() => setIndex(f.index)} className={`shrink-0 overflow-hidden rounded-xl border-2 transition ${index === f.index ? 'border-violet-500 scale-105' : 'border-transparent opacity-70'}`}>
            <img src={f.thumb} alt={`test face ${f.index}`} className="h-16" />
          </button>
        ))}
      </div>
      <KnobSlider label="Principal components used" min={1} max={150} value={k} onChange={setK} color="#a78bfa" format={v => `${v} / 150`} />
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        <div><ResultImage src={data?.original} label="Original face" filename="face-original" /></div>
        <div><ResultImage src={data?.reconstruction} loading={loading} label={`Rebuilt with ${k}`} filename={`face-rebuilt-${k}`} />
          {data && <p className="mt-1 text-center text-xs opacity-70">RMSE {data.rmse}</p>}</div>
        <div className="relative"><ResultImage src={data?.newest_eigenface} label={`Eigenface #${k} (just added)`} className="opacity-80" /></div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn text-white" style={{ background: '#a78bfa' }} onClick={async () => { try { setGuess(await lab5.identify(index)) } catch (e) { setErr((e as Error).message) } }}>🕵 Who is this?</button>
        <AnimatePresence mode="wait">
          {guess && (
            <motion.div key={guess.predicted + index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className={`rounded-2xl px-4 py-2 text-sm ${guess.correct ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'}`}>
              SVM guesses <b>{guess.predicted}</b> · true name <b>{guess.true}</b> {guess.correct ? '✅' : '❌'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {!faces.length && !err && <Skeleton className="h-20" />}
    </div>
  )
}
