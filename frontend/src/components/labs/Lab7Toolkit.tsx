import { useState } from 'react'
import { lab7 } from '../../api/labs'
import { sampleFile } from '../../api/client'
import { useDebouncedProcess } from '../../hooks/useDebouncedProcess'
import ImageDropZone from '../playground/ImageDropZone'
import KnobSlider from '../playground/KnobSlider'
import ResultImage from '../playground/ResultImage'
import { ErrorNote } from '../playground/Status'
import ToolkitItem from '../playground/ToolkitItem'
import ToolkitPanel from '../playground/ToolkitPanel'

const METHODS = [['global', 'Global'], ['otsu', 'Otsu'], ['adaptive', 'Adaptive'], ['watershed', 'Watershed'], ['contours', 'Contours']] as const

function Classic({ file, withIou }: { file: File; withIou?: boolean }) {
  const [thresh, setThresh] = useState(127), [block, setBlock] = useState(35), [c, setC] = useState(5)
  const [gt, setGt] = useState<File | null>(null)
  const { data, loading, error } = useDebouncedProcess(s => lab7.classic(file, gt, thresh, block, c, s), [file, gt, thresh, block, c])
  return <>
    <div className="grid gap-3 sm:grid-cols-3">
      <KnobSlider label="Global threshold" min={0} max={255} value={thresh} onChange={setThresh} color="#2dd4bf" />
      <KnobSlider label="Adaptive block size" min={3} max={101} step={2} value={block} onChange={setBlock} color="#2dd4bf" />
      <KnobSlider label="Adaptive C" min={-10} max={20} value={c} onChange={setC} color="#2dd4bf" />
    </div>
    <ErrorNote message={error} />
    <div className="grid gap-3 sm:grid-cols-3">
      <ResultImage src={data?.original} label="Original" loading={loading} />
      {METHODS.map(([id, label]) => (
        <ResultImage key={id} src={data?.images[id]} loading={loading} filename={`lab7-${id}`}
          label={`${label}${data?.iou ? ` · IoU ${data.iou[id]}` : ''}${id === 'watershed' && data ? ` · ${data.extra.watershed_regions} regions` : ''}${id === 'contours' && data ? ` · ${data.extra.contours} contours` : ''}`} />
      ))}
    </div>
    {withIou && <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-64"><ImageDropZone compact label={gt ? `Ground truth: ${gt.name}` : 'Upload ground-truth mask'} onFile={setGt} /></div>
        <button className="chip" onClick={async () => setGt(await sampleFile('coins_gt_mask.png'))}>use coins demo mask</button>
        {gt && <button className="chip" onClick={() => setGt(null)}>clear</button>}
      </div>
      {data?.iou ? (
        <table className="w-full max-w-md text-left text-sm"><thead><tr className="text-xs opacity-60"><th>Method</th><th>IoU</th><th>IoU (inverted mask)</th></tr></thead>
          <tbody>{METHODS.map(([id, l]) => <tr key={id} className="border-t border-black/5 dark:border-white/10"><td className="py-1">{l}</td><td className="font-mono">{data.iou![id]}</td><td className="font-mono opacity-70">{data.iou_inverted![id]}</td></tr>)}</tbody></table>
      ) : <p className="text-xs opacity-60">IoU = |pred ∩ truth| / |pred ∪ truth|. Upload a white-on-black mask (same scene) to score each method. Tip: the demo mask is made for coins.png, so load that sample image first.</p>}
    </>}
  </>
}

export default function Lab7Toolkit({ file, color }: { file: File | null; color: string }) {
  return (
    <ToolkitPanel color={color}>
      {file ? <>
        <ToolkitItem title="Thresholding · watershed · contours (side-by-side comparison)"><Classic file={file} /></ToolkitItem>
        <ToolkitItem title="IoU against a ground-truth mask"><Classic file={file} withIou /></ToolkitItem>
      </> : <p className="text-sm opacity-60">Loading image…</p>}
    </ToolkitPanel>
  )
}
