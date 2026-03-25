# AGENT BRIEFING — Backend Core Agent (Agent 1)
══════════════════════════════════════════
Project: NafdacCheck WhatsApp Bot
Your role: Backend Core Agent
Your deliverables: D01, D02, D05, D06, D07, D09

> **Scope note:** NafdacCheck verifies ALL NAFDAC-regulated consumable products — drugs, food, cosmetics, water, and dietary supplements. Messaging should reflect this broader scope, not just drugs.
══════════════════════════════════════════

## What You're Building

You are scaffolding the entire Node.js/Express backend for NafdacCheck — a WhatsApp drug verification bot. You own everything from the server entry point to the NAFDAC API wrapper, response formatters, onboarding message, Railway config, and developer docs.

This is a stateless, no-database backend. Keep every file simple and shippable.

---

## Project Structure to Create

```
nafdaccheck/
├── src/
│   ├── index.js             ← D01: Express server + Twilio webhook
│   ├── nafdac.js            ← D02: 9jaCheckr API wrapper
│   ├── handlers/
│   │   └── onboard.js       ← D06: Welcome message logic
│   └── utils/
│       └── format.js        ← D05: Response formatters
├── .env.example             ← D09: env var template
├── package.json
├── railway.json             ← D07: Railway deployment config
└── README.md                ← D09: Setup instructions
```

---

## D01 — Express Server + Twilio Webhook (`src/index.js`)

- Use `express` + `body-parser` (or `express.json()`)
- Mount a POST route at `/webhook`
- Twilio sends `form-urlencoded` POST bodies — parse with `express.urlencoded({ extended: false })`
- Extract from Twilio payload:
  - `req.body.From` — sender's WhatsApp number
  - `req.body.Body` — text message (may be empty if image)
  - `req.body.NumMedia` — number of attached media files
  - `req.body.MediaUrl0` — URL of first image (if present)
  - `req.body.MediaContentType0` — MIME type of image
- Route to the correct handler:
  - If `NumMedia > 0` → image flow (stub this — Agent 2 will fill it in)
  - If body matches greeting (`/^(hi|hello|hey|start)/i`) → onboarding
  - Otherwise → text flow (stub — Agent 2 fills in)
- Reply using Twilio TwiML: respond with `Content-Type: text/xml` and this structure:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <Response>
    <Message>
      <Body>YOUR MESSAGE HERE</Body>
    </Message>
  </Response>
  ```
- Export a named function `sendReply(res, message)` that wraps the TwiML response
- Run on `process.env.PORT || 3000`

**Stubs to leave for Agent 2:**
```js
// src/handlers/text.js   — Agent 2 will implement
// src/handlers/image.js  — Agent 2 will implement
```
Import them but leave graceful fallback if empty:
```js
async function handleText(body, res) {
  // TODO: Agent 2 — Claude text handler
  sendReply(res, "Text handler coming soon.");
}
async function handleImage(mediaUrl, mediaType, res) {
  // TODO: Agent 2 — Claude vision handler
  sendReply(res, "Image handler coming soon.");
}
```

---

## D02 — 9jaCheckr API Wrapper (`src/nafdac.js`)

- Use `node-fetch` (v2, CommonJS-compatible) or the native `fetch` if Node ≥ 18
- Export one function: `verifyByNumber(regNo)`
- API call: `GET https://api.9jacheckr.xyz/api/verify/:nafdac_number`
- Auth header: `x-api-key: process.env.NAFDAC_API_KEY`
- On success: return the product object
- On not-found or error: return `null`
- Normalize the reg number before calling (trim whitespace, uppercase)

```js
// Expected return shape (pass-through from API):
{
  name: "Lonart DS Tablet",
  manufacturer: "Bliss GVS Pharma Nigeria Ltd",
  nafdacNumber: "A1-5645",
  status: "Active",
  approvalDate: "March 2019",
  expiryDate: "March 2027"
}
// or null if not found
```

---

## D05 — Response Formatter (`src/utils/format.js`)

Export two functions:

### `formatVerified(product)`
Returns a ≤300-char string:
```
✅ VERIFIED

Product: {name}
Manufacturer: {manufacturer}
Reg No: {nafdacNumber}
Status: {status}
Manufacturing Date: {approvalDate}
Expiry Date: {expiryDate}

Registered with NAFDAC.
Always purchase from a licensed vendor.
```

> If `approvalDate` or `expiryDate` are null/undefined in the API response, omit that line rather than showing "undefined".

### `formatNotFound(regNo)`
Returns a ≤300-char string:
```
⚠️ NOT VERIFIED

"{regNo}" was not found in the NAFDAC register.

This may mean: counterfeit, wrong number, or lapsed registration.

Do not use without confirming with a licensed pharmacist or vendor.
NAFDAC Helpline: 0800-162-3322
```

Keep both outputs under 300 characters where possible. Truncate manufacturer name if needed.

---

## D06 — Onboarding Message (`src/handlers/onboard.js`)

Export a function `handleOnboard(res)` that calls `sendReply` with:

```
👋 Welcome to NafdacCheck!

Verify any NAFDAC-registered product:
• Drugs & medicines
• Food & beverages
• Cosmetics & supplements
• Bottled water

Send a NAFDAC number, product name,
or a photo of the pack. 🇳🇬
```

---

## D07 — Railway Config (`railway.json`)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node src/index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

Also ensure `package.json` has:
```json
"scripts": {
  "start": "node src/index.js"
}
```

---

## D09 — `.env.example` and `README.md`

### `.env.example`
```
PORT=3000
TWILIO_ACCOUNT_SID=your_twilio_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
NAFDAC_API_KEY=your_9jacheckr_api_key_here
ANTHROPIC_API_KEY=your_claude_api_key_here
```

### `README.md` — include:
1. What this project does (1 paragraph)
2. Prerequisites (Node 18+, npm, Railway CLI)
3. Install steps (`npm install`)
4. Environment variable setup (reference `.env.example`)
5. How to run locally (`node src/index.js`)
6. How to connect Twilio: set webhook URL to `https://your-railway-url/webhook`
7. How to deploy to Railway: `railway up`

---

## Dependencies to Install

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "node-fetch": "^2.7.0",
    "dotenv": "^16.3.1"
  }
}
```

---

## Constraints

- Node.js only — no TypeScript
- No database — stateless
- Use `require()` (CommonJS), not `import`
- Load `.env` at the very top of `index.js`: `require('dotenv').config()`
- All bot messages ≤ 300 characters where possible
- Tone: calm, clear, non-technical

---

## Hand-off to Agent 2

When done, Agent 2 needs:
- `src/nafdac.js` — the `verifyByNumber(regNo)` function (exported, tested)
- `src/utils/format.js` — `formatVerified` and `formatNotFound`
- `src/index.js` — server running, webhook route wired, `handleText` and `handleImage` stubs importable
- `src/handlers/onboard.js` — already complete

Agent 2 will implement `src/handlers/text.js` and `src/handlers/image.js` and plug them in.

---

## Output Format

Provide **complete, copy-paste-ready file contents** for every file listed above.
Label each file clearly. Flag any blockers immediately.

Start now.
══════════════════════════════════════════
