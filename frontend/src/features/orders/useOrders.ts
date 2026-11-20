
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { orderService } from './orderService'

import type {
  CambioEstado,
  EstadoPedido,
  PedidoCreate,
} from './types'

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: PedidoCreate) =>
      orderService.crearPedido(datos),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['productos'] }),
        queryClient.invalidateQueries({ queryKey: ['mis-pedidos'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-pedidos'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-resumen'] }),
      ])
    },
  })
}

export function useMyOrders() {
  return useQuery({
    queryKey: ['mis-pedidos'],
    queryFn: () => orderService.obtenerMisPedidos(),
    retry: false,
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (pedidoId: number) =>
      orderService.cancelarPedido(pedidoId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['mis-pedidos'] }),
        queryClient.invalidateQueries({ queryKey: ['productos'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-pedidos'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-resumen'] }),
      ])
    },
  })
}

export function useAdminOrders(
  pagina: number,
  limite: number,
  estado?: EstadoPedido,
) {
  return useQuery({
    queryKey: ['admin-pedidos', pagina, limite, estado],
    queryFn: () =>
      orderService.listarPedidos(pagina, limite, estado),
    retry: false,
  })
}

export function useAdminSummary() {
  return useQuery({
    queryKey: ['admin-resumen'],
    queryFn: () => orderService.obtenerResumen(),
    retry: false,
  })
}

export function useChangeOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: number
      datos: CambioEstado
    }) => orderService.cambiarEstado(id, datos),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-pedidos'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-resumen'] }),
        queryClient.invalidateQueries({ queryKey: ['mis-pedidos'] }),
        queryClient.invalidateQueries({ queryKey: ['productos'] }),
      ])
    },
  })
}
