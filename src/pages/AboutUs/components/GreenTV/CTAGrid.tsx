// components/GreenTV/CTAGrid.tsx
import React from 'react'
import CTACard from './CTACard'

const CTAGrid: React.FC = () => {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-grid">
          <CTACard
            title="SEETHARAMAN SCHOOL OF SUSTAINABLE DEVELOPMENT"
            desc="Education, leadership development, and real-world application of sustainability principles"
            link="https://seetharaman.com/about/"
            label="LEARN MORE"
          />

          <CTACard
            title="PUBLISHED WORKS & THOUGHT LEADERSHIP"
            desc="Bridging banking, sustainability, and value-based leadership"
            link="https://seetharaman.com/about/"
            label="EXPLORE"
          />

          <CTACard
            title="CONNECT WITH US"
            desc="Join the movement for conscious living and sustainable development"
            link="#contact"
            label="GET IN TOUCH"
            external={false}
          />
        </div>
      </div>
    </section>
  )
}

export default CTAGrid
