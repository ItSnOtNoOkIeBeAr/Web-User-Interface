import { useEffect, useState } from 'react'
import { sampleFile } from '../api/client'
import { useSharedImage } from '../context/ImageContext'

/**
 * The working image for a lab: the user's shared upload if present, otherwise a bundled sample.
 * Returns the File (for uploading) and an object URL (for display).
 */
export function useLabImage(defaultSample: string) {
  const { file: shared, setFile } = useSharedImage()
  const [sample, setSample] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setSample(null)
    sampleFile(defaultSample).then(f => alive && setSample(f)).catch(e => alive && setError(e.message))
    return () => { alive = false }
  }, [defaultSample])

  const file = shared ?? sample
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!file) { setUrl(null); return }
    const u = URL.createObjectURL(file)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [file])

  return { file, url, setFile, reset: () => setFile(null), error, isSample: !shared }
}
