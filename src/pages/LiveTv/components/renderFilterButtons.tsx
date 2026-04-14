import { VideoCategoryFiltersProps } from '../type/type'


export default function VideoCategoryFilters({
  selectedCategory,
  categories,
  onCategoryChange,
}: VideoCategoryFiltersProps) {
  return (
    <div className="livetv-filters">
      {categories.map(({ key, label }) => (
        <button
          key={key}
          className={`filter-btn ${selectedCategory === key ? 'active' : ''}`}
          onClick={() => onCategoryChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
