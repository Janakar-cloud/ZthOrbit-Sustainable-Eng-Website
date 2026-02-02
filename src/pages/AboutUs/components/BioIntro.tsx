import BioTimeline from './BioTimeline'

export default function BioIntro() {
  return (
    <div className="bio-intro-column">
      <h2 className="bio-main-heading">Dr. R. Seetharaman</h2>

      <div className="bio-intro-card">
        <div className="quote-mark">"</div>
        <p className="bio-intro-text">
          A globally respected banker, author, and thought leader known for integrating
          sustainability, governance, and ethics into modern financial leadership.
        </p>
      </div>

      <BioTimeline />
    </div>
  )
}
