"""Shared helpers: upload validation, image decode/encode, downscaling."""
import base64
import cv2
import numpy as np
from fastapi import HTTPException, UploadFile

MAX_BYTES = 12 * 1024 * 1024   # reject uploads larger than 12 MB
MAX_SIDE = 960                 # downscale anything bigger than this (longest side)


async def read_image(file: UploadFile, max_side: int = MAX_SIDE, gray: bool = False) -> np.ndarray:
    """Validate and decode an uploaded image into a BGR (or gray) uint8 array."""
    data = await file.read()
    if not data:
        raise HTTPException(400, "Empty upload.")
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Image too large (max 12 MB).")
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_GRAYSCALE if gray else cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(400, "File is not a readable image (use PNG/JPG/BMP/WebP).")
    return downscale(img, max_side)


def downscale(img: np.ndarray, max_side: int = MAX_SIDE) -> np.ndarray:
    h, w = img.shape[:2]
    s = max_side / max(h, w)
    if s < 1:
        img = cv2.resize(img, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA)
    return img


def to_b64(img: np.ndarray, fmt: str = "png", quality: int = 80) -> str:
    """Encode an image as a data URL. fmt='jpeg' is used for live webcam frames (faster)."""
    ext = ".jpg" if fmt == "jpeg" else ".png"
    params = [cv2.IMWRITE_JPEG_QUALITY, quality] if fmt == "jpeg" else []
    ok, buf = cv2.imencode(ext, img, params)
    if not ok:
        raise HTTPException(500, "Could not encode image.")
    mime = "image/jpeg" if fmt == "jpeg" else "image/png"
    return f"data:{mime};base64,{base64.b64encode(buf).decode()}"


def ensure_bgr(img: np.ndarray) -> np.ndarray:
    return cv2.cvtColor(img, cv2.COLOR_GRAY2BGR) if img.ndim == 2 else img
