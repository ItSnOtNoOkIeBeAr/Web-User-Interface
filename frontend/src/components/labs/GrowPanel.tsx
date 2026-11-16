import { useEffect, useRef, useState } from 'react'
import { lab7 } from '../../api/labs'
import { loadImageData } from '../../api/client'
import KnobSlider from '../playground/KnobSlider'
import DownloadButton from '../playground/DownloadButton'
import { ErrorNote } from '../playground/Status'

/** Click-to-grow region growing: the backend returns each pixel's growth step; we replay it as a flood. */
export default function GrowPanel({ file, url }: { file: File | null; url: string | null }) {
  const [tol, setTol] = useState(18)
  const [res, setRes] = useState<{ image: string; steps: number; area_percent: number } | null>(null)
  const [seed, setSeed] = useState<{ x: number; y: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const raf = useRef(0)

  useEffect(() => { setRes(null); setSeed(null) }, [file])

  const animate = async (order: string) => {
    const od = await loadImageData(order)
    const c = canvas.current!; c.width = od.width; c.height = od.height
    const ctx = c.getContext('2d')!
    const out = ctx.createImageData(od.width, od.height)
    const t0 = performance.now(), DURATION = 1800
    cancelAnimationFrame(raf.current)
    const frame = (now: number) => {
      const t = Math.min(1, (now - t0) / DURATION) * 255
      for (let i = 0; i < od.width * od.height; i++) {
        const o = od.data[i * 4]
        const on = o > 0 && o <= t
        // colour by growth step: hot (seed) -> cool (edge of region)
        out.data[i * 4] = on ? 255 - o * 0.6 : 0; out.data[i * 4 + 1] = on ? 60 + o * 0.5 : 0; out.data[i * 4 + 2] = on ? 180 : 0
        out.data[i * 4 + 3] = on ? 150 : 0
      }
      ctx.putImageData(out, 0, 0)
      if (t < 255) raf.current = requestAnimationFrame(frame)
    }
    raf.current = requestAnimationFrame(frame)
  }
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const onClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!file || busy) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
    setSeed({ x, y }); setBusy(true); setErr(null)
    try {
      const g = await lab7.grow(file, x, y, tol)
      setRes(g); await animate(g.order)
    } catch (er) { setErr((er as Error).message) } finally { setBusy(false) }
  }

  return (
    <div className="space-y-2">
      <h3 className="font-bold">🌊 Click-to-grow <span className="text-xs font-normal opacity-60">region growing</span></h3>
      <KnobSlider label="Colour tolerance" min={2} max={60} value={tol} onChange={setTol} color="#2dd4bf" />
      <ErrorNote message={err} />
      <div onClick={onClick} className="relative cursor-crosshair overflow-hidden rounded-2xl bg-black">
        {(res?.image ?? url) ? <img src={res?.image ?? url ?? ''} alt="click to grow a region" className="block w-full" draggable={false} /> : <div className="aspect-video animate-pulse" />}
        <canvas ref={canvas} className="pointer-events-none absolute inset-0 h-full w-full" />
        {seed && <span className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-white" style={{ left: `${seed.x * 100}%`, top: `${seed.y * 100}%` }} />}
        {!seed && <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">👆 click anywhere to plant a seed</span>}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="opacity-70">{busy ? 'Growing…' : res ? `Region covers ${res.area_percent}% of the image · ${res.steps} growth steps` : 'Nothing grown yet'}</span>
        <DownloadButton getCanvas={() => canvas.current} filename="lab7-grown-region" label="⬇ Region" />
      </div>
    </div>
  )
}
