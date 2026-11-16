import { useCallback, useEffect, useRef, useState } from 'react'

/** Webcam access + frame grabbing (downscaled JPEG blobs, so uploads stay small). */
export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setActive(false)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
      streamRef.current = stream
      setActive(true)
      // The <video> may mount after `active` flips, so attach in an effect below as well.
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}) }
    } catch (e) {
      setError(
        (e as DOMException).name === 'NotAllowedError' ? 'Camera permission was denied.'
          : 'No camera available (or it is in use by another app).')
    }
  }, [])

  useEffect(() => {
    if (active && videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  })
  useEffect(() => stop, [stop])

  const canvas = useRef<HTMLCanvasElement | null>(null)
  /** Grab the current frame as a JPEG blob, scaled so its width is at most maxW. */
  const grabFrame = useCallback((maxW = 480): Promise<Blob | null> => {
    const v = videoRef.current
    if (!v || !v.videoWidth) return Promise.resolve(null)
    const s = Math.min(1, maxW / v.videoWidth)
    const c = (canvas.current ??= document.createElement('canvas'))
    c.width = Math.round(v.videoWidth * s); c.height = Math.round(v.videoHeight * s)
    c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height)
    return new Promise(res => c.toBlob(b => res(b), 'image/jpeg', 0.8))
  }, [])

  return { videoRef, active, error, start, stop, grabFrame }
}

/**
 * Throttled frame loop: grab -> process -> (wait out the rest of the frame budget) -> repeat.
 * Never queues requests: a new frame is only sent after the previous reply, so slow servers
 * just lower the FPS instead of building a backlog. Reports achieved FPS.
 */
export function useFrameLoop(
  active: boolean,
  grab: () => Promise<Blob | null>,
  process: (frame: Blob) => Promise<void>,
  maxFps = 6,
) {
  const [fps, setFps] = useState(0)
  const procRef = useRef(process); procRef.current = process
  const grabRef = useRef(grab); grabRef.current = grab

  useEffect(() => {
    if (!active) { setFps(0); return }
    let alive = true
    const times: number[] = []
    ;(async () => {
      while (alive) {
        const t0 = performance.now()
        const frame = await grabRef.current()
        if (frame) {
          try { await procRef.current(frame) } catch { await new Promise(r => setTimeout(r, 800)) }
          times.push(performance.now()); if (times.length > 8) times.shift()
          if (times.length > 1) setFps(Math.round(((times.length - 1) * 1000) / (times[times.length - 1] - times[0]) * 10) / 10)
        }
        const wait = 1000 / maxFps - (performance.now() - t0)
        await new Promise(r => setTimeout(r, Math.max(30, wait)))
      }
    })()
    return () => { alive = false }
  }, [active, maxFps])

  return fps
}
