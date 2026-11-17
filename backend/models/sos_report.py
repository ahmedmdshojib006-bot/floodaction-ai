from datetime import datetime, timezone
import json
from typing import List, Optional
from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from pydantic import BaseModel, Field
from backend.models.database import Base

class SOSReport(Base):
    __tablename__ = "sos_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    raw_message = Column(Text, nullable=False)
    source = Column(String(50), default="WEB")  # WEB, TELEGRAM, SMS
    sender_info = Column(String(100), nullable=True)
    
    # AI Extracted Entities
    location = Column(String(255), nullable=False)
    district = Column(String(100), index=True, default="Unknown")
    people_count = Column(Integer, default=1)
    critical_needs = Column(Text, default="[]")  # JSON string of list
    severity_score = Column(Integer, index=True, default=3)  # 1-5
    priority_level = Column(String(20), index=True, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    
    # Operational Status
    status = Column(String(30), index=True, default="PENDING")  # PENDING, DISPATCHED, RESOLVED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        try:
            needs = json.loads(self.critical_needs) if self.critical_needs else []
        except Exception:
            needs = [self.critical_needs] if self.critical_needs else []
            
        return {
            "id": self.id,
            "raw_message": self.raw_message,
            "source": self.source,
            "sender_info": self.sender_info,
            "location": self.location,
            "district": self.district,
            "people_count": self.people_count,
            "critical_needs": needs,
            "severity_score": self.severity_score,
            "priority_level": self.priority_level,
            "lat": self.lat,
            "lng": self.lng,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

# --- Pydantic Schemas ---

class SOSCreateRequest(BaseModel):
    message: str = Field(..., description="Unstructured SOS text in Bangla, Banglish, or English")
    source: Optional[str] = "WEB"
    sender_info: Optional[str] = None

class SOSStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(PENDING|DISPATCHED|RESOLVED)$")

class SOSReportResponse(BaseModel):
    id: int
    raw_message: str
    source: str
    sender_info: Optional[str]
    location: str
    district: str
    people_count: int
    critical_needs: List[str]
    severity_score: int
    priority_level: str
    lat: float
    lng: float
    status: str
    created_at: Optional[str]
    updated_at: Optional[str]
