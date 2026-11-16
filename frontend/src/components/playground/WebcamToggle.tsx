interface Props { active: boolean; onStart: () => void; onStop: () => void; error?: string | null }

export default function WebcamToggle({ active, onStart, onStop, error }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button className={active ? 'btn bg-red-500 text-white' : 'btn-solid'} onClick={active ? onStop : onStart}>
        {active ? '⏹ Stop camera' : '📷 Use webcam'}
      </button>
      {active && <span className="inline-flex items-center gap-1 text-xs"><span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />live</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
