import { useEffect, useState } from 'react';
import '../../style/AboutUs.css';
import Header from '../../components/header/Header';
import { useAppContext } from '../../context/AppContext';
import Footer from '../../components/footer/Footer';
import { images } from './data/data'
import { AboutUsProps } from './type/type';
import BioSection from './components/BioSection';
import GreenTVSection from './components/GreenTV/GreenTVSection';
import ContactSection from './components/ContactSection';


export default function AboutUs({ onNavigate }: AboutUsProps) {

  const { darkMode } = useAppContext()

  const [currentSlide, setCurrentSlide] = useState(0)


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
                <img src={img.url} alt={img.name} loading="lazy"
                  onLoad={(e) => {
                    e.currentTarget.classList.add("loaded");
                    e.currentTarget.previousElementSibling?.classList.add("hide-loader");
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="bio-section">
          <div className="bio-hero">
            <BioSection></BioSection>
          </div>
        </section>

        <section className="greentv-section">
          <div className={`${darkMode ? "greentv-hero-dark" : "greentv-hero"}`}>
            <GreenTVSection />
          </div>
        </section>

        <ContactSection />
      </main>

      <Footer onNavigate={onNavigate} />

    </div>
  );
}
