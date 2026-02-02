// components/GreenTV/ThemeGrid.tsx
import React from 'react'
import { themes } from '../../data/data'

const ThemeGrid: React.FC = () => {
  return (

    <div className="greentv-themes">
      <h3 className="themes-heading">Our Focus Areas</h3>
      <div className="themes-grid">
        {themes.map((theme, i) => (
          <div key={i} className="theme-card">
            <div className="theme-icon">
              <span className="material-icons">{theme.icon}</span>
            </div>
            <h4>{theme.title}</h4>
            <p>{theme.desc}</p>
          </div>
        ))}
      </div>
    </div>

  )
}

export default ThemeGrid
