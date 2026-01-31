interface Props<T> {
  title: string
  subtitle: string
  items: T[]
  viewAll: () => void
  onItemClick: (item: T, poistion: number) => void
}

export default function WorkSection<
  T extends { id: number; title: string; description: string; image?: string; thumbnail?: string }
>({
  title,
  subtitle,
  items,
  viewAll,
  onItemClick
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
            <a href="#" className="work-view-all" onClick={(e) => { e.preventDefault(); viewAll() }}>
              View All
              <span className="material-icons">arrow_forward</span>
            </a>
          </div>
          <div className="work-grid" style={{ cursor: 'pointer' }}>
            {items.map((item, i) => (
             <div key={i} className="work-card" onClick={() => onItemClick(item, i)} style={{ cursor: 'pointer' }}>
                <div className="work-image-wrapper">
                  <img
                    src={item.image}
                    alt={item.title}
                  />
                </div>
                <div className="work-card-content">
                  <h3 className='work-sub-title'>{item.title}</h3>
                  <p className='work-description'>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
  )
}
