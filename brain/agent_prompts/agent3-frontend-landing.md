# AGENT BRIEFING — Frontend Agent (Agent 3)
══════════════════════════════════════════
Project: NafdacCheck WhatsApp Bot
Your role: Frontend Agent
Your deliverables: D08 — Landing Page
══════════════════════════════════════════

## What You're Building

A single-page landing website for NafdacCheck — a WhatsApp drug verification bot for Nigeria. This page gives the demo credibility, explains the product to judges, and provides a scannable WhatsApp QR code / link to join the bot.

This page runs standalone — no backend dependency. It can be deployed to Railway as a static file or served from the same Express server.

---

## File to Create

```
public/
└── index.html     ← Single self-contained HTML file (inline CSS + JS)
```

Everything in one file. No build tools. No npm. No frameworks.

---

## Page Design Brief

**Aesthetic:** Clean, trustworthy, medical-adjacent. Dark navy/white with green accents. WhatsApp green (`#25D366`) for CTAs. Not clinical — warm and accessible.

**Font:** Use Google Fonts — `Inter` for body, `Sora` or `Outfit` for headings.

**Tone:** Calm, responsible, and urgent. Think public health campaign meets fintech landing page.

---

## Page Sections (in order)

### 1. Hero Section
- Big headline: **"Is your drug real?"**
- Sub-headline: "NafdacCheck verifies any drug against the NAFDAC register — in seconds, on WhatsApp."
- CTA button: "Verify a Drug Now →" (links to `https://wa.me/[TWILIO_SANDBOX_NUMBER]` — use a placeholder `#` for now)
- Background: Dark navy (`#0A0F2C`) with subtle gradient or grid lines

### 2. How It Works (3-step visual)
Three icon cards in a row:
1. **Send a message** — "Type a NAFDAC number, drug name, or send a photo of the pack"
2. **We check the register** — "Your query hits the official NAFDAC database in real time"
3. **Get your answer** — "Verified ✅ or Not Found ⚠️ — with responsible safety guidance"

### 3. Demo / Screenshot Block
A mock WhatsApp chat UI (pure CSS, no images needed) showing:
- User sends: `"A1-5645"`
- Bot replies: `"✅ VERIFIED — Lonart DS Tablet | Bliss GVS Pharma | Reg: A1-5645 | Status: Active"`

Style this to look like a real WhatsApp conversation bubble exchange.

### 4. Trust / Why It Matters
Short paragraph or 2-column stat block:
- "1 in 5 drugs in Nigeria is counterfeit" (source: WHO)
- "NAFDAC registers every legitimate drug sold in Nigeria"
- "NafdacCheck puts that data in your pocket — no app, no login"

### 5. Get Started / CTA
- Instruction: "Send 'hi' to our WhatsApp bot to get started"
- Big green button: "Open WhatsApp →" (link placeholder `#`)
- Optional: Twilio sandbox number displayed as text

### 6. Footer
- "Built at Babcock Tech Week Hackathon 2026"
- "Data powered by NAFDAC & 9jaCheckr"
- "AI by Anthropic Claude"

---

## Technical Specs

- **Single HTML file** — all CSS in `<style>`, optional inline `<script>` for micro-animations
- **Fully responsive** — mobile-first, since judges may view on phone
- **No external JS libraries** — vanilla only
- **Google Fonts** — load via `<link>` tag in `<head>`
- **WhatsApp green:** `#25D366`
- **Navy:** `#0A0F2C`
- **Accent/verified green:** `#00C853`
- **Warning amber:** `#FFB300`
- **White:** `#FFFFFF`
- **Body text:** `#E0E6F0` on dark backgrounds

### Animations to include:
- Hero headline: fade-in on load (`opacity 0 → 1`, 0.8s)
- Step cards: slide-up on scroll (use `IntersectionObserver`)
- CTA button: WhatsApp-green pulse on hover

---

## Serving from Express (optional integration note)

If the team wants one Railway deployment for both the bot and the landing page, add this to `src/index.js`:

```js
const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));
```

Your file should work with this setup — just put `index.html` in `public/`.

---

## Constraints

- **No frameworks** — plain HTML/CSS/JS only
- **No placeholder images** — use CSS shapes, emoji, or SVG icons inline
- **Must look great on mobile** — test at 375px width
- **All text should be real** — no "Lorem Ipsum"
- **Keep it under 500 lines** — tight, clean, shippable

---

## Output Format

Provide **one complete `public/index.html` file**, copy-paste ready.
The file should open in a browser with zero external dependencies failing.
Flag any questions or blockers immediately.

Start now.
══════════════════════════════════════════
