
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import get_current_user_id
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioService


router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"],
)

SessionDep = Annotated[Session, Depends(get_session)]


@router.post(
    "/registro",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
)
def registrar_usuario(
    datos: UserCreate,
    session: SessionDep,
):
    service = UsuarioService(session)

    return service.registrar_usuario(datos)


@router.get(
    "/",
    response_model=list[UserPublic],
)
def listar_usuarios(
    session: SessionDep,
    usuario_id: Annotated[int, Depends(get_current_user_id)],
):
    usuario_actual = session.get(Usuario, usuario_id)

    if usuario_actual is None or usuario_actual.disabled:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no autenticado",
        )

    if usuario_actual.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tenés permisos para realizar esta operación",
        )

    service = UsuarioService(session)

    return service.listar_usuarios()


@router.get(
    "/{usuario_id}",
    response_model=UserPublic,
)
def obtener_usuario(
    usuario_id: int,
    session: SessionDep,
    usuario_actual_id: Annotated[
        int,
        Depends(get_current_user_id),
    ],
):
    usuario_actual = session.get(Usuario, usuario_actual_id)

    if usuario_actual is None or usuario_actual.disabled:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no autenticado",
        )

    if usuario_actual.role != "admin" and usuario_actual.id != usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tenés permisos para consultar este usuario",
        )

    service = UsuarioService(session)

    return service.obtener_usuario(usuario_id)


@router.patch(
    "/{usuario_id}/estado",
    response_model=UserPublic,
)
def cambiar_estado_usuario(
    usuario_id: int,
    desactivado: bool,
    session: SessionDep,
    usuario_actual_id: Annotated[
        int,
        Depends(get_current_user_id),
    ],
):
    usuario_actual = session.get(Usuario, usuario_actual_id)

    if usuario_actual is None or usuario_actual.disabled:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no autenticado",
        )

    if usuario_actual.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo un administrador puede modificar usuarios",
        )

    service = UsuarioService(session)

    return service.cambiar_estado(usuario_id, desactivado)
