
import { useState } from 'react'
import type { Producto } from '../../features/products/types'
import { useCartStore } from '../../features/cart/cartStore'

interface ProductCardProps {
  producto: Producto
}

function ProductCard({ producto }: ProductCardProps) {
  const [mensaje, setMensaje] = useState('')

  const agregarProducto = useCartStore(
    (state) => state.agregarProducto,
  )

  const cantidad = useCartStore(
    (state) =>
      state.items.find((item) => item.producto.id === producto.id)
        ?.cantidad ?? 0,
  )

  const precio = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(producto.precio_base)

  const agregar = () => {
    if (!producto.disponible || producto.stock <= 0) return

    if (cantidad >= producto.stock) {
      setMensaje('Stock máximo alcanzado')
      return
    }

    agregarProducto(producto)
    setMensaje('¡Agregado al carrito!')

    window.setTimeout(() => setMensaje(''), 2000)
  }

  return (
    <article className="product-card">
      <div className="product-image">
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre} />
        ) : (
          <span className="product-emoji">
            {producto.categoria.nombre === 'Hamburguesas'
              ? '🍔'
              : producto.categoria.nombre === 'Pizzas'
                ? '🍕'
                : '🥤'}
          </span>
        )}

        {!producto.disponible && (
          <span className="product-badge">No disponible</span>
        )}
      </div>

      <div className="product-info">
        <span className="product-category">
          {producto.categoria.nombre}
        </span>

        <h3>{producto.nombre}</h3>

        <p>
          {producto.descripcion || 'Un producto delicioso para disfrutar.'}
        </p>

        <div className="product-footer">
          <div>
            <strong>{precio}</strong>

            {cantidad > 0 && (
              <p style={{
                margin: '6px 0 0',
                color: '#16a34a',
                fontSize: '12px',
                fontWeight: 700,
              }}>
                En carrito: {cantidad}
              </p>
            )}
          </div>

          <button
            type="button"
            className="add-button"
            disabled={!producto.disponible || producto.stock <= 0}
            onClick={agregar}
            aria-label={`Agregar ${producto.nombre} al carrito`}
            title="Agregar al carrito"
          >
            +
          </button>
        </div>

        {mensaje && (
          <p
            role="status"
            style={{
              color: '#16a34a',
              fontSize: '12px',
              fontWeight: 700,
              marginTop: '10px',
            }}
          >
            ✓ {mensaje}
          </p>
        )}
      </div>
    </article>
  )
}

export default ProductCard
