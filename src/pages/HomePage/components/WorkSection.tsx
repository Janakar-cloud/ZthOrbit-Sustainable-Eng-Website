interface Props<T> {
  title: string
  subtitle: string
  items: T[]
  onItemClick: (item: T, poistion: number) => void
  showDescription?: boolean
}

export default function WorkSection<
  T extends { id: number; title: string; description: string; image?: string; thumbnail?: string }
>({
  title,
  subtitle,
  items,
  onItemClick,
  showDescription = true,
}: Props<T>) {
  return (
    <section className="work-section">
          <div className="work-header">
            <div className="work-header-left">
              <h2 className="work-title">{title}</h2>
              <p className="work-subtitle">
               {subtitle}
              </p>
            </div>
          </div>
          <div className="work-grid" style={{ cursor: 'pointer' }}>
            {items.map((item, i) => (
             <div key={i} className="work-card" onClick={() => onItemClick(item, i)} style={{ cursor: 'pointer' }}>
                <div className="work-image-wrapper">
                  {item.image || item.thumbnail
                    ? <img src={item.image || item.thumbnail} alt={item.title} />
                    : <div className="work-image-placeholder" />
                  }
                </div>
                <div className="work-card-content">
                  <h3 className='work-sub-title'>{item.title}</h3>
                  {showDescription && <p className='work-description'>{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
  )
}
