
from fastapi import HTTPException, status

from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductoStockUpdate,
    ProductoUpdate,
    ProductosPaginados,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoService:
    def __init__(self, uow_factory=ProductoUnitOfWork):
        self.uow_factory = uow_factory

    def listar_productos(
        self,
        nombre: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
        pagina: int = 1,
        limite: int = 10,
    ) -> ProductosPaginados:
        if pagina < 1 or limite < 1:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="La página y el límite deben ser mayores que cero",
            )

        with self.uow_factory() as uow:
            productos, total = uow.productos.search(
                nombre=nombre,
                categoria_id=categoria_id,
                disponible=disponible,
                pagina=pagina,
                limite=limite,
            )

            items = [
                ProductoRead.model_validate(producto)
                for producto in productos
            ]

            return ProductosPaginados(
                total=total,
                items=items,
            )

    def obtener_producto(self, producto_id: int) -> ProductoRead:
        with self.uow_factory() as uow:
            producto = uow.productos.get_by_id(producto_id)

            if producto is None or not producto.activo:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Producto no encontrado",
                )

            return ProductoRead.model_validate(producto)

    def crear_producto(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow_factory() as uow:
            categoria = uow.session.get(Categoria, datos.categoria_id)

            if categoria is None or not categoria.activo:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="La categoría indicada no existe o está inactiva",
                )

            producto = Producto(
                categoria_id=datos.categoria_id,
                nombre=datos.nombre,
                descripcion=datos.descripcion,
                precio_base=datos.precio_base,
                imagen_url=datos.imagen_url,
                stock=datos.stock,
                disponible=datos.disponible,
                activo=True,
            )

            producto = uow.productos.add(producto)

            return ProductoRead.model_validate(producto)

    def actualizar_producto(
        self,
        producto_id: int,
        datos: ProductoUpdate,
    ) -> ProductoRead:
        with self.uow_factory() as uow:
            producto = uow.productos.get_by_id(producto_id)

            if producto is None or not producto.activo:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Producto no encontrado",
                )

            cambios = datos.model_dump(exclude_unset=True)

            if "categoria_id" in cambios:
                categoria = uow.session.get(
                    Categoria,
                    cambios["categoria_id"],
                )

                if categoria is None or not categoria.activo:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="La categoría indicada no existe o está inactiva",
                    )

            for campo, valor in cambios.items():
                setattr(producto, campo, valor)

            uow.productos.update(producto)

            return ProductoRead.model_validate(producto)

    def actualizar_stock(
        self,
        producto_id: int,
        datos: ProductoStockUpdate,
    ) -> ProductoRead:
        with self.uow_factory() as uow:
            producto = uow.productos.get_by_id(producto_id)

            if producto is None or not producto.activo:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Producto no encontrado",
                )

            producto.stock = datos.stock
            producto.disponible = datos.disponible

            uow.productos.update(producto)

            return ProductoRead.model_validate(producto)

    def eliminar_producto(self, producto_id: int) -> None:
        with self.uow_factory() as uow:
            producto = uow.productos.get_by_id(producto_id)

            if producto is None or not producto.activo:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Producto no encontrado",
                )

            producto.activo = False

            uow.productos.update(producto)
