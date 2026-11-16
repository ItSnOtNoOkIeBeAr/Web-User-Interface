import { useState } from 'react'
import { lab3 } from '../../api/labs'
import { useDebouncedProcess } from '../../hooks/useDebouncedProcess'
import HistogramChart from '../playground/HistogramChart'
import KnobSlider from '../playground/KnobSlider'
import ResultImage from '../playground/ResultImage'
import { ErrorNote } from '../playground/Status'
import ToolkitItem from '../playground/ToolkitItem'
import ToolkitPanel from '../playground/ToolkitPanel'

function Gray({ file }: { file: File }) {
  const { data, loading, error } = useDebouncedProcess(s => lab3.equalize(file, 2, 8, s), [file], { delay: 0 })
  return <><ErrorNote message={error} /><ResultImage src={data?.gray} loading={loading} label="cv2.cvtColor(BGR2GRAY)" filename="lab3-gray" className="max-w-md" />
    {data && <HistogramChart data={data.hist.original} height={140} />}</>
}

function ColorEq({ file }: { file: File }) {
  const { data, loading, error } = useDebouncedProcess(s => lab3.color(file, s), [file], { delay: 0 })
  return <><ErrorNote message={error} /><div className="grid gap-3 sm:grid-cols-3">
    <ResultImage src={data?.original} loading={loading} label="Original" />
    <ResultImage src={data?.yuv} loading={loading} label="Equalize Y in YUV" filename="lab3-yuv" />
    <ResultImage src={data?.hsv} loading={loading} label="Equalize V in HSV" filename="lab3-hsv" /></div></>
}

function Stretch({ file }: { file: File }) {
  const [low, setLow] = useState(2), [high, setHigh] = useState(98)
  const { data, loading, error } = useDebouncedProcess(s => lab3.stretch(file, low, high, s), [file, low, high])
  return <>
    <div className="grid gap-3 sm:grid-cols-2">
      <KnobSlider label="Low percentile" min={0} max={49} value={low} onChange={setLow} color="#3ddc97" format={v => `${v}%`} />
      <KnobSlider label="High percentile" min={51} max={100} value={high} onChange={setHigh} color="#3ddc97" format={v => `${v}%`} />
    </div>
    <ErrorNote message={error} />
    <div className="grid gap-3 sm:grid-cols-2">
      <ResultImage src={data?.stretched} loading={loading} label={data ? `Stretched [${data.lo.toFixed(0)}–${data.hi.toFixed(0)}] → [0–255]` : 'Stretched'} filename="lab3-stretch" />
      {data && <HistogramChart data={data.hist.stretched} secondary={data.hist.original} height={190} color="#3ddc97" />}
    </div></>
}

export default function Lab3Toolkit({ file, color }: { file: File | null; color: string }) {
  return (
    <ToolkitPanel color={color}>
      {file ? <>
        <ToolkitItem title="Grayscale conversion"><Gray file={file} /></ToolkitItem>
        <ToolkitItem title="Color equalization (YUV / HSV)"><ColorEq file={file} /></ToolkitItem>
        <ToolkitItem title="Linear contrast stretching"><Stretch file={file} /></ToolkitItem>
      </> : <p className="text-sm opacity-60">Loading image…</p>}
    </ToolkitPanel>
  )
}
