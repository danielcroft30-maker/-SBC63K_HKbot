# 🎨 Telegram Color Converter Bot

A Telegram bot that converts colors between HEX, RGB, HSL, and CMYK formats using an interactive color picker.

## Features

- 🎨 Visual color picker with real-time updates
- 🔄 Convert between HEX, RGB, HSL, and CMYK
- 📋 Copy any color format with one click
- 🚀 Instant conversion results

## Deployment

### Prerequisites
- Python 3.8+
- Telegram Bot Token (get from @BotFather)
- Railway account (or any hosting platform)

### Deploy on Railway

1. Fork this repository
2. Create a new project on Railway
3. Connect your GitHub repository
4. Add environment variables:
   - `TELEGRAM_TOKEN`: Your bot token from @BotFather
   - `WEBAPP_URL`: URL of your deployed WebApp

### Local Development

1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Create a `.env` file with your TELEGRAM_TOKEN
4. Run the bot: `python main.py`

## Technologies Used

- Python 3.9+
- python-telegram-bot
- HTML/CSS/JavaScript
- iro.js for color picker
- Railway for hosting

## License

MIT
