import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { LabMeta } from '../../data/labs'

export default function LabTile({ lab }: { lab: LabMeta }) {
  return (
    <motion.div whileHover={{ y: -6, rotate: -0.5 }} whileTap={{ scale: 0.97 }}>
      <Link to={lab.path} className="block h-full rounded-3xl p-5 text-white shadow-lg" style={{ background: `linear-gradient(140deg, ${lab.color}, ${lab.color}99)` }}>
        <div className="flex items-start justify-between">
          <span className="text-4xl">{lab.emoji}</span>
          <span className="rounded-full bg-black/25 px-2 py-0.5 text-xs font-bold">Lab {lab.n}</span>
        </div>
        <h3 className="mt-3 text-xl font-bold">{lab.title}</h3>
        <p className="text-sm opacity-90">{lab.topic}</p>
        <p className="mt-3 text-xs font-semibold">✨ {lab.spotlight}</p>
        <p className="mt-1 text-[11px] opacity-80">🧰 {lab.toolkit.join(' · ')}</p>
      </Link>
    </motion.div>
  )
}
