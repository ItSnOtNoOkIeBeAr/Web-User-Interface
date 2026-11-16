import { useRef, useState } from 'react'

interface Props { before: string; after: string; beforeLabel?: string; afterLabel?: string }

/** Drag the handle to wipe between two same-sized images. */
export default function BeforeAfterSlider({ before, after, beforeLabel = 'Before', afterLabel = 'After' }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(50)
  const move = (clientX: number) => {
    const r = box.current!.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }
  return (
    <div ref={box} className="relative select-none overflow-hidden rounded-2xl touch-none cursor-ew-resize"
      onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); move(e.clientX) }}
      onPointerMove={e => e.buttons && move(e.clientX)}>
      <img src={after} alt={afterLabel} className="block w-full" draggable={false} />
      <img src={before} alt={beforeLabel} className="absolute inset-0 h-full w-full object-fill" draggable={false} style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
      <div className="absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-2 py-1 text-xs shadow">⇔</div>
      </div>
      <span className="absolute left-2 top-2 rounded bg-black/60 px-2 text-xs text-white">{beforeLabel}</span>
      <span className="absolute right-2 top-2 rounded bg-black/60 px-2 text-xs text-white">{afterLabel}</span>
    </div>
  )
}
