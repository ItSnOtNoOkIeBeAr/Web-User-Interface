import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Report } from '../../data/reports'

/** Collapsible Objective / Procedure / Algorithm / Results / Conclusion for the printed report. */
export default function LabReportSection({ report, color }: { report: Report; color: string }) {
  const sections: [string, React.ReactNode][] = [
    ['Objective', <p>{report.objective}</p>],
    ['Procedure', <ol className="list-decimal pl-5 space-y-1">{report.procedure.map(s => <li key={s}>{s}</li>)}</ol>],
    ['Algorithm', <ul className="list-disc pl-5 space-y-1">{report.algorithm.map(s => <li key={s}>{s}</li>)}</ul>],
    ['Results', <p>{report.results}</p>],
    ['Conclusion', <p>{report.conclusion}</p>],
  ]
  const [open, setOpen] = useState<string | null>(null)
  return (
    <section className="card p-4 sm:p-6">
      <h2 className="mb-3 text-xl font-bold">📝 Lab report</h2>
      <div className="space-y-2">
        {sections.map(([title, body]) => (
          <div key={title} className="rounded-2xl border border-black/5 dark:border-white/10">
            <button className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold"
              aria-expanded={open === title} onClick={() => setOpen(open === title ? null : title)}>
              <span style={{ color }}>{title}</span><span>{open === title ? '−' : '+'}</span>
            </button>
            {open === title && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden px-4 pb-4 text-sm leading-relaxed">
                {body}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
