import { useState } from 'react'
import { lab6, type DetectResult } from '../../api/labs'
import ImageDropZone from '../playground/ImageDropZone'
import KnobSlider from '../playground/KnobSlider'
import ResultImage from '../playground/ResultImage'
import { ErrorNote } from '../playground/Status'
import ToolkitItem from '../playground/ToolkitItem'
import ToolkitPanel from '../playground/ToolkitPanel'
import { sampleFile } from '../../api/client'

const YAML = `# data.yaml
path: ../datasets/my_dataset   # dataset root
train: images/train
val: images/val
test: images/test              # optional

nc: 3                          # number of classes
names: ['cat', 'dog', 'person']`

const TREE = `my_dataset/
├── images/
│   ├── train/  img001.jpg ...
│   └── val/    img101.jpg ...
├── labels/
│   ├── train/  img001.txt ...   # one .txt per image
│   └── val/    img101.txt ...
└── data.yaml

# each line of a label file:  class cx cy w h   (all normalized 0-1)
0 0.512 0.430 0.250 0.380`

const CMDS = `# train (from pretrained weights)
yolo detect train data=data.yaml model=yolo11n.pt epochs=50 imgsz=640

# validate
yolo detect val model=runs/detect/train/weights/best.pt data=data.yaml

# predict
yolo detect predict model=runs/detect/train/weights/best.pt source=image.jpg conf=0.35`

const Code = ({ children }: { children: string }) => <pre className="overflow-x-auto rounded-xl bg-black/80 p-3 text-xs text-emerald-200">{children}</pre>

/** Image detection with model switch (YOLOv11n / YOLOv8n / custom best.pt). */
function ImageDetect({ file }: { file: File | null }) {
  const [src, setSrc] = useState<File | null>(null)
  const [model, setModel] = useState('yolo11n')
  const [conf, setConf] = useState(0.35)
  const [res, setRes] = useState<DetectResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [customInfo, setCustomInfo] = useState<string | null>(null)
  const target = src ?? file

  const run = async (m = model) => {
    if (!target) return
    setBusy(true); setErr(null)
    try { setRes(await lab6.detect(target, m, conf, true)) } catch (e) { setErr((e as Error).message) } finally { setBusy(false) }
  }
  return <>
    <div className="flex flex-wrap items-center gap-2">
      {[['yolo11n', 'YOLOv11n'], ['yolov8n', 'YOLOv8n'], ['custom', 'Custom best.pt']].map(([id, l]) => (
        <button key={id} className={`chip ${model === id ? 'chip-on' : ''}`} onClick={() => { setModel(id); setRes(null) }}>{l}</button>))}
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <ImageDropZone compact label={src ? `Image: ${src.name}` : 'Upload an image to detect'} onFile={setSrc} />
      {model === 'custom' && <ImageDropZone compact label={customInfo ?? 'Upload best.pt'} accept=".pt" validate={false}
        onFile={async f => { try { const r = await lab6.custom(f); setCustomInfo(`best.pt loaded · ${r.classes.length} classes`); setErr(null) } catch (e) { setErr((e as Error).message) } }} />}
    </div>
    <KnobSlider label="Confidence" min={0.05} max={0.95} step={0.05} value={conf} onChange={setConf} color="#fb7185" format={v => `${Math.round(v * 100)}%`} />
    <div className="flex items-center gap-2"><button className="btn-solid" disabled={busy || !target} onClick={() => run()}>{busy ? 'Detecting…' : '🎯 Detect'}</button>
      {res && <span className="text-xs">{res.boxes.length} objects · {res.ms} ms · {Object.entries(res.counts).map(([k, v]) => `${k}×${v}`).join(', ')}</span>}</div>
    <ErrorNote message={err} />
    {(res || busy) && <ResultImage src={res?.image} loading={busy} label="Annotated result" filename={`lab6-${model}`} className="max-w-xl" />}
  </>
}

/** YOLO label visualizer: image + .txt label file. */
function LabelViz() {
  const [img, setImg] = useState<File | null>(null)
  const [txt, setTxt] = useState<File | null>(null)
  const [names, setNames] = useState('cat')
  const [out, setOut] = useState<{ image: string; boxes: number } | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const demo = async () => {
    setImg(await sampleFile('cat.jpg'))
    setTxt(new File([await (await fetch('/samples/cat_labels.txt')).blob()], 'cat_labels.txt'))
    setNames('cat')
  }
  return <>
    <div className="grid gap-3 sm:grid-cols-2">
      <ImageDropZone compact label={img ? img.name : 'Image'} onFile={setImg} />
      <ImageDropZone compact label={txt ? txt.name : 'YOLO .txt labels'} accept=".txt" validate={false} onFile={setTxt} />
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <input value={names} onChange={e => setNames(e.target.value)} placeholder="class names, comma separated" className="flex-1 rounded-full border border-black/10 bg-transparent px-3 py-1.5 text-sm dark:border-white/20" />
      <button className="chip" onClick={demo}>use demo files</button>
      <button className="btn-solid" disabled={!img || !txt} onClick={async () => { try { setOut(await lab6.labelViz(img!, txt!, names)); setErr(null) } catch (e) { setErr((e as Error).message) } }}>Draw labels</button>
    </div>
    <ErrorNote message={err} />
    {out && <ResultImage src={out.image} label={`${out.boxes} labelled boxes`} filename="lab6-labels" className="max-w-xl" />}
    <p className="text-xs opacity-60">The demo label is a hand-written example box for the cat photo, only to show the format.</p>
  </>
}

export default function Lab6Toolkit({ file, color }: { file: File | null; color: string }) {
  return (
    <ToolkitPanel color={color}>
      <ToolkitItem title="Image detection · model switch · custom best.pt"><ImageDetect file={file} /></ToolkitItem>
      <ToolkitItem title="YOLO label visualizer"><LabelViz /></ToolkitItem>
      <ToolkitItem title="Dataset structure & data.yaml"><Code>{TREE}</Code><Code>{YAML}</Code></ToolkitItem>
      <ToolkitItem title="Train / validate commands"><Code>{CMDS}</Code></ToolkitItem>
    </ToolkitPanel>
  )
}
