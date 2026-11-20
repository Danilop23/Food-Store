
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link } from 'react-router-dom'
import { useCartStore } from '../features/cart/cartStore'
import { useCreateOrder } from '../features/orders/useOrders'
import type { FormaPago, PedidoRead } from '../features/orders/types'

function CheckoutPage() {
  const items = useCartStore((state) => state.items)
  const vaciarCarrito = useCartStore((state) => state.vaciarCarrito)
  const crearPedido = useCreateOrder()

  const [pedidoConfirmado, setPedidoConfirmado] =
    useState<PedidoRead | null>(null)

  const formatoPrecio = (precio: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(precio)

  const total = items.reduce(
    (acumulado, item) =>
      acumulado + item.producto.precio_base * item.cantidad,
    0,
  )

  const formulario = useForm({
    defaultValues: {
      direccion: '',
      formaPago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      if (items.length === 0) return

      try {
        const pedido = await crearPedido.mutateAsync({
          items: items.map((item) => ({
            producto_id: item.producto.id,
            cantidad: item.cantidad,
          })),
          forma_pago: value.formaPago,
          direccion_entrega: value.direccion.trim(),
          notas: value.notas.trim() || null,
        })

        vaciarCarrito()
        setPedidoConfirmado(pedido)
      } catch {
        // El error se muestra debajo del formulario.
      }
    },
  })

  if (pedidoConfirmado) {
    return (
      <div className="app">
        <header className="navbar">
          <Link to="/" className="brand">
            <span className="brand-icon">🍴</span>
            <span>
              Food<span className="brand-highlight">Store</span>
            </span>
          </Link>
        </header>

        <main
          style={{
            maxWidth: '700px',
            margin: '0 auto',
            padding: '80px 6%',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '65px' }}>✅</div>
          <h1>¡Pedido confirmado!</h1>
          <p style={{ color: '#666', lineHeight: 1.7 }}>
            Tu pedido fue registrado correctamente.
          </p>

          <div
            style={{
              background: '#fff8f2',
              borderRadius: '16px',
              padding: '25px',
              margin: '30px 0',
              textAlign: 'left',
            }}
          >
            <p>
              <strong>Número de pedido:</strong> #{pedidoConfirmado.id}
            </p>
            <p>
              <strong>Estado:</strong> {pedidoConfirmado.estado}
            </p>
            <p>
              <strong>Forma de pago:</strong>{' '}
              {pedidoConfirmado.forma_pago === 'EFECTIVO'
                ? 'Efectivo'
                : 'Transferencia'}
            </p>
            <p>
              <strong>Dirección:</strong>{' '}
              {pedidoConfirmado.direccion_entrega}
            </p>
            <p>
              <strong>Total:</strong>{' '}
              {formatoPrecio(pedidoConfirmado.total)}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/mis-pedidos" className="primary-button">
              Ver mis pedidos
            </Link>
            <Link to="/" className="nav-link">
              Volver al inicio
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="app">
        <main
          style={{
            maxWidth: '700px',
            margin: '0 auto',
            padding: '90px 6%',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '60px' }}>🛒</div>
          <h2>No hay productos para confirmar</h2>
          <p style={{ color: '#777', marginBottom: '25px' }}>
            Agregá productos al carrito antes de realizar tu pedido.
          </p>
          <Link to="/" className="primary-button">
            Ir a comprar
          </Link>
        </main>
      </div>
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
            Volver al carrito
          </Link>
        </nav>
      </header>

      <main
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '55px 6%',
        }}
      >
        <div className="section-heading">
          <span className="section-eyebrow">ÚLTIMO PASO</span>
          <h2>Confirmar pedido</h2>
          <p>Completá los datos para finalizar tu compra.</p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px',
            marginTop: '35px',
            alignItems: 'start',
          }}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void formulario.handleSubmit()
            }}
            style={{
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: '16px',
              padding: '25px',
              display: 'grid',
              gap: '18px',
            }}
          >
            <h3 style={{ margin: 0 }}>Datos de entrega</h3>

            <formulario.Field
              name="direccion"
              validators={{
                onChange: ({ value }) => {
                  if (value.trim().length < 5) {
                    return 'Ingresá una dirección de al menos 5 caracteres.'
                  }
                  if (value.length > 200) {
                    return 'La dirección no puede superar los 200 caracteres.'
                  }
                  return undefined
                },
              }}
            >
              {(field) => (
                <label style={{ display: 'grid', gap: '8px' }}>
                  <strong>Dirección de entrega</strong>
                  <input
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    onBlur={field.handleBlur}
                    required
                    minLength={5}
                    maxLength={200}
                    placeholder="Calle, número, barrio y localidad"
                    style={{
                      padding: '13px',
                      border: '1px solid #ddd',
                      borderRadius: '9px',
                      font: 'inherit',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <span
                      style={{ color: '#b91c1c', fontSize: '13px' }}
                      role="alert"
                    >
                      {field.state.meta.errors.join(', ')}
                    </span>
                  )}
                </label>
              )}
            </formulario.Field>

            <formulario.Field name="formaPago">
              {(field) => (
                <label style={{ display: 'grid', gap: '8px' }}>
                  <strong>Forma de pago</strong>
                  <select
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(event.target.value as FormaPago)
                    }
                    style={{
                      padding: '13px',
                      border: '1px solid #ddd',
                      borderRadius: '9px',
                      font: 'inherit',
                      background: '#fff',
                    }}
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                  </select>
                </label>
              )}
            </formulario.Field>

            <formulario.Field
              name="notas"
              validators={{
                onChange: ({ value }) =>
                  value.length > 500
                    ? 'Las notas no pueden superar los 500 caracteres.'
                    : undefined,
              }}
            >
              {(field) => (
                <label style={{ display: 'grid', gap: '8px' }}>
                  <strong>Notas del pedido (opcional)</strong>
                  <textarea
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    onBlur={field.handleBlur}
                    rows={4}
                    maxLength={500}
                    placeholder="Indicaciones adicionales para la entrega..."
                    style={{
                      padding: '13px',
                      border: '1px solid #ddd',
                      borderRadius: '9px',
                      font: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <span
                      style={{ color: '#b91c1c', fontSize: '13px' }}
                      role="alert"
                    >
                      {field.state.meta.errors.join(', ')}
                    </span>
                  )}
                </label>
              )}
            </formulario.Field>

            {crearPedido.isError && (
              <div
                role="alert"
                style={{
                  background: '#fff1f1',
                  color: '#b91c1c',
                  padding: '13px',
                  borderRadius: '9px',
                  fontSize: '14px',
                }}
              >
                No se pudo confirmar el pedido. Verificá que los productos
                tengan stock disponible e intentá nuevamente.
              </div>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={
                crearPedido.isPending ||
                !formulario.state.canSubmit ||
                formulario.state.isSubmitting
              }
              style={{
                width: '100%',
                border: 0,
                cursor: crearPedido.isPending ? 'wait' : 'pointer',
                opacity: crearPedido.isPending ? 0.7 : 1,
              }}
            >
              {crearPedido.isPending || formulario.state.isSubmitting
                ? 'Confirmando pedido...'
                : 'Confirmar compra'}
            </button>
          </form>

          <section
            style={{
              background: '#fff8f2',
              borderRadius: '16px',
              padding: '25px',
            }}
          >
            <h3 style={{ marginTop: 0 }}>Resumen de tu compra</h3>

            {items.map((item) => (
              <div
                key={item.producto.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '13px 0',
                  borderBottom: '1px solid #eadfd6',
                }}
              >
                <div>
                  <strong>{item.producto.nombre}</strong>
                  <div style={{ color: '#777', fontSize: '13px' }}>
                    Cantidad: {item.cantidad}
                  </div>
                </div>
                <strong>
                  {formatoPrecio(
                    item.producto.precio_base * item.cantidad,
                  )}
                </strong>
              </div>
            ))}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '22px',
                fontSize: '19px',
              }}
            >
              <strong>Total estimado</strong>
              <strong style={{ color: '#ea580c' }}>
                {formatoPrecio(total)}
              </strong>
            </div>

            <p style={{ color: '#777', fontSize: '12px', lineHeight: 1.5 }}>
              El total definitivo será calculado y validado por el servidor
              al confirmar el pedido.
            </p>
          </section>
        </div>
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

export default CheckoutPage
