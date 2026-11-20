
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import {
  useAdminCategories,
  useAdminProducts,
  useAdminUsers,
  useCreateCategory,
  useCreateProduct,
  useDeleteCategory,
  useDeleteProduct,
  useUpdateCategory,
  useUpdateProduct,
  useUpdateProductStock,
  useChangeUserStatus,
} from '../features/admin/useAdminManagement'

import type {
  CategoriaAdmin,
  CategoriaDatos,
  ProductoAdmin,
  ProductoDatos,
} from '../features/admin/adminService'

import {
  useAdminOrders,
  useAdminSummary,
  useChangeOrderStatus,
} from '../features/orders/useOrders'

import type { EstadoPedido, PedidoRead } from '../features/orders/types'

type Seccion = 'pedidos' | 'productos' | 'categorias' | 'usuarios'

const LIMITE = 10

const precio = (valor: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor)

const fecha = (valor: string) =>
  new Date(valor).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })

const estados: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

function AdminPage() {
  const [seccion, setSeccion] = useState<Seccion>('pedidos')
  const [pagina, setPagina] = useState(1)
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [mensajeError, setMensajeError] = useState('')

  const [categoriaEditando, setCategoriaEditando] =
    useState<CategoriaAdmin | null>(null)
  const [productoEditando, setProductoEditando] =
    useState<ProductoAdmin | null>(null)

  const [nombreCategoria, setNombreCategoria] = useState('')
  const [descripcionCategoria, setDescripcionCategoria] = useState('')

  const [nombreProducto, setNombreProducto] = useState('')
  const [descripcionProducto, setDescripcionProducto] = useState('')
  const [categoriaProducto, setCategoriaProducto] = useState('')
  const [precioProducto, setPrecioProducto] = useState('')
  const [imagenProducto, setImagenProducto] = useState('')
  const [stockProducto, setStockProducto] = useState('')

  const [stockEditando, setStockEditando] = useState<number | null>(null)
  const [nuevoStock, setNuevoStock] = useState('')

  const resumen = useAdminSummary()
  const estado = estadoFiltro
    ? (estadoFiltro as EstadoPedido)
    : undefined
  const pedidos = useAdminOrders(pagina, LIMITE, estado)
  const cambiarEstadoPedido = useChangeOrderStatus()

  const categorias = useAdminCategories()
  const productos = useAdminProducts()
  const usuarios = useAdminUsers()

  const crearCategoria = useCreateCategory()
  const actualizarCategoria = useUpdateCategory()
  const eliminarCategoria = useDeleteCategory()

  const crearProducto = useCreateProduct()
  const actualizarProducto = useUpdateProduct()
  const actualizarStock = useUpdateProductStock()
  const eliminarProducto = useDeleteProduct()

  const cambiarEstadoUsuario = useChangeUserStatus()

  const limpiarError = () => setMensajeError('')

  const ejecutar = async (accion: () => Promise<unknown>) => {
    limpiarError()

    try {
      await accion()
    } catch (error: unknown) {
      const mensaje =
        typeof error === 'object' &&
        error !== null &&
        'response' in error
          ? (error as { response?: { data?: { detail?: string } } })
              .response?.data?.detail
          : undefined

      setMensajeError(mensaje || 'No se pudo completar la operación.')
    }
  }

  const guardarCategoria = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const datos: CategoriaDatos = {
      nombre: nombreCategoria.trim(),
      descripcion: descripcionCategoria.trim() || null,
    }

    if (categoriaEditando) {
      await ejecutar(() =>
        actualizarCategoria.mutateAsync({
          id: categoriaEditando.id,
          datos,
        }),
      )
    } else {
      await ejecutar(() => crearCategoria.mutateAsync(datos))
    }

    setCategoriaEditando(null)
    setNombreCategoria('')
    setDescripcionCategoria('')
  }

  const editarCategoria = (categoria: CategoriaAdmin) => {
    setCategoriaEditando(categoria)
    setNombreCategoria(categoria.nombre)
    setDescripcionCategoria(categoria.descripcion ?? '')
  }

  const guardarProducto = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const datos: ProductoDatos = {
      categoria_id: Number(categoriaProducto),
      nombre: nombreProducto.trim(),
      descripcion: descripcionProducto.trim() || null,
      precio_base: Number(precioProducto),
      imagen_url: imagenProducto.trim() || null,
      stock: Number(stockProducto),
      disponible: Number(stockProducto) > 0,
    }

    if (productoEditando) {
      await ejecutar(() =>
        actualizarProducto.mutateAsync({
          id: productoEditando.id,
          datos,
        }),
      )
    } else {
      await ejecutar(() => crearProducto.mutateAsync(datos))
    }

    setProductoEditando(null)
    setNombreProducto('')
    setDescripcionProducto('')
    setCategoriaProducto('')
    setPrecioProducto('')
    setImagenProducto('')
    setStockProducto('')
  }

  const editarProducto = (producto: ProductoAdmin) => {
    setProductoEditando(producto)
    setNombreProducto(producto.nombre)
    setDescripcionProducto(producto.descripcion ?? '')
    setCategoriaProducto(String(producto.categoria_id))
    setPrecioProducto(String(producto.precio_base))
    setImagenProducto(producto.imagen_url ?? '')
    setStockProducto(String(producto.stock))
  }

  const guardarStock = async (producto: ProductoAdmin) => {
    const stock = Number(nuevoStock)

    if (!Number.isInteger(stock) || stock < 0) {
      setMensajeError('El stock debe ser un número entero mayor o igual a cero.')
      return
    }

    await ejecutar(() =>
      actualizarStock.mutateAsync({
        id: producto.id,
        stock,
        disponible: stock > 0,
      }),
    )

    setStockEditando(null)
    setNuevoStock('')
  }

  const actualizarEstadoPedido = (
    pedido: PedidoRead,
    nuevoEstado: EstadoPedido,
  ) => {
    if (pedido.estado === nuevoEstado) return

    if (
      !window.confirm(
        `¿Cambiar el pedido #${pedido.id} a "${estados[nuevoEstado]}"?`,
      )
    ) {
      return
    }

    void ejecutar(() =>
      cambiarEstadoPedido.mutateAsync({
        id: pedido.id,
        datos: { estado: nuevoEstado },
      }),
    )
  }

  const totalPaginas = Math.max(
    1,
    Math.ceil((pedidos.data?.total ?? 0) / LIMITE),
  )

  const secciones: { id: Seccion; nombre: string; icono: string }[] = [
    { id: 'pedidos', nombre: 'Pedidos', icono: '📦' },
    { id: 'productos', nombre: 'Productos', icono: '🍔' },
    { id: 'categorias', nombre: 'Categorías', icono: '📂' },
    { id: 'usuarios', nombre: 'Usuarios', icono: '👥' },
  ]

  const inputStyle = {
    width: '100%',
    padding: '11px 12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    boxSizing: 'border-box' as const,
  }

  const buttonStyle = {
    padding: '9px 14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: '#fff',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 400,
  }

  const primaryStyle = {
    ...buttonStyle,
    background: '#ea580c',
    color: '#fff',
    border: '1px solid #ea580c',
    fontWeight: 700,
  }

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
          <Link to="/" className="nav-link">Tienda</Link>
          <Link to="/carrito" className="nav-link">Carrito</Link>
        </nav>

        <strong style={{ color: '#ea580c' }}>Administración</strong>
      </header>

      <main
        style={{
          maxWidth: '1250px',
          margin: '0 auto',
          padding: '40px 5%',
          minHeight: '60vh',
        }}
      >
        <div className="section-heading">
          <span className="section-eyebrow">GESTIÓN DEL NEGOCIO</span>
          <h2>Panel de administración 📊</h2>
          <p>Administrá el catálogo, los pedidos y los usuarios.</p>
        </div>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '14px',
            margin: '30px 0',
          }}
        >
          {[
            ['Pendientes', resumen.data?.pendientes, '🕒'],
            ['En preparación', resumen.data?.en_preparacion, '👨‍🍳'],
            ['Entregados', resumen.data?.entregados, '✅'],
            ['Cancelados', resumen.data?.cancelados, '❌'],
            ['Pedidos de hoy', resumen.data?.pedidos_hoy, '📦'],
          ].map(([titulo, valor, icono]) => (
            <article
              key={String(titulo)}
              style={{
                background: '#fff',
                border: '1px solid #eee',
                borderRadius: '13px',
                padding: '18px',
              }}
            >
              <span style={{ fontSize: '24px' }}>{icono}</span>
              <p style={{ color: '#777', margin: '9px 0 4px' }}>
                {titulo}
              </p>
              <strong style={{ fontSize: '25px' }}>
                {resumen.isLoading ? '...' : (valor ?? 0)}
              </strong>
            </article>
          ))}

          <article
            style={{
              background: '#fff8f2',
              border: '1px solid #f5dfcf',
              borderRadius: '13px',
              padding: '18px',
            }}
          >
            <span style={{ fontSize: '24px' }}>💰</span>
            <p style={{ color: '#777', margin: '9px 0 4px' }}>
              Ingresos entregados
            </p>
            <strong style={{ color: '#ea580c', fontSize: '21px' }}>
              {resumen.isLoading
                ? '...'
                : precio(resumen.data?.ingresos_entregados ?? 0)}
            </strong>
          </article>
        </section>

        {resumen.isError && (
          <p role="alert">No se pudo cargar el resumen.</p>
        )}

        <nav
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '9px',
            margin: '30px 0 25px',
            borderBottom: '1px solid #eee',
            paddingBottom: '15px',
          }}
        >
          {secciones.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSeccion(item.id)
                limpiarError()
              }}
              style={{
                ...buttonStyle,
                ...(seccion === item.id ? primaryStyle : {}),
              }}
            >
              {item.icono} {item.nombre}
            </button>
          ))}
        </nav>

        {mensajeError && (
          <p
            role="alert"
            style={{
              background: '#fef2f2',
              color: '#b91c1c',
              padding: '12px',
              borderRadius: '8px',
            }}
          >
            {mensajeError}
          </p>
        )}

        {seccion === 'pedidos' && (
          <section>
            <h2>Gestión de pedidos</h2>

            <select
              value={estadoFiltro}
              onChange={(event) => {
                setEstadoFiltro(event.target.value)
                setPagina(1)
              }}
              style={{ ...inputStyle, maxWidth: '260px', margin: '15px 0' }}
            >
              <option value="">Todos los estados</option>
              {Object.entries(estados).map(([valor, nombre]) => (
                <option key={valor} value={valor}>
                  {nombre}
                </option>
              ))}
            </select>

            {pedidos.isLoading ? (
              <p>Cargando pedidos...</p>
            ) : pedidos.isError ? (
              <p>No se pudieron cargar los pedidos.</p>
            ) : !pedidos.data?.items.length ? (
              <p>No hay pedidos para mostrar.</p>
            ) : (
              pedidos.data.items.map((pedido) => (
                <article
                  key={pedido.id}
                  style={{
                    background: '#fff',
                    border: '1px solid #eee',
                    borderRadius: '12px',
                    padding: '18px',
                    marginBottom: '14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <strong>Pedido #{pedido.id}</strong>
                      <p style={{ color: '#777', margin: '5px 0' }}>
                        Cliente #{pedido.usuario_id} · {fecha(pedido.created_at)}
                      </p>
                    </div>
                    <strong style={{ color: '#ea580c', fontSize: '20px' }}>
                      {precio(pedido.total)}
                    </strong>
                  </div>

                  <p>
                    {pedido.items
                      .map((item) => `${item.nombre_producto} x${item.cantidad}`)
                      .join(', ')}
                  </p>

                  <p style={{ color: '#777' }}>
                    {pedido.direccion_entrega} · {pedido.forma_pago}
                  </p>

                  <select
                    value={pedido.estado}
                    disabled={cambiarEstadoPedido.isPending}
                    onChange={(event) =>
                      actualizarEstadoPedido(
                        pedido,
                        event.target.value as EstadoPedido,
                      )
                    }
                    style={{ ...inputStyle, maxWidth: '230px' }}
                  >
                    {Object.entries(estados).map(([valor, nombre]) => (
                      <option key={valor} value={valor}>
                        {nombre}
                      </option>
                    ))}
                  </select>
                </article>
              ))
            )}

            {pedidos.data && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '18px',
                  margin: '20px 0',
                }}
              >
                <button
                  style={buttonStyle}
                  disabled={pagina <= 1}
                  onClick={() => setPagina(pagina - 1)}
                >
                  Anterior
                </button>

                <span>
                  Página {pagina} de {totalPaginas}
                </span>

                <button
                  style={buttonStyle}
                  disabled={pagina >= totalPaginas}
                  onClick={() => setPagina(pagina + 1)}
                >
                  Siguiente
                </button>
              </div>
            )}
          </section>
        )}

        {seccion === 'categorias' && (
          <section>
            <h2>Gestión de categorías</h2>

            <form
              onSubmit={guardarCategoria}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                background: '#fff8f2',
                padding: '18px',
                borderRadius: '12px',
                margin: '18px 0',
              }}
            >
              <input
                required
                minLength={2}
                maxLength={100}
                placeholder="Nombre de la categoría"
                value={nombreCategoria}
                onChange={(event) => setNombreCategoria(event.target.value)}
                style={inputStyle}
              />

              <input
                placeholder="Descripción (opcional)"
                value={descripcionCategoria}
                onChange={(event) =>
                  setDescripcionCategoria(event.target.value)
                }
                style={inputStyle}
              />

              <button
                type="submit"
                style={primaryStyle}
                disabled={
                  crearCategoria.isPending || actualizarCategoria.isPending
                }
              >
                {categoriaEditando ? 'Guardar cambios' : 'Crear categoría'}
              </button>

              {categoriaEditando && (
                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => {
                    setCategoriaEditando(null)
                    setNombreCategoria('')
                    setDescripcionCategoria('')
                  }}
                >
                  Cancelar edición
                </button>
              )}
            </form>

            {categorias.isLoading ? (
              <p>Cargando categorías...</p>
            ) : categorias.isError ? (
              <p>No se pudieron cargar las categorías.</p>
            ) : (
              categorias.data?.map((categoria) => (
                <article
                  key={categoria.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    background: '#fff',
                    border: '1px solid #eee',
                    borderRadius: '10px',
                    padding: '15px',
                    marginBottom: '10px',
                  }}
                >
                  <div>
                    <strong>{categoria.nombre}</strong>
                    <p style={{ color: '#777', margin: '5px 0' }}>
                      {categoria.descripcion || 'Sin descripción'} ·{' '}
                      {categoria.activo ? 'Activa' : 'Inactiva'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      style={buttonStyle}
                      onClick={() => editarCategoria(categoria)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      style={{ ...buttonStyle, color: '#b91c1c' }}
                      onClick={() => {
                        if (
                          window.confirm(
                            `¿Eliminar la categoría "${categoria.nombre}"?`,
                          )
                        ) {
                          void ejecutar(() =>
                            eliminarCategoria.mutateAsync(categoria.id),
                          )
                        }
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        )}

        {seccion === 'productos' && (
          <section>
            <h2>Gestión de productos</h2>

            <input
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              style={{
                ...inputStyle,
                maxWidth: '350px',
                margin: '15px 0',
              }}
            />

            <form
              onSubmit={guardarProducto}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: '12px',
                background: '#fff8f2',
                padding: '18px',
                borderRadius: '12px',
                marginBottom: '22px',
              }}
            >
              <input
                required
                minLength={2}
                maxLength={150}
                placeholder="Nombre"
                value={nombreProducto}
                onChange={(event) => setNombreProducto(event.target.value)}
                style={inputStyle}
              />

              <input
                placeholder="Descripción"
                value={descripcionProducto}
                onChange={(event) =>
                  setDescripcionProducto(event.target.value)
                }
                style={inputStyle}
              />

              <select
                required
                value={categoriaProducto}
                onChange={(event) => setCategoriaProducto(event.target.value)}
                style={inputStyle}
              >
                <option value="">Seleccionar categoría</option>
                {categorias.data
                  ?.filter((categoria) => categoria.activo)
                  .map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
              </select>

              <input
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="Precio"
                value={precioProducto}
                onChange={(event) => setPrecioProducto(event.target.value)}
                style={inputStyle}
              />

              <input
                type="url"
                placeholder="URL de imagen (opcional)"
                value={imagenProducto}
                onChange={(event) => setImagenProducto(event.target.value)}
                style={inputStyle}
              />

              <input
                required
                type="number"
                min="0"
                step="1"
                placeholder="Stock"
                value={stockProducto}
                onChange={(event) => setStockProducto(event.target.value)}
                style={inputStyle}
              />

              <button
                type="submit"
                style={primaryStyle}
                disabled={
                  crearProducto.isPending || actualizarProducto.isPending
                }
              >
                {productoEditando ? 'Guardar cambios' : 'Crear producto'}
              </button>

              {productoEditando && (
                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => {
                    setProductoEditando(null)
                    setNombreProducto('')
                    setDescripcionProducto('')
                    setCategoriaProducto('')
                    setPrecioProducto('')
                    setImagenProducto('')
                    setStockProducto('')
                  }}
                >
                  Cancelar edición
                </button>
              )}
            </form>

            {productos.isLoading ? (
              <p>Cargando productos...</p>
            ) : productos.isError ? (
              <p>No se pudieron cargar los productos.</p>
            ) : (
              productos.data?.items
                .filter((producto) =>
                  producto.nombre.toLowerCase().includes(busqueda.toLowerCase()),
                )
                .map((producto) => (
                  <article
                    key={producto.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      background: '#fff',
                      border: '1px solid #eee',
                      borderRadius: '10px',
                      padding: '15px',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ flex: '1 1 220px' }}>
                      <strong>{producto.nombre}</strong>
                      <p style={{ color: '#777', margin: '5px 0' }}>
                        {producto.categoria.nombre} ·{' '}
                        {precio(producto.precio_base)} · Stock: {producto.stock}
                      </p>
                      <small>
                        {producto.activo ? 'Activo' : 'Inactivo'} ·{' '}
                        {producto.disponible ? 'Disponible' : 'No disponible'}
                      </small>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <button
                        type="button"
                        style={buttonStyle}
                        onClick={() => editarProducto(producto)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        style={buttonStyle}
                        onClick={() => {
                          setStockEditando(producto.id)
                          setNuevoStock(String(producto.stock))
                        }}
                      >
                        Stock
                      </button>

                      <button
                        type="button"
                        style={{ ...buttonStyle, color: '#b91c1c' }}
                        onClick={() => {
                          if (
                            window.confirm(
                              `¿Eliminar "${producto.nombre}"?`,
                            )
                          ) {
                            void ejecutar(() =>
                              eliminarProducto.mutateAsync(producto.id),
                            )
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </div>

                    {stockEditando === producto.id && (
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          width: '100%',
                          alignItems: 'center',
                        }}
                      >
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={nuevoStock}
                          onChange={(event) =>
                            setNuevoStock(event.target.value)
                          }
                          style={{ ...inputStyle, maxWidth: '130px' }}
                        />

                        <button
                          type="button"
                          style={primaryStyle}
                          onClick={() => void guardarStock(producto)}
                          disabled={actualizarStock.isPending}
                        >
                          Guardar stock
                        </button>

                        <button
                          type="button"
                          style={buttonStyle}
                          onClick={() => setStockEditando(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </article>
                ))
            )}
          </section>
        )}

        {seccion === 'usuarios' && (
          <section>
            <h2>Gestión de usuarios</h2>
            <p style={{ color: '#777' }}>
              Administrá el acceso de los usuarios registrados.
            </p>

            {usuarios.isLoading ? (
              <p>Cargando usuarios...</p>
            ) : usuarios.isError ? (
              <p>No se pudieron cargar los usuarios.</p>
            ) : (
              usuarios.data?.map((usuario) => (
                <article
                  key={usuario.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    background: '#fff',
                    border: '1px solid #eee',
                    borderRadius: '10px',
                    padding: '16px',
                    marginBottom: '10px',
                  }}
                >
                  <div>
                    <strong>{usuario.full_name}</strong>
                    <p style={{ color: '#777', margin: '5px 0' }}>
                      {usuario.email} · @{usuario.username}
                    </p>
                    <small>
                      Rol: {usuario.role} · Registrado:{' '}
                      {fecha(usuario.created_at)}
                    </small>
                    <p
                      style={{
                        margin: '5px 0',
                        color: usuario.disabled ? '#b91c1c' : '#15803d',
                      }}
                    >
                      {usuario.disabled ? 'Desactivado' : 'Activo'}
                    </p>
                  </div>

                  <button
                    type="button"
                    style={
                      usuario.disabled
                        ? primaryStyle
                        : { ...buttonStyle, color: '#b91c1c' }
                    }
                    disabled={cambiarEstadoUsuario.isPending}
                    onClick={() => {
                      const desactivado = !usuario.disabled

                      if (
                        window.confirm(
                          `¿${desactivado ? 'Desactivar' : 'Activar'} a ${usuario.full_name}?`,
                        )
                      ) {
                        void ejecutar(() =>
                          cambiarEstadoUsuario.mutateAsync({
                            id: usuario.id,
                            desactivado,
                          }),
                        )
                      }
                    }}
                  >
                    {usuario.disabled ? 'Activar usuario' : 'Desactivar usuario'}
                  </button>
                </article>
              ))
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <div className="brand footer-brand">
          <span className="brand-icon">🍴</span>
          <span>
            Food<span className="brand-highlight">Store</span>
          </span>
        </div>
        <p>Food Store · Administración</p>
        <span className="footer-copy">© 2026 Food Store</span>
      </footer>
    </div>
  )
}

export default AdminPage
