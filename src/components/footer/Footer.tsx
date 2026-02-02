import '../../style/Footer.css'

interface FooterProps {
  onNavigate: (page: string) => void
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo-container">
              <img
                src="/assets/images/GREENTVLOGO.png"
                alt="Green TV Logo"
                className="footer-logo-image"
              />
              <h1 className="footer-logo">
                Green Generation <span className="footer-logo-highlight">TV</span>
              </h1>
            </div>
            <p className="footer-description">
              Leading the way in sustainable engineering and environmental
              innovation for a greener future.
            </p>
          </div>

          {/* Explore */}
          <div className="footer-links">
            <h5 className="footer-heading">Explore</h5>
            <ul className="footer-list">
              <li><a onClick={() => onNavigate('home')}>Home</a></li>
              <li><a onClick={() => onNavigate('livetv')}>Videos</a></li>
              <li><a onClick={() => onNavigate('articles')}>Case Stories</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-links">
            <h5 className="footer-heading">Company</h5>
            <ul className="footer-list">
              <li><a onClick={() => onNavigate('about')}>About Us</a></li>
              <li><a onClick={() => onNavigate('articles')}>Blog</a></li>
              <li><a onClick={() => onNavigate('about')}>Contact</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-newsletter">
            <h5 className="footer-heading">Engineering Insights</h5>
            <p className="newsletter-description">
              Get the latest sustainability updates from our team.
            </p>
            <form className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-button">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>© 2026 Green Generation TV. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
