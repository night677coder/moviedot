import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallButton(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      // Show the install prompt
      deferredPrompt.prompt()
      
      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
      
      // Clear the deferred prompt
      setDeferredPrompt(null)
      setShowInstallButton(false)
    } catch (error) {
      console.error('Error during install:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallButton(false)
    // Store dismissal in localStorage
    localStorage.setItem('installPromptDismissed', Date.now())
  }

  // Don't show if already installed or dismissed recently
  useEffect(() => {
    const dismissedTime = localStorage.getItem('installPromptDismissed')
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) {
        setShowInstallButton(false)
      }
    }
  }, [])

  if (isInstalled || !showInstallButton) {
    return null
  }

  return (
    <div className="panel" style={{
      position: 'fixed',
      bottom: 20,
      left: 20,
      right: 20,
      maxWidth: 400,
      margin: '0 auto',
      zIndex: 1000,
      padding: 16,
      borderRadius: 12,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
            📱 Install MovieDot
          </div>
          <div className="subtle" style={{ fontSize: 14 }}>
            Get the best experience - install our app!
          </div>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 20,
            cursor: 'pointer',
            color: '#666',
            padding: 0,
            width: 24,
            height: 24
          }}
        >
          ×
        </button>
      </div>
      
      <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={handleDismiss}
          className="pill"
          style={{
            background: 'transparent',
            border: '1px solid #666',
            color: '#666'
          }}
        >
          Not now
        </button>
        <button
          onClick={handleInstallClick}
          className="pill"
          style={{
            background: '#007bff',
            border: 'none',
            color: '#fff'
          }}
        >
          Install App
        </button>
      </div>
    </div>
  )
}
