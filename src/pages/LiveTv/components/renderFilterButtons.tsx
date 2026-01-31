import { videoCategories } from '../data/data'
import { VideoCategoryFiltersProps } from '../type/type'


export default function VideoCategoryFilters({
  selectedCategory,
  onCategoryChange,
}: VideoCategoryFiltersProps) {
  return (
    <div className="livetv-filters">
      {videoCategories.map(({ key, label, icon }) => (
        <button
          key={key}
          className={`filter-btn ${selectedCategory === key ? 'active' : ''}`}
          onClick={() => onCategoryChange(key)}
        >
          <span className="material-icons">{icon}</span>
          {label}
        </button>
      ))}
    </div>
  )
}
