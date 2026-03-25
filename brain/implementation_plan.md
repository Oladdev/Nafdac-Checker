# NafdacCheck — Master Implementation Plan

**Hackathon:** Babcock Tech Week — Build with AI: Bridging the Trust Gap  
**Track:** Healthcare  
**Deadline:** 24 hours from session start  
**Demo target:** Full live flow on a real phone in under 60 seconds

---

## Product Summary

NafdacCheck is a WhatsApp bot that verifies any NAFDAC-regulated consumable product against the NAFDAC register — including drugs, food, cosmetics, water, and dietary supplements. Users send a reg number, product name, or photo — the bot responds with a verified ✅ or responsible warning ⚠️ in plain language. No app. No browser. No login.

---

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Runtime | Node.js + Express | CommonJS (`require`) |
| Channel | Twilio WhatsApp Sandbox | POST webhook |
| NAFDAC data | 9jaCheckr API | `GET /api/verify/:nafdac_number` |
| AI | Claude API (`claude-sonnet-4-20250514`) | Text intent, name resolution, vision OCR |
| Hosting | Railway | Free tier, auto-deploy from repo |
| Landing page | Vanilla HTML/CSS/JS | Served as static file from Express |

---

## Deliverables

| ID | Deliverable | Owner | Priority | Status |
|----|-------------|-------|----------|--------|
| D01 | Express server + Twilio webhook | Agent 1 | Must Ship | ⏳ |
| D02 | 9jaCheckr API wrapper | Agent 1 | Must Ship | ⏳ |
| D03 | Claude text handler | Agent 2 | Must Ship | ⏳ |
| D04 | Claude vision handler | Agent 2 | Must Ship | ⏳ |
| D05 | Response formatter | Agent 1 | Must Ship | ⏳ |
| D06 | Onboarding message | Agent 1 | Must Ship | ⏳ |
| D07 | Railway deployment config | Agent 1 | Must Ship | ⏳ |
| D08 | Landing page | Agent 3 | Must Ship | ⏳ |
| D09 | `.env` template + README | Agent 1 | Must Ship | ⏳ |
| D10 | Report suspicious product flow | — | Nice to Have | 🔒 Parked |

---

## Agent Assignments

### Agent 1 — Backend Core
**Prompt:** `brain/agent_prompts/agent1-backend-core.md`  
**Owns:** D01, D02, D05, D06, D07, D09  
**Depends on:** Nothing — starts immediately  
**Estimated time:** 3–4 hrs  

Deliverables:
- `src/index.js` — Express server, Twilio webhook, routing logic
- `src/nafdac.js` — `verifyByNumber(regNo)` wrapper
- `src/utils/format.js` — `formatVerified()` and `formatNotFound()`
- `src/handlers/onboard.js` — welcome message
- `package.json`, `railway.json`, `.env.example`, `README.md`

---

### Agent 2 — Claude Integration
**Prompt:** `brain/agent_prompts/agent2-claude-integration.md`  
**Owns:** D03, D04  
**Depends on:** Agent 1 (needs `nafdac.js` + `format.js` + `index.js` scaffold)  
**Estimated time:** 2–3 hrs  

Deliverables:
- `src/claude.js` — Anthropic SDK client
- `src/handlers/text.js` — intent detection + name resolution + lookup
- `src/handlers/image.js` — image download + Claude Vision + lookup

---

### Agent 3 — Frontend
**Prompt:** `brain/agent_prompts/agent3-frontend-landing.md`  
**Owns:** D08  
**Depends on:** Nothing — runs in parallel with Agent 1  
**Estimated time:** 1–2 hrs  

Deliverables:
- `public/index.html` — single-file landing page (inline CSS + JS)

---

## Dependency Graph

```
Agent 1 (D01, D02, D05, D06, D07, D09)   Agent 3 (D08)
         |                                       |
         v                                 [independent]
Agent 2 (D03, D04)
         |
         v
  Integration & QA
         |
         v
  Railway Deploy + Twilio wiring
         |
         v
        DEMO
```

**Critical path:** Agent 1 → Agent 2 → Deploy to Railway → Live Twilio test

---

## Full Project File Structure

```
nafdaccheck/
├── src/
│   ├── index.js              # Express server + Twilio webhook (D01)
│   ├── nafdac.js             # 9jaCheckr wrapper (D02)
│   ├── claude.js             # Anthropic SDK client
│   ├── handlers/
│   │   ├── text.js           # Claude text flow (D03)
│   │   ├── image.js          # Claude vision flow (D04)
│   │   └── onboard.js        # Welcome message (D06)
│   └── utils/
│       └── format.js         # Response formatters (D05)
├── public/
│   └── index.html            # Landing page (D08)
├── .env                      # Local secrets (gitignored)
├── .env.example              # Template (D09)
├── .gitignore
├── package.json
├── railway.json              # Railway config (D07)
└── README.md                 # Setup guide (D09)
```

