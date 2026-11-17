import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, desc, func

from backend.models.database import get_db
from backend.models.sos_report import SOSReport, SOSCreateRequest, SOSStatusUpdate
from backend.services.ai_parser import parse_sos_message
from backend.services.connection_manager import manager

router = APIRouter(prefix="/api/sos", tags=["SOS Reports"])

@router.get("/list")
async def list_sos_reports(
    severity_score: Optional[int] = Query(None, ge=1, le=5),
    priority_level: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db)
):
    query = select(SOSReport).order_by(desc(SOSReport.created_at)).limit(limit)

    if severity_score is not None:
        query = query.where(SOSReport.severity_score == severity_score)
    if priority_level:
        query = query.where(SOSReport.priority_level == priority_level.upper())
    if district and district.lower() != "all":
        query = query.where(func.lower(SOSReport.district) == district.lower())
    if status and status.lower() != "all":
        query = query.where(SOSReport.status == status.upper())

    result = await db.execute(query)
    reports = result.scalars().all()
    return [r.to_dict() for r in reports]

@router.post("/submit")
async def submit_public_sos(
    payload: SOSCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="SOS message cannot be empty")

    # Run AI Parser (Gemini API with fallback heuristics)
    parsed = await parse_sos_message(payload.message.strip())

    report = SOSReport(
        raw_message=payload.message.strip(),
        source=payload.source or "WEB",
        sender_info=payload.sender_info,
        location=parsed.get("location", "Unknown Flood Zone"),
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

    # Broadcast event via WebSocket
    await manager.broadcast({
        "event": "NEW_SOS_REPORT",
        "data": report_dict,
        "message": f"New SOS Incident at {report.location} ({report.people_count} people, {report.priority_level} priority)"
    })

    return report_dict

@router.post("/parse")
async def parse_and_create_sos(
    payload: SOSCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Parses natural language emergency message (Bangla, Banglish, English),
    persists the SOS report, and triggers instant WebSocket broadcast.
    Used by Telegram Bot service and external integrations.
    """
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="SOS message cannot be empty")

    parsed = await parse_sos_message(payload.message.strip())

    report = SOSReport(
        raw_message=payload.message.strip(),
        source=payload.source or "TELEGRAM",
        sender_info=payload.sender_info,
        location=parsed.get("location", "Feni Sector, Bangladesh"),
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

    # Trigger live WebSocket broadcast to React Leaflet map
    await manager.broadcast({
        "event": "NEW_SOS_REPORT",
        "data": report_dict,
        "message": f"🚨 [TELEGRAM SOS] {report.location}: {report.people_count} people ({report.priority_level})"
    })

    return {
        "status": "success",
        "report_id": report.id,
        "location": report.location,
        "district": report.district,
        "people_count": report.people_count,
        "critical_needs": report_dict.get("critical_needs", []),
        "severity_score": report.severity_score,
        "priority_level": report.priority_level,
        "lat": report.lat,
        "lng": report.lng,
        "created_at": report_dict.get("created_at")
    }

@router.patch("/{report_id}/status")
async def update_sos_status(
    report_id: int,
    payload: SOSStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    query = select(SOSReport).where(SOSReport.id == report_id)
    result = await db.execute(query)
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(status_code=404, detail="SOS Report not found")

    report.status = payload.status
    await db.commit()
    await db.refresh(report)

    report_dict = report.to_dict()

    # Broadcast status change to connected clients
    await manager.broadcast({
        "event": "SOS_STATUS_UPDATED",
        "data": report_dict,
        "message": f"Report #{report.id} ({report.location}) status changed to {report.status}"
    })

    return report_dict

@router.get("/stats")
async def get_sos_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SOSReport))
    reports = result.scalars().all()

    total = len(reports)
    pending = sum(1 for r in reports if r.status == "PENDING")
    dispatched = sum(1 for r in reports if r.status == "DISPATCHED")
    resolved = sum(1 for r in reports if r.status == "RESOLVED")
    critical = sum(1 for r in reports if r.severity_score == 5)
    high = sum(1 for r in reports if r.severity_score == 4)
    total_people = sum(r.people_count for r in reports if r.status != "RESOLVED")

    return {
        "total_reports": total,
        "pending": pending,
        "dispatched": dispatched,
        "resolved": resolved,
        "critical_severity": critical,
        "high_severity": high,
        "total_people_at_risk": total_people
    }
