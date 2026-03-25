# NafdacCheck

NafdacCheck is a WhatsApp-based verification bot that lets Nigerians instantly check whether any NAFDAC-registered product — drugs, food, beverages, cosmetics, or bottled water — is authentic and approved. Simply send a NAFDAC number, a product name, or a photo of the packaging, and the bot responds in seconds.

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v8 or higher
- **Railway CLI** (`npm install -g @railway/cli`) — for deployment
- A **Twilio** account with a WhatsApp sandbox or approved sender
- A **9jaCheckr** API key (https://9jacheckr.xyz)

---

## Installation

```bash
npm install
```

---

## Environment Setup

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=3000
TWILIO_ACCOUNT_SID=your_twilio_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
NAFDAC_API_KEY=your_9jacheckr_api_key_here
ANTHROPIC_API_KEY=your_claude_api_key_here
```

> ⚠️ Never commit `.env` to version control. It is listed in `.gitignore`.

---

## Running Locally

```bash
node src/index.js
```

The server starts on `http://localhost:3000`.

To expose your local server to Twilio, use [ngrok](https://ngrok.com):

```bash
ngrok http 3000
```

Then use the generated `https://xxxx.ngrok.io` URL as your Twilio webhook.

---

## Connecting Twilio

1. Go to your [Twilio Console](https://console.twilio.com)
2. Navigate to **Messaging → Try it out → Send a WhatsApp message** (Sandbox)
3. Under **Sandbox Settings**, set the **"When a message comes in"** webhook to:
   ```
   https://your-railway-url/webhook
   ```
   Method: `HTTP POST`
4. Save and test by sending "hi" to your Twilio WhatsApp sandbox number

---

## Deploying to Railway

1. Login to Railway:
   ```bash
   railway login
   ```
2. Link or create a project:
   ```bash
   railway init
   ```
3. Add your environment variables in the Railway dashboard (Settings → Variables)
4. Deploy:
   ```bash
   railway up
   ```
5. Get your public URL from the Railway dashboard and set it as your Twilio webhook:
   ```
   https://your-app-name.up.railway.app/webhook
   ```

---

## Project Structure

```
src/
├── index.js            ← Express server + Twilio webhook router
├── nafdac.js           ← 9jaCheckr API wrapper
├── handlers/
│   ├── onboard.js      ← Welcome message
│   ├── text.js         ← (Agent 2) Text-based NAFDAC lookup
│   └── image.js        ← (Agent 2) Vision-based drug pack OCR
└── utils/
    └── format.js       ← Response message formatters
```

---

## NAFDAC Helpline

📞 **0800-162-3322** (toll-free)
