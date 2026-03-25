# Software Requirements Specification

## NafdacCheck — WhatsApp Drug Verification Bot

**Version:** 1.0  
**Date:** March 2026  
**Hackathon:** Babcock Tech Week — Build with AI: Bridging the Trust Gap  
**Track:** Healthcare

-----

## 1. Overview

### 1.1 Product Summary

NafdacCheck is a WhatsApp-based drug verification bot that allows any Nigerian to instantly verify whether a drug or medical product is registered with NAFDAC (National Agency for Food and Drug Administration and Control). Users can verify by sending a registration number, a drug name, or a photo of a drug pack.

### 1.2 Problem Statement

Counterfeit and unregistered drugs are a critical public health crisis in Nigeria. Patients, caregivers, and pharmacists have no fast, accessible way to verify drug authenticity at the point of purchase or use. Existing tools require internet browsers, technical literacy, and deliberate effort — barriers that most end users cannot overcome in a real-world pharmacy or market setting.

This creates a **trust gap**: people use AI and digital tools, but not in healthcare, because they don’t trust the outputs or can’t access them easily.

### 1.3 Solution

NafdacCheck bridges this gap by meeting users where they already are — WhatsApp — and delivering NAFDAC verification results in plain, human-readable language within seconds. The AI layer (Claude) handles fuzzy name matching, image reading, and responsible response formatting. The data layer (9jaCheckr API) provides real-time NAFDAC registration data.

### 1.4 Hackathon Constraints

- **Duration:** 24 hours
- **Team size:** 3 (2 technical, 1 non-technical)
- **Budget:** $5 Google Cloud credits + free tiers
- **Submission deadline:** Thursday 7 AM

-----

## 2. Goals & Success Criteria

|Goal                    |Success Criteria                                          |
|------------------------|----------------------------------------------------------|
|Core verification works |User sends reg number, gets verified result in < 5 seconds|
|Name lookup works       |User sends drug name, Claude interprets and returns result|
|Photo scan works        |User sends photo, bot extracts number and verifies        |
|Responsible AI messaging|Unverified drugs return a clear, calm safety warning      |
|Demo-ready              |Full flow demoed live on a real phone in under 60 seconds |

-----

## 3. Users

### 3.1 Primary Users

- **Patients & caregivers** — verifying drugs before use
- **Pharmacists & drug sellers** — confirming stock authenticity
- **Market traders** — checking goods before resale

### 3.2 Secondary Users

- **Judges & evaluators** — assessing the prototype during the hackathon demo

### 3.3 User Assumptions

- Has WhatsApp installed on their phone
- May have low digital literacy
- May be on a 2G/3G connection
- Communicates in English or Nigerian Pidgin

-----

## 4. Features

### 4.1 F01 — Drug Verification by Registration Number

**Priority:** Must Have  
**Description:** User sends a NAFDAC registration number (e.g. `A1-5645` or `01-5713`). The bot hits the 9jaCheckr API and returns the verification result.

**Input:** Text message containing a NAFDAC reg number  
**Output:**

```
✅ VERIFIED

Product: Lonart DS Tablet
Manufacturer: Bliss GVS Pharma Nigeria Ltd
NAFDAC Reg No: A1-5645
Registration Status: Active
Approval Date: March 2019
Expiry Date: March 2027

This product is registered with NAFDAC.
Always purchase drugs from a licensed pharmacy.
```

-----

### 4.2 F02 — Drug Verification by Name

**Priority:** Must Have  
**Description:** User sends a drug name in plain text (e.g. `"lonart tablet"` or `"coartem"`). Claude interprets the name, identifies the most likely NAFDAC number pattern, and attempts a lookup.

**Input:** Text message with drug name  
**Output:** Verification result if found, or a “not found” response with guidance  
**Notes:** Claude handles spelling variations, brand name vs generic name mismatches, and partial names.

-----

### 4.3 F03 — Photo Scan (Wow Feature)

**Priority:** Must Have (primary demo wow moment)  
**Description:** User sends a photo of a drug pack, blister strip, or label. Claude vision reads the image, extracts the NAFDAC registration number, and runs the verification automatically.

**Input:** Image (JPEG/PNG) sent via WhatsApp  
**Output:** Extracted reg number + verification result  
**Fallback:** If Claude cannot extract a number, bot replies asking the user to send a clearer image or type the number manually.

-----

### 4.4 F04 — Responsible “Not Found” Warning

**Priority:** Must Have  
**Description:** When a drug is not found in the NAFDAC register, the bot returns a calm, responsible safety warning rather than a generic error.

**Output:**

```
⚠️ NOT VERIFIED

This registration number was not found in the NAFDAC register.

This could mean:
• The product is counterfeit or unregistered
• The number was entered incorrectly
• The product's registration has lapsed

Do not use this product until you can confirm its authenticity with a licensed pharmacist or NAFDAC directly.

NAFDAC Consumer Protection: 0800-162-3322 (toll-free)
```

