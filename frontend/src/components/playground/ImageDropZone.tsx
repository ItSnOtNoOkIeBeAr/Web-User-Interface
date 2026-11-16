import { useRef, useState } from 'react'
import { validateImage } from '../../api/client'

interface Props { onFile: (f: File) => void; label?: string; compact?: boolean; accept?: string; validate?: boolean }

/** Click-or-drop upload box with type/size validation. */
export default function ImageDropZone({ onFile, label = 'Drop an image or click to browse', compact, accept = 'image/*', validate = true }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const take = (f?: File) => {
    if (!f) return
    const e = validate ? validateImage(f) : null
    setErr(e)
    if (!e) onFile(f)
  }

  return (
    <div>
      <div
        role="button" tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={e => e.key === 'Enter' && input.current?.click()}
        onDragOver={e => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={e => { e.preventDefault(); setOver(false); take(e.dataTransfer.files[0]) }}
        className={`cursor-pointer rounded-2xl border-2 border-dashed text-center text-sm transition
          ${over ? 'border-fuchsia-500 bg-fuchsia-500/10 scale-[1.01]' : 'border-black/15 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5'}
          ${compact ? 'px-3 py-2' : 'px-4 py-8'}`}
      >
        📂 {label}
        <input ref={input} type="file" accept={accept} hidden onChange={e => { take(e.target.files?.[0]); e.target.value = '' }} />
      </div>
      {err && <p className="mt-1 text-xs text-red-500">{err}</p>}
    </div>
  )
}
