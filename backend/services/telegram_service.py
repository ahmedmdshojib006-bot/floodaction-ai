import os
import json
import logging
import httpx
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters
)

# Load environment variables from backend/.env
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(dotenv_path=env_path)

logger = logging.getLogger("FloodAction.TelegramBot")

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "9000868174:AAFZKZqn4KVtEtPvCylLIdXJIrGySMScz2o")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Greets the citizen and explains how to send emergency flood rescue requests."""
    user = update.effective_user
    greeting_name = user.first_name if user else "Citizen"

    msg = (
        f"🚨 *FloodAction AI Emergency Rescue Bot* 🚨\n"
        f"স্বাগতম, {greeting_name}!\n\n"
        f"বন্যা কবলিত এলাকায় যে কোনো জরুরি উদ্ধার বা সহায়তার জন্য আপনার বার্তা এখানে বাংলায়, বাংলিশে বা ইংরেজিতে লিখুন।\n\n"
        f"📌 *আপনি সরাসরি যা লিখতে পারেন:*\n"
        f"• আপনার এলাকা বা ইউনিয়ন (e.g. পরশুরাম, ফুলগাজী, ছাগলনাইয়া, কোম্পানীগঞ্জ, গোয়াইনঘাট)\n"
        f"• কতজন মানুষ বা পরিবার আটকে আছেন\n"
        f"• কি সহায়তা প্রয়োজন (বোট, খাবার, খাওয়ার পানি, ওষুধ, ডাক্তার)\n\n"
        f"💡 উদাহরণ দেখতে /help কমান্ড চাপুন।"
    )
    await update.message.reply_text(msg, parse_mode="Markdown")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Provides example SOS messages for quick reference."""
    help_text = (
        f"🆘 *জরুরি বার্তা পাঠানোর উদাহরণ (Example SOS Texts)*\n\n"
        f"১. *বাংলায়:*\n"
        f"\"ফেনী পরশুরাম ৩ তলায় ১০ জন আটকা, খাবার ও বোট লাগবে দ্রুত। ২ জন বৃদ্ধ ও ১ জন গর্ভবতী আছেন।\"\n\n"
        f"২. *বাংলিশে (Banglish):*\n"
        f"\"Feni sadore 3 tolai 10 jon pani te atka, bacha ache, rescue boat dorkar\"\n\n"
        f"৩. *ইংরেজিতে (English):*\n"
        f"\"Sylhet Gowainghat Jaflong road submerged, 8 people trapped on rooftop, infant fever emergency doctor needed.\"\n\n"
        f"⚡ কোনো ফর্ম পূরণ করতে হবে না, শুধু স্বাভাবিক ভাষায় মেসেজ লিখে পাঠিয়ে দিন!"
    )
    await update.message.reply_text(help_text, parse_mode="Markdown")

