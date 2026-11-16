"""Live Camera page: one endpoint that applies a chosen lab effect to a single webcam frame."""
import cv2
from fastapi import APIRouter, File, Form, UploadFile
from ..utils import read_image, to_b64
from . import lab02_edges, lab03_histogram, lab04_features, lab06_yolo, lab07_segmentation

router = APIRouter()


@router.post("/frame")
async def frame(file: UploadFile = File(...), effect: str = Form("canny"), p1: float = Form(0),
                p2: float = Form(0)):
    img = await read_image(file, max_side=480)
    info = {}
    if effect in ("canny", "sobel"):
        t1 = int(p1 or 80)
        r = lab02_edges.run_edges(img, 5, 3, t1, int(p2 or t1 * 2))
        out = cv2.cvtColor(r[effect], cv2.COLOR_GRAY2BGR)
    elif effect == "clahe":
        out = lab03_histogram.clahe_color(img, clip=p1 or 3.0)
    elif effect == "keypoints":
        out = lab04_features.live_keypoints(img)
    elif effect == "yolo":
        res, boxes, ms = lab06_yolo.detect_image(img, "yolo11n", p1 or 0.35)
        out = res.plot()
        info = {"counts": {b["label"]: sum(x["label"] == b["label"] for x in boxes) for b in boxes}, "ms": round(ms)}
    elif effect == "threshold":
        out = lab07_segmentation.live_threshold(img)
    else:
        out = img
    return {"image": to_b64(out, "jpeg", 75), "info": info}
