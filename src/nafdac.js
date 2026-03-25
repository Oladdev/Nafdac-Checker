'use strict';

/**
 * nafdac.js — D02
 * Wrapper for the 9jaCheckr NAFDAC product verification API.
 */

const fetch = require('node-fetch');

const NAFDAC_API_BASE = 'https://api.9jacheckr.xyz/api/verify';

/**
 * Verify a product by its NAFDAC registration number.
 * @param {string} regNo - NAFDAC registration number (e.g. "A1-5645")
 * @returns {Promise<Object|null>} Product object or null if not found
 */
async function verifyByNumber(regNo) {
  if (!regNo) return null;

  // Normalize: trim whitespace and uppercase
  const normalized = regNo.trim().toUpperCase();

  const url = `${NAFDAC_API_BASE}/${encodeURIComponent(normalized)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.NAFDAC_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // 404 or any non-2xx — product not found or API error
      return null;
    }

    const data = await response.json();

    // Return the product object as-is (pass-through from API)
    return data || null;
  } catch (err) {
    // Network error, timeout, or JSON parse error
    console.error('[nafdac.js] API call failed:', err.message);
    return null;
  }
}

module.exports = { verifyByNumber };
