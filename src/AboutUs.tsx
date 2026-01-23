import { useEffect, useState } from 'react';
import './AboutUs.css';

interface AboutUsProps {
  onNavigate: (page: string) => void;
}

export default function AboutUs({ onNavigate }: AboutUsProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [isAdmin] = useState(false) // Set to true for admin users
  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    const animatedElements = document.querySelectorAll('.stat-box, .cta-card');
    animatedElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-us">
      <header className="header">
        <div className="header-content">
          <div className="logo-container">
            <div className="logo-icon">
              <span className="material-icons">eco</span>
            </div>
            <h1 className="logo" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
              Green Generation <span className="logo-highlight">TV</span>
            </h1>
          </div>
          
          <nav className="desktop-nav">
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('livetv'); }}>LiveTV</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('podcast'); }}>Podcast</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('articles'); }}>Articles</a>
            <a href="#" className="nav-link active" onClick={(e) => { e.preventDefault(); onNavigate('about'); }}>About Us</a>
          </nav>
          
          <div className="header-actions">
            <div className="user-profile-container">
              <button className="user-profile-btn" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <span className="material-icons">account_circle</span>
              </button>
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <button className="dropdown-item" onClick={() => setDarkMode(!darkMode)}>
                    <span className="material-icons">{darkMode ? 'light_mode' : 'dark_mode'}</span>
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
              <button className="admin-btn" onClick={() => onNavigate('admin')}>
                <span className="material-icons">admin_panel_settings</span>
                <span>Admin</span>
              </button>
            )}
            <button className="login-btn" onClick={() => onNavigate('login')}>
              <span>Login</span>
            </button>
            <button className="mobile-menu">
              <span className="material-icons">menu</span>
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="hero-banner">
          <div className="hero-slideshow">
            <div className="slideshow-image active">
              <img src="https://via.placeholder.com/1200x400/2ecc71/ffffff?text=Leadership+Excellence" alt="Leadership" />
            </div>
            <div className="slideshow-image">
              <img src="https://via.placeholder.com/1200x400/27ae60/ffffff?text=Sustainability+Vision" alt="Sustainability" />
            </div>
            <div className="slideshow-image">
              <img src="https://via.placeholder.com/1200x400/229954/ffffff?text=Future+Ready+Leadership" alt="Vision" />
            </div>
          </div>
        </section>

        <section className="bio-section">
          <div className="bio-hero">
            <div className="bio-hero-content">
              <div className="bio-image-column">
                <div className="bio-image-frame">
                  <img 
                    src="https://via.placeholder.com/400x500/2ecc71/ffffff?text=Dr.+R.+Seetharaman" 
                    alt="Dr. R. Seetharaman" 
                    className="bio-main-image"
                  />
                </div>
              </div>
              
              <div className="bio-intro-column">
                <h2 className="bio-main-heading">Dr. R. Seetharaman</h2>
                <div className="bio-intro-card">
                  <div className="quote-mark">"</div>
                  <p className="bio-intro-text">
                    A globally respected banker, author, and thought leader known for integrating sustainability, governance, and ethics into modern financial leadership.
                  </p>
                </div>

                <div className="bio-timeline">
                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h3 className="timeline-title">Leadership Excellence</h3>
                      <p className="timeline-text">
                        Served for over two decades as the Chief Executive Officer of Doha Bank, where he played a pivotal role in transforming the institution into one of the leading banks in the Middle East with a strong international presence. Under his leadership, Doha Bank expanded across regions, strengthened corporate governance frameworks, and maintained financial resilience through multiple global crises.
                      </p>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h3 className="timeline-title">Sustainability Advocate</h3>
                      <p className="timeline-text">
                        Dr. Seetharaman has consistently advocated that finance must serve society and that economic growth must be aligned with social equity and environmental responsibility. His views on sustainability extend beyond environmental concerns to include ethical leadership, inclusive development, emotional maturity, and institutional accountability.
                      </p>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h3 className="timeline-title">Educational Visionary</h3>
                      <p className="timeline-text">
                        Founder of the Seetharaman School of Sustainable Development, which focuses on education, leadership development, and real-world application of sustainability principles. Through this platform, he promotes the integration of sustainability into business education, governance systems, and public discourse.
                      </p>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h3 className="timeline-title">Green Generation TV</h3>
                      <p className="timeline-text">
                        Green Generation TV emerged from this vision, reflecting Dr. Seetharaman's belief that sustainability should not remain confined to policy documents, classrooms, or boardrooms—but must become part of everyday thinking and living.
                      </p>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h3 className="timeline-title">Thought Leadership</h3>
                      <p className="timeline-text">
                        A widely published author and speaker whose work bridges banking, sustainability, corporate consciousness, and value-based leadership. His contributions continue to influence professionals, institutions, and young leaders seeking to build resilient, ethical, and future-ready systems.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="greentv-section">
          <div className="greentv-hero">
            <div className="greentv-background-pattern"></div>
            <div className="container">
              <div className="greentv-header">
                <div className="greentv-badge">
                  <span className="material-icons">lightbulb</span>
                  <span>CORE IDEA</span>
                </div>
                <h2 className="greentv-title">Green Generation TV</h2>
                <div className="greentv-manifesto">
                  <div className="manifesto-quote-icon">
                    <span className="material-icons">format_quote</span>
                  </div>
                  <p className="manifesto-text">
                    A purpose-driven media platform created to translate sustainability from concept into everyday practice. 
                    It exists on a simple but powerful belief: <strong>sustainability must move beyond classrooms, conferences, 
                    and policy documents—and become part of how people think, choose, and live every day.</strong>
                  </p>
                </div>
              </div>

              <div className="greentv-themes">
                <h3 className="themes-heading">Our Focus Areas</h3>
                <div className="themes-grid">
                  <div className="theme-card">
                    <div className="theme-icon">
                      <span className="material-icons">favorite</span>
                    </div>
                    <h4>Conscious Living</h4>
                    <p>Cruelty-free practices and mindful choices</p>
                  </div>

                  <div className="theme-card">
                    <div className="theme-icon">
                      <span className="material-icons">psychology</span>
                    </div>
                    <h4>Emotional Intelligence</h4>
                    <p>Anger and crisis management skills</p>
                  </div>

                  <div className="theme-card">
                    <div className="theme-icon">
                      <span className="material-icons">gavel</span>
                    </div>
                    <h4>Ethical Governance</h4>
                    <p>Responsible leadership frameworks</p>
                  </div>

                  <div className="theme-card">
                    <div className="theme-icon">
                      <span className="material-icons">account_balance</span>
                    </div>
                    <h4>Financial Clarity</h4>
                    <p>Sustainable economic decision-making</p>
                  </div>

                  <div className="theme-card">
                    <div className="theme-icon">
                      <span className="material-icons">school</span>
                    </div>
                    <h4>Practical Application</h4>
                    <p>Reflection, discipline, and daily practice</p>
                  </div>

                  <div className="theme-card">
                    <div className="theme-icon">
                      <span className="material-icons">groups</span>
                    </div>
                    <h4>Thought Leadership</h4>
                    <p>Bridging ideas with lived experience</p>
                  </div>
                </div>
              </div>

              <div className="greentv-mission">
                <div className="mission-content">
                  <div className="mission-icon-large">
                    <span className="material-icons">emoji_objects</span>
                  </div>
                  <div className="mission-text">
                    <h3>Transforming Learning into Living</h3>
                    <p>
                      Green Generation TV transforms learning into living and ideas into action. It serves as a space for 
                      individuals, professionals, and institutions seeking clarity, balance, and purpose in a rapidly changing 
                      world—<span className="highlight">empowering a generation defined not by age, but by awareness.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <div className="cta-grid">
              <div className="cta-card">
                <h3>SEETHARAMAN SCHOOL OF SUSTAINABLE DEVELOPMENT</h3>
                <p>Education, leadership development, and real-world application of sustainability principles</p>
                <a href="https://seetharaman.com/about/" target="_blank" rel="noopener noreferrer" className="cta-button">LEARN MORE</a>
              </div>
              
              <div className="cta-card">
                <h3>PUBLISHED WORKS & THOUGHT LEADERSHIP</h3>
                <p>Bridging banking, sustainability, corporate consciousness, and value-based leadership</p>
                <a href="https://seetharaman.com/about/" target="_blank" rel="noopener noreferrer" className="cta-button">EXPLORE</a>
              </div>
              
              <div className="cta-card">
                <h3>CONNECT WITH US</h3>
                <p>Join the movement for conscious living and sustainable development</p>
                <a href="#contact" className="cta-button">GET IN TOUCH</a>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div className="container">
            <div className="section-header-center">
              <div className="section-badge">
                <span className="material-icons">contact_support</span>
                <span>GET IN TOUCH</span>
              </div>
              <h2 className="section-heading">Contact Information</h2>
              <p className="section-description">
                We'd love to hear from you. Reach out to us through any of these channels.
              </p>
            </div>
            
            <div className="contact-grid">
              <div className="contact-item" data-aos="fade-up" data-aos-delay="0">
                <div className="contact-icon">
                  <span className="material-icons">email</span>
                </div>
                <h3>Email</h3>
                <p className="contact-label">Drop us a line</p>
                <p className="contact-value">
                  <a href="mailto:greengenerationtvofficial@gmail.com">greengenerationtvofficial@gmail.com</a>
                </p>
                <button className="contact-action" onClick={() => window.location.href = 'mailto:greengenerationtvofficial@gmail.com'}>
                  <span className="material-icons">arrow_forward</span>
                </button>
              </div>
              
              <div className="contact-item" data-aos="fade-up" data-aos-delay="100">
                <div className="contact-icon">
                  <span className="material-icons">phone</span>
                </div>
                <h3>Phone</h3>
                <p className="contact-label">Give us a call</p>
                <p className="contact-value">
                  <a href="tel:+917550222600">+91 75502 22600</a>
                </p>
                <button className="contact-action" onClick={() => window.location.href = 'tel:+917550222600'}>
                  <span className="material-icons">arrow_forward</span>
                </button>
              </div>
              
              <div className="contact-item" data-aos="fade-up" data-aos-delay="200">
                <div className="contact-icon">
                  <span className="material-icons">location_on</span>
                </div>
                <h3>Location</h3>
                <p className="contact-label">Visit our office</p>
                <p className="contact-value">
                  145, Abbusali St, Logaiah Colony<br />
                  Saligramam, Chennai<br />
                  Tamil Nadu 600092
                </p>
                <button className="contact-action" onClick={() => window.open('https://maps.google.com/?q=145+Abbusali+St+Logaiah+Colony+Saligramam+Chennai+600092', '_blank')}>
                  <span className="material-icons">arrow_forward</span>
                </button>
              </div>
              
              <div className="contact-item" data-aos="fade-up" data-aos-delay="300">
                <div className="contact-icon">
                  <span className="material-icons">language</span>
                </div>
                <h3>Website</h3>
                <p className="contact-label">Explore online</p>
                <p className="contact-value">
                  <a href="https://greengen.tv" target="_blank" rel="noopener noreferrer">greengen.tv</a>
                </p>
                <button className="contact-action" onClick={() => window.open('https://greengen.tv', '_blank')}>
                  <span className="material-icons">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo-container">
                <div className="logo-icon">
                  <span className="material-icons">eco</span>
                </div>
                <h1 className="logo">
                  Green Generation <span className="logo-highlight">TV</span>
                </h1>
              </div>
              <p className="footer-description">
                Leading the way in sustainable engineering and environmental innovation for a greener future.
              </p>
            </div>
            
            <div className="footer-links">
              <h5 className="footer-heading">Explore</h5>
              <ul className="footer-list">
                <li><a onClick={() => onNavigate('home')}>Home</a></li>
                <li><a href="#">Videos</a></li>
                <li><a href="#">Productions</a></li>
                <li><a href="#case-stories">Case Stories</a></li>
              </ul>
            </div>
            
            <div className="footer-links">
              <h5 className="footer-heading">Company</h5>
              <ul className="footer-list">
                <li><a className="active">About Us</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
            
            <div className="footer-newsletter">
              <h5 className="footer-heading">Engineering Insights</h5>
              <p className="newsletter-description">
                Get the latest sustainability updates from our team.
              </p>
              <form className="newsletter-form">
                <input type="email" placeholder="Enter your email" className="newsletter-input" />
                <button type="submit" className="newsletter-button">Subscribe</button>
              </form>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>© 2026 Green Generation TV. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
