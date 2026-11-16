import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface Props { data: number[]; color?: string; height?: number; secondary?: number[]; secondaryColor?: string }

/** 256-bin histogram. Changing `data` animates the area morphing to its new shape. */
export default function HistogramChart({ data, color = '#8b5cf6', height = 160, secondary, secondaryColor = '#94a3b8' }: Props) {
  const rows = data.map((v, i) => ({ i, v, s: secondary?.[i] }))
  return (
    <div style={{ height }} role="img" aria-label="Intensity histogram">
      <ResponsiveContainer>
        <AreaChart data={rows} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="i" tick={{ fontSize: 10 }} ticks={[0, 64, 128, 192, 255]} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(v: number) => [v, 'pixels']} labelFormatter={l => `intensity ${l}`} />
          {secondary && <Area type="monotone" dataKey="s" stroke={secondaryColor} fill={secondaryColor} fillOpacity={0.15} isAnimationActive={false} dot={false} />}
          <Area type="monotone" dataKey="v" stroke={color} fill={color} fillOpacity={0.45} isAnimationActive animationDuration={700} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
