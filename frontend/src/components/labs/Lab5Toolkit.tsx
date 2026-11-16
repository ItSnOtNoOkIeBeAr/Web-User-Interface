import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { lab5, type Lab5Model, type Lab5Stats } from '../../api/labs'
import { ErrorNote, Skeleton } from '../playground/Status'
import ToolkitItem from '../playground/ToolkitItem'
import ToolkitPanel from '../playground/ToolkitPanel'
import TrainGate from './TrainGate'

function Content() {
  const [stats, setStats] = useState<Lab5Stats | null>(null)
  const [model, setModel] = useState<Lab5Model | null>(null)
  const [err, setErr] = useState<string | null>(null)
  useEffect(() => { Promise.all([lab5.stats(), lab5.model()]).then(([s, m]) => { setStats(s); setModel(m) }).catch(e => setErr(e.message)) }, [])
  if (err) return <ErrorNote message={err} />
  if (!stats || !model) return <Skeleton className="h-40" />

  const variance = model.cumulative_variance.map((v, i) => ({ k: i + 1, v: +(v * 100).toFixed(2) }))
  return <>
    <ToolkitItem title="Dataset stats" defaultOpen>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[['Images', stats.n_samples], ['Size (h×w)', `${stats.height}×${stats.width}`], ['Features', stats.n_features], ['People', stats.classes.length], ['Train (80%)', stats.train], ['Test (20%)', stats.test]].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-black/5 p-2 dark:bg-white/5"><div className="text-[11px] opacity-60">{k}</div><div className="font-mono font-semibold">{v}</div></div>
        ))}
      </div>
      <div className="h-44"><ResponsiveContainer><BarChart data={stats.classes.map((c, i) => ({ c: c.split(' ').pop(), n: stats.counts[i] }))} margin={{ left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.15} /><XAxis dataKey="c" tick={{ fontSize: 10 }} interval={0} angle={-30} height={50} /><YAxis tick={{ fontSize: 10 }} /><Tooltip />
        <Bar dataKey="n" fill="#a78bfa" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
      <p className="text-xs opacity-70">fetch_lfw_people(min_faces_per_person=70, resize=0.4) · train_test_split(test_size=0.2, random_state=42)</p>
    </ToolkitItem>
    <ToolkitItem title="PCA fit & eigenface gallery (first 12 + last 3)">
      <p className="text-xs opacity-70">PCA(n_components=150, svd_solver="randomized", whiten=True), fitted on the training split only.</p>
      <div className="flex flex-wrap items-center gap-2">
        <figure className="text-center text-[11px]"><img src={model.mean_face} className="h-20 rounded-lg" alt="mean face" />mean</figure>
        {model.eigenfaces.first.map((s, i) => <figure key={i} className="text-center text-[11px]"><img src={s} className="h-20 rounded-lg" alt={`eigenface ${i + 1}`} />#{i + 1}</figure>)}
        <span className="px-1 text-lg">…</span>
        {model.eigenfaces.last.map((s, i) => <figure key={i} className="text-center text-[11px]"><img src={s} className="h-20 rounded-lg" alt={`eigenface ${148 + i}`} />#{148 + i}</figure>)}
      </div>
      <p className="text-xs opacity-70">First eigenfaces capture broad lighting/shape; the last ones are mostly noise.</p>
    </ToolkitItem>
    <ToolkitItem title="90% cumulative variance">
      <p><b>{model.n_for_90}</b> components explain 90% of the variance.</p>
      <div className="h-52"><ResponsiveContainer><LineChart data={variance} margin={{ left: -15 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.15} /><XAxis dataKey="k" tick={{ fontSize: 10 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" /><Tooltip />
        <ReferenceLine y={90} stroke="#fb7185" strokeDasharray="4 4" label={{ value: '90%', fontSize: 10 }} /><ReferenceLine x={model.n_for_90} stroke="#fb7185" strokeDasharray="4 4" />
        <Line dataKey="v" stroke="#a78bfa" dot={false} strokeWidth={3} name="cumulative %" /></LineChart></ResponsiveContainer></div>
    </ToolkitItem>
    <ToolkitItem title="SVM classification report">
      <p>RBF SVM (class_weight="balanced") accuracy: <b>{(model.accuracy * 100).toFixed(1)}%</b></p>
      <div className="overflow-x-auto"><table className="w-full text-left text-xs">
        <thead><tr className="opacity-60"><th>Person</th><th>Precision</th><th>Recall</th><th>F1</th><th>Support</th></tr></thead>
        <tbody>{model.report.map(r => <tr key={r.name} className="border-t border-black/5 dark:border-white/10"><td className="py-1">{r.name}</td><td>{r.precision}</td><td>{r.recall}</td><td>{r['f1-score']}</td><td>{r.support}</td></tr>)}
          <tr className="border-t font-semibold"><td className="py-1">weighted avg</td><td>{model.report_avg.precision}</td><td>{model.report_avg.recall}</td><td>{model.report_avg['f1-score']}</td><td>{model.test_count}</td></tr></tbody>
      </table></div>
    </ToolkitItem>
    <ToolkitItem title="Misclassified faces">
      {model.misclassified.length ? <div className="flex flex-wrap gap-3">{model.misclassified.map((m, i) => (
        <figure key={i} className="w-24 text-center text-[11px]"><img src={m.image} alt="misclassified" className="rounded-lg" /><span className="text-emerald-600">true: {m.true}</span><br /><span className="text-rose-500">pred: {m.pred}</span></figure>))}</div>
        : <p>No misclassifications 🎉</p>}
    </ToolkitItem>
  </>
}

export default function Lab5Toolkit({ color }: { color: string }) {
  return <ToolkitPanel color={color}><TrainGate><Content /></TrainGate></ToolkitPanel>
}
