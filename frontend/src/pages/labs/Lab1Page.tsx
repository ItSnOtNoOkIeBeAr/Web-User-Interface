import { labByN } from '../../data/labs'
import { useLabImage } from '../../hooks/useLabImage'
import PixelLab from '../../components/labs/PixelLab'
import Lab1Toolkit from '../../components/labs/Lab1Toolkit'
import SourceBar from '../../components/labs/SourceBar'
import SpotlightStage from '../../components/playground/SpotlightStage'
import LabPageShell from '../../components/playground/LabPageShell'
import { ErrorNote } from '../../components/playground/Status'

export default function Lab1Page() {
  const lab = labByN(1)
  const img = useLabImage(lab.sample)
  return (
    <LabPageShell n={1}
      spotlight={
        <SpotlightStage title={lab.spotlight} tagline={lab.blurb} color={lab.color}
          controls={<SourceBar name={img.file?.name} isSample={img.isSample} onFile={img.setFile} onReset={img.reset} />}>
          <ErrorNote message={img.error} />
          <PixelLab src={img.url} />
        </SpotlightStage>}
      toolkit={<Lab1Toolkit file={img.file} color={lab.color} />} />
  )
}
