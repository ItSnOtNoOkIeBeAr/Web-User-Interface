import { useRef, useState } from 'react'
import { live } from '../api/labs'
import { useFrameLoop, useWebcam } from '../hooks/useWebcam'
import DownloadButton from '../components/playground/DownloadButton'
import KnobSlider from '../components/playground/KnobSlider'
import WebcamToggle from '../components/playground/WebcamToggle'
import { ErrorNote } from '../components/playground/Status'

const EFFECTS = [
  { id: 'canny', label: '⚡ Canny edges', lab: 2 }, { id: 'sobel', label: '⚡ Sobel', lab: 2 },
  { id: 'clahe', label: '🌗 CLAHE', lab: 3 }, { id: 'keypoints', label: '🧭 Keypoints (SURF/ORB)', lab: 4 },
  { id: 'yolo', label: '🎯 YOLO', lab: 6 }, { id: 'threshold', label: '🎨 Otsu threshold', lab: 7 },
  { id: 'none', label: '👁 Raw', lab: 0 },
]

/** One page: pick an effect chip, see it applied to the live webcam. */
export default function LiveCameraPage() {
  const cam = useWebcam()
  const [effect, setEffect] = useState('canny')
  const [p1, setP1] = useState(0)
  const [out, setOut] = useState<{ image: string; info: { counts?: Record<string, number>; ms?: number } } | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const effRef = useRef({ effect, p1 }); effRef.current = { effect, p1 }

  const fps = useFrameLoop(cam.active, () => cam.grabFrame(400), async f => {
    try { setOut(await live.frame(f, effRef.current.effect, effRef.current.p1, 0)); setErr(null) } catch (e) { setErr((e as Error).message); throw e }
  }, 6)

  const knob = effect === 'clahe' ? { label: 'CLAHE clipLimit', min: 1, max: 12, step: 0.5, def: 3 }
    : effect === 'yolo' ? { label: 'YOLO confidence', min: 0.1, max: 0.9, step: 0.05, def: 0.35 }
    : effect === 'canny' ? { label: 'Canny low threshold', min: 10, max: 200, step: 5, def: 80 } : null

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
      <h1 className="text-3xl font-bold">📹 Live Camera</h1>
      <p className="text-sm opacity-70">Webcam-friendly experiments from Labs 2, 3, 4, 6 and 7. Frames are throttled and downscaled before they are sent to the backend.</p>
      <div className="card space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <WebcamToggle active={cam.active} onStart={cam.start} onStop={() => { cam.stop(); setOut(null) }} error={cam.error} />
          {cam.active && <span className="font-mono text-xs">{fps} fps</span>}
          {out?.info.ms !== undefined && <span className="font-mono text-xs">· YOLO {out.info.ms} ms</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {EFFECTS.map(e => <button key={e.id} className={`chip ${effect === e.id ? 'chip-on' : ''}`} onClick={() => { setEffect(e.id); setP1(0); setOut(null) }}>{e.label}{e.lab ? ` · L${e.lab}` : ''}</button>)}
        </div>
        {knob && <div className="max-w-xs"><KnobSlider label={knob.label} min={knob.min} max={knob.max} step={knob.step} value={p1 || knob.def} onChange={setP1} color="#6366f1" /></div>}
        <ErrorNote message={err} />
        <video ref={cam.videoRef} muted playsInline className="hidden" />
        <div className="relative overflow-hidden rounded-2xl bg-black">
          {out ? <img src={out.image} alt={`${effect} effect`} className="block w-full" />
            : <div className="grid aspect-video place-items-center text-sm text-white/70">{cam.active ? 'Waiting for first frame…' : 'Press "Use webcam" to start'}</div>}
        </div>
        <div className="flex items-center gap-2">
          {out?.info.counts && Object.entries(out.info.counts).map(([k, v]) => <span key={k} className="chip chip-on">{k} × {v}</span>)}
          <span className="ml-auto"><DownloadButton src={out?.image} filename={`live-${effect}`} label="⬇ Snapshot PNG" /></span>
        </div>
      </div>
    </div>
  )
}