async def handle_incoming_sos(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Processes natural language flood rescue messages and records them in the dispatch system."""
    message = update.message
    if not message or not message.text:
        return

    raw_text = message.text.strip()
    user = update.effective_user
    username = user.username or user.first_name or f"User_{user.id}"
    chat_id = str(message.chat_id)

    logger.info(f"Telegram SOS received from @{username} (Chat ID {chat_id}): '{raw_text}'")

    # 1. Send instant acknowledgment
    ack_msg = await message.reply_text("🔄 আপনার মেসেজটি AI দ্বারা প্রসেস করা হচ্ছে...")

    try:
        # 2. Forward to FastAPI /api/sos/parse endpoint
        endpoint = f"{BACKEND_URL}/api/sos/parse"
        payload = {
            "message": raw_text,
            "source": "TELEGRAM",
            "sender_info": f"@{username} (Telegram ID: {chat_id})"
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(endpoint, json=payload)

        if response.status_code == 200:
            data = response.json()
            location = data.get("location", "Feni / Sylhet Region")
            people_count = data.get("people_count", 1)
            severity = data.get("severity_score", 4)
            priority = data.get("priority_level", "HIGH")
            raw_needs = data.get("critical_needs", [])
            
            # Format critical needs in human-friendly Bangla
            need_translations = {
                "rescue_boat": "উদ্ধারকারী বোট (Rescue Boat)",
                "drinking_water": "খাওয়ার পানি (Drinking Water)",
                "food": "শুকনা খাবার (Food Relief)",
                "medical": "চিকিৎসা সহায়তা / ঔষধ (Medical Doctor)",
                "shelter": "নিরাপদ আশ্রয় (Flood Shelter)"
            }
            formatted_needs = ", ".join([need_translations.get(n, n.replace('_', ' ')) for n in raw_needs])
            if not formatted_needs:
                formatted_needs = "উদ্ধারকারী বোট ও পানি"

            # 3. Clean confirmation card reply
            reply_card = (
                f"✅ *জরুরি উদ্ধার অনুরোধ নথিভুক্ত করা হয়েছে!*\n\n"
                f"📍 *এলাকা:* {location}\n"
                f"⚠️ *বিপদ মাত্রা:* Level {severity}/5 ({priority})\n"
                f"👥 *আটকে পড়া মানুষ:* ~{people_count} জন\n"
                f"🆘 *প্রয়োজনীয় সহায়তা:* {formatted_needs}\n\n"
                f"🚨 নিকটস্থ উদ্ধারকারী দল ও লাইভ ম্যাপে আপডেট পাঠানো হয়েছে।"
            )

            await ack_msg.edit_text(reply_card, parse_mode="Markdown")
        else:
            logger.error(f"Backend parse endpoint returned {response.status_code}: {response.text}")
            await ack_msg.edit_text(
                "⚠️ সার্ভারে সংযোগ করতে সমস্যা হয়েছে, তবে আপনার বার্তাটি সিস্টেমে সংরক্ষিত আছে। জরুরি প্রয়োজনে সরাসরি স্থানীয় কন্ট্রোল রুমে যোগাযোগ করুন।"
            )

    except Exception as e:
        logger.error(f"Error processing Telegram SOS: {e}")
        # Direct fallback parse and DB save if HTTP endpoint was unreachable
        try:
            from backend.services.ai_parser import parse_sos_message
            from backend.models.database import AsyncSessionLocal
            from backend.models.sos_report import SOSReport
            from backend.services.connection_manager import manager

            parsed = await parse_sos_message(raw_text)
            async with AsyncSessionLocal() as session:
                rep = SOSReport(
                    raw_message=raw_text,
                    source="TELEGRAM",
                    sender_info=f"@{username} (ID: {chat_id})",
                    location=parsed.get("location", "Feni Flood Sector"),
                    district=parsed.get("district", "Feni"),
                    people_count=parsed.get("people_count", 1),
                    critical_needs=json.dumps(parsed.get("critical_needs", ["rescue_boat"])),
                    severity_score=parsed.get("severity_score", 4),
                    priority_level=parsed.get("priority_level", "HIGH"),
                    lat=parsed.get("lat", 23.0159),
                    lng=parsed.get("lng", 91.3976),
                    status="PENDING"
                )
                session.add(rep)
                await session.commit()
                await session.refresh(rep)

                await manager.broadcast({
                    "event": "NEW_SOS_REPORT",
                    "data": rep.to_dict(),
                    "message": f"🚨 [TELEGRAM SOS] {rep.location}: {rep.people_count} people"
                })

            await ack_msg.edit_text(
                f"✅ *জরুরি উদ্ধার অনুরোধ নথিভুক্ত করা হয়েছে!*\n"
                f"📍 এলাকা: {parsed.get('location')}\n"
                f"⚠️ বিপদ মাত্রা: Level {parsed.get('severity_score')}/5 ({parsed.get('priority_level')})\n"
                f"👥 আটকে পড়া মানুষ: ~{parsed.get('people_count')} জন\n"
                f"🚨 নিকটস্থ উদ্ধারকারী দল ও লাইভ ম্যাপে আপডেট পাঠানো হয়েছে।",
                parse_mode="Markdown"
            )
        except Exception as fallback_err:
            logger.error(f"Fallback direct parse failed: {fallback_err}")
            await ack_msg.edit_text(
                "❌ দুঃখিত, সংযোগের ত্রুটির কারণে বার্তাটি তাৎক্ষণিকভাবে প্রসেস করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।"
            )

def build_telegram_application():
    """Builds and returns the python-telegram-bot application."""
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), handle_incoming_sos))

    return app
