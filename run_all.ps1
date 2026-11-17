# Starts everything: Matthew's backend (:8001), Jaypee's backend (:8002) and the gateway (:8000).
# Usage (from project root):  .\run_all.ps1            then expose with:  cloudflared tunnel --url http://localhost:8000
$root = $PSScriptRoot
$py = Join-Path $root "backend\.venv\Scripts\python.exe"
$jaypee = if ($env:JAYPEE_BACKEND_DIR) { $env:JAYPEE_BACKEND_DIR } else { Join-Path $root "..\Comvision-web-ui\backend" }

if (-not (Test-Path (Join-Path $root "frontend\dist"))) {
  Write-Host "Building frontend..."; Push-Location (Join-Path $root "frontend"); npm run build; Pop-Location
}
& $py -m pip install -q -r (Join-Path $root "gateway\requirements.txt")

# Each backend runs in its own process because both use a Python package called `app`.
Start-Process $py -ArgumentList "-m uvicorn app.main:app --port 8001" -WorkingDirectory (Join-Path $root "backend")
Start-Process $py -ArgumentList "-m uvicorn app.main:app --port 8002" -WorkingDirectory (Resolve-Path $jaypee)
& $py -m uvicorn gateway.main:app --port 8000 --app-dir $root
