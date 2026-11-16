import { useState } from 'react'
import { lab2 } from '../../api/labs'
import { labByN } from '../../data/labs'
import { useLabImage } from '../../hooks/useLabImage'
import { useDebouncedProcess } from '../../hooks/useDebouncedProcess'
import LiveEdgeVision from '../../components/labs/LiveEdgeVision'
import SourceBar from '../../components/labs/SourceBar'
import KnobSlider from '../../components/playground/KnobSlider'
import ResultImage from '../../components/playground/ResultImage'
import SpotlightStage from '../../components/playground/SpotlightStage'
import ToolkitItem from '../../components/playground/ToolkitItem'
import ToolkitPanel from '../../components/playground/ToolkitPanel'
import LabPageShell from '../../components/playground/LabPageShell'

export default function Lab2Page() {
  const lab = labByN(2)
  const img = useLabImage(lab.sample)
  // Toolkit knobs also feed the spotlight, so everything stays consistent.
  const [blur, setBlur] = useState(5), [ksize, setKsize] = useState(3)
  const xy = useDebouncedProcess(s => lab2.edges(img.file!, { blur, ksize, t1: 80, t2: 160 }, s), [img.file, blur, ksize], { enabled: !!img.file })

  return (
    <LabPageShell n={2}
      spotlight={
        <SpotlightStage title={lab.spotlight} tagline={lab.blurb} color={lab.color}
          controls={<SourceBar name={img.file?.name} isSample={img.isSample} onFile={img.setFile} onReset={img.reset} />}>
          <LiveEdgeVision file={img.file} blur={blur} ksize={ksize} />
        </SpotlightStage>}
      toolkit={
        <ToolkitPanel color={lab.color}>
          <ToolkitItem title="Gaussian blur size (applies to the spotlight too)" defaultOpen>
            <KnobSlider label="Kernel size (odd)" min={1} max={21} step={2} value={blur} onChange={setBlur} color={lab.color} />
            <p className="text-xs opacity-70">1 = no blur. Larger kernels remove noise before the gradient step, but erase fine edges.</p>
          </ToolkitItem>
          <ToolkitItem title="Sobel X / Y individual views">
            <KnobSlider label="Sobel ksize" min={1} max={7} step={2} value={ksize} onChange={setKsize} color={lab.color} />
            <div className="grid gap-3 sm:grid-cols-3">
              <ResultImage src={xy.data?.gray} label="Grayscale" loading={xy.loading} />
              <ResultImage src={xy.data?.sobel_x} label="Sobel X (vertical edges)" loading={xy.loading} filename="sobel-x" />
              <ResultImage src={xy.data?.sobel_y} label="Sobel Y (horizontal edges)" loading={xy.loading} filename="sobel-y" />
            </div>
          </ToolkitItem>
        </ToolkitPanel>} />
  )
}
