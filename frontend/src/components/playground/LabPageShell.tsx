import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { labByN, LABS } from '../../data/labs'
import { REPORTS } from '../../data/reports'
import LabReportSection from './LabReportSection'

interface Props { n: number; spotlight: ReactNode; toolkit: ReactNode }

/** Common page frame: header, spotlight, toolkit, report, prev/next links. */
export default function LabPageShell({ n, spotlight, toolkit }: Props) {
  const lab = labByN(n)
  const prev = LABS[n - 2], next = LABS[n]
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <motion.header initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl text-3xl" style={{ background: lab.color + '33' }}>{lab.emoji}</div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: lab.color }}>Lab {n} · {lab.topic}</p>
          <h1 className="text-3xl font-bold">{lab.title}</h1>
        </div>
      </motion.header>
      {spotlight}
      {toolkit}
      <LabReportSection report={REPORTS[n]} color={lab.color} />
      <nav className="flex justify-between text-sm font-semibold">
        {prev ? <Link className="btn-ghost" to={prev.path}>← Lab {prev.n}</Link> : <span />}
        {next ? <Link className="btn-ghost" to={next.path}>Lab {next.n} →</Link> : <Link className="btn-ghost" to="/live">Live Camera →</Link>}
      </nav>
    </div>
  )
}
