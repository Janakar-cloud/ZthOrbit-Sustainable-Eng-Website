import '../../style/Footer.css'
import LogoImage from "../../../assets/images/GREENTVLOGOHEADER.png"
import { useAppContext } from '../../context/AppContext'
interface FooterProps {
  onNavigate: (page: string) => void
}

export default function Footer({ onNavigate }: FooterProps) {

  const { setActivePage } = useAppContext()
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo-container">
              <img
                src={LogoImage}
                alt="Green TV Logo"
                className="footer-logo-image"
              />
              <h1 className="footer-logo">
                The Green <span className="footer-logo-highlight">TV</span>
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
              <li><a onClick={() => { setActivePage('home'); onNavigate('home') }}>Home</a></li>
              <li><a onClick={() => { setActivePage('videos'); onNavigate('videos') }}>Videos</a></li>
              <li><a onClick={() => { setActivePage('articles'); onNavigate('articles') }}>Articles</a></li>
              <li><a onClick={() => { setActivePage('podcast'); onNavigate('podcast') }}>Podcast</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-links">
            <h5 className="footer-heading">Company</h5>
            <ul className="footer-list">
              <li><a onClick={() => { setActivePage('about'); onNavigate('about') }}>About Us</a></li>
              <li><a onClick={() => {
                setActivePage('about');
                onNavigate('about')
                setTimeout(() => {
                  document.getElementById('contact')?.scrollIntoView({
                    behavior: 'smooth',
                  });
                }, 100); // delay ensures page loads
              }}>Contact</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-newsletter">
            <h5 className="footer-heading">Engineering Insights</h5>
            <p className="newsletter-description">
              Get the latest sustainability updates from our team.
            </p>
            {/* <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-button">
                Subscribe
              </button>
            </form> */}
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>© 2026 The Green TV. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
