import { useState, type ReactNode } from 'react'

/** One collapsible tool. Children mount only when opened, so closed tools cost nothing. */
export default function ToolkitItem({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10">
      <button className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-semibold" aria-expanded={open} onClick={() => setOpen(!open)}>
        {title}<span className={`transition ${open ? 'rotate-45' : ''}`}>＋</span>
      </button>
      {open && <div className="space-y-3 px-4 pb-4 text-sm">{children}</div>}
    </div>
  )
}