-----

### 4.5 F05 — Onboarding / Welcome Message

**Priority:** Must Have  
**Description:** When a user sends their first message (or sends “hi”, “hello”, “start”), the bot replies with a friendly onboarding message explaining what it does.

**Output:**

```
👋 Welcome to NafdacCheck!

I help you verify whether a drug or medical product is registered with NAFDAC — in seconds.

Here's what you can do:
• Send a NAFDAC number (e.g. A1-5645)
• Send a drug name (e.g. "lonart tablet")
• Send a photo of the drug pack or label

Let's keep Nigerian drugs safe. 🇳🇬
```

-----

### 4.6 F06 — Report Suspicious Drug (Nice to Have)

**Priority:** Nice to Have  
**Description:** User can type `"report"` followed by a drug name or reg number to flag it as suspicious. The report is logged server-side. This creates a community trust signal for the demo.

**Input:** `"report A1-5645"` or `"report lonart"`  
**Output:** Confirmation that the report was received

-----

## 5. Technical Architecture

### 5.1 System Overview

```
WhatsApp (User)
      ↓
Twilio WhatsApp Sandbox (webhook)
      ↓
Express.js Backend (Node.js on Railway)
      ↓
      ├── Text message → Claude API (intent detection + name resolution)
      │         ↓
      │   9jaCheckr API (NAFDAC lookup)
      │         ↓
      │   Claude API (response formatting)
      │
      └── Image message → Claude Vision API (number extraction)
                ↓
          9jaCheckr API (NAFDAC lookup)
                ↓
          Claude API (response formatting)
```

### 5.2 Tech Stack

|Layer            |Tool                                 |Cost                  |
|-----------------|-------------------------------------|----------------------|
|Messaging channel|Twilio WhatsApp Sandbox              |Free                  |
|Backend runtime  |Node.js + Express                    |Free                  |
|Backend hosting  |Railway                              |Free tier             |
|NAFDAC data      |9jaCheckr API                        |Free (300 calls/month)|
|AI brain         |Claude API (claude-sonnet-4-20250514)|~$0 (free credit)     |
|Language         |JavaScript (ES6+)                    |—                     |

### 5.3 External APIs

**9jaCheckr API**

- Base URL: `https://api.9jacheckr.xyz`
- Endpoint: `GET /api/verify/:nafdac_number`
- Auth: `x-api-key` header
- Returns: `{ ok: boolean, product: { name, manufacturer, dates } }`

**Claude API**

- Model: `claude-sonnet-4-20250514`
- Used for: intent detection, name-to-number resolution, image OCR, response formatting
- Vision: enabled (accepts base64 image input)

**Twilio WhatsApp Sandbox**

- Webhook: POST to your Express `/webhook` endpoint
- Supports: text messages, image messages (MediaUrl0)

### 5.4 Project Structure

```
nafdaccheck/
├── src/
│   ├── index.js          # Express server + Twilio webhook
│   ├── claude.js         # Claude API calls (text + vision)
│   ├── nafdac.js         # 9jaCheckr API wrapper
│   ├── handlers/
│   │   ├── text.js       # Handle text message flow
│   │   ├── image.js      # Handle image message flow
│   │   └── onboard.js    # Welcome message logic
│   └── utils/
│       └── format.js     # Response formatters
├── .env
├── package.json
└── railway.json
```

-----

## 6. Message Flow Diagrams

### 6.1 Text Message Flow

```
Receive message
      ↓
Is it a greeting? → Send onboarding message
      ↓
Is it "report ..."? → Log report, send confirmation
      ↓
Send to Claude → detect intent
      ↓
Does it contain a reg number? → Query 9jaCheckr directly
      ↓
Is it a drug name? → Claude resolves to reg number → Query 9jaCheckr
      ↓
Found? → Format verified response
Not found? → Format responsible warning
```

### 6.2 Image Message Flow

```
Receive image (MediaUrl0 from Twilio)
      ↓
Download image → convert to base64
      ↓
Send to Claude Vision → extract NAFDAC number
      ↓
Number found? → Query 9jaCheckr → format result
Number not found? → Ask user to retry with clearer image
```

-----

## 7. Non-Functional Requirements

|Requirement  |Target                                      |
|-------------|--------------------------------------------|
|Response time|< 5 seconds for text, < 10 seconds for image|
|Availability |Up for the full 24hr hackathon window       |
|Tone         |Calm, clear, non-alarmist — responsible AI  |
|Accessibility|Works on 2G, no app install required        |
|Transparency |Always attributes data to NAFDAC register   |

-----

## 8. Out of Scope (for this prototype)

- User accounts or authentication
- Database / persistent storage
- Multi-language support (Yoruba, Pidgin, Hausa)
- Payment or premium tier
- Nearest pharmacy finder
- Native mobile app

-----

## 9. Team & Responsibilities

|Person                |Role                                                            |
|------------------