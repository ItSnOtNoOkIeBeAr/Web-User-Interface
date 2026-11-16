export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <h1 className="text-3xl font-bold">About CV Playground</h1>
      <p>One web app that compiles the 7 laboratory activities of <b>CSST106 – Perception and Computer Vision</b> (BSCS 4A, 1st Semester, A.Y. 2026–2027, Instructor: Jeremy C. Reyes).</p>
      <div className="card space-y-2 p-5 text-sm">
        <h2 className="text-lg font-bold">How it works</h2>
        <p>The React front end sends your images and webcam frames to a FastAPI back end that runs the real OpenCV, scikit-learn, Ultralytics and PyTorch code, then displays the returned images and numbers. No results are faked.</p>
        <p>Each lab page has a big <b>Spotlight</b> demo, a compact <b>Toolkit</b>, and a collapsible report (objective, procedure, algorithm, results, conclusion).</p>
      </div>
      <div className="card space-y-2 p-5 text-sm">
        <h2 className="text-lg font-bold">Notes</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li><b>SURF</b> is patented and not part of standard OpenCV builds; when unavailable the app says so and falls back to ORB.</li>
          <li><b>Lab 5</b> downloads the LFW dataset (~200 MB) the first time and caches the trained model.</li>
          <li>Uploaded images are limited to 12 MB and downscaled for speed; nothing is stored on the server.</li>
        </ul>
      </div>
    </div>
  )
}
