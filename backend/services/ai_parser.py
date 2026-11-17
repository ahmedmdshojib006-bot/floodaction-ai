import os
import re
import json
import logging
from typing import Dict, Any, List

logger = logging.getLogger("FloodAction.AIParser")

# Known geographic coordinates for Bangladesh flood vulnerable districts & upazilas
BANGLADESH_FLOOD_COORDINATES = {
    # Feni District
    "parshuram": {"district": "Feni", "lat": 23.2125, "lng": 91.4361},
    "fulgazi": {"district": "Feni", "lat": 23.1672, "lng": 91.4285},
    "chhagalnaiya": {"district": "Feni", "lat": 23.0361, "lng": 91.5186},
    "daganbhuiyan": {"district": "Feni", "lat": 22.9352, "lng": 91.3056},
    "sonagazi": {"district": "Feni", "lat": 22.8500, "lng": 91.3833},
    "feni": {"district": "Feni", "lat": 23.0159, "lng": 91.3976},
    "muhuri": {"district": "Feni", "lat": 23.1800, "lng": 91.4400},
    
    # Noakhali District
    "companiganj": {"district": "Noakhali", "lat": 22.8681, "lng": 91.2828},
    "senbagh": {"district": "Noakhali", "lat": 22.9861, "lng": 91.2333},
    "begumganj": {"district": "Noakhali", "lat": 22.9469, "lng": 91.1000},
    "kabirhat": {"district": "Noakhali", "lat": 22.8417, "lng": 91.1944},
    "subarnachar": {"district": "Noakhali", "lat": 22.6833, "lng": 91.1333},
    "maijdee": {"district": "Noakhali", "lat": 22.8712, "lng": 91.0973},
    "noakhali": {"district": "Noakhali", "lat": 22.8696, "lng": 91.0993},

    # Comilla District
    "burichang": {"district": "Comilla", "lat": 23.5500, "lng": 91.1300},
    "brahmanpara": {"district": "Comilla", "lat": 23.6167, "lng": 91.1167},
    "debidwar": {"district": "Comilla", "lat": 23.6000, "lng": 90.9833},
    "chauddagram": {"district": "Comilla", "lat": 23.2167, "lng": 91.3167},
    "muradnagar": {"district": "Comilla", "lat": 23.6333, "lng": 90.9667},
    "laksham": {"district": "Comilla", "lat": 23.2417, "lng": 91.1250},
    "manoharganj": {"district": "Comilla", "lat": 23.1833, "lng": 91.1167},
    "nangalkot": {"district": "Comilla", "lat": 23.1611, "lng": 91.2000},
    "comilla": {"district": "Comilla", "lat": 23.4607, "lng": 91.1809},
    "gumti": {"district": "Comilla", "lat": 23.5200, "lng": 91.1500},

    # Sylhet & Sunamganj
    "gowainghat": {"district": "Sylhet", "lat": 25.0833, "lng": 91.9667},
    "kanaighat": {"district": "Sylhet", "lat": 25.0167, "lng": 92.2667},
    "bholaganj": {"district": "Sylhet", "lat": 25.1500, "lng": 91.7500},
    "companiganj_sylhet": {"district": "Sylhet", "lat": 25.0789, "lng": 91.7511},
    "zakiganj": {"district": "Sylhet", "lat": 24.8833, "lng": 92.3667},
    "sylhet": {"district": "Sylhet", "lat": 24.8949, "lng": 91.8687},
    "chhatak": {"district": "Sunamganj", "lat": 25.0417, "lng": 91.6667},
    "tahirpur": {"district": "Sunamganj", "lat": 25.1000, "lng": 91.1833},
    "sunamganj": {"district": "Sunamganj", "lat": 25.0667, "lng": 91.4000},
}

BANGLA_DIGITS_MAP = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
}

def convert_bangla_digits(text: str) -> str:
    for bn, en in BANGLA_DIGITS_MAP.items():
        text = text.replace(bn, en)
    return text

