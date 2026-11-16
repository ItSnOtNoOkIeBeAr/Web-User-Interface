"""Lab 7 - Segmentation: DeepLabV3 (semantic), region growing, thresholding, watershed, contours, IoU."""
import cv2
import numpy as np
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from ..utils import read_image, to_b64

router = APIRouter()

VOC = ["background", "aeroplane", "bicycle", "bird", "boat", "bottle", "bus", "car", "cat", "chair", "cow",
       "dining table", "dog", "horse", "motorbike", "person", "potted plant", "sheep", "sofa", "train", "tv monitor"]


def voc_palette():
    """The standard PASCAL VOC colour map."""
    pal = np.zeros((256, 3), np.uint8)
    for i in range(256):
        c, r, g, b = i, 0, 0, 0
        for j in range(8):
            r |= ((c >> 0) & 1) << (7 - j); g |= ((c >> 1) & 1) << (7 - j); b |= ((c >> 2) & 1) << (7 - j)
            c >>= 3
        pal[i] = (r, g, b)
    return pal


_net = {}


def get_deeplab():
    """DeepLabV3-MobileNetV3 with the COCO-subset-with-VOC-labels weights (21 classes), cached."""
    if "m" not in _net:
        import torch
        from torchvision.models.segmentation import (DeepLabV3_MobileNet_V3_Large_Weights as W,
                                                     deeplabv3_mobilenet_v3_large)
        try:
            _net["m"] = deeplabv3_mobilenet_v3_large(weights=W.DEFAULT).eval()
        except Exception as e:
            raise HTTPException(503, f"Could not load DeepLabV3 weights (internet needed once): {e}")
        _net["t"] = W.DEFAULT.transforms()
        torch.set_num_threads(4)
    return _net["m"], _net["t"]


@router.post("/deeplab")
async def deeplab(file: UploadFile = File(...)):
    """Semantic segmentation. Returns a coloured RGBA overlay + a class-id map for hover lookups."""
    import torch
    from PIL import Image
    img = await read_image(file, max_side=520)
    model, tf = get_deeplab()
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    with torch.no_grad():
        logits = model(tf(Image.fromarray(rgb)).unsqueeze(0))["out"][0]
    cls = logits.argmax(0).byte().numpy()
    cls = cv2.resize(cls, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_NEAREST)
    pal = voc_palette()
    rgba = np.dstack([pal[cls][..., ::-1], np.where(cls > 0, 255, 0).astype(np.uint8)])   # BGRA
    total = cls.size
    present = [{"id": int(c), "name": VOC[c], "color": "#%02x%02x%02x" % tuple(int(v) for v in pal[c]),
                "percent": round(100 * float((cls == c).sum()) / total, 1)}
               for c in np.unique(cls) if c > 0]
    return {"image": to_b64(img), "overlay": to_b64(rgba), "class_map": to_b64(cls), "classes": present,
            "size": [img.shape[1], img.shape[0]]}


@router.post("/region-grow")
async def region_grow(file: UploadFile = File(...), x: float = Form(0.5), y: float = Form(0.5),
                      tol: int = Form(18)):
    """Grow a region from a seed with colour tolerance, then compute the growth ORDER.

    cv2.floodFill gives the connected region; repeated constrained dilation from the seed
    gives each pixel's growth step so the front end can replay the flood as an animation.
    """
    img = await read_image(file, max_side=360)
    h, w = img.shape[:2]
    seed = (int(np.clip(x, 0, 1) * (w - 1)), int(np.clip(y, 0, 1) * (h - 1)))
    smooth = cv2.GaussianBlur(img, (5, 5), 0)
    mask = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(smooth.copy(), mask, seed, (0, 0, 255), (tol,) * 3, (tol,) * 3,
                  4 | cv2.FLOODFILL_MASK_ONLY | cv2.FLOODFILL_FIXED_RANGE | (255 << 8))
    region = mask[1:-1, 1:-1] > 0
    order = np.zeros((h, w), np.uint16)
    front = np.zeros((h, w), np.uint8)
    front[seed[1], seed[0]] = 1
    reached = front.copy()
    kernel = cv2.getStructuringElement(cv2.MORPH_CROSS, (3, 3))
    steps = 0
    while steps < 400:
        nxt = cv2.dilate(reached, kernel) & region.astype(np.uint8)
        if nxt.sum() == reached.sum():
            break
        steps += 1
        order[(nxt > 0) & (reached == 0)] = steps
        reached = nxt
    scaled = np.where(order > 0, 1 + order.astype(np.float32) / max(steps, 1) * 254, 0)
    if region[seed[1], seed[0]]:
        scaled[seed[1], seed[0]] = 1
    return {"image": to_b64(img), "order": to_b64(scaled.astype(np.uint8)), "steps": steps,
            "area_percent": round(100 * float(region.mean()), 1), "size": [w, h]}


