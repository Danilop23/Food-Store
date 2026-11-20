
from fastapi import HTTPException, status

from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository
from app.modules.usuarios.schemas import UserCreate, UserPublic


class UsuarioService:
    def __init__(self, session):
        self.session = session
        self.usuarios = UsuarioRepository(session)

    def registrar_usuario(self, datos: UserCreate) -> UserPublic:
        usuario_existente = self.usuarios.get_by_username(
            datos.username
        )

        if usuario_existente is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El nombre de usuario ya está registrado",
            )

        email_existente = self.usuarios.get_by_email(datos.email)

        if email_existente is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El correo electrónico ya está registrado",
            )

        usuario = Usuario(
            username=datos.username,
            full_name=datos.full_name,
            email=datos.email,
            hashed_password=hash_password(datos.password),
            role="user",
            disabled=False,
        )

        usuario = self.usuarios.add(usuario)

        return UserPublic.model_validate(usuario)

    def listar_usuarios(self) -> list[UserPublic]:
        usuarios = self.usuarios.get_all()

        return [
            UserPublic.model_validate(usuario)
            for usuario in usuarios
        ]

    def obtener_usuario(self, usuario_id: int) -> UserPublic:
        usuario = self.usuarios.get_by_id(usuario_id)

        if usuario is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado",
            )

        return UserPublic.model_validate(usuario)

    def cambiar_estado(
        self,
        usuario_id: int,
        desactivado: bool,
    ) -> UserPublic:
        usuario = self.usuarios.get_by_id(usuario_id)

        if usuario is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado",
            )

        usuario.disabled = desactivado

        self.usuarios.update(usuario)

        return UserPublic.model_validate(usuario)
