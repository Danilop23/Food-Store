
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.core.deps import require_role
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductoStockUpdate,
    ProductoUpdate,
    ProductosPaginados,
)
from app.modules.productos.service import ProductoService


router = APIRouter(
    prefix="/productos",
    tags=["Productos"],
)


AdminUser = Annotated[object, Depends(require_role("admin"))]


@router.get(
    "/",
    response_model=ProductosPaginados,
)
def listar_productos(
    nombre: str | None = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
    pagina: Annotated[int, Query(ge=1)] = 1,
    limite: Annotated[int, Query(ge=1, le=100)] = 10,
):
    service = ProductoService()

    return service.listar_productos(
        nombre=nombre,
        categoria_id=categoria_id,
        disponible=disponible,
        pagina=pagina,
        limite=limite,
    )


@router.get(
    "/{producto_id}",
    response_model=ProductoRead,
)
def obtener_producto(producto_id: int):
    service = ProductoService()
    return service.obtener_producto(producto_id)


@router.post(
    "/",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_producto(
    datos: ProductoCreate,
    admin: AdminUser,
):
    service = ProductoService()
    return service.crear_producto(datos)


@router.put(
    "/{producto_id}",
    response_model=ProductoRead,
)
def actualizar_producto(
    producto_id: int,
    datos: ProductoUpdate,
    admin: AdminUser,
):
    service = ProductoService()

    return service.actualizar_producto(
        producto_id,
        datos,
    )


@router.patch(
    "/{producto_id}/stock",
    response_model=ProductoRead,
)
def actualizar_stock(
    producto_id: int,
    datos: ProductoStockUpdate,
    admin: AdminUser,
):
    service = ProductoService()

    return service.actualizar_stock(
        producto_id,
        datos,
    )


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_producto(
    producto_id: int,
    admin: AdminUser,
):
    service = ProductoService()
    service.eliminar_producto(producto_id)
