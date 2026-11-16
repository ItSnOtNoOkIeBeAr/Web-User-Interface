"""Lab 5 - PCA / Eigenfaces on LFW + RBF-SVM classification.

Training happens once in a background thread and is cached to backend/cache/lab5.joblib.
Dataset: fetch_lfw_people(min_faces_per_person=70, resize=0.4); 80/20 split, random_state=42.
PCA(n_components=150, svd_solver='randomized', whiten=True) is fitted on the TRAIN split only.
"""
import threading
from pathlib import Path
import cv2
import joblib
import numpy as np
from fastapi import APIRouter, HTTPException
from sklearn.datasets import fetch_lfw_people
from sklearn.decomposition import PCA
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from ..utils import to_b64

router = APIRouter()
CACHE = Path(__file__).resolve().parents[2] / "cache" / "lab5.joblib"
STATE = {"status": "idle", "message": "", "model": None}   # idle | training | ready | error
_lock = threading.Lock()


def face_png(vec, shape, scale=3, normalize=True):
    """Turn a flat face vector into a PNG data URL (min-max normalised for eigenfaces)."""
    im = vec.reshape(shape).astype(np.float32)
    if normalize:
        im = (im - im.min()) / max(im.max() - im.min(), 1e-6) * 255
    im = np.clip(im, 0, 255).astype(np.uint8)
    return to_b64(cv2.resize(im, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC))


def train():
    """Load LFW, fit PCA on train only, fit SVM, evaluate and cache everything the UI needs."""
    STATE.update(status="training", message="Downloading / loading LFW (first run needs internet, ~200 MB)...")
    try:
        lfw = fetch_lfw_people(min_faces_per_person=70, resize=0.4)
        n, h, w = lfw.images.shape
        X, y, names = lfw.data, lfw.target, lfw.target_names
        Xtr, Xte, ytr, yte, itr, ite = train_test_split(X, y, np.arange(n), test_size=0.2, random_state=42)
        STATE["message"] = "Fitting PCA (150 components, randomized, whitened)..."
        pca = PCA(n_components=150, svd_solver="randomized", whiten=True, random_state=42).fit(Xtr)
        Ptr, Pte = pca.transform(Xtr), pca.transform(Xte)
        STATE["message"] = "Training RBF-SVM (class_weight='balanced')..."
        clf = SVC(kernel="rbf", class_weight="balanced", C=1000, gamma=0.005).fit(Ptr, ytr)
        pred = clf.predict(Pte)
        cum = np.cumsum(pca.explained_variance_ratio_)
        model = {"pca": pca, "clf": clf, "shape": (h, w), "names": list(names), "Xte": Xte, "Pte": Pte,
                 "yte": yte, "pred": pred, "n": n, "ntr": len(Xtr), "nte": len(Xte),
                 "counts": np.bincount(y).tolist(), "cum": cum,
                 "acc": float(accuracy_score(yte, pred)),
                 "report": classification_report(yte, pred, target_names=names, output_dict=True, zero_division=0)}
        CACHE.parent.mkdir(exist_ok=True)
        joblib.dump(model, CACHE)
        STATE.update(status="ready", message="", model=model)
    except Exception as e:  # network failure, etc.
        STATE.update(status="error", message=f"{type(e).__name__}: {e}")


def get_model():
    if STATE["model"] is None and CACHE.exists():
        STATE.update(model=joblib.load(CACHE), status="ready")
    if STATE["model"] is None:
        raise HTTPException(409, "Model not trained yet. Press 'Train' first.")
    return STATE["model"]


@router.get("/status")
def status():
    if STATE["model"] is None and CACHE.exists() and STATE["status"] != "training":
        get_model()
    return {"status": STATE["status"], "message": STATE["message"]}


@router.post("/train")
def start_training(force: bool = False):
    with _lock:
        if STATE["status"] == "training":
            return {"status": "training"}
        if STATE["model"] is None and CACHE.exists() and not force:
            get_model()
            return {"status": "ready"}
        if force and CACHE.exists():
            CACHE.unlink()
            STATE["model"] = None
        threading.Thread(target=train, daemon=True).start()
        STATE["status"] = "training"
        return {"status": "training"}


@router.get("/stats")
def stats():
    m = get_model()
    h, w = m["shape"]
    return {"n_samples": m["n"], "height": h, "width": w, "n_features": h * w, "classes": m["names"],
            "counts": m["counts"], "train": m["ntr"], "test": m["nte"]}


@router.get("/model")
def model_info():
    """PCA + SVM results: eigenfaces gallery, variance curve, report, misclassified faces."""
    m = get_model()
    comps, shape = m["pca"].components_, m["shape"]
    cum = m["cum"]
    wrong = np.where(m["pred"] != m["yte"])[0][:12]
    r = m["report"]
    return {
        "accuracy": m["acc"],
        "eigenfaces": {"first": [face_png(c, shape) for c in comps[:12]],
                       "last": [face_png(c, shape) for c in comps[-3:]]},
        "mean_face": face_png(m["pca"].mean_, shape),
        "cumulative_variance": [round(float(v), 4) for v in cum],
        "n_for_90": int(np.searchsorted(cum, 0.90) + 1),
        "report": [{"name": n, **{k: round(r[n][k], 3) for k in ("precision", "recall", "f1-score")},
                    "support": int(r[n]["support"])} for n in m["names"]],
        "report_avg": {k: round(r["weighted avg"][k], 3) for k in ("precision", "recall", "f1-score")},
        "misclassified": [{"image": face_png(m["Xte"][i], shape, normalize=False), "true": m["names"][m["yte"][i]],
                           "pred": m["names"][m["pred"][i]]} for i in wrong],
        "test_count": m["nte"],
    }


@router.get("/test-faces")
def test_faces(limit: int = 36):
    """Thumbnails of held-out test faces for the Face Rebuilder to pick from."""
    m = get_model()
    return [{"index": int(i), "thumb": face_png(m["Xte"][i], m["shape"], scale=2, normalize=False)}
            for i in range(min(limit, m["nte"]))]


@router.get("/reconstruct")
def reconstruct(index: int = 0, k: int = 50):
    """Rebuild a test face from its first k principal components (rest zeroed)."""
    m = get_model()
    if not 0 <= index < m["nte"]:
        raise HTTPException(404, "No such test face.")
    k = int(np.clip(k, 1, 150))
    z = m["Pte"][index].copy()
    z[k:] = 0
    rec = m["pca"].inverse_transform(z[None])[0]
    orig = m["Xte"][index]
    # "ghost" layer: the k-th eigenface that was just added, for the visual
    newest = m["pca"].components_[k - 1]
    err = float(np.sqrt(np.mean((rec - orig) ** 2)))
    return {"original": face_png(orig, m["shape"], 4, False), "reconstruction": face_png(rec, m["shape"], 4, False),
            "newest_eigenface": face_png(newest, m["shape"], 2), "k": k, "rmse": round(err, 2)}


@router.get("/identify")
def identify(index: int = 0):
    m = get_model()
    p = int(m["clf"].predict(m["Pte"][index][None])[0])
    t = int(m["yte"][index])
    return {"predicted": m["names"][p], "true": m["names"][t], "correct": p == t}
