import { useState } from 'react'
import { lab3 } from '../../api/labs'
import { useDebouncedProcess } from '../../hooks/useDebouncedProcess'
import BeforeAfterSlider from '../playground/BeforeAfterSlider'
import DownloadButton from '../playground/DownloadButton'
import HistogramChart from '../playground/HistogramChart'
import KnobSlider from '../playground/KnobSlider'
import { ErrorNote, Skeleton } from '../playground/Status'

type View = 'original' | 'he' | 'clahe'
const VIEWS: { id: View; label: string; color: string }[] = [
  { id: 'original', label: 'Original', color: '#64748b' },
  { id: 'he', label: 'Global HE', color: '#3ddc97' },
  { id: 'clahe', label: 'CLAHE', color: '#8b5cf6' },
]

/** Spotlight: switch HE / CLAHE, watch the histogram morph, tune clipLimit live. */
export default function ContrastRescue({ file }: { file: File | null }) {
  const [view, setView] = useState<View>('clahe')
  const [clip, setClip] = useState(3)
  const [tile, setTile] = useState(8)
  const { data, loading, error } = useDebouncedProcess(s => lab3.equalize(file!, clip, tile, s), [file, clip, tile], { enabled: !!file, delay: 200 })
  const imgFor = (v: View) => (v === 'original' ? data!.gray : data![v])
  const cur = VIEWS.find(v => v.id === view)!

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        {VIEWS.map(v => <button key={v.id} className={`chip ${view === v.id ? 'chip-on' : ''}`} onClick={() => setView(v.id)}>{v.label}</button>)}
        <div className="w-52"><KnobSlider label="CLAHE clipLimit" min={1} max={20} step={0.5} value={clip} onChange={setClip} color="#8b5cf6" /></div>
        <div className="w-40"><KnobSlider label="Tile grid" min={2} max={16} value={tile} onChange={setTile} color="#8b5cf6" format={v => `${v}×${v}`} /></div>
      </div>
      <ErrorNote message={error} />
      {data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <BeforeAfterSlider before={data.gray} after={imgFor(view)} beforeLabel="Original (gray)" afterLabel={cur.label} />
            <div className="flex items-center justify-between text-xs">
              <span className="opacity-70">mean {data.stats[view].mean} · std (contrast) {data.stats[view].std}</span>
              <DownloadButton src={imgFor(view)} filename={`lab3-${view}`} />
            </div>
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold">Histogram · {cur.label} <span className="font-normal opacity-60">(grey = original)</span></p>
            <HistogramChart data={data.hist[view]} secondary={view === 'original' ? undefined : data.hist.original} color={cur.color} height={230} />
            {loading && <p className="text-xs opacity-60">updating…</p>}
          </div>
        </div>
      ) : <Skeleton className="h-72" />}
    </div>
  )
}
