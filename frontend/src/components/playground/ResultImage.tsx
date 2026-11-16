import { AnimatePresence, motion } from 'framer-motion'
import DownloadButton from './DownloadButton'
import { Skeleton } from './Status'

interface Props { src?: string | null; label?: string; loading?: boolean; filename?: string; pixelated?: boolean; className?: string }

/** Captioned result image that cross-fades when `src` changes, with skeleton + PNG download. */
export default function ResultImage({ src, label, loading, filename, pixelated, className = '' }: Props) {
  return (
    <figure className={`relative ${className}`}>
      <div className="relative overflow-hidden rounded-2xl bg-black/5 dark:bg-white/5 min-h-[6rem]">
        {!src && <Skeleton className="h-48" />}
        <AnimatePresence mode="wait">
          {src && (
            <motion.img key={src.slice(-40)} src={src} alt={label ?? 'result'}
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: loading ? 0.55 : 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }} className={`w-full ${pixelated ? 'pixelated' : ''}`} />
          )}
        </AnimatePresence>
        {loading && src && <div className="absolute right-2 top-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
      </div>
      {(label || filename) && (
        <figcaption className="mt-1 flex items-center justify-between text-xs">
          <span className="font-semibold opacity-70">{label}</span>
          {filename && <DownloadButton src={src} filename={filename} />}
        </figcaption>
      )}
    </figure>
  )
}
