'use strict';

/**
 * ai.js — OpenRouter AI Client
 * Shared helper for text and vision calls via OpenRouter's free tier.
 * Uses the OpenAI-compatible chat completions endpoint.
 */

const fetch = require('node-fetch');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemma-3-27b-it:free';

/**
 * Call OpenRouter chat completions API.
 * @param {Array} messages - OpenAI-format messages array
 * @returns {string} The assistant's text response
 */
async function callAI(messages) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log('[ai.js] API key loaded:', apiKey ? `${apiKey.substring(0, 10)}... (length: ${apiKey.length})` : 'NOT SET');
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is missing from environment variables');
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://nafdaccheck.com',
      'X-Title': 'NafdacCheck'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages,
      max_tokens: 100
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

module.exports = { callAI, MODEL };
