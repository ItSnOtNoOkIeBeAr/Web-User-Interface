import { LABS } from '../../data/labs'
import SpotlightCard from './SpotlightCard'

/** Swipeable (native scroll-snap) row of the best experiments. */
export default function SpotlightCarousel() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10">
      <h2 className="mb-1 text-2xl font-bold">✨ Spotlight experiments</h2>
      <p className="mb-4 text-sm opacity-70">Swipe through the headline demo of every lab.</p>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4">
        {LABS.map(l => <SpotlightCard key={l.n} lab={l} />)}
      </div>
    </section>
  )
}
