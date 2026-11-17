from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.models.database import get_db
from backend.models.flood_zone import FloodZone, RiskPredictRequest, RiskPredictResponse
from backend.models.sos_report import SOSReport
from backend.services.risk_model import risk_engine
from backend.services.connection_manager import manager

router = APIRouter(prefix="/api/risk", tags=["Flood Risk ML"])

@router.post("/predict", response_model=RiskPredictResponse)
async def predict_flood_risk(payload: RiskPredictRequest):
    pred = risk_engine.predict(
        rainfall_48h_mm=payload.upstream_rainfall_48h_mm,
        river_water_level_m=payload.river_water_level_m,
        elevation_m=payload.elevation_m,
        danger_threshold_m=payload.danger_level_threshold_m
    )
    return RiskPredictResponse(**pred)

@router.get("/zones")
async def get_monitored_flood_zones(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FloodZone))
    zones = result.scalars().all()

    # Dynamic count of active SOS in each district/zone
    sos_res = await db.execute(select(SOSReport).where(SOSReport.status != "RESOLVED"))
    active_reports = sos_res.scalars().all()

    zone_list = []
    for z in zones:
        z_dict = z.to_dict()
        # Count matching active SOS
        matching_sos = sum(1 for s in active_reports if s.district.lower() == z.district.lower())
        z_dict["active_sos_count"] = matching_sos
        zone_list.append(z_dict)

    return zone_list

@router.post("/recalculate")
async def recalculate_all_zones(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FloodZone))
    zones = result.scalars().all()

    updated_zones = []
    for z in zones:
        pred = risk_engine.predict(
            rainfall_48h_mm=z.upstream_rainfall_48h_mm,
            river_water_level_m=z.river_water_level_m,
            elevation_m=z.elevation_m,
            danger_threshold_m=z.danger_level_threshold_m
        )
        z.flood_risk_level = pred["flood_risk_level"]
        z.risk_score = pred["risk_score"]
        z.predicted_inundation_hours = pred["predicted_inundation_hours"]
        updated_zones.append(z.to_dict())

    await db.commit()

    # Broadcast updated risk levels to frontend
    await manager.broadcast({
        "event": "FLOOD_RISK_UPDATED",
        "data": updated_zones,
        "message": "Regional flood risk scores updated from ML Hydrological Pipeline."
    })

    return {"status": "success", "zones": updated_zones}
