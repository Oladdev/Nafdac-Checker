# Implementation Plan — Agent 1: Backend Core
**Agent:** Rege (Backend Core Agent)
**Project:** NafdacCheck WhatsApp Drug Verification Bot
**Date:** 2026-03-25
**Deliverables:** D01, D02, D05, D06, D07, D09
**Status:** ✅ APPROVED by PM (Ola) — corrections applied — proceeding to execution

---

## Overview

Build the entire foundational Node.js/Express backend for NafdacCheck. This is a **stateless, no-database** server that receives WhatsApp messages via Twilio webhooks, routes them to the appropriate handler, calls the 9jaCheckr NAFDAC API for drug verification, and formats replies within WhatsApp's character limits.

All files must be complete, copy-paste-ready, and shippable. Agent 2 will build on top of these foundations.

---

## Project Structure

```
nafdaccheck/
├── src/
│   ├── index.js              ← D01: Express server + Twilio webhook
│   ├── nafdac.js             ← D02: 9jaCheckr API wrapper
│   ├── handlers/
│   │   └── onboard.js        ← D06: Welcome message logic
│   └── utils/
│       └── format.js         ← D05: Response formatters
├── .env.example              ← D09: Environment variable template
├── .gitignore                ← Excludes .env from version control
├── package.json              ← Dependencies + start script
├── railway.json              ← D07: Railway deployment config
└── README.md                 ← D09: Setup & deployment instructions
```

---

## Deliverable Breakdown

### D01 — `src/index.js` (Express Server + Twilio Webhook)

**Purpose:** Entry point. Boots the server, parses Twilio's form-urlencoded POST bodies, and routes incoming messages.

**Steps:**
1. `require('dotenv').config()` at the very top
2. Import `express`, mount `express.urlencoded({ extended: false })` middleware
3. Add a health-check route `GET /` → returns `200 OK` (for Railway)
4. Mount `POST /webhook`:
   - Extract `From`, `Body`, `NumMedia`, `MediaUrl0`, `MediaContentType0` from `req.body`
   - Routing logic:
     - `NumMedia > 0` → `handleImage(mediaUrl, mediaType, res)` (stub)
     - `Body` matches `/^(hi|hello|hey|start)/i` → `handleOnboard(res)`
     - Otherwise → `handleText(body, res)` (stub)
5. Export `sendReply(res, message)` — wraps TwiML XML response with `Content-Type: text/xml`
6. Listen on `process.env.PORT || 3000`

**Stubs for Agent 2 (inline, not separate files yet):**
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

**TwiML Response Format:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>
    <Body>MESSAGE HERE</Body>
  </Message>
</Response>
```

---

### D02 — `src/nafdac.js` (9jaCheckr API Wrapper)

**Purpose:** Single-function module that queries the NAFDAC drug registry.

**Steps:**
1. Use `node-fetch` v2 (CommonJS-compatible)
2. Export `verifyByNumber(regNo)`:
   - Normalize input: `trim()` + `toUpperCase()`
   - Call `GET https://api.9jacheckr.xyz/api/verify/:nafdac_number`
   - Set header `x-api-key: process.env.NAFDAC_API_KEY`
   - On success (`2xx`): return product object
   - On not-found or any error: return `null`

**Expected success return shape:**
```json
{
  "name": "Lonart DS Tablet",
  "manufacturer": "Bliss GVS Pharma Nigeria Ltd",
  "nafdacNumber": "A1-5645",
  "status": "Active",
  "approvalDate": "March 2019",
  "expiryDate": "March 2027"
}
```

---

### D05 — `src/utils/format.js` (Response Formatters)

**Purpose:** Format verified and not-found responses within WhatsApp's 300-char soft limit.

**Exports:**

#### `formatVerified(product)` — ✅ CORRECTED by PM
```
✅ VERIFIED

Product: {name}
Manufacturer: {manufacturer}
Reg No: {nafdacNumber}
Status: {status}
Manufacturing Date: {approvalDate}    ← omit line if null/undefined
Expiry Date: {expiryDate}             ← omit line if null/undefined

Registered with NAFDAC.
Always purchase from a licensed vendor.
```
> **Rule:** If `approvalDate` or `expiryDate` are `null`/`undefined`, do **not** print that line at all.

#### `formatNotFound(regNo)`
```
⚠️ NOT VERIFIED

"{regNo}" was not found in the NAFDAC register.

This may mean: counterfeit, wrong number, or lapsed registration.

Do not use without confirming with a pharmacist.
NAFDAC Helpline: 0800-162-3322
```

**Note:** Truncate `manufacturer` name if the total would exceed 300 characters.

---

### D06 — `src/handlers/onboard.js` (Onboarding Handler) — ✅ CORRECTED by PM

**Purpose:** Send a welcome message when the user says hi/hello/hey/start.

**Export:** `handleOnboard(res)` — calls `sendReply` from `index.js`

**Message (updated to broader product scope):**
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

### D07 — `railway.json` (Railway Deployment Config)

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

Also ensure `package.json` has `"start": "node src/index.js"` in scripts.

---

### D09 — `.env.example` + `README.md`

#### `.env.example`
```
PORT=3000
TWILIO_ACCOUNT_SID=your_twilio_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
NAFDAC_API_KEY=your_9jacheckr_api_key_here
ANTHROPIC_API_KEY=your_claude_api_key_here
```

#### `.gitignore`
```
.env
node_modules/
```

#### `README.md` Sections:
1. What NafdacCheck does (1 paragraph)
2. Prerequisites (Node 18+, npm, Railway CLI)
3. Installation (`npm install`)
4. Environment setup (reference `.env.example`)
5. Running locally (`node src/index.js`)
6. Connecting Twilio (set webhook to `https://your-railway-url/webhook`)
7. Deploying to Railway (`railway up`)

---

## Dependencies

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

## Constraints & Rules

| Rule | Detail |
|---|---|
| Language | Node.js only — no TypeScript |
| Modules | CommonJS `require()` — no ES `import` |
| Database | None — fully stateless |
| Env loading | `require('dotenv').config()` FIRST line of `index.js` |
| Message length | ≤ 300 characters per bot reply where possible |
| Tone | Calm, clear, non-technical |
| Null safety | Never print "undefined" — omit optional fields |

---

## Hand-off Checklist for Agent 2

When I am done, Agent 2 will receive:

- [x] `src/index.js` — server running, webhook wired, `handleText` and `handleImage` stubs in place
- [x] `src/nafdac.js` — `verifyByNumber(regNo)` exported and functional
- [x] `src/utils/format.js` — `formatVerified` and `formatNotFound` exported
- [x] `src/handlers/onboard.js` — fully implemented
- [x] `railway.json`, `.env.example`, `.gitignore`, `README.md`, `package.json` — all ready

Agent 2's task: implement `src/handlers/text.js` and `src/handlers/image.js` using Claude AI (text + vision) and replace the stubs in `index.js`.

---

## Execution Order

```
1. Initialize package.json        (npm init -y + edit)
2. Install dependencies            (npm install express node-fetch@2 dotenv)
3. Create src/utils/format.js     (D05 — no dependencies)
4. Create src/nafdac.js           (D02 — no dependencies)
5. Create src/handlers/onboard.js (D06 — depends on sendReply)
6. Create src/index.js            (D01 — ties everything together)
7. Create railway.json            (D07)
8. Create .env.example            (D09)
9. Create .gitignore
10. Create README.md              (D09)
```
