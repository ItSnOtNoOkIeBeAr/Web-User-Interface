// Tiny fetch helpers shared by every lab's API client.

import { apiUrl } from './base'

type Field = string | number | boolean | Blob | undefined | null

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`
    try { const j = await res.json(); if (j.detail) msg = typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail) } catch { /* not JSON */ }
    throw new Error(msg)
  }
  return res.json()
}

/** POST multipart form data (files + scalar params) and return parsed JSON. */
export async function postForm<T>(path: string, fields: Record<string, Field>, signal?: AbortSignal): Promise<T> {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null) continue
    if (v instanceof Blob) fd.append(k, v, (v as File).name || `${k}.jpg`)
    else fd.append(k, String(v))
  }
  try {
    return await parse<T>(await fetch(apiUrl(`/api${path}`), { method: 'POST', body: fd, signal }))
  } catch (e) {
    if (e instanceof TypeError) throw new Error('Cannot reach the backend. Start it with: uvicorn app.main:app --reload')
    throw e
  }
}

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  try {
    return await parse<T>(await fetch(apiUrl(`/api${path}`), { signal }))
  } catch (e) {
    if (e instanceof TypeError) throw new Error('Cannot reach the backend. Start it with: uvicorn app.main:app --reload')
    throw e
  }
}

/** Load a bundled sample from /samples as a File so it can be uploaded like any user image. */
export async function sampleFile(name: string): Promise<File> {
  const res = await fetch(apiUrl(`/samples/${name}`))
  if (!res.ok) throw new Error(`Sample ${name} not found. Run backend/make_samples.py`)
  const blob = await res.blob()
  return new File([blob], name, { type: blob.type })
}

/** Validate a user-chosen image (type + size) before uploading. Returns an error string or null. */
export function validateImage(f: File): string | null {
  if (!f.type.startsWith('image/')) return 'That file is not an image.'
  if (f.size > 12 * 1024 * 1024) return 'Image is larger than 12 MB.'
  return null
}

/** Decode a data URL into ImageData (used for hover lookups and animated masks). */
export function loadImageData(src: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth; c.height = img.naturalHeight
      const ctx = c.getContext('2d', { willReadFrequently: true })!
      ctx.drawImage(img, 0, 0)
      resolve(ctx.getImageData(0, 0, c.width, c.height))
    }
    img.onerror = reject
    img.src = src
  })
}
