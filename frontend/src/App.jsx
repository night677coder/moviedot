import { NavLink, Route, Routes } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Home from './pages/Home.jsx'
import Category from './pages/Category.jsx'
import Search from './pages/Search.jsx'
import MovieDetails from './pages/MovieDetails.jsx'
import Watch from './pages/Watch.jsx'
import SEO from './components/SEO.jsx'
import InstallPrompt from './components/InstallPrompt.jsx'

const categories = [
  { key: 'telugu', label: 'Telugu' },
  { key: 'hindi', label: 'Hindi' },
  { key: 'tamil', label: 'Tamil' },
  { key: 'malayalam', label: 'Malayalam' },
  { key: 'english', label: 'English' }
]

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope)
        })
        .catch((error) => {
          console.log('ServiceWorker registration failed: ', error)
        })
    }
  }, [])

  // Disable right-click context menu
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault()
      return false
    }

    document.addEventListener('contextmenu', handleContextMenu)
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div>
      {/* SEO Component */}
      <Routes>
        <Route path="/" element={
          <SEO 
            title="Watch Latest Movies Online"
            description="Stream the latest Telugu, Hindi, Tamil, Malayalam, and English movies online for free. MovieDot offers unlimited entertainment with high-quality streaming."
            keywords="movies online, watch movies, free streaming, Telugu movies, Hindi movies, Tamil movies, Malayalam movies, English movies"
            canonicalUrl="https://night677coder.github.io/moviedot/"
          />
        } />
        <Route path="/search" element={
          <SEO 
            title="Search Movies"
            description="Search for your favorite movies across Telugu, Hindi, Tamil, Malayalam, and English languages. Find and watch movies instantly."
            keywords="search movies, find movies, movie search, online movie finder"
            canonicalUrl="https://night677coder.github.io/moviedot/search"
          />
        } />
        <Route path="/c/:language" element={
          <SEO 
            title="Browse Movies by Language"
            description="Browse movies by language - Telugu, Hindi, Tamil, Malayalam, and English. Discover new films and watch them online."
            keywords="browse movies, movies by language, category movies"
            canonicalUrl="https://night677coder.github.io/moviedot"
          />
        } />
        <Route path="/movie" element={
          <SEO 
            title="Movie Details"
            description="Get detailed information about movies including cast, plot, ratings, and streaming options."
            keywords="movie details, movie information, cast, plot, ratings"
            canonicalUrl="https://night677coder.github.io/moviedot/movie"
          />
        } />
        <Route path="/watch" element={
          <SEO 
            title="Watch Movie Online"
            description="Watch movies online in high quality. Stream your favorite films without any interruptions."
            keywords="watch online, stream movies, online streaming, HD movies"
            canonicalUrl="https://night677coder.github.io/moviedot/watch"
          />
        } />
      </Routes>

      <div className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand">
            <span className="brand-badge" />
            <span>MovieDot</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="nav desktop-nav">
            <NavLink to="/" className={({ isActive }) => `pill ${isActive ? 'active' : ''}`}>Home</NavLink>
            <NavLink to="/search" className={({ isActive }) => `pill ${isActive ? 'active' : ''}`}>Search</NavLink>
            {categories.map((c) => (
              <NavLink
                key={c.key}
                to={`/c/${c.key}?page=1`}
                className={({ isActive }) => `pill ${isActive ? 'active' : ''}`}
              >
                {c.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`mobile-dropdown ${isMobileMenuOpen ? 'open' : ''}`} ref={dropdownRef}>
          <div className="mobile-nav">
            <NavLink 
              to="/" 
              className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink 
              to="/search" 
              className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Search
            </NavLink>
            {categories.map((c) => (
              <NavLink
                key={c.key}
                to={`/c/${c.key}?page=1`}
                className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {c.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/c/:language" element={<Category />} />
        <Route path="/movie" element={<MovieDetails />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="*" element={<Home />} />
      </Routes>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>MovieDot</h4>
              <p>Your gateway to unlimited entertainment</p>
            </div>
            <div className="footer-section">
              <h4>Categories</h4>
              <div className="footer-links">
                {categories.map((c) => (
                  <NavLink key={c.key} to={`/c/${c.key}?page=1`} className="footer-link">
                    {c.label}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <div className="footer-links">
                <NavLink to="/" className="footer-link">Home</NavLink>
                <NavLink to="/search" className="footer-link">Search</NavLink>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 MovieDot. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  )
}
