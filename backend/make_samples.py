"""Generate /samples from scikit-image's bundled images (run once: python make_samples.py)."""
from pathlib import Path
import cv2
import numpy as np
from skimage import data

out = Path(__file__).parent / "samples"
out.mkdir(exist_ok=True)


def save(name, rgb):
    cv2.imwrite(str(out / name), cv2.cvtColor(np.ascontiguousarray(rgb), cv2.COLOR_RGB2BGR) if rgb.ndim == 3
                else rgb)


astro, cat, coffee = data.astronaut(), data.chelsea(), data.coffee()
save("astronaut.jpg", astro)
save("cat.jpg", cat)
save("coffee.jpg", coffee)
save("rocket.jpg", data.rocket())
save("brick.png", data.brick())
cam = data.camera()
save("cameraman.png", cam)
# Lab 3 demo images: a dark photo and a washed-out (low-contrast) photo
f = coffee.astype(np.float32) / 255
save("dark.jpg", (255 * f ** 3.2).astype(np.uint8))
save("washed_out.jpg", (110 + 0.35 * coffee).astype(np.uint8))
# Lab 7 demo: coins + ground-truth mask (Otsu + morphology; stand-in for a hand-labelled mask)
coins = data.coins()
save("coins.png", cv2.cvtColor(coins, cv2.COLOR_GRAY2RGB))
g = cv2.GaussianBlur(coins, (0, 0), 2)
_, m = cv2.threshold(g, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
save("coins_gt_mask.png", m)
# Lab 6 label-visualizer demo: a hand-written YOLO label for the cat image
(out / "cat_labels.txt").write_text("0 0.50 0.50 0.70 0.80\n")
print("samples written:", sorted(p.name for p in out.iterdir()))


# ---- Preview images for the home page: real outputs from the lab code (not mock-ups) ----
def make_previews():
    import base64
    from app.labs import lab02_edges, lab03_histogram, lab06_yolo, lab04_features
    prev = out / "previews"
    prev.mkdir(exist_ok=True)
    cat_bgr = cv2.imread(str(out / "cat.jpg"))
    astro_bgr = cv2.imread(str(out / "astronaut.jpg"))
    cv2.imwrite(str(prev / "canny.png"), lab02_edges.run_edges(cat_bgr)["canny"])
    cv2.imwrite(str(prev / "clahe.png"), lab03_histogram.clahe_color(cv2.imread(str(out / "dark.jpg")), 3.0))
    res, _, _ = lab06_yolo.detect_image(cat_bgr, "yolo11n", 0.35)
    cv2.imwrite(str(prev / "yolo.png"), res.plot())
    # Pixel Lab preview: a crop of the astronaut blown up with nearest-neighbour so pixels are visible
    crop = astro_bgr[80:120, 170:210]
    cv2.imwrite(str(prev / "pixel.png"), cv2.resize(crop, None, fx=12, fy=12, interpolation=cv2.INTER_NEAREST))
    # Match preview: ORB matches between the image and a rotated/scaled copy
    b = lab04_features.synthetic_view(astro_bgr)
    ga, gb = (cv2.cvtColor(x, cv2.COLOR_BGR2GRAY) for x in (astro_bgr, b))
    r = lab04_features.match_pair(ga, gb, "orb", 0.75)
    cv2.imwrite(str(prev / "matches.png"), cv2.drawMatches(astro_bgr, r["k1"], b, r["k2"], r["good"][:40], None, flags=2))
    # PCA preview: low-rank (SVD) rebuilds of the cameraman image - same maths as eigenface reconstruction
    g = cam.astype(np.float32)
    mu = g.mean(0)
    U, S, Vt = np.linalg.svd(g - mu, full_matrices=False)
    for k in (3, 60):
        rec = (U[:, :k] * S[:k]) @ Vt[:k] + mu
        cv2.imwrite(str(prev / f"pca_k{k}.png"), np.clip(rec, 0, 255).astype(np.uint8))
    cv2.imwrite(str(prev / "pca.png"), cv2.imread(str(prev / "pca_k60.png")))
    # Segmentation preview: DeepLab overlay on the cat
    import asyncio
    from app.labs import lab07_segmentation as seg
    import torch
    from PIL import Image
    model, tf = seg.get_deeplab()
    rgb = cv2.cvtColor(cat_bgr, cv2.COLOR_BGR2RGB)
    with torch.no_grad():
        cls = model(tf(Image.fromarray(rgb)).unsqueeze(0))["out"][0].argmax(0).byte().numpy()
    cls = cv2.resize(cls, (cat_bgr.shape[1], cat_bgr.shape[0]), interpolation=cv2.INTER_NEAREST)
    col = seg.voc_palette()[cls][..., ::-1]
    blend = np.where((cls > 0)[..., None], (0.4 * cat_bgr + 0.6 * col).astype(np.uint8), cat_bgr)
    cv2.imwrite(str(prev / "deeplab.png"), blend)
    print("previews:", sorted(p.name for p in prev.iterdir()))


if __name__ == "__main__":
    make_previews()
