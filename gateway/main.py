"""Main API / gateway. The only thing exposed to the internet (e.g. via Cloudflare Tunnel).

  /api/*, /samples/*   -> Matthew's backend  (default http://127.0.0.1:8001)
  /jaypee/*            -> Jaypee's backend   (default http://127.0.0.1:8002), prefix stripped
                          e.g. /jaypee/api/lab2/run -> Jaypee's /api/lab2/run
  /gateway/status      -> health of both backends
  everything else      -> the built React frontend (frontend/dist), with SPA fallback

Run:  uvicorn gateway.main:app --port 8000   (from the project root)
"""
import os
from pathlib import Path

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse

MINE = os.getenv("MATTHEW_BACKEND_URL", "http://127.0.0.1:8001").rstrip("/")
JAYPEE = os.getenv("JAYPEE_BACKEND_URL", "http://127.0.0.1:8002").rstrip("/")
DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"

app = FastAPI(title="CV Playground Gateway")
client = httpx.AsyncClient(timeout=httpx.Timeout(300.0, connect=5.0))   # YOLO/DeepLab first loads are slow
HOP_BY_HOP = {"host", "connection", "keep-alive", "transfer-encoding", "te", "upgrade", "content-length"}


async def forward(request: Request, base: str, path: str):
    """Stream the request to `base`/`path` and stream the answer back."""
    url = f"{base}/{path}"
    headers = {k: v for k, v in request.headers.items() if k.lower() not in HOP_BY_HOP}
    try:
        req = client.build_request(request.method, url, params=request.query_params,
                                   headers=headers, content=request.stream())
        resp = await client.send(req, stream=True)
    except httpx.HTTPError as e:
        who = "Jaypee's" if base == JAYPEE else "Matthew's"
        return JSONResponse({"detail": f"{who} backend is not reachable ({type(e).__name__}). Is it running?"}, status_code=502)
    out_headers = {k: v for k, v in resp.headers.items() if k.lower() not in HOP_BY_HOP | {"content-encoding"}}
    return StreamingResponse(resp.aiter_raw(), status_code=resp.status_code, headers=out_headers,
                             background=None, media_type=resp.headers.get("content-type"))


@app.get("/gateway/status")
async def status():
    async def ping(name, base):
        try:
            r = await client.get(f"{base}/api/health", timeout=3)
            return {"name": name, "url": base, "up": r.status_code == 200, "health": r.json()}
        except Exception as e:
            return {"name": name, "url": base, "up": False, "error": type(e).__name__}
    return {"matthew": await ping("matthew", MINE), "jaypee": await ping("jaypee", JAYPEE)}


@app.api_route("/jaypee/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
async def jaypee(path: str, request: Request):
    return await forward(request, JAYPEE, path)


@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
async def mine_api(path: str, request: Request):
    return await forward(request, MINE, f"api/{path}")


@app.api_route("/samples/{path:path}", methods=["GET"])
async def mine_samples(path: str, request: Request):
    return await forward(request, MINE, f"samples/{path}")


@app.get("/{path:path}")
async def frontend(path: str):
    """Serve the built frontend (run `npm run build` first); unknown paths fall back to index.html."""
    if not DIST.exists():
        return JSONResponse({"detail": "Frontend not built. Run `npm run build` in frontend/, or use the Vite dev server."}, status_code=404)
    f = (DIST / path).resolve()
    if path and f.is_file() and DIST in f.parents:
        return FileResponse(f)
    return FileResponse(DIST / "index.html")
