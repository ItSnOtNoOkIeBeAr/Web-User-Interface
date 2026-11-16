import ImageDropZone from '../playground/ImageDropZone'

interface Props { name?: string; isSample: boolean; onFile: (f: File) => void; onReset: () => void }

/** Compact "which image am I using" bar shared by lab pages. */
export default function SourceBar({ name, isSample, onFile, onReset }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-56"><ImageDropZone compact label="Upload your own image" onFile={onFile} /></div>
      <span className="text-xs opacity-70">Using: <b>{isSample ? `sample (${name ?? '…'})` : name}</b></span>
      {!isSample && <button className="chip" onClick={onReset}>↺ back to sample</button>}
    </div>
  )
}
