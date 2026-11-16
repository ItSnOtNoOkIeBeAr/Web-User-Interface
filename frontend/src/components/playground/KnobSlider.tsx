interface Props {
  label: string; value: number; min: number; max: number; step?: number
  onChange: (v: number) => void; color?: string; format?: (v: number) => string
}

/** Labeled range slider with a live value badge. */
export default function KnobSlider({ label, value, min, max, step = 1, onChange, color = '#8b5cf6', format }: Props) {
  return (
    <label className="block text-xs font-semibold">
      <div className="flex justify-between mb-1">
        <span className="opacity-70">{label}</span>
        <span className="rounded-full px-2 text-white" style={{ background: color }}>{format ? format(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} style={{ accentColor: color }}
        onChange={e => onChange(Number(e.target.value))} className="w-full" />
    </label>
  )
}
