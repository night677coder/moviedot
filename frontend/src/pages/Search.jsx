import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiGet, encodeQuery } from '../api.js'
import MovieCard from '../components/MovieCard.jsx'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = useMemo(() => (searchParams.get('q') || '').trim(), [searchParams])

  const [input, setInput] = useState(q)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setInput(q)
  }, [q])

  useEffect(() => {
    if (!q) {
      setData(null)
      setError('')
      setLoading(false)
      return
    }

    let mounted = true
    setLoading(true)
    
    // First try the search API
    apiGet(`/search${encodeQuery({ query: q })}`)
      .then((d) => {
        if (!mounted) return
        
        // If search returns no results, fetch all categories and search across them
        if (d.status && d.data && d.data.length === 0) {
          const categories = ['telugu', 'hindi', 'tamil', 'malayalam', 'english']
          const promises = [apiGet('/'), ...categories.map(cat => apiGet(`/${cat}/1`))]
          
          return Promise.all(promises).then((results) => {
            if (!mounted) return
            
            let allMovies = []
            results.forEach(result => {
              if (result.status && result.data) {
                allMovies = allMovies.concat(result.data)
              }
            })
            
            // Remove duplicates based on link
            const uniqueMovies = allMovies.filter((movie, index, self) =>
              index === self.findIndex((m) => m.link === movie.link)
            )
            
            const filteredResults = uniqueMovies.filter(item => 
              item.title.toLowerCase().includes(q.toLowerCase())
            )
            
            setData({
              status: true,
              total_found: filteredResults.length,
              data: filteredResults
            })
            setError('')
          })
        }
        
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
  }, [q])

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Search</div>
        </div>
      </div>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          const next = input.trim()
          if (!next) {
            setSearchParams({})
            return
          }
          setSearchParams({ q: next })
        }}
        style={{ marginBottom: 14 }}
      >
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search movies…"
        />
        <button className="button" type="submit">Search</button>
      </form>

      {loading ? <div className="panel">Searching…</div> : null}
      {!loading && error ? <div className="panel">{error}</div> : null}

      {!loading && data?.status === false ? <div className="panel">No results.</div> : null}

      {!loading && data?.data?.length ? (
        <div>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="badge">{data.total_found} results</span>
          </div>
          <div className="grid">
            {data.data.map((item, index) => (
              <MovieCard key={`${item.link}-${index}`} item={item} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
