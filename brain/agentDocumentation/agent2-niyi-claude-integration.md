# Agent 2 (Niyi) — Claude Integration Documentation

## Overview
This document outlines the implementation details for **Agent 2 (Niyi)** on the NafdacCheck WhatsApp Bot project.
Agent 2 is responsible for handling all natural language and image-based queries from WhatsApp users via **Twilio** and passing them through **Anthropic's Claude 3.5 Sonnet** to extract NAFDAC registration numbers.

## Deliverables Completed
- `src/claude.js` (Anthropic Client)
- `src/handlers/text.js` (D03 - Text Fallback & Intent)
- `src/handlers/image.js` (D04 - Vision Verification)
- Integration into `src/index.js`

## Architecture & Data Flow

### 1. Claude Client Setup (`src/claude.js`)
Configures the official `@anthropic-ai/sdk` using the `ANTHROPIC_API_KEY` from environment variables.
* **Model Used:** `claude-sonnet-4-20250514`

### 2. Text Message Flow (`src/handlers/text.js`)
Handles standard text requests sent by users to the bot.
- **Regex Fast-Path:** Messages are checked against the `/^[a-z0-9]{1,2}-\d{3,6}$/i` regex. If a user directly types a NAFDAC number (e.g., `A1-5645`), we skip Claude entirely and hit the Agent 1 `verifyByNumber` API to save costs and latency.
- **Claude Inference (Max 50 Tokens):** If it isn't an exact number format, the text is sent to Claude with a system prompt instructing it to either extract a NAFDAC number from the text or *guess* the most common registration number for a named product in Nigeria.
- **Fallback:** If Claude returns `UNKNOWN`, the bot guides the user on how to format their query correctly.

### 3. Image Message Flow (`src/handlers/image.js`)
Handles drug/product pack photos sent by users.
- **Twilio Secure Download:** Fetches the image from the Twilio `MediaUrl` securely using HTTP Basic Auth (`TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`), relying on `node-fetch`.
- **Base64 Encoding:** Converts the downloaded Buffer to a Base64 string.
- **Claude Vision Inference (Max 100 Tokens):** Sends the Base64 image and media type to Claude Vision, prompting it to locate a string matching the NAFDAC format (XX-XXXX) on the product packaging.
- **Fallback:** If Claude returns `NOT_FOUND` or fails to see the number, the bot responds asking for a clearer photo or a typed registration number.

## Integration Dependencies
- **Core APIs (Agent 1):** Relies heavily on `verifyByNumber` from `src/nafdac.js` and formatters (`formatVerified`, `formatNotFound`) from `src/utils/format.js`.
- **Express (Agent 1):** Hooked into the main express routing via `index.sendReply` to successfully respond with `TwiML` XML payload format.
- **NPM Packages:** `@anthropic-ai/sdk` and `node-fetch@2`

## Key Design Constraints Met
- Responses use Agent 1's formatters, maintaining the ≤ 300 character limit.
- Fallback messages handle the extended scope gracefully by using "product" instead of "drug".
- Fully utilizes CommonJS `require()` (no ES modules).
- No API keys or raw error traces are ever exposed to the user.

---
*Maintained by Niyi (Claude Integration Agent)*
