
import { Link } from 'react-router-dom'
import { useCartStore } from '../features/cart/cartStore'

function CartPage() {
  const items = useCartStore((state) => state.items)
  const modificarCantidad = useCartStore((state) => state.modificarCantidad)
  const quitarProducto = useCartStore((state) => state.quitarProducto)
  const vaciarCarrito = useCartStore((state) => state.vaciarCarrito)
  const obtenerTotal = useCartStore((state) => state.obtenerTotal)

  const formatoPrecio = (precio: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(precio)

  const total = obtenerTotal()

  return (
    <div className="app">
      <header className="navbar">
        <Link to="/" className="brand">
          <span className="brand-icon">🍴</span>
          <span>
            Food<span className="brand-highlight">Store</span>
          </span>
        </Link>

        <nav className="nav-links">
          <Link to="/" className="nav-link">
            Inicio
          </Link>
          <Link to="/#productos" className="nav-link">
            Productos
          </Link>
        </nav>

        <Link to="/" className="cart-button">
          Seguir comprando
        </Link>
      </header>

      <main
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '55px 6%',
        }}
      >
        <div className="section-heading">
          <span className="section-eyebrow">TU PEDIDO</span>
          <h2>Mi carrito 🛒</h2>
          <p>Revisá tus productos antes de continuar.</p>
        </div>

        {items.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '75px 20px',
              background: '#fff8f2',
              borderRadius: '18px',
              marginTop: '35px',
            }}
          >
            <div style={{ fontSize: '65px' }}>🛒</div>
            <h2>Tu carrito está vacío</h2>
            <p style={{ color: '#777', marginBottom: '25px' }}>
              Todavía no agregaste ningún producto.
            </p>
            <Link to="/" className="primary-button">
              Explorar productos →
            </Link>
          </div>
        ) : (
          <div style={{ marginTop: '35px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px',
                marginBottom: '25px',
              }}
            >
              <strong>
                {items.length} productos diferentes
              </strong>

              <button
                type="button"
                onClick={vaciarCarrito}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Vaciar carrito
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {items.map((item) => (
                <article
                  key={item.producto.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '20px',
                    background: '#fff',
                    border: '1px solid #eee',
                    borderRadius: '15px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      width: '95px',
                      height: '95px',
                      display: 'grid',
                      placeItems: 'center',
                      background: '#fff1e7',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {item.producto.imagen_url ? (
                      <img
                        src={item.producto.imagen_url}
                        alt={item.producto.nombre}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '48px' }}>
                        {item.producto.categoria.nombre === 'Hamburguesas'
                          ? '🍔'
                          : item.producto.categoria.nombre === 'Pizzas'
                            ? '🍕'
                            : '🥤'}
                      </span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <span className="section-eyebrow">
                      {item.producto.categoria.nombre}
                    </span>
                    <h3 style={{ margin: '6px 0' }}>
                      {item.producto.nombre}
                    </h3>
                    <span style={{ color: '#777', fontSize: '13px' }}>
                      {formatoPrecio(item.producto.precio_base)} por unidad
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        modificarCantidad(
                          item.producto.id,
                          item.cantidad - 1,
                        )
                      }
                      disabled={item.cantidad <= 1}
                      aria-label="Disminuir cantidad"
                    >
                      −
                    </button>

                    <strong>{item.cantidad}</strong>

                    <button
                      type="button"
                      onClick={() =>
                        modificarCantidad(
                          item.producto.id,
                          item.cantidad + 1,
                        )
                      }
                      disabled={item.cantidad >= item.producto.stock}
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>

                  <div style={{ minWidth: '110px', textAlign: 'right' }}>
                    <strong style={{ color: '#ea580c' }}>
                      {formatoPrecio(
                        item.producto.precio_base * item.cantidad,
                      )}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => quitarProducto(item.producto.id)}
                    aria-label={`Eliminar ${item.producto.nombre}`}
                    title="Eliminar producto"
                    style={{
                      border: 0,
                      background: '#fff1f1',
                      color: '#dc2626',
                      borderRadius: '9px',
                      padding: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    🗑️
                  </button>
                </article>
              ))}
            </div>

            <div
              style={{
                maxWidth: '420px',
                marginLeft: 'auto',
                marginTop: '30px',
                padding: '25px',
                background: '#fff8f2',
                borderRadius: '15px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '18px',
                }}
              >
                <strong>Total del pedido</strong>
                <strong style={{ color: '#ea580c', fontSize: '22px' }}>
                  {formatoPrecio(total)}
                </strong>
              </div>

              <Link
                to="/checkout"
                className="primary-button"
                style={{
                  display: 'block',
                  width: '100%',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Continuar con el pedido
              </Link>

              <p
                style={{
                  textAlign: 'center',
                  color: '#888',
                  fontSize: '12px',
                  marginTop: '12px',
                }}
              >
                Revisá tus datos de entrega y confirmá la compra.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="brand footer-brand">
          <span className="brand-icon">🍴</span>
          <span>
            Food<span className="brand-highlight">Store</span>
          </span>
        </div>
        <p>Tu comida favorita, siempre cerca.</p>
        <span className="footer-copy">© 2026 Food Store</span>
      </footer>
    </div>
  )
}

export default CartPage
