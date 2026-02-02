import { useState } from 'react'
import '../../style/header.css'
import {useAppContext} from '../../context/AppContext'

export default function Header({ onNavigate }: { onNavigate: (page: string) => void }) {
  const {
    activePage,
    setActivePage,
    darkMode,
    toggleDarkMode,
    showProfileMenu,
    toggleProfileMenu,
    isAdmin,
  } = useAppContext()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavigate = (page: string) => {
    setActivePage(page);
    onNavigate(page);
    // setMobileMenuOpen(!mobileMenuOpen);
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
            <a href="#" onClick={(e) =>  {e.preventDefault();handleNavigate('livetv')}} className={isActive('livetv')}>LiveTV</a>
            <a href="#" onClick={(e) =>  {e.preventDefault();handleNavigate('podcast')}} className={isActive('podcast')}>Podcast</a>
            <a href="#" onClick={(e) =>  {e.preventDefault();handleNavigate('articles')}} className={isActive('articles')}>Articles</a>
            <a href="#"  onClick={(e) => {e.preventDefault(); handleNavigate('about')}} className={isActive('about')}>About Us</a>
          </nav>

          {/* Right Actions */}
          <div className="header-actions">
            <div className="user-profile-container">
              <button
                className="user-profile-btn"
                onClick={toggleProfileMenu}
              >
                <span className="material-icons">account_circle</span>
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  <button className="dropdown-item" onClick={toggleDarkMode}>
                    <span className="material-icons">
                      {darkMode ? 'light_mode' : 'dark_mode'}
                    </span>
                    <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>

                  <button className="dropdown-item">
                    <span className="material-icons">settings</span>
                    <span>Settings</span>
                  </button>

                  <button className="dropdown-item">
                    <span className="material-icons">lock_reset</span>
                    <span>Forgot Password</span>
                  </button>

                  <button className="dropdown-item logout">
                    <span className="material-icons">logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {isAdmin && (
              <button className="admin-btn" onClick={() => handleNavigate('admin')}>
                <span className="material-icons">admin_panel_settings</span>
                <span>Admin</span>
              </button>
            )}

            <button className="login-btn" onClick={() => handleNavigate('login')}>
              Login
            </button>


            {/* MOBILE MENU BUTTON */}
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

      {/* MOBILE NAV */}
      {mobileMenuOpen && (
        <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <a onClick={() => handleNavigate('livetv')} className="nav-link">LiveTV</a>
          <a onClick={() => handleNavigate('podcast')}className="nav-link">Podcast</a>
          <a onClick={() => handleNavigate('articles')} className="nav-link">Articles</a>
          <a onClick={() => handleNavigate('about')} className="nav-link">About Us</a>
        </div>
      )}

      {/* BACKDROP */}
      {mobileMenuOpen && (
        <div className="mobile-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}
    </>
  )
}

