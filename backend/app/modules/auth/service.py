
from datetime import timedelta

from fastapi import HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.security import (
    create_access_token,
    verify_password,
)
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository


class AuthService:
    def __init__(self, session):
        self.session = session
        self.usuarios = UsuarioRepository(session)

    def login(
        self,
        form_data: OAuth2PasswordRequestForm,
        response: Response,
    ) -> dict:
        usuario = self.usuarios.get_by_username(form_data.username)

        if usuario is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not verify_password(
            form_data.password,
            usuario.hashed_password,
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if usuario.disabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La cuenta se encuentra desactivada",
            )

        access_token = create_access_token(
            data={"sub": str(usuario.id)},
            expires_delta=timedelta(minutes=30),
        )

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=1800,
            path="/",
        )

        return {"message": "Inicio de sesión exitoso"}

    def logout(self, response: Response) -> dict:
        response.delete_cookie(
            key="access_token",
            path="/",
        )

        return {"message": "Sesión cerrada correctamente"}

    def obtener_usuario_actual(self, usuario: Usuario) -> Usuario:
        return usuario
