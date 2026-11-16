import { useState } from 'react'
import { lab2, type EdgeResult } from '../../api/labs'
import { useDebouncedProcess } from '../../hooks/useDebouncedProcess'
import { useFrameLoop, useWebcam } from '../../hooks/useWebcam'
import KnobSlider from '../playground/KnobSlider'
import SplitCompare from '../playground/SplitCompare'
import WebcamToggle from '../playground/WebcamToggle'
import DownloadButton from '../playground/DownloadButton'
import { ErrorNote, Skeleton } from '../playground/Status'

interface Props { file: File | null; blur: number; ksize: number }

/** Spotlight: Original | Sobel | Canny split-screen wipe on an image or a live webcam. */
export default function LiveEdgeVision({ file, blur, ksize }: Props) {
  const [t1, setT1] = useState(80), [t2, setT2] = useState(160)
  const cam = useWebcam()
  const [live, setLive] = useState<EdgeResult | null>(null)
  const [camErr, setCamErr] = useState<string | null>(null)

  // Still image: debounced, full PNG quality.
  const still = useDebouncedProcess(s => lab2.edges(file!, { blur, ksize, t1, t2 }, s), [file, blur, ksize, t1, t2], { enabled: !!file && !cam.active })

  // Webcam: throttled loop, small JPEG frames.
  const fps = useFrameLoop(cam.active, () => cam.grabFrame(400), async f => {
    try { setLive(await lab2.edges(f, { blur, ksize, t1, t2, fmt: 'jpeg', max_side: 400 })); setCamErr(null) } catch (e) { setCamErr((e as Error).message); throw e }
  }, 6)

  const r = cam.active ? live : still.data
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <WebcamToggle active={cam.active} onStart={cam.start} onStop={() => { cam.stop(); setLive(null) }} error={cam.error} />
        <div className="w-44"><KnobSlider label="Canny low" min={0} max={254} value={t1} onChange={v => setT1(Math.min(v, t2 - 1))} color="#ffb703" /></div>
        <div className="w-44"><KnobSlider label="Canny high" min={1} max={255} value={t2} onChange={v => setT2(Math.max(v, t1 + 1))} color="#ffb703" /></div>
        {cam.active && <span className="text-xs font-mono">{fps} fps</span>}
      </div>
      <video ref={cam.videoRef} muted playsInline className="hidden" />
      <ErrorNote message={camErr ?? still.error} />
      {r ? (
        <>
          <SplitCompare panes={[{ label: 'Original', src: r.original }, { label: 'Sobel', src: r.sobel }, { label: 'Canny', src: r.canny }]} />
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="opacity-70">Drag the dividers to wipe between views · Canny edge pixels: <b>{r.canny_pixels.toLocaleString()}</b></span>
            <span className="ml-auto flex gap-1">
              <DownloadButton src={r.sobel} filename="sobel" label="⬇ Sobel" /><DownloadButton src={r.canny} filename="canny" label="⬇ Canny" />
            </span>
          </div>
        </>
      ) : <Skeleton className="h-72" />}
    </div>
  )
}
