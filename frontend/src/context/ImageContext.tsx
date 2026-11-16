import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

// The image the user dropped on the home page (or any lab). Shared so it "opens in any lab".
interface Ctx { file: File | null; setFile: (f: File | null) => void }
const ImageCtx = createContext<Ctx>({ file: null, setFile: () => {} })

export function ImageProvider({ children }: { children: ReactNode }) {
  const [file, setFile] = useState<File | null>(null)
  const value = useMemo(() => ({ file, setFile }), [file])
  return <ImageCtx.Provider value={value}>{children}</ImageCtx.Provider>
}

export const useSharedImage = () => useContext(ImageCtx)
