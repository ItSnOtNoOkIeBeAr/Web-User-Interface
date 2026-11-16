import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LABS } from '../../data/labs'
import { useSharedImage } from '../../context/ImageContext'
import ImageDropZone from '../playground/ImageDropZone'

/** Drop one image, choose a lab, and it opens there as the working image. */
export default function TryItQuickDrop() {
  const { file, setFile } = useSharedImage()
  const [target, setTarget] = useState('/lab2')
  const nav = useNavigate()
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10">
      <div className="card grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">⚡ Try it: quick drop</h2>
          <p className="mb-3 text-sm opacity-70">Drop an image, pick a lab, and jump straight in.</p>
          <ImageDropZone onFile={setFile} label={file ? `Loaded: ${file.name}` : 'Drop an image here'} compact />
        </div>
        <div className="flex gap-2">
          <select value={target} onChange={e => setTarget(e.target.value)} className="rounded-full border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/20">
            {LABS.filter(l => l.n !== 5).map(l => <option key={l.n} value={l.path} className="text-black">Lab {l.n} · {l.spotlight}</option>)}
          </select>
          <button className="btn-solid" disabled={!file} onClick={() => nav(target)}>Open →</button>
        </div>
      </div>
    </section>
  )
}
