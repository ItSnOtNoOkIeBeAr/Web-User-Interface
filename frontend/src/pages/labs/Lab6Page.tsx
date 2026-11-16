import { labByN } from '../../data/labs'
import { useLabImage } from '../../hooks/useLabImage'
import Lab6Toolkit from '../../components/labs/Lab6Toolkit'
import ObjectSpotterCam from '../../components/labs/ObjectSpotterCam'
import SourceBar from '../../components/labs/SourceBar'
import SpotlightStage from '../../components/playground/SpotlightStage'
import LabPageShell from '../../components/playground/LabPageShell'

export default function Lab6Page() {
  const lab = labByN(6)
  const img = useLabImage(lab.sample)
  return (
    <LabPageShell n={6}
      spotlight={
        <SpotlightStage title={lab.spotlight} tagline={lab.blurb} color={lab.color}
          controls={<SourceBar name={img.file?.name} isSample={img.isSample} onFile={img.setFile} onReset={img.reset} />}>
          <ObjectSpotterCam file={img.file} url={img.url} />
        </SpotlightStage>}
      toolkit={<Lab6Toolkit file={img.file} color={lab.color} />} />
  )
}
