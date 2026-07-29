import json
import logging
import os
from telegram import KeyboardButton, ReplyKeyboardMarkup, Update, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

# Get bot token from environment variable
TOKEN = os.environ.get("TELEGRAM_TOKEN")
if not TOKEN:
    raise ValueError("No TELEGRAM_TOKEN set in environment variables!")

# WebApp URL - replace with your deployed webapp URL
WEBAPP_URL = os.environ.get("WEBAPP_URL", "https://your-webapp-url.vercel.app")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message with a button that opens the color picker WebApp."""
    user = update.effective_user
    await update.message.reply_text(
        f"🎨 Hi {user.first_name}!\n\n"
        "Click the button below to pick a color. I'll convert it for you!\n\n"
        "Supported formats:\n"
        "• HEX → RGB, HSL, CMYK\n"
        "• RGB → HEX, HSL, CMYK\n"
        "• HSL → HEX, RGB, CMYK\n"
        "• CMYK → HEX, RGB, HSL",
        reply_markup=ReplyKeyboardMarkup.from_button(
            KeyboardButton(
                text="🎨 Open Color Picker",
                web_app=WebAppInfo(url=WEBAPP_URL),
            )
        ),
        disable_web_page_preview=True,
    )

async def web_app_data_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle the color data sent from the WebApp."""
    try:
        # Parse the JSON data from the WebApp
        data = json.loads(update.effective_message.web_app_data.data)
        
        # Extract color values
        hex_color = data.get("hex", "#000000")
        rgb = data.get("rgb", {"r": 0, "g": 0, "b": 0})
        hsl = data.get("hsl", {"h": 0, "s": 0, "l": 0})
        cmyk = data.get("cmyk", {"c": 0, "m": 0, "y": 0, "k": 0})
        
        # Format the response
        response = (
            f"🎨 <b>Color Converted!</b>\n\n"
            f"<b>Preview:</b> <code>██████████</code>\n\n"
            f"<b>HEX:</b> <code>{hex_color}</code>\n"
            f"<b>RGB:</b> <code>rgb({rgb['r']}, {rgb['g']}, {rgb['b']})</code>\n"
            f"<b>HSL:</b> <code>hsl({hsl['h']}°, {hsl['s']}%, {hsl['l']}%)</code>\n"
            f"<b>CMYK:</b> <code>cmyk({cmyk['c']}%, {cmyk['m']}%, {cmyk['y']}%, {cmyk['k']}%)</code>\n\n"
            f"💡 <i>Copy any format and use it in your project!</i>"
        )
        
        await update.message.reply_html(response)
        
    except json.JSONDecodeError:
        await update.message.reply_text("❌ Sorry, I couldn't process that color data. Please try again.")
    except Exception as e:
        logger.error(f"Error processing webapp data: {e}")
        await update.message.reply_text("❌ Something went wrong. Please try again.")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a help message when /help is issued."""
    help_text = (
        "🆘 <b>How to use this bot</b>\n\n"
        "1. Click the <b>'Open Color Picker'</b> button\n"
        "2. Choose any color using the visual picker\n"
        "3. The bot will instantly convert it to:\n"
        "   • HEX\n"
        "   • RGB\n"
        "   • HSL\n"
        "   • CMYK\n\n"
        "You can also use these commands:\n"
        "/start - Start the bot\n"
        "/help - Show this help message"
    )
    await update.message.reply_html(help_text)

async def unknown_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle unknown commands."""
    await update.message.reply_text(
        "❌ Unknown command. Use /start to begin or /help for assistance."
    )

def main() -> None:
    """Start the bot."""
    # Create the Application with updated builder pattern
    application = (
        Application.builder()
        .token(TOKEN)
        .build()
    )

    # Add command handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    
    # Add handler for WebApp data
    application.add_handler(MessageHandler(
        filters.StatusUpdate.WEB_APP_DATA, 
        web_app_data_handler
    ))
    
    # Add handler for unknown commands
    application.add_handler(MessageHandler(
        filters.COMMAND, 
        unknown_command
    ))

    # Run the bot using long polling
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
