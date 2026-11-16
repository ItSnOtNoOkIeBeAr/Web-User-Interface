import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'

// Real outputs produced by the backend labs (see backend/make_samples.py -> samples/previews).
const SLIDES = [
  { src: '/samples/previews/canny.png', label: 'Canny edges', lab: 2 },
  { src: '/samples/previews/yolo.png', label: 'YOLO boxes', lab: 6 },
  { src: '/samples/previews/pca_k3.png', label: 'PCA rebuild · 3 components', lab: 5 },
  { src: '/samples/previews/pca_k60.png', label: 'PCA rebuild · 60 components', lab: 5 },
  { src: '/samples/previews/deeplab.png', label: 'Segmentation masks', lab: 7 },
]

/** Animated hero: cycles through real demo outputs. */
export default function HeroShowcase() {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI(v => (v + 1) % SLIDES.length), 2600); return () => clearInterval(t) }, [])
  const s = SLIDES[i]
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-fuchsia-500 via-violet-600 to-sky-500 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold leading-tight sm:text-6xl">
            Play with<br />computer vision.
          </motion.h1>
          <p className="mt-4 max-w-md text-lg opacity-90">Seven labs, one playground. Real OpenCV, PCA, YOLO and DeepLab running on your images and webcam.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#labs" className="btn bg-white text-ink">Pick a lab ↓</a>
            <Link to="/live" className="btn bg-white/20 hover:bg-white/30">📹 Live camera</Link>
          </div>
        </div>
        <div className="relative aspect-square max-h-[380px] overflow-hidden rounded-3xl bg-black/30 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.img key={s.src} src={s.src} alt={s.label} initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }} className="absolute inset-0 h-full w-full object-cover" />
          </AnimatePresence>
          <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold">Lab {s.lab} · {s.label}</div>
        </div>
      </div>
    </section>
  )
}
