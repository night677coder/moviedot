import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { apiGet } from '../api.js'
import MovieCard from '../components/MovieCard.jsx'

export default function Category() {
  const { language } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = useMemo(() => {
    const p = Number(searchParams.get('page') || '1')
    return Number.isFinite(p) && p > 0 ? p : 1
  }, [searchParams])

  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    apiGet(`/${encodeURIComponent(language)}/${page}`)
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
  }, [language, page])

  const canNext = (data?.data?.length || 0) > 0

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, textTransform: 'capitalize' }}>{language}</div>
          <div className="subtle">Page {page}</div>
        </div>
        <div className="row">
          <button
            className="button secondary"
            onClick={() => setSearchParams({ page: String(Math.max(1, page - 1)) })}
            disabled={page <= 1}
          >
            Prev
          </button>
          <button
            className="button"
            onClick={() => setSearchParams({ page: String(page + 1) })}
            disabled={!canNext}
          >
            Next
          </button>
        </div>
      </div>

      {loading ? <div className="panel">Loading…</div> : null}
      {!loading && error ? <div className="panel">Error: {error}</div> : null}

      {!loading && data?.status === false ? <div className="panel">Unsupported category or no data available.</div> : null}

      {!loading && data?.data?.length ? (
        <div className="grid">
          {data.data.map((item) => (
            <MovieCard key={item.link} item={item} />
          ))}
        </div>
      ) : !loading && !error && data?.status !== false ? (
        <div className="panel">No movies found in this category.</div>
      ) : null}
    </div>
  )
}
