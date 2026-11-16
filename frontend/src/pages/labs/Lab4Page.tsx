import { labByN } from '../../data/labs'
import { useLabImage } from '../../hooks/useLabImage'
import FeatureMatchUp from '../../components/labs/FeatureMatchUp'
import Lab4Toolkit from '../../components/labs/Lab4Toolkit'
import SourceBar from '../../components/labs/SourceBar'
import SpotlightStage from '../../components/playground/SpotlightStage'
import LabPageShell from '../../components/playground/LabPageShell'

export default function Lab4Page() {
  const lab = labByN(4)
  const img = useLabImage(lab.sample)
  return (
    <LabPageShell n={4}
      spotlight={
        <SpotlightStage title={lab.spotlight} tagline={lab.blurb} color={lab.color}
          controls={<SourceBar name={img.file?.name} isSample={img.isSample} onFile={img.setFile} onReset={img.reset} />}>
          <FeatureMatchUp file={img.file} />
        </SpotlightStage>}
      toolkit={<Lab4Toolkit file={img.file} color={lab.color} />} />
  )
}
