import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { apiGet, encodeQuery } from '../api.js'
import MovieCard from '../components/MovieCard.jsx'
import VideoPlayer from '../components/VideoPlayer.jsx'
import { extractDirectVideoUrl, createVideoPlayer } from '../utils/videoExtractor.js'
import { useAutoShuffle } from '../hooks/useAutoShuffle.js'

export default function Watch() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const url = useMemo(() => searchParams.get('url') || '', [searchParams])
  const title = useMemo(() => searchParams.get('title') || 'Movie', [searchParams])

  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedSource, setSelectedSource] = useState(null)
  const [extractedUrl, setExtractedUrl] = useState(null)
  const [useIframe, setUseIframe] = useState(false)
  const [allRecommendations, setAllRecommendations] = useState([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(true)

  // Use auto-shuffle hook for recommendations
  const shuffledRecommendations = useAutoShuffle(allRecommendations, 10000, 6)

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
        
        // Auto-select first available source
        if (d?.other_links?.length) {
          const unwantedTypes = ['Uperbox', 'Streamtape', 'Download', 'Droplare', 'Filelions']
          const filteredLinks = d.other_links.filter(link => 
            !unwantedTypes.some(unwanted => 
              link.type.toLowerCase().includes(unwanted.toLowerCase())
            )
          )
          
          if (filteredLinks.length > 0) {
            setSelectedSource(filteredLinks[0])
            // Trigger extraction for the first filtered source
            handleSourceChange(filteredLinks[0])
          }
        }
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

  // Fetch recommendations (trending movies)
  useEffect(() => {
    let mounted = true
    setRecommendationsLoading(true)
    apiGet('/')
      .then((d) => {
        if (!mounted) return
        // Filter out current movie and store all recommendations
        const movies = d?.data?.filter(movie => movie.link !== url) || []
        setAllRecommendations(movies)
      })
      .catch((e) => {
        if (!mounted) return
        console.error('Failed to load recommendations:', e)
      })
      .finally(() => {
        if (!mounted) return
        setRecommendationsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [url])

  // Filter out unwanted streaming services
  const filteredLinks = useMemo(() => {
    if (!data?.other_links) return []
    
    const unwantedTypes = ['Uperbox', 'Streamtape', 'Download', 'Droplare', 'Filelions']
    return data.other_links.filter(link => 
      !unwantedTypes.some(unwanted => 
        link.type.toLowerCase().includes(unwanted.toLowerCase())
      )
    )
  }, [data?.other_links])

  const handleSourceChange = async (source) => {
    setSelectedSource(source)
    setExtractedUrl(null)
    setUseIframe(false)
    
    // Try to extract direct video URL
    try {
      const extracted = await extractDirectVideoUrl(source.url)
      const playerConfig = createVideoPlayer(extracted, title)
      
      if (playerConfig.type === 'hls') {
        setExtractedUrl(playerConfig.src)
      } else {
        // Fall back to iframe for non-direct URLs
        setUseIframe(true)
      }
    } catch (error) {
      console.error('Failed to extract video URL:', error)
      setUseIframe(true)
    }
  }

  const handleVideoFallback = () => {
    setUseIframe(true)
  }

  if (loading) {
    return (
      <div className="container">
        <div className="panel">Loading…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Watch</div>
            <div className="subtle">{title}</div>
          </div>
          <Link className="pill" to="/movie">Back to Details</Link>
        </div>
        <div className="panel">{error}</div>
      </div>
    )
  }

  if (!data?.status) {
    return (
      <div className="container">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Watch</div>
            <div className="subtle">{title}</div>
          </div>
          <Link className="pill" to="/movie">Back to Details</Link>
        </div>
        <div className="panel">Unable to load movie details.</div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Watch</div>
          <div className="subtle">{data.title || title}</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Link className="pill" to={`/movie?url=${encodeURIComponent(url)}`}>Details</Link>
          <Link className="pill" to="/">Home</Link>
        </div>
      </div>

      <div className="panel">
        {/* Video Player Section */}
        <div style={{ marginBottom: 20 }}>
          {selectedSource ? (
            <>
              {extractedUrl && !useIframe ? (
                <VideoPlayer 
                  src={extractedUrl} 
                  title={data.title || title}
                  onFallback={handleVideoFallback}
                />
              ) : (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 8, backgroundColor: '#000' }}>
                  <iframe
                    src={selectedSource.url}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      borderRadius: 8
                    }}
                    allowFullScreen
                    title={data.title || title}
                  />
                </div>
              )}
              
              {/* Fallback button for iframe */}
              {useIframe && (
                <div style={{ marginTop: 10, textAlign: 'center' }}>
                  <a 
                    href={selectedSource.url} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: 4,
                      fontSize: 14
                    }}
                  >
                    Open in New Tab
                  </a>
                </div>
              )}
            </>
          ) : (
            <div style={{ 
              aspectRatio: '16/9', 
              backgroundColor: '#000', 
              borderRadius: 8, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#666'
            }}>
              No video source available
            </div>
          )}
        </div>

        {/* Source Selection */}
        {filteredLinks.length > 1 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Video Sources</div>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              {filteredLinks.map((link, idx) => (
                <button
                  key={`${link.url || 'url'}-${idx}`}
                  className={`pill ${selectedSource?.url === link.url ? 'active' : ''}`}
                  onClick={() => handleSourceChange(link)}
                  style={{ cursor: 'pointer' }}
                >
                  {link.type} {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Movie Info */}
        <div className="hr"></div>
        
        <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.2, marginBottom: 8 }}>
          {data.title}
        </div>
        
        {data.description && (
          <div className="subtle" style={{ marginBottom: 16 }}>
            {data.description}
          </div>
        )}

        
      </div>

      {/* You May Also Like Section */}
      {shuffledRecommendations.length > 0 && (
        <div className="panel" style={{ marginTop: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>You May Also Like</div>
          <div className="subtle" style={{ marginBottom: 14 }}>Auto-refreshing recommendations</div>
          
          {recommendationsLoading ? (
            <div>Loading recommendations…</div>
          ) : (
            <div className="grid">
              {shuffledRecommendations.map((item) => (
                <MovieCard key={`watch-shuffled-${item.link}`} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
