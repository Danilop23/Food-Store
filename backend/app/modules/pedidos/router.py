
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.models import Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import PedidoService
from app.modules.usuarios.models import Usuario


router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"],
)


CurrentUser = Annotated[
    Usuario,
    Depends(get_current_active_user),
]

AdminUser = Annotated[
    Usuario,
    Depends(require_role("admin")),
]


@router.post(
    "/",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_pedido(
    datos: PedidoCreate,
    usuario: CurrentUser,
):
    service = PedidoService()

    return service.crear_pedido(
        usuario_id=usuario.id,
        datos=datos,
    )


@router.get(
    "/mis-pedidos",
    response_model=list[PedidoRead],
)
def listar_mis_pedidos(usuario: CurrentUser):
    service = PedidoService()

    return service.listar_pedidos_usuario(usuario.id)


@router.get(
    "/",
    response_model=PedidosPaginados,
)
def listar_pedidos(
    admin: AdminUser,
    pagina: Annotated[int, Query(ge=1)] = 1,
    limite: Annotated[int, Query(ge=1, le=100)] = 10,
    estado: str | None = None,
):
    service = PedidoService()

    return service.listar_pedidos(
        pagina=pagina,
        limite=limite,
        estado=estado,
    )


@router.get(
    "/resumen",
    response_model=ResumenPedidos,
)
def obtener_resumen(admin: AdminUser):
    service = PedidoService()

    return service.obtener_resumen()


@router.get(
    "/{pedido_id}",
    response_model=PedidoRead,
)
def obtener_pedido(
    pedido_id: int,
    usuario: CurrentUser,
):
    service = PedidoService()
    pedido = service.obtener_pedido(pedido_id)

    if usuario.role != "admin" and pedido.usuario_id != usuario.id:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tenés permiso para consultar este pedido",
        )

    return pedido


@router.patch(
    "/{pedido_id}/cancelar",
    response_model=PedidoRead,
)
def cancelar_pedido(
    pedido_id: int,
    usuario: CurrentUser,
):
    service = PedidoService()

    return service.cancelar_pedido(
        pedido_id=pedido_id,
        usuario_id=None if usuario.role == "admin" else usuario.id,
    )


@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoRead,
)
def cambiar_estado(
    pedido_id: int,
    datos: CambioEstado,
    admin: AdminUser,
):
    service = PedidoService()

    return service.cambiar_estado(
        pedido_id=pedido_id,
        datos=datos,
    )
