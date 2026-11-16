"""Lab 4 - Feature detection & matching: SURF (falls back to ORB), ORB, SIFT.

SURF is patented and lives in OpenCV's non-free module, so the pip wheels do not include it.
When cv2.xfeatures2d.SURF_create() is unavailable we report it honestly and fall back to ORB.
"""
import time
import cv2
import numpy as np
from fastapi import APIRouter, File, Form, UploadFile
from ..utils import read_image, to_b64

router = APIRouter()


def surf_available() -> bool:
    try:
        cv2.xfeatures2d.SURF_create()
        return True
    except Exception:
        return False


def make_detector(name: str, hessian: float = 400, upright: bool = False, orb_features: int = 1500):
    """Return (detector, norm, resolved_name, notice)."""
    if name == "surf":
        if surf_available():
            return cv2.xfeatures2d.SURF_create(hessianThreshold=hessian, upright=upright), cv2.NORM_L2, "surf", ""
        # Map the Hessian threshold onto ORB's FAST threshold so the knob still does something.
        fast = int(np.clip(hessian / 40, 5, 60))
        return (cv2.ORB_create(nfeatures=orb_features, fastThreshold=fast), cv2.NORM_HAMMING, "orb",
                "SURF is unavailable in this OpenCV build (patented / non-free). Using ORB instead; "
                "the Hessian threshold is mapped to ORB's FAST threshold.")
    if name == "sift":
        return cv2.SIFT_create(), cv2.NORM_L2, "sift", ""
    return cv2.ORB_create(nfeatures=orb_features), cv2.NORM_HAMMING, "orb", ""


def match_pair(g1, g2, name, ratio=0.75, hessian=400):
    """Detect, describe and match with Lowe's ratio test. Returns stats + raw objects."""
    det, norm, resolved, notice = make_detector(name, hessian)
    t0 = time.perf_counter()
    k1, d1 = det.detectAndCompute(g1, None)
    k2, d2 = det.detectAndCompute(g2, None)
    good = []
    if d1 is not None and d2 is not None and len(d1) > 1 and len(d2) > 1:
        pairs = cv2.BFMatcher(norm).knnMatch(d1, d2, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < ratio * p[1].distance]
    ms = (time.perf_counter() - t0) * 1000
    return {"k1": k1, "k2": k2, "good": sorted(good, key=lambda m: m.distance), "ms": ms,
            "resolved": resolved, "notice": notice}


def synthetic_view(img):
    """Second view for single-image demos: rotate 25 deg + scale 0.8 (matches should survive)."""
    h, w = img.shape[:2]
    M = cv2.getRotationMatrix2D((w / 2, h / 2), 25, 0.8)
    return cv2.warpAffine(img, M, (w, h), borderValue=(40, 40, 40))


@router.post("/match")
async def match(img1: UploadFile = File(...), img2: UploadFile | None = File(None),
                detector: str = Form("surf"), ratio: float = Form(0.75), hessian: float = Form(400)):
    a = await read_image(img1, max_side=640)
    b = await read_image(img2, max_side=640) if img2 is not None else synthetic_view(a)
    ga, gb = (cv2.cvtColor(x, cv2.COLOR_BGR2GRAY) for x in (a, b))

    # Race: run all three detectors on the same pair.
    race, chosen = [], None
    for name in ("surf", "orb", "sift"):
        if name == "surf" and not surf_available():
            race.append({"name": "SURF", "available": False, "keypoints": 0, "matches": 0, "ms": 0})
            if detector == "surf":
                chosen = ("orb", match_pair(ga, gb, "orb", ratio, hessian))
            continue
        r = match_pair(ga, gb, name, ratio, hessian)
        race.append({"name": name.upper(), "available": True, "keypoints": len(r["k1"]) + len(r["k2"]),
                     "matches": len(r["good"]), "ms": round(r["ms"], 1)})
        if name == detector:
            chosen = (name, r)
    _, r = chosen
    lines = [{"a": [round(r["k1"][m.queryIdx].pt[0], 1), round(r["k1"][m.queryIdx].pt[1], 1)],
              "b": [round(r["k2"][m.trainIdx].pt[0], 1), round(r["k2"][m.trainIdx].pt[1], 1)]}
             for m in r["good"][:80]]
    return {"img1": to_b64(a), "img2": to_b64(b), "size1": [a.shape[1], a.shape[0]],
            "size2": [b.shape[1], b.shape[0]], "lines": lines, "total_matches": len(r["good"]),
            "used": r["resolved"].upper(), "notice": r["notice"], "race": race,
            "synthetic_second_view": img2 is None}


@router.post("/keypoints")
async def keypoints(file: UploadFile = File(...), detector: str = Form("surf"), hessian: float = Form(400),
                    upright: bool = Form(False), rich: bool = Form(True), angle: float = Form(30)):
    """Keypoint count on the original and on a rotated copy (shows rotation invariance / U-SURF)."""
    img = await read_image(file, max_side=640)
    h, w = img.shape[:2]
    rot = cv2.warpAffine(img, cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0), (w, h))
    det, _, resolved, notice = make_detector(detector, hessian, upright)
    if upright and resolved != "surf":
        notice = (notice + " " if notice else "") + "U-SURF (upright) needs real SURF, so the toggle has no effect here."
    flag = cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS if rich else cv2.DRAW_MATCHES_FLAGS_DEFAULT
    out, counts = {}, {}
    for key, im in (("original", img), ("rotated", rot)):
        kps = det.detect(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY), None)
        counts[key] = len(kps)
        out[key] = to_b64(cv2.drawKeypoints(im, kps, None, color=(0, 255, 120), flags=flag))
    return {"images": out, "counts": counts, "used": resolved.upper(), "notice": notice}


def live_keypoints(img, hessian=400):
    """Used by the Live Camera page: ORB (or SURF when available) keypoints drawn on the frame."""
    det, _, _, _ = make_detector("surf", hessian)
    kps = det.detect(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), None)
    return cv2.drawKeypoints(img, kps, None, color=(0, 255, 120), flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
