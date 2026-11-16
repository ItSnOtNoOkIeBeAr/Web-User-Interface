import HeroShowcase from '../components/home/HeroShowcase'
import SpotlightCarousel from '../components/home/SpotlightCarousel'
import LabTileGrid from '../components/home/LabTileGrid'
import TryItQuickDrop from '../components/home/TryItQuickDrop'

export default function HomePage() {
  return (
    <>
      <HeroShowcase />
      <SpotlightCarousel />
      <TryItQuickDrop />
      <LabTileGrid />
    </>
  )
}
