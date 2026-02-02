// components/GreenTV/CTACard.tsx
import React from 'react'
import { CTACardProps } from '../../type/type'

const CTACard: React.FC<CTACardProps> = ({
  title,
  desc,
  link,
  label,
  external = true,
}) => {
  return (
    <div className="cta-card">
      <h3>{title}</h3>
      <p>{desc}</p>

      <a
        href={link}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className="cta-button"
      >
        {label}
      </a>
    </div>
  )
}

export default CTACard
