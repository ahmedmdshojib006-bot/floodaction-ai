from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Column, Integer, String, Float, DateTime
from pydantic import BaseModel, Field
from backend.models.database import Base

class FloodZone(Base):
    __tablename__ = "flood_zones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    zone_name = Column(String(150), nullable=False)
    district = Column(String(100), index=True, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    radius_km = Column(Float, default=12.0)
    
    # Hydraulic & Terrain Factors
    elevation_m = Column(Float, default=8.0)
    upstream_rainfall_48h_mm = Column(Float, default=120.0)
    river_water_level_m = Column(Float, default=14.5)
    danger_level_threshold_m = Column(Float, default=13.0)
    
    # Model Outputs
    flood_risk_level = Column(String(30), default="MODERATE")  # LOW, MODERATE, SEVERE
    risk_score = Column(Float, default=55.0)  # 0 to 100
    predicted_inundation_hours = Column(Integer, default=12)
    active_sos_count = Column(Integer, default=0)
    
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "zone_name": self.zone_name,
            "district": self.district,
            "lat": self.lat,
            "lng": self.lng,
            "radius_km": self.radius_km,
            "elevation_m": self.elevation_m,
            "upstream_rainfall_48h_mm": self.upstream_rainfall_48h_mm,
            "river_water_level_m": self.river_water_level_m,
            "danger_level_threshold_m": self.danger_level_threshold_m,
            "flood_risk_level": self.flood_risk_level,
            "risk_score": self.risk_score,
            "predicted_inundation_hours": self.predicted_inundation_hours,
            "active_sos_count": self.active_sos_count,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

# --- Pydantic Schemas ---

class RiskPredictRequest(BaseModel):
    zone_name: Optional[str] = "Custom Zone"
    district: Optional[str] = "Feni"
    elevation_m: float = Field(..., ge=-5.0, le=200.0, description="Elevation in meters")
    upstream_rainfall_48h_mm: float = Field(..., ge=0.0, le=1000.0, description="Rainfall past 48h in mm")
    river_water_level_m: float = Field(..., ge=0.0, le=50.0, description="River water level in meters")
    danger_level_threshold_m: float = Field(default=13.0, ge=0.0, le=50.0, description="Danger level threshold in meters")

class RiskPredictResponse(BaseModel):
    flood_risk_level: str
    risk_score: float
    predicted_inundation_hours: int
    danger_margin_m: float
    summary: str

class FloodZoneResponse(BaseModel):
    id: int
    zone_name: str
    district: str
    lat: float
    lng: float
    radius_km: float
    elevation_m: float
    upstream_rainfall_48h_mm: float
    river_water_level_m: float
    danger_level_threshold_m: float
    flood_risk_level: str
    risk_score: float
    predicted_inundation_hours: int
    active_sos_count: int
    updated_at: Optional[str]
