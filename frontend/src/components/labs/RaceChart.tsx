import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MatchResult } from '../../api/labs'

const COLORS: Record<string, string> = { SURF: '#38bdf8', ORB: '#ffb703', SIFT: '#a78bfa' }
const METRICS: { key: 'keypoints' | 'matches' | 'ms'; label: string; hint: string }[] = [
  { key: 'keypoints', label: 'Keypoints (both images)', hint: 'more = denser' },
  { key: 'matches', label: 'Good matches', hint: 'more = better' },
  { key: 'ms', label: 'Time (ms)', hint: 'less = faster' },
]

/** SURF vs ORB vs SIFT on the same pair: three small bar charts. */
export default function RaceChart({ race }: { race: MatchResult['race'] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {METRICS.map(m => (
        <div key={m.key} className="rounded-2xl bg-black/5 p-3 dark:bg-white/5">
          <p className="text-xs font-bold">{m.label} <span className="font-normal opacity-60">· {m.hint}</span></p>
          <div className="h-32">
            <ResponsiveContainer>
              <BarChart data={race} margin={{ top: 14, right: 4, left: -24, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey={m.key} isAnimationActive animationDuration={700} radius={[8, 8, 0, 0]} label={{ position: 'top', fontSize: 10 }}>
                  {race.map(r => <Cell key={r.name} fill={r.available ? COLORS[r.name] : '#94a3b8'} fillOpacity={r.available ? 1 : 0.3} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
      {race.some(r => !r.available) && <p className="text-xs opacity-70 sm:col-span-3">Greyed bars: that detector is unavailable in this OpenCV build.</p>}
    </div>
  )
}
