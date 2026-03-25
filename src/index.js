'use strict';

/**
 * index.js — D01
 * NafdacCheck Express server + Twilio webhook handler.
 * Entry point for the entire backend.
 */

require('dotenv').config();

const express = require('express');
const { handleOnboard } = require('./handlers/onboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse Twilio's form-urlencoded POST bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ─────────────────────────────────────────
// Helper: Send a TwiML WhatsApp reply
// ─────────────────────────────────────────
function sendReply(res, message) {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>
    <Body>${message}</Body>
  </Message>
</Response>`;

  res.setHeader('Content-Type', 'text/xml');
  res.send(twiml);
}

// ─────────────────────────────────────────
// Handlers — Agent 2 implemented these
// ─────────────────────────────────────────
const { handleText } = require('./handlers/text');
const { handleImage } = require('./handlers/image');

// ─────────────────────────────────────────
// Health check (Railway ping / browser test)
// ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).send('NafdacCheck is running ✅');
});

// ─────────────────────────────────────────
// POST /webhook — Twilio inbound messages
// ─────────────────────────────────────────
app.post('/webhook', async (req, res) => {
  const body = (req.body.Body || '').trim();
  const numMedia = parseInt(req.body.NumMedia || '0', 10);
  const mediaUrl = req.body.MediaUrl0 || null;
  const mediaType = req.body.MediaContentType0 || null;

  console.log(`[webhook] From: ${req.body.From} | NumMedia: ${numMedia} | Body: "${body}"`);

  try {
    if (numMedia > 0 && mediaUrl) {
      // Image message — Agent 2 will implement
      await handleImage(mediaUrl, mediaType, sendReply, res);
    } else if (/^(hi|hello|hey|start)/i.test(body)) {
      // Greeting — send onboarding message
      handleOnboard(sendReply, res);
    } else {
      // Text message (NAFDAC number or drug name) — Agent 2 will implement
      await handleText(body, sendReply, res);
    }
  } catch (err) {
    console.error('[webhook] Unhandled error:', err.message);
    sendReply(res, 'Something went wrong. Please try again.');
  }
});

// ─────────────────────────────────────────
// Start server
// ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`NafdacCheck server running on port ${PORT}`);
});

module.exports = { sendReply };
