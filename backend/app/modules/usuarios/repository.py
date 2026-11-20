from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session):
        super().__init__(session, Usuario)

    def get_by_username(self, username: str) -> Usuario | None:
        return self.get_by_field("username", username)

    def get_by_email(self, email: str) -> Usuario | None:
        return self.get_by_field("email", email)