---

## Environment Variables

| Variable | Description | Who needs it |
|---|---|---|
| `PORT` | Server port (default 3000) | All |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | D01, D04 |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | D01, D04 |
| `NAFDAC_API_KEY` | 9jaCheckr API key | D02 |
| `ANTHROPIC_API_KEY` | Claude API key | D03, D04 |

> [!IMPORTANT]  
> The `.env` file must never be committed. Ensure `.gitignore` includes `.env`.  
> On Railway, set all five variables in the project dashboard before deploying.

---

## Integration Checkpoints

### Checkpoint 1 — After D01 + D02 (Agent 1 done)
```bash
curl -X POST http://localhost:3000/webhook \
  -d "From=whatsapp:+2348012345678&Body=hi&NumMedia=0"
# Expected: TwiML welcome message in response body
```

### Checkpoint 2 — After D03 (text handler done)
```bash
curl -X POST http://localhost:3000/webhook \
  -d "From=whatsapp:+2348012345678&Body=A1-5645&NumMedia=0"
# Expected: TwiML verified response for Lonart DS
```

### Checkpoint 3 — After D04 (vision handler done)
- Open Twilio sandbox on a real phone
- Send a photo of a drug pack, food label, or cosmetic pack
- Expected: extracted reg number + verification result

### Checkpoint 4 — After D07 (Railway deployed)
- Confirm public URL: `curl https://[railway-url]/webhook`
- Update Twilio sandbox webhook to `https://[railway-url]/webhook`
- Run full live demo on real phone

---

## Deployment Steps (Railway)

1. Push code to GitHub repository
2. Create new Railway project → connect GitHub repo
3. Set all 5 environment variables in Railway dashboard
4. Railway runs `node src/index.js` via `railway.json`
5. Copy the Railway public URL
6. Twilio Console → Sandbox Settings → set webhook to `[railway-url]/webhook`
7. Send "hi" from phone to sandbox number — confirm response

---

## Message Design Reference

### ✅ Verified
```
✅ VERIFIED

Product: Lonart DS Tablet
Manufacturer: Bliss GVS Pharma
Reg No: A1-5645 | Status: Active
Manufacturing Date: March 2019
Expiry Date: March 2027

Registered with NAFDAC.
Always purchase from a licensed vendor.
```

### ⚠️ Not Found
```
⚠️ NOT VERIFIED

"A1-9999" not found in NAFDAC register.

Could be: counterfeit, wrong number, or lapsed.

Do not use — confirm with a licensed pharmacist or vendor.
NAFDAC: 0800-162-3322
```

### 👋 Onboarding
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

## Definition of Done

- [ ] Real WhatsApp message with reg number → verified result
- [ ] Real WhatsApp message with drug name → result
- [ ] Real WhatsApp photo → verified result (wow moment)
- [ ] Unrecognized number → responsible warning
- [ ] Bot live on Railway with public webhook URL
- [ ] Landing page deployed and accessible
- [ ] Demo script rehearsed at least once

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Claude API quota exceeded | Low | High | Monitor usage; memory-cache common lookups |
| 9jaCheckr returns inconsistent shapes | Medium | Medium | Defensive parsing with fallbacks in `nafdac.js` |
| Twilio image auth fails | Medium | High | Ensure Basic Auth in image download request |
| Railway cold start too slow | Low | Medium | Keep service warm with a ping cron |
| Demo phone has no signal | Low | Critical | Record backup video of the full flow |

---

## PM Status Board Template

```
STATUS BOARD — [timestamp]
═══════════════════════════════════════════
D01 Express + Twilio webhook   ⏳ / 🔄 / ✅
D02 9jaCheckr API wrapper      ⏳ / 🔄 / ✅
D03 Claude text handler        ⏳ / 🔄 / ✅
D04 Claude vision handler      ⏳ / 🔄 / ✅
D05 Response formatter         ⏳ / 🔄 / ✅
D06 Onboarding message         ⏳ / 🔄 / ✅
D07 Railway config             ⏳ / 🔄 / ✅
D08 Landing page               ⏳ / 🔄 / ✅
D09 README / .env template     ⏳ / 🔄 / ✅
D10 Report flow (nice-to-have) 🔒 Parked
═══════════════════════════════════════════
Blockers: [none / describe]
Next action: [what's happening now]
```

---

*Last updated: 2026-03-25 10:52 WAT | PM Agent: Ola*
