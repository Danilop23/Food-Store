
from typing import Annotated

from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import get_current_active_user
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic


router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"],
)

SessionDep = Annotated[Session, Depends(get_session)]


@router.post("/login")
def login(
    response: Response,
    form_data: Annotated[
        OAuth2PasswordRequestForm,
        Depends(),
    ],
    session: SessionDep,
):
    service = AuthService(session)
    return service.login(form_data, response)


@router.post("/logout")
def logout(response: Response):
    service = AuthService.__new__(AuthService)
    return service.logout(response)


@router.get(
    "/me",
    response_model=UserPublic,
)
def obtener_usuario_actual(
    current_user: Annotated[
        Usuario,
        Depends(get_current_active_user),
    ],
):
    return UserPublic.model_validate(current_user)
