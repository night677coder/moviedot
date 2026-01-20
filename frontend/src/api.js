const defaultBase = 'http://127.0.0.1:8000'

export function getApiBase() {
  const envBase = import.meta.env.VITE_API_BASE
  return envBase && typeof envBase === 'string' && envBase.trim().length > 0 ? envBase.trim() : defaultBase
}

export async function apiGet(path) {
  const base = getApiBase()
  const res = await fetch(`${base}${path}`)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed (${res.status}): ${text || res.statusText}`)
  }
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return res.json()
  return res.text()
}

export function encodeQuery(obj) {
  const params = new URLSearchParams()
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    params.set(k, String(v))
  })
  const s = params.toString()
  return s ? `?${s}` : ''
}
