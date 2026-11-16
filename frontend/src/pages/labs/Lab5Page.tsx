import { labByN } from '../../data/labs'
import FaceRebuilder from '../../components/labs/FaceRebuilder'
import Lab5Toolkit from '../../components/labs/Lab5Toolkit'
import TrainGate from '../../components/labs/TrainGate'
import SpotlightStage from '../../components/playground/SpotlightStage'
import LabPageShell from '../../components/playground/LabPageShell'

export default function Lab5Page() {
  const lab = labByN(5)
  return (
    <LabPageShell n={5}
      spotlight={
        <SpotlightStage title={lab.spotlight} tagline={lab.blurb} color={lab.color}>
          <TrainGate><FaceRebuilder /></TrainGate>
        </SpotlightStage>}
      toolkit={<Lab5Toolkit color={lab.color} />} />
  )
}
