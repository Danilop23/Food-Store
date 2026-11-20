
from sqlmodel import func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session):
        super().__init__(session, Producto)

    def search(
        self,
        nombre: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
        pagina: int = 1,
        limite: int = 10,
    ) -> tuple[list[Producto], int]:
        statement = select(Producto).where(
            Producto.activo.is_(True)
        )

        if nombre:
            statement = statement.where(
                Producto.nombre.ilike(f"%{nombre}%")
            )

        if categoria_id is not None:
            statement = statement.where(
                Producto.categoria_id == categoria_id
            )

        if disponible is not None:
            statement = statement.where(
                Producto.disponible == disponible
            )

        total_statement = select(func.count()).select_from(
            statement.subquery()
        )

        total = self.session.exec(total_statement).one()

        offset = (pagina - 1) * limite

        paginated_statement = (
            statement
            .offset(offset)
            .limit(limite)
        )

        productos = list(
            self.session.exec(paginated_statement).all()
        )

        return productos, total
