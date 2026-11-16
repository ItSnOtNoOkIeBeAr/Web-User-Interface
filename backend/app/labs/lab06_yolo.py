"""Lab 6 - YOLO object detection (Ultralytics YOLOv11n / YOLOv8n / custom best.pt)."""
import time
from collections import Counter
from pathlib import Path
import cv2
import numpy as np
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from ..utils import read_image, to_b64

router = APIRouter()
CACHE_DIR = Path(__file__).resolve().parents[2] / "cache"
WEIGHTS = {"yolo11n": "yolo11n.pt", "yolov8n": "yolov8n.pt", "custom": str(CACHE_DIR / "best.pt")}
_models = {}


def get_model(key: str):
    """Load (and cache) a YOLO model. Official weights auto-download on first use."""
    from ultralytics import YOLO
    if key not in WEIGHTS:
        raise HTTPException(400, f"Unknown model '{key}'.")
    if key == "custom" and not Path(WEIGHTS[key]).exists():
        raise HTTPException(409, "No custom best.pt uploaded yet.")
    if key not in _models:
        try:
            _models[key] = YOLO(WEIGHTS[key])
        except Exception as e:
            raise HTTPException(503, f"Could not load {key}: {e}")
    return _models[key]


def detect_image(img, key="yolo11n", conf=0.35):
    model = get_model(key)
    t0 = time.perf_counter()
    res = model.predict(img, conf=conf, verbose=False, imgsz=480)[0]
    ms = (time.perf_counter() - t0) * 1000
    h, w = img.shape[:2]
    boxes = []
    for b in res.boxes:
        x1, y1, x2, y2 = b.xyxy[0].tolist()
        boxes.append({"label": res.names[int(b.cls)], "conf": round(float(b.conf), 3),
                      "box": [x1 / w, y1 / h, x2 / w, y2 / h]})   # normalised so the UI can scale freely
    return res, boxes, ms


@router.post("/detect")
async def detect(file: UploadFile = File(...), model: str = Form("yolo11n"), conf: float = Form(0.35),
                 annotate: bool = Form(False), max_side: int = Form(640)):
    img = await read_image(file, max_side=max_side)
    res, boxes, ms = detect_image(img, model, conf)
    out = {"boxes": boxes, "counts": dict(Counter(b["label"] for b in boxes)), "ms": round(ms, 1),
           "classes": len(res.names)}
    if annotate:
        out["image"] = to_b64(res.plot())
    return out


@router.post("/custom-model")
async def upload_custom(file: UploadFile = File(...)):
    """Save a user-supplied best.pt (only .pt accepted; limited to 200 MB)."""
    if not (file.filename or "").lower().endswith(".pt"):
        raise HTTPException(400, "Please upload a .pt weights file.")
    data = await file.read()
    if len(data) > 200 * 1024 * 1024:
        raise HTTPException(413, "Weights file too large.")
    CACHE_DIR.mkdir(exist_ok=True)
    Path(WEIGHTS["custom"]).write_bytes(data)
    _models.pop("custom", None)
    try:
        names = get_model("custom").names
    except HTTPException:
        Path(WEIGHTS["custom"]).unlink(missing_ok=True)
        raise HTTPException(400, "That file could not be loaded as a YOLO model.")
    return {"ok": True, "classes": list(names.values())}


@router.post("/label-viz")
async def label_viz(image: UploadFile = File(...), labels: UploadFile = File(...), names: str = Form("")):
    """Draw YOLO-format labels ('class cx cy w h' normalised, one per line) on an image."""
    img = await read_image(image)
    h, w = img.shape[:2]
    class_names = [n.strip() for n in names.split(",") if n.strip()]
    rng = np.random.RandomState(3)
    colors = {}
    drawn = 0
    for line in (await labels.read()).decode("utf-8", "ignore").splitlines():
        p = line.split()
        if len(p) < 5:
            continue
        try:
            c, cx, cy, bw, bh = int(float(p[0])), *map(float, p[1:5])
        except ValueError:
            continue
        colors.setdefault(c, tuple(int(v) for v in rng.randint(60, 255, 3)))
        x1, y1, x2, y2 = int((cx - bw / 2) * w), int((cy - bh / 2) * h), int((cx + bw / 2) * w), int((cy + bh / 2) * h)
        cv2.rectangle(img, (x1, y1), (x2, y2), colors[c], 2)
        label = class_names[c] if c < len(class_names) else f"class {c}"
        cv2.putText(img, label, (x1, max(14, y1 - 5)), cv2.FONT_HERSHEY_SIMPLEX, 0.55, colors[c], 2)
        drawn += 1
    if not drawn:
        raise HTTPException(400, "No valid YOLO label lines found in the .txt file.")
    return {"image": to_b64(img), "boxes": drawn}
