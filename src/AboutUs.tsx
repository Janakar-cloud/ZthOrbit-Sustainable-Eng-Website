import './AboutUs.css'

function AboutUs() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <h1>About Green Generation TV</h1>
          <p className="subtitle">
            Leading the conversation on sustainable engineering and environmental innovation
          </p>
        </div>
      </section>

      <section className="about-content">
        <div className="container">
          <div className="about-section">
            <h2>Our Mission</h2>
            <p>
              Green Generation TV is dedicated to promoting sustainable engineering practices
              and environmental awareness through engaging media content. We provide a platform
              for experts, innovators, and enthusiasts to share knowledge and inspire action
              towards a more sustainable future.
            </p>
          </div>

          <div className="about-section">
            <h2>What We Do</h2>
            <p>
              We create and curate high-quality content across multiple formats including
              articles, podcasts, video case stories, and live broadcasts. Our content covers
              topics ranging from renewable energy and green building to sustainable transportation
              and circular economy principles.
            </p>
          </div>

          <div className="about-section">
            <h2>Our Team</h2>
            <p>
              Our team consists of environmental engineers, sustainability consultants,
              media professionals, and passionate advocates for a greener planet. Together,
              we work to make complex engineering concepts accessible and actionable for
              everyone.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutUs
