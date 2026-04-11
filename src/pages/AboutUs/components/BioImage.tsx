export default function BioImage() {
  return (
    <div className="bio-image-column">
      <div className="bio-image-frame">
        <img
          src="/assets/images/seetharaman/Seetharaman4.jpg"
          alt="Dr. R. Seetharaman"
          className="bio-main-image"
          loading="lazy"
          onLoad={(e) => {
            e.currentTarget.classList.add("loaded");
            e.currentTarget.previousElementSibling?.classList.add("hide-loader");
          }}
        />
      </div>
    </div>
  )
}
