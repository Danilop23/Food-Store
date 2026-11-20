# Food Store – Sistema de gestión de pedidos

**Trabajo Práctico Integrador – Programación IV**

Aplicación web para la gestión de un negocio gastronómico. Permite a los clientes consultar productos, gestionar un carrito y realizar pedidos, mientras que los administradores pueden gestionar productos, categorías, usuarios y pedidos desde un panel de administración.

## Tecnologías utilizadas

### Backend
- Python 3.12
- FastAPI
- SQLModel
- PostgreSQL
- Pydantic Settings
- JWT para autenticación
- Cookies HttpOnly para gestionar la sesión

### Frontend
- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- TanStack Query
- TanStack Form
- TanStack Table
- Zustand
- Axios
- React Router

## Funcionalidades principales

### Cliente
- Registro e inicio de sesión.
- Consulta del catálogo de productos.
- Búsqueda y filtrado por categorías.
- Paginación de productos.
- Carrito de compras persistente.
- Realización de pedidos.
- Consulta del historial y detalle de pedidos.
- Cancelación de pedidos pendientes.

### Administrador
- Panel de administración con indicadores.
- Gestión de productos y categorías.
- Administración de precios y stock.
- Gestión de usuarios.
- Consulta y actualización de pedidos.
- Control de estados de los pedidos.

## Arquitectura y desarrollo

El proyecto está organizado en dos aplicaciones independientes: un backend desarrollado con FastAPI y un frontend desarrollado con React y TypeScript.

En el backend se implementó una arquitectura modular y por capas, utilizando patrones como Repository y Unit of Work para organizar el acceso a datos y gestionar las operaciones transaccionales.

Se incorporaron autenticación mediante JWT, cookies HttpOnly y control de acceso basado en roles.

En el frontend se utilizaron TanStack Query para la gestión del estado del servidor, TanStack Form para los formularios, TanStack Table para las tablas administrativas y Zustand para el estado global de la aplicación.

Uno de los aspectos centrales del desarrollo fue la gestión de pedidos y el control de stock, contemplando tanto el descuento de productos al realizar una compra como la restitución de unidades cuando se cancela un pedido.

## Instalación y ejecución

### Requisitos
- Python 3.12 o compatible.
- Node.js 22 o superior.
- PostgreSQL.
- npm.

### Backend

Desde la carpeta `backend`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Crear el archivo `.env` tomando como referencia `.env.example` y configurar la conexión a PostgreSQL y la clave secreta.

Crear la base de datos `food_store` y ejecutar:

```powershell
python -m app.db.seed
uvicorn main:app --reload
```

La API estará disponible en:

http://127.0.0.1:8000

Documentación Swagger:

http://127.0.0.1:8000/docs

### Frontend

Desde la carpeta `frontend`:

```powershell
npm install
```

Crear el archivo `.env` tomando como referencia `.env.example`.

Luego ejecutar:

```powershell
npm run dev
```

La aplicación estará disponible en:

http://localhost:5173

Para generar la versión de producción:

```powershell
npm run build
```

## Acceso de administrador

El Seed crea inicialmente el siguiente usuario administrador, siempre que todavía no exista:

- **Usuario:** `admin`
- **Contraseña:** `Admin1234!`

## Información del proyecto

**Desarrollado por:** Danilo Peirano

**Asignatura:** Programación IV

**Institución:** Universidad Tecnológica Nacional (UTN)

**Repositorio:** https://github.com/Danilop23/Food-Store

**Video de presentación:** https://drive.google.com/file/d/1U_TQAeTktq9MC2uEHGSctMuleWK08aGh/view?usp=sharing