def parse_with_heuristics(message: str) -> Dict[str, Any]:
    """Intelligent NLP heuristic parser for emergency flood messages in Bangla/Banglish/English."""
    clean_msg = convert_bangla_digits(message)
    lower_msg = clean_msg.lower()

    # 1. Detect Location
    matched_loc = "Feni District"
    matched_district = "Feni"
    lat = 23.0159
    lng = 91.3976

    for key, data in BANGLADESH_FLOOD_COORDINATES.items():
        # Bengali & Banglish phonetic equivalents check
        key_aliases = {
            "parshuram": ["parshuram", "porshuram", "পরশুরাম", "পরশুরামের"],
            "fulgazi": ["fulgazi", "fulgaji", "fulgachi", "ফুলগাজী", "ফুলগাজি", "ফুলগাজীর", "ফুলগাছি"],
            "chhagalnaiya": ["chhagalnaiya", "chagalnaiya", "chagolnaiya", "ছাগলনাইয়া", "ছাগলনাইয়ার"],
            "daganbhuiyan": ["daganbhuiyan", "daganbhuiya", "দাগনভূঞা", "দাগনভূঁইয়া"],
            "feni": ["feni", "ফেনী", "ফেনির", "ফেনীর"],
            "muhuri": ["muhuri", "মুহুরী", "মুহুরি"],
            "companiganj": ["companiganj", "কোম্পানীগঞ্জ", "কোম্পানিগঞ্জ"],
            "senbagh": ["senbagh", "সেনবাগ"],
            "begumganj": ["begumganj", "বেগমগঞ্জ"],
            "noakhali": ["noakhali", "নোয়াখালী"],
            "burichang": ["burichang", "বুড়িচং"],
            "laksham": ["laksham", "laksam", "লাকসাম", "লাকসামের", "লাকশাম", "লাকশামের"],
            "manoharganj": ["manoharganj", "monoharganj", "মনোহরগঞ্জ", "মনোহরগঞ্জের"],
            "nangalkot": ["nangalkot", "নাঙ্গলকোট", "নাঙ্গলকোটের"],
            "comilla": ["comilla", "কুমিল্লা"],
            "gumti": ["gumti", "গোমতী", "গোমতি"],
            "gowainghat": ["gowainghat", "গোয়াইনঘাট", "গোয়াইনঘাটের"],
            "sylhet": ["sylhet", "সিলেট", "সিলেটের"],
            "sunamganj": ["sunamganj", "সুনামগঞ্জ"],
            "chhatak": ["chhatak", "ছাতক"]
        }
        aliases = key_aliases.get(key, [key])
        
        if any(alias in lower_msg for alias in aliases):
            matched_loc = key.replace("_", " ").title() + f", {data['district']}"
            matched_district = data["district"]
            lat = data["lat"]
            lng = data["lng"]
            break

    # 2. Extract People Count
    # Search for patterns like "10 jon", "10 জন", "5 people", "১৫ জন"
    people_count = 1
    people_match = re.search(r'(\d+)\s*(?:জন|jon|manush|people|person|persons|family|poribar|পরিবার)', lower_msg)
    if people_match:
        try:
            val = int(people_match.group(1))
            people_count = max(1, min(val, 250))
        except Exception:
            people_count = 1
    else:
        # Search for standalone numbers near start/middle
        num_matches = re.findall(r'\b(\d{1,3})\b', lower_msg)
        if num_matches:
            try:
                candidate = int(num_matches[0])
                if 1 <= candidate <= 100:
                    people_count = candidate
            except Exception:
                pass

    # 3. Extract Critical Needs
    critical_needs = []
    need_patterns = [
        ("bridge_collapse", ["bridge", "ব্রিজ", "ভেঙে", "ভেঙ্গে", "ভাঙা", "ভাঙ্গে", "venge", "bhenge", "bhanga", "collapse", "collapsed", "sako", "সাঁকো", "কালভার্ট", "culvert"]),
        ("rescue_boat", ["boat", "বোট", "নৌকা", "nouka", "trawler", "ট্রলার", "rescue", "উদ্ধার", "attka", "আটকা", " আটকে"]),
        ("drinking_water", ["water", "পানি", "pani", "khabar pani", "পানীয় জল", "mineral water"]),
        ("food", ["food", "খাবার", "khabar", "shukna khabar", "শুকনা খাবার", "biscuit", "chira"]),
        ("medical", ["medical", "ডাক্তার", "ঔষধ", "doctor", "medicine", "oushodh", "injured", "shishu", "infant", "pregnant", "গর্ববতী", "গর্ভবতী", "rogi", "রোগী"]),
        ("shelter", ["shelter", "আশ্রয়", "ashroy", "chhad", "ছাদ", "roof", "tola", "তলা"]),
    ]

    for need_key, keywords in need_patterns:
        if any(kw in lower_msg for kw in keywords):
            critical_needs.append(need_key)

    if not critical_needs:
        critical_needs = ["rescue_boat", "drinking_water"]

    # 4. Compute Severity Score (1 to 5) & Priority Level
    severity = 3
    is_urgent_high = any(w in lower_msg for w in [
        "ডুবে", "submerged", "dube", "roof", "ছাদ", "chhad", "পানি উঠছে", "pani uthtese",
        "infant", "shishu", "শিশু", "pregnant", "গর্ববতী", "গর্ভবতী", "emergency", "মরবে",
        "critical", "danger", "পানিবন্দি", "pani bondi", "৩ তলা", "3 tola"
    ])
    
    is_life_threatening = any(w in lower_msg for w in [
        "dube geche", "ডুবে গেছে", "pani buke", "বুক পানি", "chade pani", "bachte chai",
        "বাঁচতে চাই", "help immediately", "জরুরি", "জরুরী", "mora", "die",
        "ভেঙে", "ভেঙ্গে", "ভাঙা", "collapse", "bridge", "ব্রিজ"
    ])

    if is_life_threatening or (is_urgent_high and people_count >= 10) or "bridge_collapse" in critical_needs:
        severity = 5
    elif is_urgent_high or "medical" in critical_needs:
        severity = 4
    elif "rescue_boat" in critical_needs or people_count > 4:
        severity = 3
    else:
        severity = 2

    priority_map = {1: "LOW", 2: "LOW", 3: "MEDIUM", 4: "HIGH", 5: "CRITICAL"}
    priority_level = priority_map.get(severity, "MEDIUM")

    return {
        "location": matched_loc,
        "district": matched_district,
        "people_count": people_count,
        "critical_needs": critical_needs,
        "severity_score": severity,
        "priority_level": priority_level,
        "lat": lat,
        "lng": lng
    }

