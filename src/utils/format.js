'use strict';

/**
 * format.js — D05
 * Response formatters for NafdacCheck WhatsApp bot.
 * All outputs should stay ≤ 300 characters where possible.
 */

/**
 * Format a successful NAFDAC verification result.
 * @param {Object} product - Product object from 9jaCheckr API
 * @returns {string} WhatsApp-ready message
 */
function formatVerified(product) {
  const name = product.name || 'Unknown Product';
  const nafdacNumber = product.nafdacNumber || 'N/A';
  const status = product.status || 'N/A';

  // Truncate manufacturer if needed to stay within char limits
  let manufacturer = product.manufacturer || 'N/A';
  if (manufacturer.length > 40) {
    manufacturer = manufacturer.substring(0, 37) + '...';
  }

  let msg = `✅ VERIFIED\n\nProduct: ${name}\nManufacturer: ${manufacturer}\nReg No: ${nafdacNumber}\nStatus: ${status}`;

  // Only include dates if they are present and not null/undefined
  if (product.approvalDate) {
    msg += `\nManufacturing Date: ${product.approvalDate}`;
  }
  if (product.expiryDate) {
    msg += `\nExpiry Date: ${product.expiryDate}`;
  }

  msg += '\n\nRegistered with NAFDAC.\nAlways purchase from a licensed vendor.';

  return msg;
}

/**
 * Format a not-found / unverified result.
 * @param {string} regNo - The reg number or name that was searched
 * @returns {string} WhatsApp-ready message
 */
function formatNotFound(regNo) {
  return (
    `⚠️ NOT VERIFIED\n\n"${regNo}" was not found in the NAFDAC register.\n\n` +
    `This may mean: counterfeit, wrong number, or lapsed registration.\n\n` +
    `Do not use without confirming with a pharmacist.\n` +
    `NAFDAC Helpline: 0800-162-3322`
  );
}

module.exports = { formatVerified, formatNotFound };
