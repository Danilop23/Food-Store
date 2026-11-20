
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.usuarios.models import Usuario
    from app.modules.pedidos.detalle_models import DetallePedido


class Pedido(SQLModel, table=True):
    __tablename__ = "pedidos"

    id: int | None = Field(default=None, primary_key=True)

    usuario_id: int = Field(
        foreign_key="usuarios.id",
        index=True,
    )

    estado: str = Field(default="PENDIENTE", max_length=30)

    forma_pago: str

    direccion_entrega: str = Field(max_length=200)

    notas: str | None = Field(default=None)

    total: float = Field(default=0.0)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={
            "onupdate": lambda: datetime.now(timezone.utc)
        },
    )

    usuario: "Usuario" = Relationship(
        back_populates="pedidos"
    )

    items: list["DetallePedido"] = Relationship(
        back_populates="pedido"
    )
