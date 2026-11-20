
from fastapi import HTTPException, status

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaService:
    def __init__(self, uow_factory=CategoriaUnitOfWork):
        self.uow_factory = uow_factory

    def listar_categorias(self) -> list[CategoriaRead]:
        with self.uow_factory() as uow:
            categorias = uow.categorias.get_all()

            return [
                CategoriaRead.model_validate(categoria)
                for categoria in categorias
                if categoria.activo
            ]

    def obtener_categoria(self, categoria_id: int) -> CategoriaRead:
        with self.uow_factory() as uow:
            categoria = uow.categorias.get_by_id(categoria_id)

            if categoria is None or not categoria.activo:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Categoría no encontrada",
                )

            return CategoriaRead.model_validate(categoria)

    def crear_categoria(
        self,
        datos: CategoriaCreate,
    ) -> CategoriaRead:
        with self.uow_factory() as uow:
            existente = uow.categorias.get_by_nombre(datos.nombre)

            if existente is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Ya existe una categoría con ese nombre",
                )

            categoria = Categoria(
                nombre=datos.nombre,
                descripcion=datos.descripcion,
                activo=True,
            )

            categoria = uow.categorias.add(categoria)

            return CategoriaRead.model_validate(categoria)

    def actualizar_categoria(
        self,
        categoria_id: int,
        datos: CategoriaUpdate,
    ) -> CategoriaRead:
        with self.uow_factory() as uow:
            categoria = uow.categorias.get_by_id(categoria_id)

            if categoria is None or not categoria.activo:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Categoría no encontrada",
                )

            cambios = datos.model_dump(exclude_unset=True)

            if "nombre" in cambios:
                existente = uow.categorias.get_by_nombre(
                    cambios["nombre"]
                )

                if existente is not None and existente.id != categoria_id:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Ya existe una categoría con ese nombre",
                    )

            for campo, valor in cambios.items():
                setattr(categoria, campo, valor)

            uow.categorias.update(categoria)

            return CategoriaRead.model_validate(categoria)

    def eliminar_categoria(self, categoria_id: int) -> None:
        with self.uow_factory() as uow:
            categoria = uow.categorias.get_by_id(categoria_id)

            if categoria is None or not categoria.activo:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Categoría no encontrada",
                )

            categoria.activo = False

            uow.categorias.update(categoria)
