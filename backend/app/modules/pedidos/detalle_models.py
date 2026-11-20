
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido
    from app.modules.productos.models import Producto


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalle_pedidos"

    id: int | None = Field(default=None, primary_key=True)

    pedido_id: int = Field(
        foreign_key="pedidos.id",
        index=True,
    )

    producto_id: int = Field(
        foreign_key="productos.id",
        index=True,
    )

    cantidad: int

    nombre_producto: str

    precio_unitario: float

    subtotal: float

    pedido: "Pedido" = Relationship(
        back_populates="items"
    )

    producto: "Producto" = Relationship(
        back_populates="detalles"
    )
