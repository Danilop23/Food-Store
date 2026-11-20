
from sqlmodel import func, select
from sqlalchemy.orm import selectinload

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session):
        super().__init__(session, Pedido)

    def list_by_usuario(
        self,
        usuario_id: int,
    ) -> list[Pedido]:

        statement = (
            select(Pedido)
            .where(Pedido.usuario_id == usuario_id)
            .order_by(Pedido.created_at.desc())
        )

        return list(self.session.exec(statement).all())

    def list_paginated(
        self,
        pagina: int = 1,
        limite: int = 10,
        estado: str | None = None,
    ) -> tuple[list[Pedido], int]:

        statement = select(Pedido)

        if estado:
            statement = statement.where(Pedido.estado == estado)

        total_statement = (
            select(func.count())
            .select_from(statement.subquery())
        )

        total = self.session.exec(total_statement).one()

        offset = (pagina - 1) * limite

        paginated_statement = (
            statement
            .options(selectinload(Pedido.items))
            .order_by(Pedido.created_at.desc(), Pedido.id.desc())
            .offset(offset)
            .limit(limite)
        )

        pedidos = list(
            self.session.exec(paginated_statement).all()
        )

        return pedidos, total

    def count_by_estado(self, estado: str) -> int:

        statement = (
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.estado == estado)
        )

        return self.session.exec(statement).one()
