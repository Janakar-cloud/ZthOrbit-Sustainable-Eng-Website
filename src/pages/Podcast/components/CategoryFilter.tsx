import React from 'react'
import { CategoryFilterProps } from '../type/type'


const CategoryFilter = React.memo(function CategoryFilter({
  categories,
  selectedCategory,
  onSelect
}: CategoryFilterProps) {
  return (
    <section className="podcast-filter-section">
      <div className="podcast-container">
        <h2 className="filter-title">Browse by Category</h2>

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category.id}
              className={`filter-btn ${
                selectedCategory === category.id ? 'active' : ''
              }`}
              onClick={() => onSelect(category.id)}
              aria-pressed={selectedCategory === category.id}
            >
              <span className="material-icons">
                {category.icon}
              </span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
})

export default CategoryFilter
