import { useState } from 'react'
import { lab4 } from '../../api/labs'
import { useDebouncedProcess } from '../../hooks/useDebouncedProcess'
import ImageDropZone from '../playground/ImageDropZone'
import KnobSlider from '../playground/KnobSlider'
import { ErrorNote, Notice, Skeleton } from '../playground/Status'
import MatchLines from './MatchLines'
import RaceChart from './RaceChart'

export const DETECTORS = ['surf', 'orb', 'sift'] as const

/** Spotlight: animated matches between two views + detector race. */
export default function FeatureMatchUp({ file }: { file: File | null }) {
  const [second, setSecond] = useState<File | null>(null)
  const [detector, setDetector] = useState<string>('surf')
  const [ratio, setRatio] = useState(0.75)
  const [hessian, setHessian] = useState(400)
  const { data, loading, error } = useDebouncedProcess(
    s => lab4.match(file!, second, detector, ratio, hessian, s), [file, second, detector, ratio, hessian], { enabled: !!file, delay: 350 })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex gap-1">{DETECTORS.map(d => <button key={d} className={`chip ${detector === d ? 'chip-on' : ''}`} onClick={() => setDetector(d)}>{d.toUpperCase()}</button>)}</div>
        <div className="w-48"><KnobSlider label="Ratio test" min={0.4} max={0.95} step={0.01} value={ratio} onChange={setRatio} color="#38bdf8" /></div>
        <div className="w-48"><KnobSlider label="Hessian threshold" min={50} max={3000} step={50} value={hessian} onChange={setHessian} color="#38bdf8" /></div>
        <div className="w-60"><ImageDropZone compact label={second ? `2nd image: ${second.name}` : 'Optional: upload 2nd image'} onFile={setSecond} /></div>
        {second && <button className="chip" onClick={() => setSecond(null)}>use rotated copy</button>}
      </div>
      <ErrorNote message={error} />
      {data ? (
        <>
          <Notice>{data.notice}</Notice>
          <div className={loading ? 'opacity-60 transition' : 'transition'}>
            <MatchLines r={data} />
          </div>
          <p className="text-sm">
            <b>{data.used}</b> found <b>{data.total_matches}</b> good matches (showing the best {data.lines.length}).{' '}
            {data.synthetic_second_view && <span className="opacity-70">Right image = the same photo rotated 25° and scaled 0.8×, so every match is a true correspondence.</span>}
          </p>
          <h3 className="font-bold">🏁 Detector race</h3>
          <RaceChart race={data.race} />
        </>
      ) : <Skeleton className="h-72" />}
    </div>
  )
}
