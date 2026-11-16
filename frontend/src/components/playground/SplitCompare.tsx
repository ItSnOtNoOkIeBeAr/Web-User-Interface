import { useRef, useState } from 'react'

interface Pane { label: string; src: string }

/** Multi-pane wipe: N images laid on top of each other, N-1 draggable dividers. */
export default function SplitCompare({ panes }: { panes: Pane[] }) {
  const box = useRef<HTMLDivElement>(null)
  const n = panes.length
  const [cuts, setCuts] = useState<number[]>(() => Array.from({ length: n - 1 }, (_, i) => ((i + 1) / n) * 100))
  const drag = useRef(-1)

  const pct = (x: number) => { const r = box.current!.getBoundingClientRect(); return Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)) }
  const down = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = pct(e.clientX)
    drag.current = cuts.reduce((best, c, i) => (Math.abs(c - p) < Math.abs(cuts[best] - p) ? i : best), 0)
    update(p)
  }
  const update = (p: number) => setCuts(cs => cs.map((c, i) => {
    if (i !== drag.current) return c
    const lo = i > 0 ? cs[i - 1] : 0, hi = i < cs.length - 1 ? cs[i + 1] : 100
    return Math.min(hi, Math.max(lo, p))
  }))
  const bounds = [0, ...cuts, 100]

  return (
    <div ref={box} onPointerDown={down} onPointerMove={e => e.buttons && update(pct(e.clientX))}
      className="relative select-none overflow-hidden rounded-2xl touch-none cursor-ew-resize bg-black">
      {/* first pane sizes the box; the rest are clipped into their segment */}
      <img src={panes[0].src} alt="" className="block w-full invisible" draggable={false} />
      {panes.map((p, i) => (
        <img key={p.label} src={p.src} alt={p.label} draggable={false} className="absolute inset-0 h-full w-full object-fill"
          style={{ clipPath: `inset(0 ${100 - bounds[i + 1]}% 0 ${bounds[i]}%)` }} />
      ))}
      {cuts.map((c, i) => <div key={i} className="absolute inset-y-0 w-0.5 bg-white shadow-lg" style={{ left: `${c}%` }} />)}
      {panes.map((p, i) => (
        <span key={p.label} className="absolute top-2 -translate-x-1/2 rounded-full bg-black/60 px-2 text-[11px] font-semibold text-white"
          style={{ left: `${(bounds[i] + bounds[i + 1]) / 2}%` }}>{p.label}</span>
      ))}
    </div>
  )
}
