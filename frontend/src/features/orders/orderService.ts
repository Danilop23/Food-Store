import { api } from '../../api/client'
import type {
  CambioEstado,
  EstadoPedido,
  PedidoCreate,
  PedidoRead,
  PedidosPaginados,
  ResumenPedidos,
} from './types'

export const orderService = {
  async crearPedido(datos: PedidoCreate): Promise<PedidoRead> {
    const response = await api.post<PedidoRead>('/pedidos/', datos)
    return response.data
  },

  async obtenerMisPedidos(): Promise<PedidoRead[]> {
    const response = await api.get<PedidoRead[]>('/pedidos/mis-pedidos')
    return response.data
  },

  async obtenerPedido(id: number): Promise<PedidoRead> {
    const response = await api.get<PedidoRead>(`/pedidos/${id}`)
    return response.data
  },

  async cancelarPedido(id: number): Promise<PedidoRead> {
    const response = await api.patch<PedidoRead>(
      `/pedidos/${id}/cancelar`,
    )
    return response.data
  },

  async listarPedidos(
    pagina = 1,
    limite = 10,
    estado?: EstadoPedido,
  ): Promise<PedidosPaginados> {
    const response = await api.get<PedidosPaginados>('/pedidos/', {
      params: { pagina, limite, estado },
    })

    return response.data
  },

  async obtenerResumen(): Promise<ResumenPedidos> {
    const response = await api.get<ResumenPedidos>('/pedidos/resumen')
    return response.data
  },

  async cambiarEstado(
    id: number,
    datos: CambioEstado,
  ): Promise<PedidoRead> {
    const response = await api.patch<PedidoRead>(
      `/pedidos/${id}/estado`,
      datos,
    )

    return response.data
  },
}