// Small status widgets: loading skeleton, error note, info notice.
export function Skeleton({ className = 'h-48' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-gradient-to-r from-black/5 via-black/10 to-black/5 dark:from-white/5 dark:via-white/10 dark:to-white/5 ${className}`} />
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null
  return <div className="rounded-2xl bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">⚠ {message}</div>
}

export function Notice({ children }: { children: React.ReactNode }) {
  if (!children) return null
  return <div className="rounded-2xl bg-amber-400/15 px-3 py-2 text-sm text-amber-700 dark:text-amber-200">ℹ {children}</div>
}
