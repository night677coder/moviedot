import { useEffect, useState } from 'react'
import { apiGet } from '../api.js'
import MovieCard from '../components/MovieCard.jsx'

export default function Home() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    apiGet('/')
      .then((d) => {
        if (!mounted) return
        setData(d)
        setError('')
      })
      .catch((e) => {
        if (!mounted) return
        setError(e.message || String(e))
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Trending / Latest</div>
        </div>
        {data?.total_found !== undefined ? <span className="badge">{data.total_found} items</span> : null}
      </div>

      {loading ? <div className="panel">Loading…</div> : null}
      
      {!loading && error ? (
        <div className="panel">
          <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 12 }}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="button"
            style={{ marginTop: 8 }}
          >
            Retry
          </button>
        </div>
      ) : null}

      {!loading && !error && (!data?.data || data.data.length === 0) ? (
        <div className="panel">
          <p style={{ color: 'rgba(255,255,255,0.65)', textAlign: 'center', padding: '20px 0' }}>
            No movies found. Please try again later.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="button"
            style={{ display: 'block', margin: '0 auto' }}
          >
            Refresh
          </button>
        </div>
      ) : null}

      {!loading && data?.data?.length ? (
        <div className="grid">
          {data.data.map((item, index) => (
            <MovieCard key={`${item.link}-${index}`} item={item} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
