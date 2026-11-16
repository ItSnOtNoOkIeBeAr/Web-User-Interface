import { useEffect, useRef, useState } from 'react'
import { lab7 } from '../../api/labs'
import { loadImageData } from '../../api/client'
import { useDebouncedProcess } from '../../hooks/useDebouncedProcess'
import DownloadButton from '../playground/DownloadButton'
import { ErrorNote, Skeleton } from '../playground/Status'

/** DeepLabV3 semantic segmentation: masks fade in; hover a region to highlight its class. */
export default function SemanticPanel({ file }: { file: File | null }) {
  const { data, loading, error } = useDebouncedProcess(s => lab7.deeplab(file!, s), [file], { enabled: !!file, delay: 0 })
  const [shown, setShown] = useState(false)
  const [hoverId, setHoverId] = useState<number | null>(null)
  const classMap = useRef<ImageData | null>(null)
  const hl = useRef<HTMLCanvasElement>(null)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {          // fade masks in after each new result
    setShown(false); classMap.current = null
    if (!data) return
    loadImageData(data.class_map).then(d => { classMap.current = d })
    const t = setTimeout(() => setShown(true), 80)
    return () => clearTimeout(t)
  }, [data])

  useEffect(() => {          // paint highlight canvas for the hovered class
    const c = hl.current, m = classMap.current
    if (!c || !m) return
    c.width = m.width; c.height = m.height
    const ctx = c.getContext('2d')!
    if (hoverId === null) { ctx.clearRect(0, 0, c.width, c.height); return }
    const out = ctx.createImageData(m.width, m.height)
    for (let i = 0; i < m.width * m.height; i++) {
      const cls = m.data[i * 4]
      if (cls === hoverId) { out.data[i * 4] = out.data[i * 4 + 1] = out.data[i * 4 + 2] = 255; out.data[i * 4 + 3] = 90 }
      else { out.data[i * 4 + 3] = 120 }
    }
    ctx.putImageData(out, 0, 0)
  }, [hoverId, data])

  const onMove = (e: React.PointerEvent) => {
    const m = classMap.current; if (!m) return
    const r = box.current!.getBoundingClientRect()
    const x = Math.floor(((e.clientX - r.left) / r.width) * m.width), y = Math.floor(((e.clientY - r.top) / r.height) * m.height)
    if (x < 0 || y < 0 || x >= m.width || y >= m.height) return setHoverId(null)
    const id = m.data[(y * m.width + x) * 4]
    setHoverId(id > 0 ? id : null)
  }
  const hovered = data?.classes.find(c => c.id === hoverId)

  return (
    <div className="space-y-2">
      <h3 className="font-bold">🧠 Semantic segmentation <span className="text-xs font-normal opacity-60">DeepLabV3 · VOC classes</span></h3>
      <ErrorNote message={error} />
      {data ? (
        <>
          <div ref={box} className="relative overflow-hidden rounded-2xl bg-black" onPointerMove={onMove} onPointerLeave={() => setHoverId(null)}>
            <img src={data.image} alt="source" className="block w-full" />
            <img src={data.overlay} alt="segmentation mask" className="absolute inset-0 h-full w-full transition-opacity duration-1000" style={{ opacity: shown ? 0.7 : 0 }} />
            <canvas ref={hl} className="pointer-events-none absolute inset-0 h-full w-full transition-opacity" />
            {hovered && <span className="absolute left-2 top-2 rounded-full px-3 py-1 text-sm font-bold text-white shadow" style={{ background: hovered.color }}>{hovered.name} · {hovered.percent}%</span>}
            {loading && <div className="absolute inset-0 grid place-items-center bg-black/40 text-sm text-white">Segmenting…</div>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {data.classes.length ? data.classes.map(c => (
              <span key={c.id} className="chip flex items-center gap-1" onPointerEnter={() => setHoverId(c.id)} onPointerLeave={() => setHoverId(null)}>
                <i className="inline-block h-3 w-3 rounded-full" style={{ background: c.color }} />{c.name} {c.percent}%</span>)) : <span className="text-sm opacity-60">No VOC objects found in this image.</span>}
            <span className="ml-auto flex gap-1"><DownloadButton src={data.overlay} filename="lab7-mask" label="⬇ Mask" /></span>
          </div>
        </>
      ) : <Skeleton className="h-60" />}
      {loading && !data && <p className="text-xs opacity-60">First run downloads the DeepLab weights (~40 MB).</p>}
    </div>
  )
}
