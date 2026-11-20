
import type { Categoria } from '../../features/categories/types'

interface CategoryCardProps {
  categoria: Categoria
  selected: boolean
  onClick: (id: number) => void
}

function CategoryCard({
  categoria,
  selected,
  onClick,
}: CategoryCardProps) {
  const iconos: Record<string, string> = {
    Hamburguesas: '🍔',
    Pizzas: '🍕',
    Bebidas: '🥤',
  }

  return (
    <button
      type="button"
      className={`category-card ${selected ? 'active' : ''}`}
      onClick={() => onClick(categoria.id)}
      aria-pressed={selected}
    >
      <span className="category-emoji">
        {iconos[categoria.nombre] || '🍽️'}
      </span>

      <span>{categoria.nombre}</span>
    </button>
  )
}

export default CategoryCard
