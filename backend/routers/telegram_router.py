import json
import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.database import get_db
from backend.models.sos_report import SOSReport
from backend.services.ai_parser import parse_sos_message
from backend.services.connection_manager import manager

logger = logging.getLogger("FloodAction.TelegramWebhook")
router = APIRouter(prefix="/api/webhook", tags=["Telegram Webhook"])

@router.post("/telegram")
async def telegram_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Receives incoming updates from Telegram Bot Webhook.
    Extracts text, parses via LLM parser, persists to database,
    and broadcasts instant WebSocket event to frontend command center.
    """
    try:
        data = await request.json()
    except Exception as e:
        logger.error(f"Failed to parse telegram JSON: {e}")
        return {"status": "ignored", "reason": "invalid_json"}

    message_obj = data.get("message") or data.get("channel_post") or {}
    text = message_obj.get("text", "").strip()
    
    if not text:
        return {"status": "ignored", "reason": "no_text_content"}

    # Extract sender information
    sender = message_obj.get("from", {})
    username = sender.get("username") or sender.get("first_name") or f"tg_user_{sender.get('id', 'unknown')}"
    chat_id = str(message_obj.get("chat", {}).get("id", ""))

    logger.info(f"Received Telegram SOS from @{username}: '{text}'")

    # Pass text through AI Parser (Bangla / Banglish / English)
    parsed = await parse_sos_message(text)

    # Save to database
    report = SOSReport(
        raw_message=text,
        source="TELEGRAM",
        sender_info=f"@{username} (ID: {chat_id})",
        location=parsed.get("location", "Unknown Location"),
        district=parsed.get("district", "Feni"),
        people_count=parsed.get("people_count", 1),
        critical_needs=json.dumps(parsed.get("critical_needs", ["rescue_boat"])),
        severity_score=parsed.get("severity_score", 3),
        priority_level=parsed.get("priority_level", "MEDIUM"),
        lat=parsed.get("lat", 23.0159),
        lng=parsed.get("lng", 91.3976),
        status="PENDING"
    )

    db.add(report)
    await db.commit()
    await db.refresh(report)

    report_dict = report.to_dict()

    # Instant broadcast to frontend via WebSocket
    await manager.broadcast({
        "event": "NEW_SOS_REPORT",
        "data": report_dict,
        "message": f"🚨 [TELEGRAM SOS] @{username} in {report.location}: {report.people_count} people, {report.priority_level} priority"
    })

    return {
        "status": "success",
        "report_id": report.id,
        "parsed_entities": parsed,
        "reply": f"SOS received and logged for {report.location}. Rescue coordinates dispatched to FloodAction command."
    }
