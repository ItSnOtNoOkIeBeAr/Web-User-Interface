import { useState } from 'react'
import { lab1 } from '../../api/labs'
import { useDebouncedProcess } from '../../hooks/useDebouncedProcess'
import KnobSlider from '../playground/KnobSlider'
import ResultImage from '../playground/ResultImage'
import { ErrorNote } from '../playground/Status'
import ToolkitItem from '../playground/ToolkitItem'
import ToolkitPanel from '../playground/ToolkitPanel'

function ShapeInfo({ file }: { file: File }) {
  const { data, error } = useDebouncedProcess(() => lab1.info(file), [file], { delay: 0 })
  return (
    <>
      <ErrorNote message={error} />
      {data && (
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[['Shape (H,W,C)', data.shape.join(' × ')], ['dtype', data.dtype], ['Total values', data.size.toLocaleString()], ['Mean B,G,R', data.mean_bgr.join(', ')]].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-black/5 p-2 dark:bg-white/5"><dt className="text-[11px] opacity-60">{k}</dt><dd className="font-mono font-semibold">{v}</dd></div>
          ))}
        </dl>
      )}
    </>
  )
}

function Crop({ file }: { file: File }) {
  const [x, setX] = useState(0.25), [y, setY] = useState(0.25), [w, setW] = useState(0.5), [h, setH] = useState(0.5)
  const { data, loading, error } = useDebouncedProcess(s => lab1.crop(file, x, y, w, h, s), [file, x, y, w, h])
  const pct = (v: number) => `${Math.round(v * 100)}%`
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-4">
        <KnobSlider label="x" min={0} max={0.9} step={0.01} value={x} onChange={setX} format={pct} />
        <KnobSlider label="y" min={0} max={0.9} step={0.01} value={y} onChange={setY} format={pct} />
        <KnobSlider label="width" min={0.05} max={1} step={0.01} value={w} onChange={setW} format={pct} />
        <KnobSlider label="height" min={0.05} max={1} step={0.01} value={h} onChange={setH} format={pct} />
      </div>
      <ErrorNote message={error} />
      <ResultImage src={data?.image} loading={loading} label={data ? `img[y1:y2, x1:x2] → ${data.shape.join('×')}` : 'Cropped'} filename="lab1-crop" className="max-w-md" />
    </>
  )
}

function Resize({ file }: { file: File }) {
  const [scale, setScale] = useState(0.5), [interp, setInterp] = useState('area')
  const { data, loading, error } = useDebouncedProcess(s => lab1.resize(file, scale, interp, s), [file, scale, interp])
  return (
    <>
      <KnobSlider label="Scale" min={0.1} max={2} step={0.05} value={scale} onChange={setScale} format={v => `${v}×`} />
      <div className="flex flex-wrap gap-2">{['nearest', 'linear', 'cubic', 'area'].map(i => <button key={i} className={`chip ${interp === i ? 'chip-on' : ''}`} onClick={() => setInterp(i)}>{i}</button>)}</div>
      <ErrorNote message={error} />
      <ResultImage src={data?.image} loading={loading} label={data ? `Shape ${data.shape.join('×')}` : 'Resized'} filename="lab1-resize" pixelated={interp === 'nearest'} className="max-w-md" />
    </>
  )
}

function Rotate({ file }: { file: File }) {
  const [times, setTimes] = useState(1)
  const { data, loading, error } = useDebouncedProcess(s => lab1.rotate(file, times, s), [file, times], { delay: 50 })
  return (
    <>
      <button className="btn-solid" onClick={() => setTimes(t => (t + 1) % 4)}>↻ Rotate 90° (now {times * 90}°)</button>
      <ErrorNote message={error} />
      <ResultImage src={data?.image} loading={loading} label={data ? `Shape ${data.shape.join('×')}` : 'Rotated'} filename="lab1-rotate" className="max-w-md" />
    </>
  )
}

export default function Lab1Toolkit({ file, color }: { file: File | null; color: string }) {
  return (
    <ToolkitPanel color={color}>
      {file ? <>
        <ToolkitItem title="Shape info" defaultOpen><ShapeInfo file={file} /></ToolkitItem>
        <ToolkitItem title="Crop ROI"><Crop file={file} /></ToolkitItem>
        <ToolkitItem title="Resize"><Resize file={file} /></ToolkitItem>
        <ToolkitItem title="Rotate 90°"><Rotate file={file} /></ToolkitItem>
      </> : <p className="text-sm opacity-60">Loading image…</p>}
    </ToolkitPanel>
  )
}