def classic(img, method="otsu", thresh=127, block=35, c=5):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    g = cv2.GaussianBlur(gray, (5, 5), 0)
    if method == "global":
        _, m = cv2.threshold(g, thresh, 255, cv2.THRESH_BINARY)
    elif method == "adaptive":
        m = cv2.adaptiveThreshold(g, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, block | 1, c)
    else:
        _, m = cv2.threshold(g, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return m


def watershed(img):
    """Marker-based watershed (Otsu -> distance transform -> markers)."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, bw = cv2.threshold(cv2.GaussianBlur(gray, (5, 5), 0), 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    bw = cv2.morphologyEx(bw, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8), iterations=2)
    bg = cv2.dilate(bw, np.ones((3, 3), np.uint8), iterations=3)
    dist = cv2.distanceTransform(bw, cv2.DIST_L2, 5)
    _, fg = cv2.threshold(dist, 0.5 * dist.max(), 255, 0)
    fg = fg.astype(np.uint8)
    _, markers = cv2.connectedComponents(fg)
    markers += 1
    markers[(bg > 0) & (fg == 0)] = 0
    markers = cv2.watershed(img.copy(), markers.astype(np.int32))
    out = img.copy()
    out[markers == -1] = (0, 0, 255)
    return out, (markers > 1).astype(np.uint8) * 255, int(markers.max() - 1)


def contours_view(img):
    edges = cv2.Canny(cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), (5, 5), 0), 60, 150)
    edges = cv2.dilate(edges, np.ones((3, 3), np.uint8))
    cs, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cs = [c for c in cs if cv2.contourArea(c) > 80]
    out = img.copy()
    cv2.drawContours(out, cs, -1, (0, 255, 0), 2)
    filled = np.zeros(img.shape[:2], np.uint8)
    cv2.drawContours(filled, cs, -1, 255, -1)
    return out, filled, len(cs)


def iou(pred, gt):
    p, g = pred > 127, gt > 127
    union = np.logical_or(p, g).sum()
    return round(float(np.logical_and(p, g).sum() / union), 4) if union else 0.0


@router.post("/classic")
async def classic_all(file: UploadFile = File(...), gt: UploadFile | None = File(None),
                      thresh: int = Form(127), block: int = Form(35), c: int = Form(5)):
    """Run every classical method once, so the UI can show them side by side (+ IoU vs ground truth)."""
    img = await read_image(file, max_side=720)
    ws_img, ws_mask, ws_n = watershed(img)
    ct_img, ct_mask, ct_n = contours_view(img)
    masks = {"global": classic(img, "global", thresh), "otsu": classic(img, "otsu"),
             "adaptive": classic(img, "adaptive", block=block, c=c), "watershed": ws_mask, "contours": ct_mask}
    out = {"original": to_b64(img),
           "images": {**{k: to_b64(v) for k, v in masks.items() if k not in ("watershed", "contours")},
                      "watershed": to_b64(ws_img), "contours": to_b64(ct_img)},
           "masks": {k: to_b64(v) for k, v in masks.items()},
           "extra": {"watershed_regions": ws_n, "contours": ct_n}}
    if gt is not None:
        g = await read_image(gt, max_side=720, gray=True)
        g = cv2.resize(g, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_NEAREST)
        out["iou"] = {k: iou(v, g) for k, v in masks.items()}
        out["iou_inverted"] = {k: iou(255 - v, g) for k, v in masks.items()}   # polarity may be flipped
    return out


def live_threshold(img):
    return cv2.cvtColor(classic(img, "otsu"), cv2.COLOR_GRAY2BGR)
