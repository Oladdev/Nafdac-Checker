'use strict';

/**
 * ai.js — OpenRouter AI Client
 * Shared helper for text and vision calls via OpenRouter's free tier.
 * Tries multiple free models with automatic fallback.
 */

const fetch = require('node-fetch');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Ordered fallback list — tries each until one works
const MODELS = [
  'meta-llama/llama-4-maverick:free',
  'qwen/qwen2.5-vl-72b-instruct:free',
  'meta-llama/llama-3.2-11b-vision-instruct:free',
  'mistralai/mistral-small-3.1-24b-instruct:free'
];

/**
 * Call OpenRouter chat completions API with automatic model fallback.
 * @param {Array} messages - OpenAI-format messages array
 * @returns {string} The assistant's text response
 */
async function callAI(messages) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is missing from environment variables');
  }

  let lastError = null;

  for (const model of MODELS) {
    try {
      console.log(`[ai.js] Trying model: ${model}`);
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nafdaccheck.com',
          'X-Title': 'NafdacCheck'
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.log(`[ai.js] Model ${model} failed (${response.status}), trying next...`);
        lastError = new Error(`OpenRouter API error ${response.status}: ${errorBody}`);
        continue; // try next model
      }

      const data = await response.json();
      const result = data.choices[0].message.content.trim();
      console.log(`[ai.js] Success with model: ${model}`);
      return result;

    } catch (err) {
      console.log(`[ai.js] Model ${model} threw error: ${err.message}`);
      lastError = err;
      continue; // try next model
    }
  }

  // All models failed
  throw lastError || new Error('All AI models failed');
}

module.exports = { callAI };
