
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.modules.pedidos.detalle_models import DetallePedido
from app.modules.pedidos.models import Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork


class PedidoService:
    def __init__(self, uow_factory=PedidoUnitOfWork):
        self.uow_factory = uow_factory

    def _restaurar_stock(self, uow, pedido: Pedido) -> None:
        for detalle in pedido.items:
            producto = uow.productos.get_by_id(detalle.producto_id)

            if producto is not None:
                producto.stock += detalle.cantidad
                producto.disponible = (
                    producto.activo and producto.stock > 0
                )

    def crear_pedido(
        self,
        usuario_id: int,
        datos: PedidoCreate,
    ) -> PedidoRead:
        with self.uow_factory() as uow:
            detalles = []
            total = 0.0

            for item in datos.items:
                producto = uow.productos.get_by_id(item.producto_id)

                if (
                    producto is None
                    or not producto.activo
                    or not producto.disponible
                ):
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Producto {item.producto_id} no disponible",
                    )

                if producto.stock < item.cantidad:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Stock insuficiente para {producto.nombre}",
                    )

                subtotal = producto.precio_base * item.cantidad
                total += subtotal

                detalles.append(
                    {
                        "producto": producto,
                        "cantidad": item.cantidad,
                        "subtotal": subtotal,
                        "precio_unitario": producto.precio_base,
                        "nombre_producto": producto.nombre,
                    }
                )

            pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=datos.forma_pago,
                direccion_entrega=datos.direccion_entrega,
                notas=datos.notas,
                total=total,
            )

            uow.session.add(pedido)
            uow.session.flush()

            for item in detalles:
                producto = item["producto"]
                producto.stock -= item["cantidad"]

                if producto.stock == 0:
                    producto.disponible = False

                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item["cantidad"],
                    nombre_producto=item["nombre_producto"],
                    precio_unitario=item["precio_unitario"],
                    subtotal=item["subtotal"],
                )

                uow.session.add(detalle)

            uow.session.flush()

            pedido = uow.session.exec(
                select(Pedido)
                .where(Pedido.id == pedido.id)
                .options(selectinload(Pedido.items))
            ).first()

            return PedidoRead.model_validate(pedido)

    def listar_pedidos_usuario(
        self,
        usuario_id: int,
    ) -> list[PedidoRead]:
        with self.uow_factory() as uow:
            pedidos = uow.pedidos.list_by_usuario(usuario_id)

            return [
                PedidoRead.model_validate(pedido)
                for pedido in pedidos
            ]

    def listar_pedidos(
        self,
        pagina: int = 1,
        limite: int = 10,
        estado: str | None = None,
    ) -> PedidosPaginados:
        if pagina < 1 or limite < 1:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="La página y el límite deben ser mayores que cero",
            )

        with self.uow_factory() as uow:
            pedidos, total = uow.pedidos.list_paginated(
                pagina=pagina,
                limite=limite,
                estado=estado,
            )

            return PedidosPaginados(
                total=total,
                items=[
                    PedidoRead.model_validate(pedido)
                    for pedido in pedidos
                ],
            )

    def obtener_pedido(self, pedido_id: int) -> PedidoRead:
        with self.uow_factory() as uow:
            pedido = uow.session.exec(
                select(Pedido)
                .where(Pedido.id == pedido_id)
                .options(selectinload(Pedido.items))
            ).first()

            if pedido is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Pedido no encontrado",
                )

            return PedidoRead.model_validate(pedido)

    def cancelar_pedido(
        self,
        pedido_id: int,
        usuario_id: int | None = None,
    ) -> PedidoRead:
        with self.uow_factory() as uow:
            pedido = uow.session.exec(
                select(Pedido)
                .where(Pedido.id == pedido_id)
                .options(selectinload(Pedido.items))
            ).first()

            if pedido is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Pedido no encontrado",
                )

            if usuario_id is not None and pedido.usuario_id != usuario_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No tenés permiso para cancelar este pedido",
                )

            if pedido.estado in ("ENTREGADO", "CANCELADO"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No se puede cancelar este pedido",
                )

            self._restaurar_stock(uow, pedido)

            pedido.estado = "CANCELADO"

            uow.session.add(pedido)
            uow.session.flush()

            return PedidoRead.model_validate(pedido)

    def cambiar_estado(
        self,
        pedido_id: int,
        datos: CambioEstado,
    ) -> PedidoRead:
        with self.uow_factory() as uow:
            pedido = uow.session.exec(
                select(Pedido)
                .where(Pedido.id == pedido_id)
                .options(selectinload(Pedido.items))
            ).first()

            if pedido is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Pedido no encontrado",
                )

            if pedido.estado in ("ENTREGADO", "CANCELADO"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El pedido ya se encuentra finalizado",
                )

            if datos.estado == "CANCELADO":
                self._restaurar_stock(uow, pedido)

            pedido.estado = datos.estado

            uow.session.add(pedido)
            uow.session.flush()

            return PedidoRead.model_validate(pedido)

    def obtener_resumen(self) -> ResumenPedidos:
        with self.uow_factory() as uow:
            pedidos = uow.pedidos.get_all()

            hoy = date.today()

            return ResumenPedidos(
                pendientes=sum(
                    1 for pedido in pedidos
                    if pedido.estado == "PENDIENTE"
                ),
                en_preparacion=sum(
                    1 for pedido in pedidos
                    if pedido.estado == "EN_PREPARACION"
                ),
                entregados=sum(
                    1 for pedido in pedidos
                    if pedido.estado == "ENTREGADO"
                ),
                cancelados=sum(
                    1 for pedido in pedidos
                    if pedido.estado == "CANCELADO"
                ),
                pedidos_hoy=sum(
                    1 for pedido in pedidos
                    if pedido.created_at.date() == hoy
                ),
                ingresos_entregados=sum(
                    pedido.total for pedido in pedidos
                    if pedido.estado == "ENTREGADO"
                ),
            )
