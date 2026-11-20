
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto } from '../products/types'

export interface CartItem {
  producto: Producto
  cantidad: number
}

interface CartState {
  items: CartItem[]
  agregarProducto: (producto: Producto) => void
  quitarProducto: (productoId: number) => void
  modificarCantidad: (productoId: number, cantidad: number) => void
  vaciarCarrito: () => void
  obtenerTotal: () => number
  obtenerCantidad: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregarProducto: (producto) => {
        set((state) => {
          const existente = state.items.find(
            (item) => item.producto.id === producto.id,
          )

          if (existente) {
            if (existente.cantidad >= producto.stock) {
              return state
            }

            return {
              items: state.items.map((item) =>
                item.producto.id === producto.id
                  ? { ...item, cantidad: item.cantidad + 1 }
                  : item,
              ),
            }
          }

          if (!producto.disponible || producto.stock <= 0) {
            return state
          }

          return {
            items: [...state.items, { producto, cantidad: 1 }],
          }
        })
      },

      quitarProducto: (productoId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => item.producto.id !== productoId,
          ),
        }))
      },

      modificarCantidad: (productoId, cantidad) => {
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.producto.id !== productoId) {
                return item
              }

              return {
                ...item,
                cantidad: Math.min(
                  Math.max(1, cantidad),
                  item.producto.stock,
                ),
              }
            }),
        }))
      },

      vaciarCarrito: () => set({ items: [] }),

      obtenerTotal: () =>
        get().items.reduce(
          (total, item) =>
            total + item.producto.precio_base * item.cantidad,
          0,
        ),

      obtenerCantidad: () =>
        get().items.reduce(
          (total, item) => total + item.cantidad,
          0,
        ),
    }),
    {
      name: 'food-store-cart',
    },
  ),
)
