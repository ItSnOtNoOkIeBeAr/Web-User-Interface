"""Lab 2 - Edge detection: Gaussian blur -> Sobel / Canny."""
import cv2
import numpy as np
from fastapi import APIRouter, File, Form, UploadFile
from ..utils import read_image, to_b64

router = APIRouter()


def run_edges(img, blur=5, ksize=3, t1=80, t2=160):
    """Return gray, Sobel magnitude, Sobel x/y and Canny (all single-channel uint8)."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur |= 1                       # Gaussian kernel sizes must be odd
    ksize = ksize if ksize in (1, 3, 5, 7) else 3
    g = cv2.GaussianBlur(gray, (blur, blur), 0) if blur > 1 else gray
    sx = cv2.Sobel(g, cv2.CV_64F, 1, 0, ksize=ksize)
    sy = cv2.Sobel(g, cv2.CV_64F, 0, 1, ksize=ksize)
    mag = cv2.convertScaleAbs(cv2.magnitude(sx, sy) / (4 ** (ksize // 2)))
    return {"gray": gray, "sobel": mag, "sobel_x": cv2.convertScaleAbs(sx / (4 ** (ksize // 2))),
            "sobel_y": cv2.convertScaleAbs(sy / (4 ** (ksize // 2))), "canny": cv2.Canny(g, t1, t2)}


@router.post("/edges")
async def edges(file: UploadFile = File(...), blur: int = Form(5), ksize: int = Form(3),
                t1: int = Form(80), t2: int = Form(160), fmt: str = Form("png"),
                max_side: int = Form(960)):
    img = await read_image(file, max_side=max_side)
    r = run_edges(img, blur, ksize, t1, t2)
    out = {k: to_b64(v, fmt) for k, v in r.items()}
    out["original"] = to_b64(img, fmt)
    out["canny_pixels"] = int(np.count_nonzero(r["canny"]))
    return out
