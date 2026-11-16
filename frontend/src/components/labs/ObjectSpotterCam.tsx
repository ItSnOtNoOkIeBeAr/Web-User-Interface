import { useState } from 'react'
import { lab6, type DetectResult } from '../../api/labs'
import { useDebouncedProcess } from '../../hooks/useDebouncedProcess'
import { useFrameLoop, useWebcam } from '../../hooks/useWebcam'
import KnobSlider from '../playground/KnobSlider'
import WebcamToggle from '../playground/WebcamToggle'
import { ErrorNote } from '../playground/Status'
import DetectionOverlay from './DetectionOverlay'

/** Spotlight: YOLOv11n on the webcam (or a still image) with animated boxes, counters and FPS. */
export default function ObjectSpotterCam({ file, url }: { file: File | null; url: string | null }) {
  const [conf, setConf] = useState(0.35)
  const cam = useWebcam()
  const [live, setLive] = useState<DetectResult | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const still = useDebouncedProcess(s => lab6.detect(file!, 'yolo11n', conf, false, s), [file, conf], { enabled: !!file && !cam.active, delay: 300 })

  const fps = useFrameLoop(cam.active, () => cam.grabFrame(480), async f => {
    try { setLive(await lab6.detect(f, 'yolo11n', conf)); setErr(null) } catch (e) { setErr((e as Error).message); throw e }
  }, 8)

  const r = cam.active ? live : still.data
  const counts = Object.entries(r?.counts ?? {})
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <WebcamToggle active={cam.active} onStart={cam.start} onStop={() => { cam.stop(); setLive(null) }} error={cam.error} />
        <div className="w-56"><KnobSlider label="Confidence" min={0.05} max={0.95} step={0.05} value={conf} onChange={setConf} color="#fb7185" format={v => `${Math.round(v * 100)}%`} /></div>
        <div className="rounded-2xl bg-black/5 px-3 py-2 font-mono text-xs dark:bg-white/10">{cam.active ? `${fps} FPS` : '— FPS'} · {r ? `${r.ms} ms inference` : 'waiting'}</div>
      </div>
      <ErrorNote message={err ?? still.error} />
      <div className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl bg-black">
        {cam.active
          ? <video ref={cam.videoRef} muted playsInline className="block w-full" />
          : url ? <img src={url} alt="detection source" className="block w-full" /> : <div className="aspect-video animate-pulse" />}
        {r && <DetectionOverlay boxes={r.boxes} />}
        {!cam.active && still.loading && <div className="absolute inset-0 grid place-items-center bg-black/40 text-sm text-white">Running YOLO… (first run loads the model)</div>}
      </div>
      <div className="flex flex-wrap items-center gap-2" aria-live="polite">
        <span className="text-xs font-bold uppercase opacity-60">Counter</span>
        {counts.length ? counts.map(([k, v]) => <span key={k} className="chip chip-on">{k} × {v}</span>) : <span className="text-sm opacity-60">no objects above {Math.round(conf * 100)}% confidence</span>}
      </div>
    </div>
  )
}
