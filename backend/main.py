
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables

# Importamos todos los modelos para registrar sus tablas.
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.pedidos.models import Pedido
from app.modules.pedidos.detalle_models import DetallePedido

# Importamos los routers.
from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as usuarios_router
from app.modules.categorias.router import router as categorias_router
from app.modules.productos.router import router as productos_router
from app.modules.pedidos.router import router as pedidos_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="API para la gestión de pedidos de Food Store",
    version="1.0.0",
    lifespan=lifespan,
)


# Configuración de CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Registro de routers.
app.include_router(
    auth_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    usuarios_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    categorias_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    productos_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    pedidos_router,
    prefix=settings.API_V1_PREFIX,
)


@app.get("/", tags=["General"])
def inicio():
    return {
        "mensaje": "Bienvenido a Food Store API",
        "documentacion": "/docs",
        "version": "1.0.0",
    }


@app.get("/health", tags=["General"])
def health():
    return {
        "status": "ok",
        "application": settings.APP_NAME,
    }
