
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useCategories } from '../features/categories/useCategories'
import CategoryCard from '../components/categories/CategoryCard'
import ProductCard from '../components/products/ProductCard'
import { useProducts } from '../features/products/useProducts'
import { useCartStore } from '../features/cart/cartStore'
import { useAuthStore } from '../store/authStore'
import { useLogout } from '../features/auth/useAuth'

function HomePage() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | undefined>()
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)

  const cantidadCarrito = useCartStore(
    (state) => state.obtenerCantidad(),
  )

  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useLogout()

  const filtros = useMemo(
    () => ({
      nombre: busqueda.trim() || undefined,
      categoria_id: categoriaSeleccionada,
      disponible: true,
      pagina,
      limite: 8,
    }),
    [busqueda, categoriaSeleccionada, pagina],
  )

  const {
    data: categorias,
    isLoading: cargandoCategorias,
    isError: errorCategorias,
  } = useCategories()

  const {
    data: productos,
    isLoading: cargandoProductos,
    isError: errorProductos,
  } = useProducts(filtros)

  const cambiarCategoria = (id: number) => {
    setCategoriaSeleccionada((actual) => actual === id ? undefined : id)
    setPagina(1)
  }

  const cambiarBusqueda = (valor: string) => {
    setBusqueda(valor)
    setPagina(1)
  }

  const cerrarSesion = () => {
    logout.mutate()
  }

  return (
    <div className="app">
      <header className="navbar">
        <Link to="/" className="brand">
          <span className="brand-icon">🍴</span>
          <span>Food<span className="brand-highlight">Store</span></span>
        </Link>

        <nav className="nav-links">
          <a href="#inicio" className="nav-link active">Inicio</a>
          <a href="#categorias" className="nav-link">Categorías</a>
          <a href="#productos" className="nav-link">Productos</a>
        </nav>

        <div className="nav-actions">
          {isAuthenticated && user ? (
            <>
              <span className="nav-link">
                Hola, {user.full_name}
              </span>

              <Link to="/mis-pedidos" className="login-button">
                Mis pedidos
              </Link>

              {user.role === 'admin' && (
                <Link to="/admin" className="login-button">
                  Administración
                </Link>
              )}

              <button
                type="button"
                className="cart-button"
                onClick={cerrarSesion}
                disabled={logout.isPending}
              >
                {logout.isPending ? 'Cerrando...' : 'Cerrar sesión'}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-button">
                Ingresar
              </Link>

              <Link to="/registro" className="cart-button">
                Registrarse
              </Link>
            </>
          )}

          <Link to="/carrito" className="cart-button">
            🛒 Carrito ({cantidadCarrito})
          </Link>
        </div>
      </header>

      <main>
        <section className="hero-section" id="inicio">
          <div className="hero-content">
            <span className="hero-tag">🍽️ SABORES QUE ENAMORAN</span>

            <h1>
              Tu comida favorita,
              <br />
              <span>a un clic de distancia.</span>
            </h1>

            <p>
              Descubrí nuestro menú, elegí tus productos favoritos
              y disfrutá de una experiencia deliciosa.
            </p>

            <div className="hero-actions">
              <a href="#productos" className="primary-button">
                Ver menú <span>→</span>
              </a>

              <span className="delivery-info">
                🚀 Productos disponibles para pedir
              </span>
            </div>

            <div className="hero-stats">
              <div>
                <strong>100%</strong>
                <span>Calidad</span>
              </div>
              <div>
                <strong>Fácil</strong>
                <span>De pedir</span>
              </div>
              <div>
                <strong>Rico</strong>
                <span>Siempre</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-food-circle">
              <span className="hero-food-emoji">🍔</span>
            </div>

            <div className="floating-card floating-card-top">
              <span>⭐</span>
              <div>
                <strong>Elegí tu favorito</strong>
                <small>Descubrí nuestro menú</small>
              </div>
            </div>

            <div className="floating-card floating-card-bottom">
              <span>🍕</span>
              <div>
                <strong>Mucho para disfrutar</strong>
                <small>Hamburguesas, pizzas y bebidas</small>
              </div>
            </div>
          </div>
        </section>

        <section className="categories-section" id="categorias">
          <div className="section-heading">
            <span className="section-eyebrow">NUESTRO MENÚ</span>
            <h2>Explorá por categorías</h2>
            <p>Encontrá exactamente lo que tenés ganas de comer.</p>
          </div>

          {cargandoCategorias && <p>Cargando categorías...</p>}

          {errorCategorias && (
            <p>No se pudieron cargar las categorías. Intentá nuevamente.</p>
          )}

          {!cargandoCategorias && !errorCategorias && (
            <div className="categories-grid">
              {categorias?.map((categoria) => (
                <CategoryCard
                  key={categoria.id}
                  categoria={categoria}
                  selected={categoriaSeleccionada === categoria.id}
                  onClick={cambiarCategoria}
                />
              ))}
            </div>
          )}
        </section>

        <section className="products-section" id="productos">
          <div className="products-heading">
            <div className="section-heading">
              <span className="section-eyebrow">PREPARADOS PARA VOS</span>
              <h2>Nuestros productos</h2>
              <p>Elegí tus favoritos y descubrí todo nuestro menú.</p>
            </div>
          </div>

          <div style={{ marginTop: '25px' }}>
            <input
              type="search"
              value={busqueda}
              onChange={(event) => cambiarBusqueda(event.target.value)}
              placeholder="Buscar hamburguesas, pizzas, bebidas..."
              aria-label="Buscar productos"
              style={{
                width: '100%',
                maxWidth: '450px',
                padding: '14px 16px',
                border: '1px solid #eeeeee',
                borderRadius: '10px',
                outlineColor: '#f97316',
              }}
            />
          </div>

          {categoriaSeleccionada !== undefined && (
            <button
              type="button"
              className="view-all"
              onClick={() => {
                setCategoriaSeleccionada(undefined)
                setPagina(1)
              }}
              style={{
                marginTop: '15px',
                border: 0,
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              Quitar filtro de categoría ✕
            </button>
          )}

          {cargandoProductos && <p>Cargando productos...</p>}

          {errorProductos && (
            <p>No se pudieron cargar los productos. Intentá nuevamente.</p>
          )}

          {!cargandoProductos && !errorProductos && (
            <>
              {productos?.items.length === 0 ? (
                <p style={{ marginTop: '30px' }}>
                  No encontramos productos con esos criterios.
                </p>
              ) : (
                <div className="products-grid">
                  {productos?.items.map((producto) => (
                    <ProductCard
                      key={producto.id}
                      producto={producto}
                    />
                  ))}
                </div>
              )}

              {productos && productos.total > 8 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '20px',
                  marginTop: '35px',
                }}>
                  <button
                    type="button"
                    disabled={pagina === 1}
                    onClick={() => setPagina((actual) => actual - 1)}
                  >
                    Anterior
                  </button>

                  <span>Página {pagina}</span>

                  <button
                    type="button"
                    disabled={pagina * 8 >= productos.total}
                    onClick={() => setPagina((actual) => actual + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="footer">
        <div className="brand footer-brand">
          <span className="brand-icon">🍴</span>
          <span>Food<span className="brand-highlight">Store</span></span>
        </div>

        <p>Tu comida favorita, siempre cerca.</p>
        <span className="footer-copy">© 2026 Food Store</span>
      </footer>
    </div>
  )
}

export default HomePage
