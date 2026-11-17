import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The FastAPI backend runs on :8000; proxy API + sample images so the app is same-origin.
export default defineConfig({
  plugins: [react()],
  // In dev, talk to the gateway (:8000), which forwards to both backends.
  server: { port: 5173, proxy: { '/api': 'http://127.0.0.1:8000', '/samples': 'http://127.0.0.1:8000', '/jaypee': 'http://127.0.0.1:8000' } },
})
