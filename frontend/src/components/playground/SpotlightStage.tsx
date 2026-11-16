import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props { title: string; tagline: string; color: string; children: ReactNode; controls?: ReactNode }

/** The big hero demo area of a lab page. */
export default function SpotlightStage({ title, tagline, color, children, controls }: Props) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden" style={{ boxShadow: `0 20px 60px -25px ${color}` }}>
      <div className="px-4 py-3 sm:px-6 text-white" style={{ background: `linear-gradient(120deg, ${color}, ${color}aa)` }}>
        <p className="text-xs font-bold uppercase tracking-widest opacity-80">✨ Spotlight</p>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm opacity-90">{tagline}</p>
      </div>
      <div className="p-4 sm:p-6">
        {controls && <div className="mb-4 flex flex-wrap items-end gap-4">{controls}</div>}
        {children}
      </div>
    </motion.section>
  )
}
