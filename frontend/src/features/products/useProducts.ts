import { useQuery } from '@tanstack/react-query'
import { productService } from './productService'
import type { FiltrosProductos } from './types'

export function useProducts(filtros: FiltrosProductos = {}) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => productService.getProducts(filtros),
  })
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['producto', id],
    queryFn: () => productService.getProductById(id),
    enabled: id > 0,
  })
}