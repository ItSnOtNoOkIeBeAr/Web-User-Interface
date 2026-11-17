// Backend address. Empty = same origin (dev proxy, or served by the gateway).
// Set VITE_API_BASE (e.g. https://api.dhekode.com) when the frontend is hosted somewhere else.
export const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')

/** Prefix a backend path such as /api/lab1/info or /samples/cat.jpg with the configured base. */
export const apiUrl = (path: string) => API_BASE + path
