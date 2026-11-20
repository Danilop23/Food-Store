import { useQuery } from '@tanstack/react-query'
import { categoryService } from './categoryService'

export function useCategories() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: categoryService.getCategories,
  })
}