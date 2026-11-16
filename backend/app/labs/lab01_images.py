"""Lab 1 - Image manipulation: shape info, crop ROI, resize, rotate.
The Pixel Lab spotlight reads real pixel values client-side from the decoded image."""
import cv2
from fastapi import APIRouter, File, Form, UploadFile
from ..utils import read_image, to_b64

router = APIRouter()


@router.post("/info")
async def info(file: UploadFile = File(...)):
    img = await read_image(file, max_side=100000)
    h, w, c = img.shape
    b, g, r = (float(img[..., i].mean()) for i in range(3))
    return {"shape": [h, w, c], "dtype": str(img.dtype), "size": int(img.size),
            "mean_bgr": [round(b, 1), round(g, 1), round(r, 1)]}


@router.post("/crop")
async def crop(file: UploadFile = File(...), x: float = Form(0.25), y: float = Form(0.25),
               w: float = Form(0.5), h: float = Form(0.5)):
    """Crop an ROI given in normalized (0-1) coordinates using NumPy slicing img[y1:y2, x1:x2]."""
    img = await read_image(file)
    H, W = img.shape[:2]
    x1, y1 = int(x * W), int(y * H)
    x2, y2 = min(W, x1 + max(1, int(w * W))), min(H, y1 + max(1, int(h * H)))
    out = img[y1:y2, x1:x2]
    return {"image": to_b64(out), "shape": list(out.shape), "roi": [x1, y1, x2, y2]}


@router.post("/resize")
async def resize(file: UploadFile = File(...), scale: float = Form(0.5), interp: str = Form("area")):
    img = await read_image(file)
    flag = {"nearest": cv2.INTER_NEAREST, "linear": cv2.INTER_LINEAR,
            "cubic": cv2.INTER_CUBIC, "area": cv2.INTER_AREA}.get(interp, cv2.INTER_AREA)
    scale = max(0.05, min(scale, 3.0))
    out = cv2.resize(img, None, fx=scale, fy=scale, interpolation=flag)
    return {"image": to_b64(out), "shape": list(out.shape)}


@router.post("/rotate")
async def rotate(file: UploadFile = File(...), times: int = Form(1)):
    """Rotate in 90 degree steps (cv2.rotate)."""
    out = await read_image(file)
    for _ in range(times % 4):
        out = cv2.rotate(out, cv2.ROTATE_90_CLOCKWISE)
    return {"image": to_b64(out), "shape": list(out.shape)}
