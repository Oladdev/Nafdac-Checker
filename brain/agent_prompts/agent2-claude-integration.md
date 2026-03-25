# AGENT BRIEFING — Claude Integration Agent (Agent 2)
══════════════════════════════════════════
Project: NafdacCheck WhatsApp Bot
Your role: Claude Integration Agent
Your deliverables: D03, D04
══════════════════════════════════════════

## Prerequisites (from Agent 1)

Before starting, confirm these files exist and are working:
- `src/nafdac.js` — exports `verifyByNumber(regNo)` → product object or `null`
- `src/utils/format.js` — exports `formatVerified(product)` and `formatNotFound(regNo)`
- `src/index.js` — Express server running, `handleText` and `handleImage` are imported stubs

You will implement the two stub handlers. Do NOT modify Agent 1's files except to replace the stub bodies in `index.js` with real imports once your handlers are done.

---

## Your Files to Create

```
src/
├── claude.js              ← Shared Claude API client
├── handlers/
│   ├── text.js            ← D03: Claude text flow
│   └── image.js           ← D04: Claude vision flow
```

---

## Claude API Setup (`src/claude.js`)

Use the official Anthropic SDK:
```
npm install @anthropic-ai/sdk
```

```js
// src/claude.js
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-20250514';

module.exports = { client, MODEL };
```

---

## D03 — Claude Text Handler (`src/handlers/text.js`)

### Export

```js
async function handleText(messageBody, res) { ... }
module.exports = { handleText };
```

### Logic Flow

```
1. Normalize input (trim, lowercase for comparison)
2. If message matches NAFDAC reg number pattern → skip Claude, call verifyByNumber directly
3. Otherwise → send to Claude for intent detection + number resolution
4. Call verifyByNumber with the resolved number
5. Format and reply
```

### Step 2 — Reg Number Pattern Detection

A NAFDAC number typically looks like: `A1-5645`, `01-5713`, `B4-3210`
Use this regex: `/^[A-Z0-9]{1,2}-\d{3,6}$/i`
If matched, call `verifyByNumber(regNo)` directly — no Claude needed.

### Step 3 — Claude Intent + Name Resolution Prompt

When the message is a drug name (not a reg number), call Claude with this system prompt:

```
You are a NAFDAC drug verification assistant. A Nigerian user has sent a message that may contain a drug name, question, or unclear text.

Your ONLY job is to extract a NAFDAC registration number to look up.

Rules:
1. If the message contains a NAFDAC reg number (format: XX-XXXX, e.g. A1-5645), extract it and return ONLY the number.
2. If the message contains a drug name, return your best guess at the most common NAFDAC reg number for that drug in Nigeria. Return ONLY the number.
3. If you cannot determine any reg number, return exactly: UNKNOWN
4. Return NOTHING else — no explanation, no punctuation, just the reg number or UNKNOWN.

Examples:
User: "lonart ds"        → A1-5645
User: "coartem tablet"   → A4-0912
User: "paracetamol"      → UNKNOWN (too generic, many reg numbers)
User: "A1-5645"          → A1-5645
```

Parse Claude's response:
- If `UNKNOWN` → reply with guidance to send a clearer message or reg number
- Otherwise → call `verifyByNumber(resolved)` → format and reply

### Error Handling

- If Claude API fails → reply: "Sorry, I couldn't process that right now. Please try sending the NAFDAC number directly (e.g. A1-5645)."
- If `verifyByNumber` returns null → call `formatNotFound(regNo)`
- Never let an unhandled error reach the user

### UNKNOWN Response Message

```
🤔 I couldn't identify a specific product from that.

Try:
• Sending the NAFDAC number directly (e.g. A1-5645)
• Being more specific (e.g. "lonart ds tablet")
• Sending a photo of the drug pack
```

---

## D04 — Claude Vision Handler (`src/handlers/image.js`)

### Export

```js
async function handleImage(mediaUrl, mediaType, res) { ... }
module.exports = { handleImage };
```

### Logic Flow

```
1. Download image from Twilio's mediaUrl
2. Convert to base64
3. Send to Claude Vision with extraction prompt
4. Parse response for NAFDAC number
5. Call verifyByNumber → format and reply
```

### Step 1 + 2 — Download and Encode

Twilio media URLs require HTTP Basic Auth (TWILIO_ACCOUNT_SID:TWILIO_AUTH_TOKEN):

```js
const fetch = require('node-fetch');
const { Buffer } = require('buffer');

async function downloadImageAsBase64(mediaUrl) {
  const auth = Buffer.from(
    `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
  ).toString('base64');

  const response = await fetch(mediaUrl, {
    headers: { Authorization: `Basic ${auth}` }
  });

  const buffer = await response.buffer();
  return buffer.toString('base64');
}
```

### Step 3 — Claude Vision Prompt

```js
const response = await client.messages.create({
  model: MODEL,
  max_tokens: 100,
  messages: [{
    role: 'user',
    content: [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType, // e.g. 'image/jpeg'
          data: base64Image
        }
      },
      {
        type: 'text',
        text: `Look at this image of a drug pack, label, or blister strip.
Find the NAFDAC registration number. It usually appears as: XX-XXXX or A1-5645 format.
Return ONLY the registration number if found, or "NOT_FOUND" if you cannot see one.
Return nothing else.`
      }
    ]
  }]
});
```

### Step 4 — Parse Response

```js
const extracted = response.content[0].text.trim().toUpperCase();
if (extracted === 'NOT_FOUND' || extracted === '') {
  // return retry message
} else {
  // call verifyByNumber(extracted)
}
```

### Fallback Message (when Claude can't find a number)

```
📷 I couldn't read a NAFDAC number from that image.

Try:
• Taking a clearer, well-lit photo
• Zooming in on the registration number
• Or type the number directly (e.g. A1-5645)
```

### Error Handling

- If image download fails → "I couldn't fetch that image. Please try again."
- If Claude API fails → "Image processing failed. Please type the NAFDAC number instead."
- Always respond — never hang.

---

## Wiring Into index.js

Once your handlers are complete, update the stub imports in `src/index.js`:

```js
// Replace stubs with real handlers:
const { handleText } = require('./handlers/text');
const { handleImage } = require('./handlers/image');
```

The function signatures match what Agent 1 stubbed:
- `handleText(body, res)`
- `handleImage(mediaUrl, mediaType, res)`

---

## Dependencies to Install

```
npm install @anthropic-ai/sdk node-fetch@2
```

(node-fetch v2 is CommonJS-compatible)

---

## Constraints

- Use `require()` — no ES modules
- Model: `claude-sonnet-4-20250514` (exact)
- Max tokens for intent detection: 50 (cheap and fast)
- Max tokens for vision: 100
- Never expose API keys or raw error objects to the WhatsApp user
- All user-facing messages ≤ 300 characters where possible

---

## Output Format

Provide **complete, copy-paste-ready file contents** for:
- `src/claude.js`
- `src/handlers/text.js`
- `src/handlers/image.js`
- Updated snippet for `src/index.js` (replacing stubs)

Label each file clearly. Flag any blockers immediately.

Start now.
══════════════════════════════════════════
