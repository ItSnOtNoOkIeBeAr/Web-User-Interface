"""CV Playground API - one FastAPI app, one router per lab."""
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .labs import (lab01_images, lab02_edges, lab03_histogram, lab04_features,
                   lab05_eigenfaces, lab06_yolo, lab07_segmentation, live)

app = FastAPI(title="CV Playground", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

for mod, prefix in [(lab01_images, "lab1"), (lab02_edges, "lab2"), (lab03_histogram, "lab3"),
                    (lab04_features, "lab4"), (lab05_eigenfaces, "lab5"), (lab06_yolo, "lab6"),
                    (lab07_segmentation, "lab7"), (live, "live")]:
    app.include_router(mod.router, prefix=f"/api/{prefix}", tags=[prefix])

SAMPLES = Path(__file__).resolve().parent.parent / "samples"
SAMPLES.mkdir(exist_ok=True)
app.mount("/samples", StaticFiles(directory=SAMPLES), name="samples")


@app.get("/api/health")
def health():
    import cv2
    return {"ok": True, "opencv": cv2.__version__, "surf": lab04_features.surf_available()}
