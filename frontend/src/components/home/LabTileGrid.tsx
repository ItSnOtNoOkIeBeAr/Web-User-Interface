import { LABS } from '../../data/labs'
import LabTile from './LabTile'

export default function LabTileGrid() {
  return (
    <section id="labs" className="mx-auto max-w-6xl px-4 pt-10">
      <h2 className="mb-4 text-2xl font-bold">🧪 All 7 labs</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LABS.map(l => <LabTile key={l.n} lab={l} />)}
        <LabTile lab={{ n: 8, path: '/live', title: 'Live Camera', topic: 'Webcam effects from Labs 2–7', emoji: '📹', color: '#6366f1',
          spotlight: 'Effect chips', blurb: '', toolkit: ['Edges', 'CLAHE', 'Keypoints', 'YOLO', 'Threshold'], sample: '', preview: '' }} />
      </div>
    </section>
  )
}
