// Advanced video URL extraction for streaming services

export async function extractDirectVideoUrl(url) {
  try {
    // For Streamlare URLs, try to extract the actual video stream
    if (url.includes('vcdnlare.com') || 
        url.includes('streamlare') || 
        url.includes('vcdn.lare') ||
        url.includes('larecdn.com') ||
        url.includes('streamlare.com') ||
        url.includes('sl-cdn') ||
        url.includes('slare')) {
      return await extractStreamlareUrl(url)
    }
    
    // For other services, add more extractors as needed
    return url
  } catch (error) {
    console.error('Failed to extract direct URL:', error)
    return url
  }
}

async function extractStreamlareUrl(url) {
  try {
    // Method 1: Try direct access first (may fail due to CORS)
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'no-cors', // This will allow the request but we won't get the content
        headers: {
          'Referer': 'https://www.5movierulz.voyage/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      // If we get here, we might be able to access it
      console.log('Direct access attempted')
    } catch (directError) {
      console.log('Direct access failed, trying proxy:', directError.message)
    }
    
    // Method 2: Use a CORS proxy to fetch the page
    let html = ''
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      const response = await fetch(proxyUrl)
      const data = await response.json()
      html = data.contents || data.data || ''
      
      if (!html || html.includes('404') || html.includes('Cloudflare')) {
        throw new Error('Proxy returned error page')
      }
    } catch (proxyError) {
      console.log('Proxy failed:', proxyError.message)
      // Return the original URL to use iframe fallback
      return url
    }
    
    // Method 1: Look for video source tags (most reliable for Streamlare)
    const sourceMatch = html.match(/<source[^>]*src=["']([^"']+)["'][^>]*>/i)
    if (sourceMatch && sourceMatch[1]) {
      const videoUrl = sourceMatch[1]
      if (videoUrl.includes('.m3u8') || videoUrl.includes('vcdnx.com')) {
        return videoUrl
      }
    }
    
    // Method 2: Look for various video source patterns
    const patterns = [
      /source\s+src=["']([^"']+)["']/g,
      /file:\s*["']([^"']+)["']/g,
      /["']([^"']*\.m3u8[^"']*)["']/g,
      /["']([^"']*\.mp4[^"']*)["']/g,
      /["'](https?:\/\/[^"']*vcdn[^"']*)["']/g,
      /["'](https?:\/\/[^"']*vcdnx[^"']*)["']/g,
      /["'](https?:\/\/[^"']*streamlare[^"']*)["']/g
    ]
    
    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(html)) !== null) {
        const videoUrl = match[1]
        if (videoUrl && (videoUrl.includes('.m3u8') || videoUrl.includes('.mp4') || 
            videoUrl.includes('vcdn') || videoUrl.includes('vcdnx'))) {
          return videoUrl
        }
      }
    }
    
    // Method 3: Look for embed configurations and JSON data
    const configPatterns = [
      /(?:config|sources|file):\s*({[^}]+})/g,
      /var\s+(?:config|sources|player)\s*=\s*({[^}]+});/g,
      /window\.(?:config|sources|player)\s*=\s*({[^}]+});/g
    ]
    
    for (const pattern of configPatterns) {
      let match
      while ((match = pattern.exec(html)) !== null) {
        try {
          const config = JSON.parse(match[1])
          const videoUrl = config.file || config.src || config.url || 
                          (config.sources && config.sources[0] && (config.sources[0].file || config.sources[0].src))
          
          if (videoUrl && (videoUrl.includes('.m3u8') || videoUrl.includes('.mp4'))) {
            return videoUrl
          }
        } catch (e) {
          // Continue to next pattern
        }
      }
    }
    
    // If all extraction methods fail, return the original URL for iframe fallback
    console.log('All extraction methods failed, using iframe fallback')
    return url
    
  } catch (error) {
    console.error('Streamlare extraction failed:', error)
    return url // Return original URL for iframe fallback
  }
}

export function createVideoPlayer(src, title) {
  if (!src) return null
  
  // Check if it's a direct video URL
  const isDirectVideo = src.includes('.m3u8') || 
                       src.includes('.mp4') || 
                       src.includes('blob:') ||
                       src.includes('data:')
  
  if (isDirectVideo) {
    return {
      type: 'hls',
      src: src,
      canPlay: true
    }
  }
  
  return {
    type: 'iframe',
    src: src,
    canPlay: true
  }
}
