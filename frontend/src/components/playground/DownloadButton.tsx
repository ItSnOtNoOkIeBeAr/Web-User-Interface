interface Props { src?: string | null; getCanvas?: () => HTMLCanvasElement | null; filename: string; label?: string }

/** Downloads a PNG from a data/object URL, or from a canvas (converted to PNG). */
export default function DownloadButton({ src, getCanvas, filename, label = '⬇ PNG' }: Props) {
  const go = async () => {
    let href = src ?? ''
    if (getCanvas) href = getCanvas()?.toDataURL('image/png') ?? ''
    if (!href) return
    // Backend may return JPEG for live frames; re-encode through a canvas so the file is truly PNG.
    if (!getCanvas && !href.startsWith('data:image/png')) {
      const img = new Image(); img.src = href; await img.decode()
      const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight
      c.getContext('2d')!.drawImage(img, 0, 0); href = c.toDataURL('image/png')
    }
    const a = document.createElement('a'); a.href = href; a.download = filename.endsWith('.png') ? filename : `${filename}.png`; a.click()
  }
  return <button className="btn-ghost !px-3 !py-1 text-xs" disabled={!src && !getCanvas} onClick={go}>{label}</button>
}
