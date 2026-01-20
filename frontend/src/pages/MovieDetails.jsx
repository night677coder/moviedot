import { useEffect, useMemo, useState, Fragment } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiGet, encodeQuery } from '../api.js'
import MovieCard from '../components/MovieCard.jsx'
import { useAutoShuffle } from '../hooks/useAutoShuffle.js'

export default function MovieDetails() {
  const [searchParams] = useSearchParams()
  const url = useMemo(() => searchParams.get('url') || '', [searchParams])

  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [allMovies, setAllMovies] = useState([])
  const [relatedLoading, setRelatedLoading] = useState(true)

  // Use auto-shuffle hook for related movies
  const shuffledRelatedMovies = useAutoShuffle(allMovies, 8000, 6)

  useEffect(() => {
    if (!url) {
      setLoading(false)
      setError('Missing url parameter.')
      return
    }

    let mounted = true
    setLoading(true)
    apiGet(`/get${encodeQuery({ url })}`)
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
  }, [url])

  // Fetch related movies
  useEffect(() => {
    let mounted = true
    setRelatedLoading(true)
    apiGet('/')
      .then((d) => {
        if (!mounted) return
        // Get all movies and filter out current movie
        const movies = d?.data?.filter(movie => movie.link !== url) || []
        setAllMovies(movies)
      })
      .catch((e) => {
        console.error('Failed to fetch related movies:', e)
      })
      .finally(() => {
        if (!mounted) return
        setRelatedLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [url])

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          {data?.title && (
            <>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{data.title}</div>
              <div className="subtle">Movie Details</div>
            </>
          )}
        </div>
        <Link className="pill" to="/">Home</Link>
      </div>

      {loading ? <div className="panel">Loading…</div> : null}
      {!loading && error ? <div className="panel">{error}</div> : null}

      {!loading && data?.status === false ? <div className="panel">Unable to load details.</div> : null}

      {!loading && data?.status ? (
        <div className="panel">
          <div className="detail">
            <div>
              <img className="poster" src={data.image} alt={data.title} />
              <div className="hr"></div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                {data.other_links?.length > 0 && (
                  <Link 
                    className="button" 
                    to={`/watch?url=${encodeURIComponent(url)}&title=${encodeURIComponent(data.title || '')}`}
                  >
                    Watch Now
                  </Link>
                )}
              
                
              </div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>{data.title}</div>
              <div className="subtle" style={{ marginTop: 6 }}>{data.description || 'No description found.'}</div>

              <div className="hr"></div>

              <div style={{ fontWeight: 800, marginBottom: 8 }}>Torrents</div>
              {data.torrent?.length ? (
                <div className="kv">
                  {data.torrent.map((t, idx) => (
                    <Fragment key={`${t.magnet || 'magnet'}-${idx}`}>
                      <div>
                        <span className="badge">{t.quality || 'N/A'}</span>
                      </div>
                      <div className="row" style={{ justifyContent: 'space-between' }}>
                        <span className="subtle">{t.size || ''}</span>
                        <a className="pill" href={t.magnet} target="_blank" rel="noreferrer">Magnet</a>
                      </div>
                    </Fragment>
                  ))}
                </div>
              ) : (
                <div className="subtle">No torrents listed.</div>
              )}

              <div className="hr"></div>

              <div style={{ fontWeight: 800, marginBottom: 8 }}>Other Links</div>
              {data.other_links?.length ? (
                <div className="kv">
                  {data.other_links.map((l, idx) => (
                    <Fragment key={`${l.url || 'url'}-${idx}`}>
                      <div><span className="badge">{l.type}</span></div>
                      <div><a className="pill" href={l.url} target="_blank" rel="noreferrer">Open</a></div>
                    </Fragment>
                  ))}
                </div>
              ) : (
                <div className="subtle">No other links listed.</div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* You May Also Like Section */}
      {!relatedLoading && shuffledRelatedMovies.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>You May Also Like</div>
              <div className="subtle">Recommended movies (auto-refreshing)</div>
            </div>
          </div>
          
          <div className="grid">
            {shuffledRelatedMovies.map((item, index) => (
              <MovieCard key={`shuffled-${item.link}-${index}`} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
