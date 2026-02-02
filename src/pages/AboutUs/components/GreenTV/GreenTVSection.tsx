import React from 'react'
import ThemeGrid from './ThemeGrid'
import CTAGrid from './CTAGrid'

const GreenTVSection: React.FC = () => {
  return (
    <>
      <section className="bio-section">
        <div className="bio-hero">
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

          <ThemeGrid />

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
      </section>

      <CTAGrid />
    </>
  )
}

export default GreenTVSection
