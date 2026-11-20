
import { api } from '../../api/client'

export interface CategoriaAdmin {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
}

export interface CategoriaDatos {
  nombre: string
  descripcion: string | null
}

export interface ProductoAdmin {
  id: number
  categoria_id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
  activo: boolean
  categoria: CategoriaAdmin
}

export interface ProductoDatos {
  categoria_id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
}

export interface UsuarioAdmin {
  id: number
  username: string
  full_name: string
  email: string
  role: string
  disabled: boolean
  created_at: string
}

export interface ProductosPaginadosAdmin {
  total: number
  items: ProductoAdmin[]
}

export const adminService = {
  async listarCategorias(): Promise<CategoriaAdmin[]> {
    const response = await api.get<CategoriaAdmin[]>('/categorias/')
    return response.data
  },

  async crearCategoria(datos: CategoriaDatos): Promise<CategoriaAdmin> {
    const response = await api.post<CategoriaAdmin>('/categorias/', datos)
    return response.data
  },

  async actualizarCategoria(
    id: number,
    datos: Partial<CategoriaDatos>,
  ): Promise<CategoriaAdmin> {
    const response = await api.put<CategoriaAdmin>(`/categorias/${id}`, datos)
    return response.data
  },

  async eliminarCategoria(id: number): Promise<void> {
    await api.delete(`/categorias/${id}`)
  },

  async listarProductos(
    pagina = 1,
    limite = 100,
  ): Promise<ProductosPaginadosAdmin> {
    const response = await api.get<ProductosPaginadosAdmin>('/productos/', {
      params: { pagina, limite },
    })
    return response.data
  },

  async crearProducto(datos: ProductoDatos): Promise<ProductoAdmin> {
    const response = await api.post<ProductoAdmin>('/productos/', datos)
    return response.data
  },

  async actualizarProducto(
    id: number,
    datos: Partial<ProductoDatos>,
  ): Promise<ProductoAdmin> {
    const response = await api.put<ProductoAdmin>(`/productos/${id}`, datos)
    return response.data
  },

  async actualizarStock(
    id: number,
    stock: number,
    disponible: boolean,
  ): Promise<ProductoAdmin> {
    const response = await api.patch<ProductoAdmin>(
      `/productos/${id}/stock`,
      { stock, disponible },
    )
    return response.data
  },

  async eliminarProducto(id: number): Promise<void> {
    await api.delete(`/productos/${id}`)
  },

  async listarUsuarios(): Promise<UsuarioAdmin[]> {
    const response = await api.get<UsuarioAdmin[]>('/usuarios/')
    return response.data
  },

  async cambiarEstadoUsuario(
    id: number,
    desactivado: boolean,
  ): Promise<UsuarioAdmin> {
    const response = await api.patch<UsuarioAdmin>(
      `/usuarios/${id}/estado`,
      null,
      { params: { desactivado } },
    )
    return response.data
  },
}
