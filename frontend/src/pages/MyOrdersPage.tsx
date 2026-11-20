
import { Link } from 'react-router-dom'

import {
  useCancelOrder,
  useMyOrders,
} from '../features/orders/useOrders'

import type { PedidoRead } from '../features/orders/types'

function MyOrdersPage() {
  const {
    data: pedidos,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useMyOrders()

  const cancelarPedido = useCancelOrder()

  const formatoPrecio = (precio: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(precio)

  const formatoFecha = (fecha: string) =>
    new Date(fecha).toLocaleString('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })

  const estadoPedido = (estado: string) => {
    const estados: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      EN_PREPARACION: 'En preparación',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
    }

    return estados[estado] ?? estado
  }

  const colorEstado = (estado: string) => {
    const colores: Record<string, { background: string; color: string }> = {
      PENDIENTE: { background: '#fff7ed', color: '#c2410c' },
      EN_PREPARACION: { background: '#eff6ff', color: '#1d4ed8' },
      ENTREGADO: { background: '#f0fdf4', color: '#15803d' },
      CANCELADO: { background: '#fef2f2', color: '#b91c1c' },
    }

    return colores[estado] ?? {
      background: '#f3f4f6',
      color: '#374151',
    }
  }

  const confirmarCancelacion = (pedidoId: number) => {
    const confirmado = window.confirm(
      `¿Estás seguro de que querés cancelar el pedido #${pedidoId}?`,
    )

    if (confirmado) {
      cancelarPedido.mutate(pedidoId)
    }
  }

  const renderPedido = (pedido: PedidoRead) => {
    const estiloEstado = colorEstado(pedido.estado)

    return (
      <article
        key={pedido.id}
        style={{
          background: '#fff',
          border: '1px solid #eee',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 3px 12px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '18px',
          }}
        >
          <div>
            <span className="section-eyebrow">
              PEDIDO #{pedido.id}
            </span>

            <p
              style={{
                color: '#777',
                margin: '6px 0 0',
                fontSize: '13px',
              }}
            >
              {formatoFecha(pedido.created_at)}
            </p>
          </div>

          <span
            style={{
              background: estiloEstado.background,
              color: estiloEstado.color,
              padding: '8px 13px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            {estadoPedido(pedido.estado)}
          </span>
        </div>

        <div style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
          {pedido.items.map((item, index) => (
            <div
              key={`${pedido.id}-${item.producto_id}-${index}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '15px',
                padding: '12px 0',
                borderBottom: '1px solid #f3f3f3',
              }}
            >
              <div>
                <strong>{item.nombre_producto}</strong>

                <p
                  style={{
                    color: '#777',
                    margin: '5px 0 0',
                    fontSize: '13px',
                  }}
                >
                  {item.cantidad} × {formatoPrecio(item.precio_unitario)}
                </p>
              </div>

              <strong style={{ whiteSpace: 'nowrap' }}>
                {formatoPrecio(item.subtotal)}
              </strong>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '15px',
            marginTop: '20px',
          }}
        >
          <div>
            <span className="section-eyebrow">FORMA DE PAGO</span>

            <p style={{ margin: '6px 0 0' }}>
              {pedido.forma_pago === 'EFECTIVO'
                ? 'Efectivo'
                : 'Transferencia'}
            </p>
          </div>

          <div>
            <span className="section-eyebrow">DIRECCIÓN DE ENTREGA</span>

            <p style={{ margin: '6px 0 0' }}>
              {pedido.direccion_entrega}
            </p>
          </div>
        </div>

        {pedido.notas && (
          <div style={{ marginTop: '15px' }}>
            <span className="section-eyebrow">NOTAS</span>

            <p style={{ margin: '6px 0 0', color: '#666' }}>
              {pedido.notas}
            </p>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '15px',
            flexWrap: 'wrap',
            borderTop: '1px solid #eee',
            marginTop: '20px',
            paddingTop: '18px',
          }}
        >
          <strong style={{ fontSize: '17px' }}>
            Total del pedido
          </strong>

          <strong style={{ color: '#ea580c', fontSize: '23px' }}>
            {formatoPrecio(pedido.total)}
          </strong>
        </div>

        {pedido.estado === 'PENDIENTE' && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '18px',
            }}
          >
            <button
              type="button"
              onClick={() => confirmarCancelacion(pedido.id)}
              disabled={cancelarPedido.isPending}
              style={{
                border: '1px solid #fecaca',
                background: cancelarPedido.isPending ? '#f3f4f6' : '#fff1f2',
                color: '#b91c1c',
                padding: '10px 16px',
                borderRadius: '9px',
                fontWeight: 600,
                cursor: cancelarPedido.isPending ? 'not-allowed' : 'pointer',
                opacity: cancelarPedido.isPending ? 0.6 : 1,
              }}
            >
              {cancelarPedido.isPending
                ? 'Cancelando...'
                : 'Cancelar pedido'}
            </button>
          </div>
        )}
      </article>
    )
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
          <Link to="/" className="nav-link">
            Inicio
          </Link>

          <Link to="/carrito" className="nav-link">
            Mi carrito
          </Link>
        </nav>

        <Link to="/" className="cart-button">
          Seguir comprando
        </Link>
      </header>

      <main
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '55px 6%',
          minHeight: '55vh',
        }}
      >
        <div className="section-heading">
          <span className="section-eyebrow">TU CUENTA</span>
          <h2>Mis pedidos 📦</h2>
          <p>Consultá el historial y los detalles de tus compras.</p>
        </div>

        {cancelarPedido.isError && (
          <div
            style={{
              background: '#fef2f2',
              color: '#b91c1c',
              padding: '14px 18px',
              borderRadius: '10px',
              marginTop: '20px',
            }}
          >
            No se pudo cancelar el pedido. Puede que ya no esté pendiente.
            Actualizá el historial e intentá nuevamente si corresponde.
          </div>
        )}

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '70px 20px' }}>
            <p>Estamos cargando tus pedidos...</p>
          </div>
        ) : isError ? (
          <div
            style={{
              textAlign: 'center',
              padding: '50px 20px',
              background: '#fff8f2',
              borderRadius: '16px',
              marginTop: '30px',
            }}
          >
            <h3>No pudimos cargar tus pedidos</h3>

            <p style={{ color: '#777' }}>
              Ocurrió un problema al consultar tu historial.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? 'Cargando...' : 'Intentar nuevamente'}
            </button>
          </div>
        ) : !pedidos || pedidos.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '65px 20px',
              background: '#fff8f2',
              borderRadius: '16px',
              marginTop: '30px',
            }}
          >
            <div style={{ fontSize: '60px' }}>📦</div>

            <h3>Todavía no realizaste pedidos</h3>

            <p style={{ color: '#777', marginBottom: '25px' }}>
              Cuando confirmes una compra, vas a poder consultarla acá.
            </p>

            <Link to="/" className="primary-button">
              Explorar productos
            </Link>
          </div>
        ) : (
          <div style={{ marginTop: '35px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '20px',
              }}
            >
              <strong>
                {pedidos.length}{' '}
                {pedidos.length === 1
                  ? 'pedido registrado'
                  : 'pedidos registrados'}
              </strong>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                style={{
                  border: '1px solid #eee',
                  background: '#fff',
                  padding: '9px 14px',
                  borderRadius: '9px',
                  cursor: 'pointer',
                }}
              >
                {isFetching ? 'Actualizando...' : '↻ Actualizar'}
              </button>
            </div>

            {pedidos.map(renderPedido)}
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

export default MyOrdersPage
