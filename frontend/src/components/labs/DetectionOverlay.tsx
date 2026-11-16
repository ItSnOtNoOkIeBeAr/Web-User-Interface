import { AnimatePresence, motion } from 'framer-motion'
import type { Detection } from '../../api/labs'

const palette = ['#fb7185', '#38bdf8', '#ffb703', '#3ddc97', '#a78bfa', '#2dd4bf', '#f472b6']
const colorOf = (label: string) => palette[[...label].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length]

/** Absolutely-positioned animated boxes (normalized 0-1 coords) over a relatively positioned media element. */
export default function DetectionOverlay({ boxes }: { boxes: Detection[] }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <AnimatePresence>
        {boxes.map((b, i) => {
          const [x1, y1, x2, y2] = b.box, c = colorOf(b.label)
          return (
            <motion.div key={`${b.label}-${i}`} layout initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, left: `${x1 * 100}%`, top: `${y1 * 100}%`, width: `${(x2 - x1) * 100}%`, height: `${(y2 - y1) * 100}%` }}
              exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="absolute rounded-md border-[3px]" style={{ borderColor: c, boxShadow: `0 0 12px ${c}88` }}>
              <span className="absolute -top-6 left-[-3px] whitespace-nowrap rounded px-1.5 text-xs font-bold text-white" style={{ background: c }}>
                {b.label} {Math.round(b.conf * 100)}%
              </span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
