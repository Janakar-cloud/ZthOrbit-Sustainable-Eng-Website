import BioImage from './BioImage'
import BioIntro from './BioIntro'

export default function BioHero() {
  return (
    <div className="bio-hero">
      <div className="bio-hero-content">
        <BioImage />
        <BioIntro />
      </div>
    </div>
  )
}
