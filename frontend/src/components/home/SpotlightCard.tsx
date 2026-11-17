import { Link } from 'react-router-dom'
import { apiUrl } from '../../api/base'
import type { LabMeta } from '../../data/labs'

export default function SpotlightCard({ lab }: { lab: LabMeta }) {
  return (
    <article className="card w-72 shrink-0 snap-center overflow-hidden sm:w-80">
      <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(transparent 40%, ${lab.color}dd), url(${apiUrl('/samples/' + lab.preview)})`, backgroundColor: lab.color }} />
      <div className="space-y-2 p-4">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: lab.color }}>Lab {lab.n}</p>
        <h3 className="text-xl font-bold">{lab.spotlight}</h3>
        <p className="min-h-[3.5rem] text-sm opacity-75">{lab.blurb}</p>
        <Link to={lab.path} className="btn text-white" style={{ background: lab.color }}>▶ Play now</Link>
      </div>
    </article>
  )
}
