import { NavLink } from 'react-router-dom'
import { LABS } from '../../data/labs'
import ThemeToggle from './ThemeToggle'

export default function NavBar() {
  const link = ({ isActive }: { isActive: boolean }) =>
    `shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-ink text-white dark:bg-white dark:text-ink' : 'hover:bg-black/5 dark:hover:bg-white/10'}`
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-[#0b0c1a]/70">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2">
        <NavLink to="/" className="mr-2 shrink-0 font-display text-lg font-bold">🧪 CV&nbsp;Playground</NavLink>
        <nav className="no-scrollbar flex flex-1 items-center gap-1 overflow-x-auto" aria-label="Labs">
          {LABS.map(l => <NavLink key={l.n} to={l.path} className={link} title={l.title}>Lab {l.n}</NavLink>)}
          <NavLink to="/live" className={link}>📹 Live</NavLink>
          <NavLink to="/about" className={link}>About</NavLink>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  )
}
