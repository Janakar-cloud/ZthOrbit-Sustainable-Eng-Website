import { useEffect, useState } from 'react';
import './AboutUs.css';
import Header from './components/header/Header';
import { useAppContext } from './context/AppContext';
import Footer from './components/footer/Footer';

interface AboutUsProps {
  onNavigate: (page: string) => void;
}

export default function AboutUs({ onNavigate }: AboutUsProps) {

  const { darkMode, showProfileMenu, isAdmin } = useAppContext()

  const [currentSlide, setCurrentSlide] = useState(0)
  const images = [
    {url:'/assets/images/seetharaman/Seetharaman1.jpg',name:'Dr. Seetharaman - Leadership Excellence'},
    {url:'/assets/images/seetharaman/Seetharaman2.jpg',name:'Dr. Seetharaman - Leadership Excellence'},
    {url:'/assets/images/seetharaman/Seetharaman3.jpg',name:'Dr. Seetharaman - Leadership Excellence'}
  ]


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % images.length)
    }, 4000) // 4 seconds

    return () => clearInterval(interval)
  }, [])

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
    <div className={`about-us ${darkMode ? 'dark' : ''}`}>

      <Header onNavigate={onNavigate} />

      <main className="main-content">
        <section className="hero-banner">
          <div className="hero-slideshow">
            {images.map((img, index) => (
              <div
                key={img.url}
                className={`slideshow-image ${index === currentSlide ? 'active' : ''}`}
              >
                <img src={img.url} alt={img.name} />
              </div>
            ))}
          </div>
        </section>


        <section className="bio-section">
          <div className="bio-hero">
            <div className="bio-hero-content">
              <div className="bio-image-column">
                <div className="bio-image-frame">
                  <img
                    src="/assets/images/seetharaman/Seetharaman4.jpg"
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

      {/* <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo-container">
                <img src="/assets/images/GREENTVLOGO.png" alt="Green TV Logo" className="logo-image" />
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
      </footer> */}
      <Footer onNavigate={onNavigate}/>
      
    </div>
  );
}
