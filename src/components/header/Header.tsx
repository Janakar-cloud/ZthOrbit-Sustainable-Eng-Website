import { useState, useEffect, useRef } from 'react'
import '../../style/Header.css'
import { useAppContext } from '../../context/AppContext'
import { logout as apiLogout } from '../../utils/api'
import { FaFacebook, FaTwitter, FaLinkedin, FaYoutube, FaInstagram, FaInfoCircle, FaSun, FaMoon } from 'react-icons/fa'; // install react-icons if not added


export default function Header({ onNavigate }: { onNavigate: (page: string) => void }) {
  const {
    activePage,
    setActivePage,
    darkMode,
    toggleDarkMode,
    showProfileMenu,
    isAdmin,
    isLoggedIn,
    user,
    logout,
  } = useAppContext()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)

  const moreRef = useRef<HTMLDivElement>(null)

  // Close 3-dot menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNavigate = (page: string) => {
    setActivePage(page)
    onNavigate(page)
    setMoreMenuOpen(false)
    setMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    const refreshTk = localStorage.getItem('refreshToken')
    if (refreshTk) {
      try { await apiLogout(refreshTk) } catch { }
    }
    logout()
    handleNavigate('home')
  }

  const isActive = (page: string) =>
    activePage === page ? 'nav-link active' : 'nav-link'

  return (
    <>
      <header className="header">
        <div className="header-content">

          {/* Logo */}
          <div className="logo-container" onClick={() => handleNavigate('home')}>
            <img
              src="/assets/images/GREENTVLOGO.png"
              alt="Green TV Logo"
              className="header-logo-image"
            />
            <h1 className="Header-logo">
              Green Generation <span className="logo-highlight">TV</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('livetv') }} className={isActive('livetv')}>LiveTV</a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('podcast') }} className={isActive('podcast')}>Podcast</a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('articles') }} className={isActive('articles')}>Articles</a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('about') }} className={isActive('about')}>About Us</a>

          </nav>

          {/* Right Actions */}
          <div className="header-actions">

            {/* THREE DOT MENU */}
            <div
              className={`more-menu-container ${darkMode ? 'dark' : ''}`}
              ref={moreRef}
            >              <button
              className="more-menu-btn"
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            >
                <span className="material-icons">more_vert</span>
              </button>

              {moreMenuOpen && (
                <div className="more-dropdown">

                  {/* Learn More */}
                  <button onClick={() => {
                    setMoreMenuOpen(false); //  close menu
                    window.open('https://seetharaman.com/', '_blank');
                  }}>
                    <FaInfoCircle /> Learn More
                  </button>

                  {isAdmin && (
                    <button onClick={() => handleNavigate('admin')}>
                      Admin
                    </button>
                  )}

                  {/* Facebook Button */}
                  <button
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => {
                      setMoreMenuOpen(false); // 
                      window.open('https://seetharaman.com/', '_blank');
                    }}>
                    <FaFacebook /> Facebook
                  </button>

                  {/* Twitter / X */}
                  <button
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => {
                      setMoreMenuOpen(false); // 
                      window.open('https://x.com/DrSeetharaman_', '_blank');
                    }}>
                    <FaTwitter /> Twitter
                  </button>



                  {/* LinkedIn */}
                  <button
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => {
                      setMoreMenuOpen(false); // 
                      window.open('https://www.linkedin.com/in/dr-r-seetharaman/', '_blank');
                    }}>
                    <FaLinkedin /> LinkedIn
                  </button>



                  {/* Youtube */}
                  <button
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => {
                      setMoreMenuOpen(false); // 
                      window.open('https://www.youtube.com/@DrSeetharaman', '_blank');
                    }}>
                    <FaYoutube /> YouTube
                  </button>


                  {/* Instagram */}
                  <button
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => {
                      setMoreMenuOpen(false); // 
                      window.open('https://www.instagram.com/dr.seetharaman/', '_blank');
                    }}>
                    <FaInstagram /> Instagram
                  </button>


                  <button onClick={toggleDarkMode} className="theme-btn">
                    {darkMode ? (
                      <>
                        <FaSun /> Light Mode
                      </>
                    ) : (
                      <>
                        <FaMoon /> Dark Mode
                      </>
                    )}
                  </button>

                  {isLoggedIn && (
                    <button onClick={handleLogout}>
                      Logout
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="user-profile-container">
              {/* <button
                className="user-profile-btn"
                onClick={toggleProfileMenu}
              >
                <span className="material-icons">account_circle</span>
              </button> */}

              {showProfileMenu && (
                <div className="profile-dropdown">
                  {isLoggedIn && user && (
                    <div className="dropdown-item" style={{ opacity: 0.7 }}>
                      <span className="material-icons">person</span>
                      <span>{user.email}</span>
                    </div>
                  )}


                  {isLoggedIn && (
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <span className="material-icons">logout</span>
                      <span>Logout</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {!isLoggedIn ? (
              <>
                <button className="login-btn" onClick={() => handleNavigate('login')}>
                  Login
                </button>
                <button className="login-btn" onClick={() => handleNavigate('signup')}>
                  Sign Up
                </button>
              </>
            ) : null}

            {/* Mobile Menu Button */}
            <button
              className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-icons">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>

          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="mobile-nav">
          <a onClick={() => handleNavigate('livetv')}>LiveTV</a>
          <a onClick={() => handleNavigate('podcast')}>Podcast</a>
          <a onClick={() => handleNavigate('articles')}>Articles</a>
          <a onClick={() => handleNavigate('about')}>About Us</a>
        </div>
      )}

      {/* Backdrop */}
      {mobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}