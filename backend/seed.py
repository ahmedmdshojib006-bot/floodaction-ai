import asyncio
import json
import logging
from sqlalchemy import select

from backend.models.database import init_db, AsyncSessionLocal
from backend.models.sos_report import SOSReport
from backend.models.flood_zone import FloodZone
from backend.services.ai_parser import parse_sos_message
from backend.services.risk_model import risk_engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FloodAction.Seed")

SAMPLE_SOS_MESSAGES = [
    {
        "text": "ফেনী পরশুরাম ৩ তলায় ১০ জন আটকা, বোট লাগবে দ্রুত। ২ জন বৃদ্ধ ও ১ জন গর্ভবতী মহিলা আছেন!",
        "source": "TELEGRAM",
        "sender": "@parshuram_relief_vol"
    },
    {
        "text": "Noakhali Companiganj Char Elahi te 20 jon pani bondi. 4 tola school chade ashi, shukna khabar ar drinking water nai please help!",
        "source": "WEB",
        "sender": "Companiganj Rescue Volunteer"
    },
    {
        "text": "বুড়িচং গোমতী নদীর বাঁধে ফাটল ধরেছে! ১৫ জন পরিবার সহ পানিবন্দি, লাইফ জ্যাকেট ও দ্রুত স্পিড বোট দরকার!",
        "source": "TELEGRAM",
        "sender": "@burichang_crisis"
    },
    {
        "text": "Sylhet Gowainghat Jaflong road dube geche, 8 people trapped inside semi-pucca house, infant fever emergency doctor needed.",
        "source": "WEB",
        "sender": "Gowainghat Community Health"
    },
    {
        "text": "ছাগলনাইয়া শুভপুর ব্রীজের কাছে ঘরের চালে ৫ জন, পানি বাড়ছে প্রতি ঘণ্টায়, দ্রুত উদ্ধার করুন বোট পাঠান!",
        "source": "SMS",
        "sender": "+8801812345678"
    }
]

SAMPLE_FLOOD_ZONES = [
    {
        "zone_name": "Feni Muhuri Basin (Parshuram & Fulgazi)",
        "district": "Feni",
        "lat": 23.1800,
        "lng": 91.4400,
        "radius_km": 14.0,
        "elevation_m": 6.5,
        "upstream_rainfall_48h_mm": 295.0,
        "river_water_level_m": 15.8,
        "danger_level_threshold_m": 13.0
    },
    {
        "zone_name": "Comilla Burichang Gumti River Reach",
        "district": "Comilla",
        "lat": 23.5500,
        "lng": 91.1300,
        "radius_km": 12.0,
        "elevation_m": 9.0,
        "upstream_rainfall_48h_mm": 185.0,
        "river_water_level_m": 14.2,
        "danger_level_threshold_m": 13.0
    },
    {
        "zone_name": "Sylhet Surma-Kushiyara & Gowainghat Delta",
        "district": "Sylhet",
        "lat": 25.0833,
        "lng": 91.9667,
        "radius_km": 18.0,
        "elevation_m": 5.2,
        "upstream_rainfall_48h_mm": 310.0,
        "river_water_level_m": 16.5,
        "danger_level_threshold_m": 13.5
    }
]

async def seed_database():
    await init_db()
    async with AsyncSessionLocal() as session:
        # Check if already seeded
        res_sos = await session.execute(select(SOSReport))
        existing_sos = res_sos.scalars().all()

        res_zones = await session.execute(select(FloodZone))
        existing_zones = res_zones.scalars().all()

        # Seed Flood Zones
        if not existing_zones:
            logger.info("Seeding 3 realistic flood zones with ML Risk Model...")
            for z_data in SAMPLE_FLOOD_ZONES:
                pred = risk_engine.predict(
                    rainfall_48h_mm=z_data["upstream_rainfall_48h_mm"],
                    river_water_level_m=z_data["river_water_level_m"],
                    elevation_m=z_data["elevation_m"],
                    danger_threshold_m=z_data["danger_level_threshold_m"]
                )

                zone = FloodZone(
                    zone_name=z_data["zone_name"],
                    district=z_data["district"],
                    lat=z_data["lat"],
                    lng=z_data["lng"],
                    radius_km=z_data["radius_km"],
                    elevation_m=z_data["elevation_m"],
                    upstream_rainfall_48h_mm=z_data["upstream_rainfall_48h_mm"],
                    river_water_level_m=z_data["river_water_level_m"],
                    danger_level_threshold_m=z_data["danger_level_threshold_m"],
                    flood_risk_level=pred["flood_risk_level"],
                    risk_score=pred["risk_score"],
                    predicted_inundation_hours=pred["predicted_inundation_hours"],
                    active_sos_count=0
                )
                session.add(zone)
            await session.commit()
            logger.info("Flood zones successfully seeded.")
        else:
            logger.info(f"Flood zones already present ({len(existing_zones)} zones).")

        # Seed SOS Reports
        if not existing_sos:
            logger.info("Seeding 5 realistic Bangla/Banglish SOS reports...")
            for item in SAMPLE_SOS_MESSAGES:
                parsed = await parse_sos_message(item["text"])
                report = SOSReport(
                    raw_message=item["text"],
                    source=item["source"],
                    sender_info=item["sender"],
                    location=parsed.get("location", "Feni, Bangladesh"),
                    district=parsed.get("district", "Feni"),
                    people_count=parsed.get("people_count", 5),
                    critical_needs=json.dumps(parsed.get("critical_needs", ["rescue_boat"])),
                    severity_score=parsed.get("severity_score", 4),
                    priority_level=parsed.get("priority_level", "HIGH"),
                    lat=parsed.get("lat", 23.0159),
                    lng=parsed.get("lng", 91.3976),
                    status="PENDING"
                )
                session.add(report)
            await session.commit()
            logger.info("5 sample SOS reports successfully seeded.")
        else:
            logger.info(f"SOS reports already present ({len(existing_sos)} reports).")

if __name__ == "__main__":
    asyncio.run(seed_database())
