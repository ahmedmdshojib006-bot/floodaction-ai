import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.services.connection_manager import manager

logger = logging.getLogger("FloodAction.WebSocketRouter")
router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/live-feed")
async def websocket_live_feed(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Initial greeting and handshake
        await websocket.send_json({
            "event": "CONNECTED",
            "message": "Connected to FloodAction Live Tactical & SOS Dispatch Stream."
        })
        while True:
            data = await websocket.receive_text()
            # Handle client heartbeats or ping
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("Client disconnected normally from /ws/live-feed")
    except Exception as e:
        manager.disconnect(websocket)
        logger.warning(f"WebSocket connection terminated with error: {e}")
