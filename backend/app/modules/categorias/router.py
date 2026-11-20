
from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import CategoriaService


router = APIRouter(
    prefix="/categorias",
    tags=["Categorías"],
)


AdminUser = Annotated[object, Depends(require_role("admin"))]


@router.get(
    "/",
    response_model=list[CategoriaRead],
)
def listar_categorias():
    service = CategoriaService()
    return service.listar_categorias()


@router.get(
    "/{categoria_id}",
    response_model=CategoriaRead,
)
def obtener_categoria(categoria_id: int):
    service = CategoriaService()
    return service.obtener_categoria(categoria_id)


@router.post(
    "/",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_categoria(
    datos: CategoriaCreate,
    admin: AdminUser,
):
    service = CategoriaService()
    return service.crear_categoria(datos)


@router.put(
    "/{categoria_id}",
    response_model=CategoriaRead,
)
def actualizar_categoria(
    categoria_id: int,
    datos: CategoriaUpdate,
    admin: AdminUser,
):
    service = CategoriaService()
    return service.actualizar_categoria(categoria_id, datos)


@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_categoria(
    categoria_id: int,
    admin: AdminUser,
):
    service = CategoriaService()
    service.eliminar_categoria(categoria_id)
