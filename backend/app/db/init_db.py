
from sqlalchemy.orm import configure_mappers

from sqlmodel import SQLModel

from app.core.database import engine
from app.db import (
    Usuario,
    Categoria,
    Producto,
    Pedido,
    DetallePedido,
)


def init_db():
    configure_mappers()

    SQLModel.metadata.create_all(engine)

    print("BASE DE DATOS INICIALIZADA CORRECTAMENTE")
    print("TABLAS CREADAS:")
    
    for tabla in SQLModel.metadata.sorted_tables:
        print(f"- {tabla.name}")


if __name__ == "__main__":
    init_db()
