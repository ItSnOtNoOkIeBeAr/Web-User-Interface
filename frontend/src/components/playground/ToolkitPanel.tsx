import type { ReactNode } from 'react'

/** Compact accordion container for a lab's minor operations. */
export default function ToolkitPanel({ children, color }: { children: ReactNode; color: string }) {
  return (
    <section className="card p-4 sm:p-6">
      <h2 className="mb-3 text-lg font-bold"><span style={{ color }}>🧰</span> Toolkit <span className="text-xs font-normal opacity-60">· smaller operations</span></h2>
      <div className="space-y-2">{children}</div>
    </section>
  )
}
