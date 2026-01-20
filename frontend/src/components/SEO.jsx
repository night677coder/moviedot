import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SEO = ({ title, description, keywords, imageUrl, canonicalUrl }) => {
  const location = useLocation()

  useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} | MovieDot`
    }

    // Update or create meta tags
    const updateMetaTag = (name, content, property = null) => {
      let tag = property 
        ? document.querySelector(`meta[property="${property}"]`)
        : document.querySelector(`meta[name="${name}"]`)
      
      if (!tag) {
        tag = document.createElement('meta')
        if (property) {
          tag.setAttribute('property', property)
        } else {
          tag.setAttribute('name', name)
        }
        document.head.appendChild(tag)
      }
      
      tag.setAttribute('content', content)
    }

    // Update meta description
    if (description) {
      updateMetaTag('description', description)
      updateMetaTag('og:description', description, 'og:description')
      updateMetaTag('twitter:description', description, 'twitter:description')
    }

    // Update keywords
    if (keywords) {
      updateMetaTag('keywords', keywords)
    }

    // Update title meta tags
    if (title) {
      updateMetaTag('title', title)
      updateMetaTag('og:title', title, 'og:title')
      updateMetaTag('twitter:title', title, 'twitter:title')
    }

    // Update image
    if (imageUrl) {
      updateMetaTag('og:image', imageUrl, 'og:image')
      updateMetaTag('twitter:image', imageUrl, 'twitter:image')
    }

    // Update canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]')
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.setAttribute('rel', 'canonical')
        document.head.appendChild(canonical)
      }
      canonical.setAttribute('href', canonicalUrl)
    }

    // Update URL meta tags
    const currentUrl = `https://night677coder.github.io/moviedot${location.pathname}`
    updateMetaTag('og:url', currentUrl, 'og:url')
    updateMetaTag('twitter:url', currentUrl, 'twitter:url')

  }, [title, description, keywords, imageUrl, canonicalUrl, location.pathname])

  // Update structured data
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": title || "MovieDot",
      "description": description || "Stream the latest movies online",
      "url": `https://night677coder.github.io/moviedot${location.pathname}`
    }

    // Remove existing structured data script
    const existingScript = document.querySelector('script[type="application/ld+json"]')
    if (existingScript) {
      existingScript.remove()
    }

    // Add new structured data
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(structuredData)
    document.head.appendChild(script)

  }, [title, description, location.pathname])

  return null
}

export default SEO
