import { useState } from 'react'
import { lab4 } from '../../api/labs'
import { useDebouncedProcess } from '../../hooks/useDebouncedProcess'
import KnobSlider from '../playground/KnobSlider'
import ResultImage from '../playground/ResultImage'
import { ErrorNote, Notice } from '../playground/Status'
import ToolkitItem from '../playground/ToolkitItem'
import ToolkitPanel from '../playground/ToolkitPanel'

/** Keypoint explorer: hessian threshold, rich drawing, U-SURF on a rotated copy. */
function Keypoints({ file, mode }: { file: File; mode: 'hessian' | 'rich' | 'upright' }) {
  const [hessian, setHessian] = useState(400)
  const [rich, setRich] = useState(mode !== 'hessian')
  const [upright, setUpright] = useState(mode === 'upright')
  const [angle, setAngle] = useState(30)
  const { data, loading, error } = useDebouncedProcess(
    s => lab4.keypoints(file, { detector: 'surf', hessian, upright, rich, angle }, s), [file, hessian, rich, upright, angle])
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {mode === 'hessian' && <KnobSlider label="Hessian threshold" min={50} max={4000} step={50} value={hessian} onChange={setHessian} color="#38bdf8" />}
        {mode === 'upright' && <>
          <KnobSlider label="Rotation of copy" min={0} max={180} value={angle} onChange={setAngle} color="#38bdf8" format={v => `${v}°`} />
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={upright} onChange={e => setUpright(e.target.checked)} /> U-SURF (upright, no orientation)</label>
        </>}
        {mode === 'rich' && <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={rich} onChange={e => setRich(e.target.checked)} /> Rich keypoints (size + orientation)</label>}
      </div>
      <ErrorNote message={error} />
      {data && <Notice>{data.notice}</Notice>}
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultImage src={data?.images.original} loading={loading} label={`Original · ${data?.counts.original ?? '…'} keypoints (${data?.used ?? ''})`} filename="lab4-keypoints" />
        <ResultImage src={data?.images.rotated} loading={loading} label={`Rotated ${angle}° · ${data?.counts.rotated ?? '…'} keypoints`} filename="lab4-keypoints-rotated" />
      </div>
    </>
  )
}

export default function Lab4Toolkit({ file, color }: { file: File | null; color: string }) {
  return (
    <ToolkitPanel color={color}>
      {file ? <>
        <ToolkitItem title="Hessian threshold → keypoint count"><Keypoints file={file} mode="hessian" /></ToolkitItem>
        <ToolkitItem title="Rich keypoint drawing"><Keypoints file={file} mode="rich" /></ToolkitItem>
        <ToolkitItem title="U-SURF toggle on a rotated copy"><Keypoints file={file} mode="upright" /></ToolkitItem>
      </> : <p className="text-sm opacity-60">Loading image…</p>}
    </ToolkitPanel>
  )
}
