"""Lab 3 - Histogram equalization: global HE, CLAHE, colour equalization, contrast stretching."""
import cv2
import numpy as np
from fastapi import APIRouter, File, Form, UploadFile
from ..utils import read_image, to_b64

router = APIRouter()


def hist(gray) -> list:
    return cv2.calcHist([gray], [0], None, [256], [0, 256]).flatten().astype(int).tolist()


def clahe_color(img, clip=2.0, tile=8):
    """CLAHE on the L channel of LAB only (keeps colours natural)."""
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    lab[..., 0] = cv2.createCLAHE(clipLimit=clip, tileGridSize=(tile, tile)).apply(lab[..., 0])
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)


@router.post("/equalize")
async def equalize(file: UploadFile = File(...), clip: float = Form(2.0), tile: int = Form(8),
                   fmt: str = Form("png")):
    img = await read_image(file)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    he = cv2.equalizeHist(gray)
    cl = cv2.createCLAHE(clipLimit=clip, tileGridSize=(tile, tile)).apply(gray)
    return {"gray": to_b64(gray, fmt), "he": to_b64(he, fmt), "clahe": to_b64(cl, fmt),
            "hist": {"original": hist(gray), "he": hist(he), "clahe": hist(cl)},
            "stats": {k: {"mean": round(float(v.mean()), 1), "std": round(float(v.std()), 1)}
                      for k, v in {"original": gray, "he": he, "clahe": cl}.items()}}


@router.post("/color")
async def color_eq(file: UploadFile = File(...)):
    """Equalize Y of YUV and V of HSV (never per-BGR-channel, which shifts colours)."""
    img = await read_image(file)
    yuv = cv2.cvtColor(img, cv2.COLOR_BGR2YUV)
    yuv[..., 0] = cv2.equalizeHist(yuv[..., 0])
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    hsv[..., 2] = cv2.equalizeHist(hsv[..., 2])
    return {"original": to_b64(img), "yuv": to_b64(cv2.cvtColor(yuv, cv2.COLOR_YUV2BGR)),
            "hsv": to_b64(cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR))}


@router.post("/stretch")
async def stretch(file: UploadFile = File(...), low: float = Form(2), high: float = Form(98)):
    """Linear contrast stretching between two percentiles."""
    gray = cv2.cvtColor(await read_image(file), cv2.COLOR_BGR2GRAY)
    lo, hi = np.percentile(gray, [low, high])
    out = np.clip((gray.astype(np.float32) - lo) * 255.0 / max(hi - lo, 1), 0, 255).astype(np.uint8)
    return {"gray": to_b64(gray), "stretched": to_b64(out), "lo": float(lo), "hi": float(hi),
            "hist": {"original": hist(gray), "stretched": hist(out)}}
