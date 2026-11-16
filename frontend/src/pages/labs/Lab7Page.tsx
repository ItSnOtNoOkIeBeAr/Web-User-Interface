import { labByN } from '../../data/labs'
import { useLabImage } from '../../hooks/useLabImage'
import GrowPanel from '../../components/labs/GrowPanel'
import Lab7Toolkit from '../../components/labs/Lab7Toolkit'
import SemanticPanel from '../../components/labs/SemanticPanel'
import SourceBar from '../../components/labs/SourceBar'
import SpotlightStage from '../../components/playground/SpotlightStage'
import LabPageShell from '../../components/playground/LabPageShell'

export default function Lab7Page() {
  const lab = labByN(7)
  const img = useLabImage(lab.sample)
  return (
    <LabPageShell n={7}
      spotlight={
        <SpotlightStage title={lab.spotlight} tagline={lab.blurb} color={lab.color}
          controls={<SourceBar name={img.file?.name} isSample={img.isSample} onFile={img.setFile} onReset={img.reset} />}>
          <div className="grid gap-6 lg:grid-cols-2">
            <SemanticPanel file={img.file} />
            <GrowPanel file={img.file} url={img.url} />
          </div>
        </SpotlightStage>}
      toolkit={<Lab7Toolkit file={img.file} color={lab.color} />} />
  )
}
