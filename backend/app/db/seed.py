
from sqlmodel import Session, select

from app.core.database import engine
from app.core.security import hash_password
from app.db import Categoria, Producto, Usuario


def seed_database():
    with Session(engine) as session:
        # ADMINISTRADOR
        admin = session.exec(
            select(Usuario).where(Usuario.username == "admin")
        ).first()

        if admin is None:
            admin = Usuario(
                username="admin",
                full_name="Administrador",
                email="admin@foodstore.com",
                hashed_password=hash_password("Admin1234!"),
                role="admin",
                disabled=False,
            )
            session.add(admin)
            print("Administrador creado.")
        else:
            print("El administrador ya existe.")

        # CATEGORÍAS
        categorias_iniciales = [
            {
                "nombre": "Hamburguesas",
                "descripcion": "Hamburguesas y combos",
            },
            {
                "nombre": "Pizzas",
                "descripcion": "Pizzas artesanales",
            },
            {
                "nombre": "Bebidas",
                "descripcion": "Bebidas frías y calientes",
            },
        ]

        categorias_creadas = {}

        for datos in categorias_iniciales:
            categoria = session.exec(
                select(Categoria).where(
                    Categoria.nombre == datos["nombre"]
                )
            ).first()

            if categoria is None:
                categoria = Categoria(**datos)
                session.add(categoria)
                session.flush()
                print(f"Categoría creada: {categoria.nombre}")
            else:
                print(f"Categoría existente: {categoria.nombre}")

            categorias_creadas[datos["nombre"]] = categoria

        # PRODUCTOS
        productos_iniciales = [
            {
                "nombre": "Hamburguesa Clásica",
                "descripcion": "Hamburguesa con carne, lechuga y tomate",
                "precio_base": 8500,
                "stock": 30,
                "categoria": "Hamburguesas",
            },
            {
                "nombre": "Hamburguesa Doble",
                "descripcion": "Doble carne y queso cheddar",
                "precio_base": 10500,
                "stock": 20,
                "categoria": "Hamburguesas",
            },
            {
                "nombre": "Hamburguesa Completa",
                "descripcion": "Carne, jamón, queso, huevo y vegetales",
                "precio_base": 11500,
                "stock": 15,
                "categoria": "Hamburguesas",
            },
            {
                "nombre": "Pizza Muzzarella",
                "descripcion": "Pizza clásica de muzzarella",
                "precio_base": 12000,
                "stock": 20,
                "categoria": "Pizzas",
            },
            {
                "nombre": "Pizza Napolitana",
                "descripcion": "Muzzarella, tomate y ajo",
                "precio_base": 14000,
                "stock": 15,
                "categoria": "Pizzas",
            },
            {
                "nombre": "Pizza Especial",
                "descripcion": "Muzzarella, jamón y morrones",
                "precio_base": 15500,
                "stock": 12,
                "categoria": "Pizzas",
            },
            {
                "nombre": "Gaseosa Cola",
                "descripcion": "Gaseosa cola de 1.5 litros",
                "precio_base": 3500,
                "stock": 50,
                "categoria": "Bebidas",
            },
            {
                "nombre": "Agua Mineral",
                "descripcion": "Agua mineral de 500 ml",
                "precio_base": 1800,
                "stock": 40,
                "categoria": "Bebidas",
            },
        ]

        for datos in productos_iniciales:
            producto = session.exec(
                select(Producto).where(
                    Producto.nombre == datos["nombre"]
                )
            ).first()

            if producto is not None:
                print(f"Producto existente: {producto.nombre}")
                continue

            categoria = categorias_creadas[datos["categoria"]]

            producto = Producto(
                categoria_id=categoria.id,
                nombre=datos["nombre"],
                descripcion=datos["descripcion"],
                precio_base=datos["precio_base"],
                stock=datos["stock"],
                disponible=True,
                activo=True,
            )

            session.add(producto)
            print(f"Producto creado: {producto.nombre}")

        session.commit()

    print("\nCARGA INICIAL FINALIZADA CORRECTAMENTE.")


if __name__ == "__main__":
    seed_database()
