import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

export default function VideoPlayer({ src, title, onFallback }) {
  const videoRef = useRef(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!src || !videoRef.current) return

    const video = videoRef.current
    let hls = null

    const loadVideo = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if it's an HLS stream
        if (src.includes('.m3u8') || src.includes('playlist.m3u8')) {
          if (Hls.isSupported()) {
            hls = new Hls({
              debug: false,
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            })
            
            hls.loadSource(src)
            hls.attachMedia(video)
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              video.play().catch(e => {
                console.error('Autoplay failed:', e)
                setError('Click to play video')
              })
            })

            hls.on(Hls.Events.ERROR, (event, data) => {
              console.error('HLS error:', data)
              if (data.fatal) {
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                  hls.startLoad()
                } else {
                  setError('Video loading failed. Try opening in new tab.')
                  onFallback && onFallback(src)
                }
              }
            })
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            video.src = src
            video.play().catch(e => {
              console.error('Autoplay failed:', e)
              setError('Click to play video')
            })
          } else {
            setError('HLS not supported in this browser')
            onFallback && onFallback(src)
          }
        } else {
          // Direct MP4 or other video format
          video.src = src
          video.play().catch(e => {
            console.error('Autoplay failed:', e)
            setError('Click to play video')
          })
        }
      } catch (err) {
        console.error('Video loading error:', err)
        setError('Failed to load video. Try opening in new tab.')
        onFallback && onFallback(src)
      } finally {
        setLoading(false)
      }
    }

    loadVideo()

    return () => {
      if (hls) {
        hls.destroy()
      }
    }
  }, [src, onFallback])

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => {
        console.error('Play failed:', e)
      })
    }
  }

  return (
    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 8, backgroundColor: '#000' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff',
          fontSize: 14
        }}>
          Loading video...
        </div>
      )}
      
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff',
          textAlign: 'center',
          fontSize: 14,
          padding: 20
        }}>
          <div>{error}</div>
          <button
            onClick={handlePlay}
            style={{
              marginTop: 10,
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      )}

      <video
        ref={videoRef}
        controls
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: 8,
          backgroundColor: '#000'
        }}
        title={title}
        playsInline
        webkit-playsinline="true"
        x-webkit-airplay="allow"
      />
    </div>
  )
}
