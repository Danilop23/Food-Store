import { api } from '../../api/client'
import type { Categoria } from './types'

export const categoryService = {
  async getCategories(): Promise<Categoria[]> {
    const { data } = await api.get<Categoria[]>('/categorias/')

    return data
  },

  async getCategoryById(id: number): Promise<Categoria> {
    const { data } = await api.get<Categoria>(`/categorias/${id}`)

    return data
  },
}