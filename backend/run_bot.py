import os
import sys
import logging

# Ensure project root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.services.telegram_service import build_telegram_application, BOT_TOKEN

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("FloodAction.BotRunner")

def main():
    logger.info("Starting FloodAction Telegram Bot Polling Service...")
    masked_token = f"{BOT_TOKEN[:8]}...{BOT_TOKEN[-4:]}" if len(BOT_TOKEN) > 12 else "VALID_TOKEN"
    logger.info(f"Using Bot Token: {masked_token}")
    app = build_telegram_application()
    logger.info("Bot application initialized successfully.")
    logger.info("Listening for citizen messages: /start, /help, and natural language SOS (Bangla/Banglish/English)...")
    app.run_polling(drop_pending_updates=True)

if __name__ == "__main__":
    main()
