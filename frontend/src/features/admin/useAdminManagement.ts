
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminService,
  type CategoriaDatos,
  type ProductoDatos,
} from './adminService'

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin-categorias'],
    queryFn: () => adminService.listarCategorias(),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: CategoriaDatos) =>
      adminService.crearCategoria(datos),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-categorias'] })
      await queryClient.invalidateQueries({ queryKey: ['categorias'] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: number
      datos: Partial<CategoriaDatos>
    }) => adminService.actualizarCategoria(id, datos),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-categorias'] })
      await queryClient.invalidateQueries({ queryKey: ['categorias'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminService.eliminarCategoria(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-categorias'] })
      await queryClient.invalidateQueries({ queryKey: ['categorias'] })
      await queryClient.invalidateQueries({ queryKey: ['admin-productos'] })
    },
  })
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin-productos'],
    queryFn: () => adminService.listarProductos(1, 100),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: ProductoDatos) =>
      adminService.crearProducto(datos),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-productos'] })
      await queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: number
      datos: Partial<ProductoDatos>
    }) => adminService.actualizarProducto(id, datos),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-productos'] })
      await queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useUpdateProductStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      stock,
      disponible,
    }: {
      id: number
      stock: number
      disponible: boolean
    }) => adminService.actualizarStock(id, stock, disponible),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-productos'] })
      await queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminService.eliminarProducto(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-productos'] })
      await queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-usuarios'],
    queryFn: () => adminService.listarUsuarios(),
  })
}

export function useChangeUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      desactivado,
    }: {
      id: number
      desactivado: boolean
    }) => adminService.cambiarEstadoUsuario(id, desactivado),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] })
    },
  })
}
