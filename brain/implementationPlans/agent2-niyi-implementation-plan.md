# Agent 2 (Niyi / Claude Integration Agent) - Implementation Plan

## Goal Description
Implement the Claude AI integration for the NafdacCheck WhatsApp Bot. This involves handling both text-based drug name inquiries and image-based drug pack photo analysis to extract NAFDAC registration numbers and verify them against the Agent 1 core logic.

## Proposed Changes

### Configuration & Utilities
#### [NEW] src/claude.js
- Initialize Anthropic SDK using `process.env.ANTHROPIC_API_KEY`.
- Export initialized `client` and `MODEL` constant (`claude-sonnet-4-20250514`).

### Handlers
#### [NEW] src/handlers/text.js
- Export `handleText(messageBody, res)`
- Implement Regex detection for direct NAFDAC numbers (`/^[A-Z0-9]{1,2}-\d{3,6}$/i`).
- If matched, call `verifyByNumber` directly.
- If not matched, call Claude API (Text Prompt) to guess/extract the registration number.
- Parse Claude response (handling "UNKNOWN" case).
- Call `verifyByNumber` and format the response using Agent 1 utilities.

#### [NEW] src/handlers/image.js
- Export `handleImage(mediaUrl, mediaType, res)`
- Implement image downloading from Twilio using HTTP Basic Auth (`process.env.TWILIO_ACCOUNT_SID` and `process.env.TWILIO_AUTH_TOKEN`).
- Convert downloaded image Buffer to Base64.
- Call Claude API (Vision Prompt) to extract the registration number from the image.
- Parse Claude response (handling "NOT_FOUND" case).
- Call `verifyByNumber` and format the response using Agent 1 utilities.

### Integration
#### [MODIFY] src/index.js
- Replace stub `handleText` and `handleImage` imports with the actual implementations from `src/handlers/text` and `src/handlers/image`.

### Dependencies
- Run `npm install @anthropic-ai/sdk node-fetch@2`

## Verification Plan

### Manual Verification
- **Text Flow:** Send generic texts (e.g., "Paracetamol"), specific drug names (e.g., "lonart ds"), and raw NAFDAC numbers. Ensure the bot routes correctly and responds with proper formatting.
- **Image Flow:** Send an image of a clear NAFDAC number, a blurry image, and a non-drug image. Ensure the Twilio download works and Claude Vision accurately reads or rejects the image.
- **Error Handling:** Simulate API failures (Anthropic API downtime, Twilio download failure) to ensure the user receives a graceful error message under 300 characters, without exposing raw error objects.
