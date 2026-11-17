# 🧪 CV Playground

One web app that compiles all **7 laboratory activities** of **CSST106 – Perception and Computer Vision**
(BSCS 4A · 1st Semester · A.Y. 2026–2027 · Instructor: Jeremy C. Reyes).

Every lab page opens with a big interactive **Spotlight** demo, followed by a compact **Toolkit** of the smaller
operations, and a collapsible **Lab report** (objective, procedure, algorithm, results, conclusion). All results come
from real OpenCV / scikit-learn / Ultralytics / PyTorch code running in the backend, and any output can be saved as a PNG.

| Layer | Stack |
|---|---|
| Frontend | React + Vite + TypeScript, React Router, Tailwind CSS, Framer Motion, Recharts |
| Backend | Python FastAPI, opencv-contrib-python, NumPy, scikit-learn, scikit-image, Ultralytics, PyTorch/torchvision |

## The 7 labs

| # | Lab | ✨ Spotlight | 🧰 Toolkit |
|---|---|---|---|
| 1 | Image Manipulation | **Pixel Lab** – hover to magnify pixels into a B-G-R value grid, paint pixels, animated BGR / RGB / gray toggle | shape info, crop ROI, resize, rotate 90° |
| 2 | Edge Detection | **Live Edge Vision** – real-time Canny + Sobel on webcam/image, split-screen wipe, live thresholds | Gaussian blur size, Sobel X/Y views, Sobel ksize |
| 3 | Histogram Equalization | **Contrast Rescue** – Global HE vs CLAHE with a morphing histogram and live clipLimit | grayscale, YUV/HSV color equalization, linear stretching |
| 4 | SURF Features | **Feature Match-Up** – animated match lines, ratio-test knob, SURF/ORB/SIFT race chart | Hessian threshold, rich keypoints, U-SURF on a rotated copy |
| 5 | PCA / Eigenfaces | **Face Rebuilder** – 1→150 components slider, "Who is this?" SVM guess | dataset stats, PCA fit, eigenface gallery (12 + 3), 90 % variance, classification report, misclassified faces |
| 6 | YOLO Detection | **Object Spotter Cam** – YOLOv11n on webcam, animated boxes, class counter, FPS, confidence | image detection, YOLOv8n switch, custom `best.pt`, label visualizer, dataset/`data.yaml`, train/val commands |
| 7 | Segmentation | **Magic Segmenter** – DeepLabV3 (VOC) masks with hover highlight + click-to-grow region growing | global/Otsu/adaptive thresholds, watershed, contours, comparison, IoU |

Plus a **Live Camera** page that applies Lab 2/3/4/6/7 effects to the webcam via effect chips.

## Setup

Requirements: **Python 3.10+**, **Node 18+**. First runs need internet (model/dataset downloads, see notes).

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
# ultralytics installs plain opencv-python, which clashes with opencv-contrib. Keep only contrib:
pip uninstall -y opencv-python opencv-python-headless
pip install --force-reinstall "opencv-contrib-python<5"
python make_samples.py            # (re)generates /samples and home-page previews (already committed)
uvicorn app.main:app --reload     # http://127.0.0.1:8000  (docs at /docs)
```

### Frontend

```bash
cd frontend
npm install
npm run dev                       # http://localhost:5173  (proxies /api and /samples to :8000)
```

Open http://localhost:5173. Webcam features need a browser that allows camera access on `localhost`.

## Project layout

```
backend/
  app/main.py                     FastAPI app + routers
  app/utils.py                    upload validation, downscaling, PNG/JPEG base64 encoding
  app/labs/lab01_images.py … lab07_segmentation.py, live.py
  samples/                        demo images (+ previews/ generated from the real labs)
  make_samples.py                 builds the samples
  tests/smoke_test.py             calls every endpoint
frontend/src/
  pages/        HomePage, labs/Lab1Page … Lab7Page, LiveCameraPage, AboutPage
  components/   home/ layout/ playground/ (shared) labs/ (lab-specific widgets)
  hooks/        useWebcam (+ throttled useFrameLoop), useDebouncedProcess, useLabImage
  api/          client.ts + one typed client per lab (labs.ts)
  data/         labs.ts (metadata), reports.ts (report text)
```

## Notes

- **SURF** is patented and lives in OpenCV's non-free module; pip wheels do **not** include it. The app detects this,
  shows a notice, and falls back to **ORB** (the Hessian threshold is mapped onto ORB's FAST threshold). The race chart
  greys SURF out instead of inventing numbers. To use real SURF, build OpenCV from source with
  `-DOPENCV_ENABLE_NONFREE=ON -DOPENCV_EXTRA_MODULES_PATH=…/opencv_contrib/modules`.
- **LFW (Lab 5)**: `fetch_lfw_people(min_faces_per_person=70, resize=0.4)` downloads ~200 MB the first time. Press
  *Train model* on the Lab 5 page; PCA (150, randomized, whitened, fit on train only) and the RBF-SVM
  (`class_weight='balanced'`, 80/20 split, `random_state=42`) are cached in `backend/cache/lab5.joblib`.
- **YOLO**: `yolo11n.pt` / `yolov8n.pt` auto-download on first use. Custom `best.pt` uploads are stored in `backend/cache/`.
- **DeepLabV3** uses torchvision's `deeplabv3_mobilenet_v3_large` with the 21 PASCAL-VOC labels (~40 MB, downloaded once).
- Sample images come from scikit-image's bundled data. `coins_gt_mask.png` is an Otsu + morphology mask used only to
  demo IoU, and `cat_labels.txt` is a hand-written example label; neither is an official ground truth.
- Uploads are validated (image type, ≤ 12 MB) and downscaled; webcam frames are downscaled JPEGs, sent one at a time
  (no request backlog), so FPS depends on your CPU.
- **Report text**: edit `frontend/src/data/reports.ts` so each lab's objective/procedure/algorithm/results/conclusion
  matches your printed report word-for-word.

## Screenshots

Add screenshots here after running the app (e.g. `docs/home.png`, `docs/lab2.png`).

## Main API (gateway) + Jaypee's backend

`gateway/main.py` is the single public entry point (put Cloudflare Tunnel in front of it). It forwards:

| Path | Goes to |
|---|---|
| `/api/*`, `/samples/*` | this project's backend (`:8001`) |
| `/jaypee/*` (prefix stripped, e.g. `/jaypee/api/lab2/run`) | Jaypee's backend, `../Comvision-web-ui/backend` (`:8002`) |
| `/gateway/status` | health of both backends |
| anything else | built frontend (`frontend/dist`) |

The two backends both contain a Python package named `app`, so they run as separate processes.

```powershell
.\run_all.ps1                                   # starts :8001, :8002 and the gateway on :8000
cloudflared tunnel --url http://localhost:8000  # expose it
```

Override locations with `JAYPEE_BACKEND_DIR`, `JAYPEE_BACKEND_URL`, `MATTHEW_BACKEND_URL`.
In dev, `npm run dev` proxies `/api`, `/samples` and `/jaypee` to the gateway on :8000.

### Public address

The app is published through a Cloudflare Tunnel at **https://cv.dhekode.com** (tunnel `comvision-web-ui`, route → `http://localhost:8000`).
- Your app: `/` · health of both backends: `/gateway/status` · Jaypee's API: `/jaypee/docs`
- A frontend hosted elsewhere should use `VITE_API_BASE=https://cv.dhekode.com`; Jaypee's frontend should use `VITE_API_BASE=https://cv.dhekode.com/jaypee`.
- Run the tunnel with `cloudflared tunnel run --token <token>` (the token is in the Cloudflare dashboard; do not commit it).
