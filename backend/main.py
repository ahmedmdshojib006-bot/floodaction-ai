import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.models.database import init_db
from backend.seed import seed_database
from backend.routers.sos_router import router as sos_router
from backend.routers.risk_router import router as risk_router
from backend.routers.telegram_router import router as telegram_router
from backend.routers.websocket_router import router as websocket_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("FloodAction.App")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing FloodAction SQLite database and AI risk model...")
    await init_db()
    # Auto-seed database with realistic flood sample records if empty
    await seed_database()
    logger.info("Backend engines initialized and ready.")

    bot_app = None
    if os.getenv("RUN_TELEGRAM_IN_LIFESPAN", "false").lower() in ("true", "1", "yes"):
        try:
            from backend.services.telegram_service import build_telegram_application
            logger.info("Starting Telegram Bot asynchronously within FastAPI lifespan...")
            bot_app = build_telegram_application()
            await bot_app.initialize()
            await bot_app.start()
            await bot_app.updater.start_polling(drop_pending_updates=True)
            logger.info("Telegram Bot is running in lifespan background.")
        except Exception as e:
            logger.error(f"Failed to start Telegram Bot in lifespan: {e}")

    yield

    if bot_app is not None:
        try:
            logger.info("Stopping Telegram Bot polling...")
            await bot_app.updater.stop()
            await bot_app.stop()
            await bot_app.shutdown()
        except Exception as e:
            logger.error(f"Error shutting down Telegram Bot: {e}")

    logger.info("Shutting down FloodAction backend services.")

app = FastAPI(
    title="FloodAction AI API",
    description="AI-Powered Constrained Resource Dispatch, LLM SOS Parser & ML Flood Risk Early Warning Engine",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend (Vite port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(sos_router)
app.include_router(risk_router)
app.include_router(telegram_router)
app.include_router(websocket_router)

@app.get("/")
async def root():
    return {
        "project": "FloodAction AI Early Warning & Tactical Dispatch",
        "track": "ClimateSphere AI - Climate Shield",
        "status": "ONLINE",
        "docs_url": "/docs",
        "ws_feed": "/ws/live-feed"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "sqlite_async",
        "llm_parser": "gemini-2.5-flash / NLP-Heuristic",
        "risk_model": "RandomForest_Hydrological_Pipeline",
        "websocket": "active"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