async def parse_sos_message(message: str) -> Dict[str, Any]:
    """
    Parses unstructured SOS messages.
    Uses Gemini API (gemini-2.5-flash) if GEMINI_API_KEY is available.
    Gracefully falls back to high-accuracy domain NLP heuristics if unavailable or on error.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if api_key:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)
            prompt = f"""
You are an emergency disaster response dispatch AI for Bangladesh flood rescue.
Analyze this emergency SOS message written in Bengali, Banglish, or English:

SOS MESSAGE:
"{message}"

Extract the following structured JSON output:
{{
  "location": "string (specific village/union/upazila/district/landmark)",
  "district": "string (one of Feni, Noakhali, Sylhet, Comilla, Sunamganj, Chittagong, etc.)",
  "people_count": integer (default 1 if unspecified),
  "critical_needs": ["rescue_boat", "medical", "food", "drinking_water", "shelter"],
  "severity_score": integer (1 to 5, where 5 is critical/submerged/infants/pregnant),
  "priority_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "lat": float (latitude near location in Bangladesh, e.g. 23.0 to 25.1),
  "lng": float (longitude near location in Bangladesh, e.g. 91.0 to 92.4)
}}
Only return valid JSON. No markdown ticks.
"""
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )

            if response and response.text:
                cleaned_text = response.text.strip()
                if cleaned_text.startswith("```json"):
                    cleaned_text = cleaned_text[7:]
                if cleaned_text.endswith("```"):
                    cleaned_text = cleaned_text[:-3]
                parsed = json.loads(cleaned_text.strip())
                
                # Sanitize fields
                if not parsed.get("district"):
                    parsed["district"] = "Feni"
                if not parsed.get("people_count") or parsed.get("people_count") < 1:
                    parsed["people_count"] = 1
                if not parsed.get("severity_score") or not (1 <= parsed.get("severity_score") <= 5):
                    parsed["severity_score"] = 4
                if not parsed.get("lat") or not parsed.get("lng"):
                    parsed["lat"] = 23.0159
                    parsed["lng"] = 91.3976
                
                logger.info(f"Gemini API structured extraction successful for message.")
                return parsed
        except Exception as e:
            logger.warning(f"Gemini API parse failed or not reachable: {e}. Falling back to domain heuristics.")

    # Fallback heuristic parser
    return parse_with_heuristics(message)
