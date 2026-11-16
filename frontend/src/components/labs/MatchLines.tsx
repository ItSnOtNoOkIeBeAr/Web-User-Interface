import { motion } from 'framer-motion'
import type { MatchResult } from '../../api/labs'

/** Two images side by side with animated SVG match lines drawn between keypoints. */
export default function MatchLines({ r }: { r: MatchResult }) {
  const [w1, h1] = r.size1, [w2, h2] = r.size2
  const H = Math.max(h1, h2), W = w1 + w2
  const hue = (i: number) => `hsl(${(i * 47) % 360} 90% 60%)`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl bg-black" role="img" aria-label="Feature matches between two images">
      <image href={r.img1} x={0} y={0} width={w1} height={h1} />
      <image href={r.img2} x={w1} y={0} width={w2} height={h2} />
      {r.lines.map((l, i) => (
        <motion.g key={`${r.used}-${i}-${l.a}-${l.b}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
          <motion.line x1={l.a[0]} y1={l.a[1]} x2={l.b[0] + w1} y2={l.b[1]} stroke={hue(i)} strokeWidth={Math.max(1, W / 500)}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: i * 0.02, duration: 0.5 }} />
          <circle cx={l.a[0]} cy={l.a[1]} r={W / 300} fill={hue(i)} />
          <circle cx={l.b[0] + w1} cy={l.b[1]} r={W / 300} fill={hue(i)} />
        </motion.g>
      ))}
    </svg>
  )
}
