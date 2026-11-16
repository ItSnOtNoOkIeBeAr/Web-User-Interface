import { labByN } from '../../data/labs'
import { useLabImage } from '../../hooks/useLabImage'
import ContrastRescue from '../../components/labs/ContrastRescue'
import Lab3Toolkit from '../../components/labs/Lab3Toolkit'
import SourceBar from '../../components/labs/SourceBar'
import SpotlightStage from '../../components/playground/SpotlightStage'
import LabPageShell from '../../components/playground/LabPageShell'

export default function Lab3Page() {
  const lab = labByN(3)
  const img = useLabImage(lab.sample)
  return (
    <LabPageShell n={3}
      spotlight={
        <SpotlightStage title={lab.spotlight} tagline={lab.blurb} color={lab.color}
          controls={<>
            <SourceBar name={img.file?.name} isSample={img.isSample} onFile={img.setFile} onReset={img.reset} />
            {img.isSample && <span className="text-xs opacity-70">Sample is a dark photo (gamma 3.2). Washed-out one: <code>/samples/washed_out.jpg</code></span>}
          </>}>
          <ContrastRescue file={img.file} />
        </SpotlightStage>}
      toolkit={<Lab3Toolkit file={img.file} color={lab.color} />} />
  )
}
