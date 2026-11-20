import { api } from '../../api/client'
import type { FiltrosProductos, ProductosPaginados, Producto } from './types'

export const productService = {
  async getProducts(
    filtros: FiltrosProductos = {},
  ): Promise<ProductosPaginados> {
    const { data } = await api.get<ProductosPaginados>('/productos/', {
      params: filtros,
    })

    return data
  },

  async getProductById(id: number): Promise<Producto> {
    const { data } = await api.get<Producto>(`/productos/${id}`)

    return data
  },
}