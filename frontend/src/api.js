const defaultBase = 'http://127.0.0.1:8000'
// Production API URL - use /api prefix for Vercel serverless deployment
// The vercel.json routes /api/* to the Python backend
const productionBase = '/api'

export function getApiBase() {
  // Check if we're in production (Vercel deployment)
  const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost'
  const envBase = import.meta.env.VITE_API_BASE
  
  if (envBase && typeof envBase === 'string' && envBase.trim().length > 0) {
    return envBase.trim()
  }
  
  // In production, use /api prefix so Vercel routes can handle them
  return isProduction ? productionBase : defaultBase
}

export async function apiGet(path) {
  const base = getApiBase()
  try {
    const res = await fetch(`${base}${path}`)
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.warn('API request failed:', res.status, text)
      // Return empty data instead of throwing to prevent white screen
      return { status: true, data: [], total_found: 0 }
    }
    const contentType = res.headers.get('content-type') || ''
    
    // Try to parse JSON, but handle failures gracefully
    try {
      if (contentType.includes('application/json')) {
        return await res.json()
      }
      // If not JSON, try to parse anyway (some servers don't set content-type correctly)
      const text = await res.text()
      // Check if it looks like HTML (error page)
      if (text.trim().startsWith('<') || text.includes('<!DOCTYPE') || text.includes('<html')) {
        console.warn('API returned HTML instead of JSON:', text.substring(0, 200))
        return { status: true, data: [], total_found: 0 }
      }
      return JSON.parse(text)
    } catch (parseError) {
      console.warn('Failed to parse API response:', parseError.message)
      return { status: true, data: [], total_found: 0 }
    }
  } catch (error) {
    // In production, if API fails, return empty data to prevent white screen
    if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
      console.warn('API call failed, returning empty data:', error.message)
      return { status: true, data: [], total_found: 0 }
    }
    throw error
  }
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
