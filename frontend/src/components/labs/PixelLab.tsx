import { useCallback, useEffect, useRef, useState } from 'react'
import KnobSlider from '../playground/KnobSlider'
import DownloadButton from '../playground/DownloadButton'

type Mode = 'rgb' | 'bgr' | 'gray'
const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'rgb', label: 'RGB (correct)', hint: 'Channels shown the way a screen expects them.' },
  { id: 'bgr', label: 'BGR as RGB', hint: 'OpenCV order shown without conversion: red and blue swap.' },
  { id: 'gray', label: 'Grayscale', hint: 'Y = 0.299R + 0.587G + 0.114B' },
]
const MAX = 480          // working resolution (longest side) so each pixel is big enough to inspect
const GRID = 5           // magnifier is GRID x GRID pixels

/**
 * Pixel Lab: decodes the image into a real pixel buffer, magnifies the pixels under the cursor into a
 * grid of B,G,R values, lets you paint pixels, and cross-fades between channel interpretations.
 */
export default function PixelLab({ src }: { src: string | null }) {
  const [mode, setMode] = useState<Mode>('rgb')
  const [paint, setPaint] = useState(false)
  const [brush, setBrush] = useState(2)
  const [color, setColor] = useState('#ff2d95')
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null)
  const [dims, setDims] = useState<[number, number]>([0, 0])
  const data = useRef<ImageData | null>(null)          // the editable RGBA pixel buffer
  const layers = { rgb: useRef<HTMLCanvasElement>(null), bgr: useRef<HTMLCanvasElement>(null), gray: useRef<HTMLCanvasElement>(null) }
  const box = useRef<HTMLDivElement>(null)
  const [tick, setTick] = useState(0)                  // bump to refresh magnifier after painting

  /** Re-render all three channel views from the base buffer. */
  const render = useCallback(() => {
    const d = data.current; if (!d) return
    const out = new ImageData(d.width, d.height)
    for (const m of ['rgb', 'bgr', 'gray'] as Mode[]) {
      const o = out.data, s = d.data
      for (let i = 0; i < s.length; i += 4) {
        const r = s[i], g = s[i + 1], b = s[i + 2]
        if (m === 'rgb') { o[i] = r; o[i + 1] = g; o[i + 2] = b }
        else if (m === 'bgr') { o[i] = b; o[i + 1] = g; o[i + 2] = r }
        else { const y = 0.299 * r + 0.587 * g + 0.114 * b; o[i] = o[i + 1] = o[i + 2] = y }
        o[i + 3] = 255
      }
      const c = layers[m].current!; c.width = d.width; c.height = d.height
      c.getContext('2d')!.putImageData(out, 0, 0)
    }
    setTick(t => t + 1)
  }, [])

  useEffect(() => {
    if (!src) return
    const img = new Image()
    img.onload = () => {
      const s = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight))
      const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s)
      const ctx = c.getContext('2d', { willReadFrequently: true })!
      ctx.drawImage(img, 0, 0, c.width, c.height)
      data.current = ctx.getImageData(0, 0, c.width, c.height)
      setDims([c.width, c.height]); render()
    }
    img.src = src
  }, [src, render])

  const toPixel = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect()
    return { x: Math.floor(((e.clientX - r.left) / r.width) * dims[0]), y: Math.floor(((e.clientY - r.top) / r.height) * dims[1]) }
  }
  const stamp = (x: number, y: number) => {
    const d = data.current; if (!d) return
    const [r, g, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16))
    for (let dy = -brush + 1; dy < brush; dy++) for (let dx = -brush + 1; dx < brush; dx++) {
      const px = x + dx, py = y + dy
      if (px < 0 || py < 0 || px >= d.width || py >= d.height) continue
      const k = (py * d.width + px) * 4; d.data[k] = r; d.data[k + 1] = g; d.data[k + 2] = b
    }
    render()
  }
  const onMove = (e: React.PointerEvent) => {
    const p = toPixel(e); setHover(p)
    if (paint && e.buttons) stamp(p.x, p.y)
  }

  // Build the magnifier cells from real pixel data.
  const cells: { r: number; g: number; b: number; ok: boolean; center: boolean }[] = []
  const d = data.current
  if (hover && d) {
    const half = Math.floor(GRID / 2)
    for (let dy = -half; dy <= half; dy++) for (let dx = -half; dx <= half; dx++) {
      const x = hover.x + dx, y = hover.y + dy
      const ok = x >= 0 && y >= 0 && x < d.width && y < d.height
      const k = (y * d.width + x) * 4
      cells.push({ r: ok ? d.data[k] : 0, g: ok ? d.data[k + 1] : 0, b: ok ? d.data[k + 2] : 0, ok, center: dx === 0 && dy === 0 })
    }
  }
  void tick

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div>
        <div ref={box} className={`relative overflow-hidden rounded-2xl bg-black ${paint ? 'cursor-crosshair' : 'cursor-zoom-in'} touch-none`}
          style={{ aspectRatio: dims[0] ? `${dims[0]} / ${dims[1]}` : '4 / 3' }}
          onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); if (paint) { const p = toPixel(e); stamp(p.x, p.y) } }}
          onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
          {(['rgb', 'bgr', 'gray'] as Mode[]).map(m => (
            <canvas key={m} ref={layers[m]} className="pixelated absolute inset-0 h-full w-full transition-opacity duration-700"
              style={{ opacity: mode === m ? 1 : 0 }} />
          ))}
          {hover && d && (
            <div className="pointer-events-none absolute border-2 border-white mix-blend-difference"
              style={{ left: `${(hover.x / dims[0]) * 100}%`, top: `${(hover.y / dims[1]) * 100}%`, width: `${(1 / dims[0]) * 100 * GRID}%`, height: `${(1 / dims[1]) * 100 * GRID}%`, transform: 'translate(-40%,-40%)' }} />
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {MODES.map(m => <button key={m.id} className={`chip ${mode === m.id ? 'chip-on' : ''}`} onClick={() => setMode(m.id)}>{m.label}</button>)}
          <DownloadButton getCanvas={() => layers[mode].current} filename={`pixel-lab-${mode}`} />
        </div>
        <p className="mt-1 text-xs opacity-70">{MODES.find(m => m.id === mode)!.hint}</p>
      </div>

      <aside className="space-y-3">
        <div className="rounded-2xl bg-black/5 p-3 dark:bg-white/5">
          <p className="mb-2 text-xs font-bold uppercase opacity-60">Magnifier · {hover ? `x=${hover.x}, y=${hover.y}` : 'hover the image'}</p>
          <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}>
            {(cells.length ? cells : Array.from({ length: GRID * GRID }, () => ({ r: 120, g: 120, b: 120, ok: false, center: false }))).map((c, i) => (
              <div key={i} className={`flex aspect-square flex-col items-center justify-center text-[9px] font-mono leading-tight ${c.center ? 'ring-2 ring-white z-10' : ''}`}
                style={{ background: `rgb(${c.r},${c.g},${c.b})`, color: (c.r * 0.3 + c.g * 0.59 + c.b * 0.11) > 140 ? '#000' : '#fff' }}>
                {c.ok && <><span>B{c.b}</span><span>G{c.g}</span><span>R{c.r}</span></>}
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] opacity-70">Each cell is one real pixel. OpenCV stores its values in the order Blue, Green, Red.</p>
        </div>
        <div className="space-y-2 rounded-2xl bg-black/5 p-3 dark:bg-white/5">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={paint} onChange={e => setPaint(e.target.checked)} /> 🖌 Paint pixels
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="ml-auto h-6 w-8" />
          </label>
          <KnobSlider label="Brush size" min={1} max={8} value={brush} onChange={setBrush} color="#ff5d8f" />
          <button className="btn-ghost w-full" onClick={() => { if (!src) return; const s = src; setPaint(false); const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); c.width = dims[0]; c.height = dims[1]; const x = c.getContext('2d', { willReadFrequently: true })!; x.drawImage(img, 0, 0, c.width, c.height); data.current = x.getImageData(0, 0, c.width, c.height); render() }; img.src = s }}>↺ Reset pixels</button>
        </div>
      </aside>
    </div>
  )
}
