'use strict';

/**
 * onboard.js — D06
 * Handles the welcome/onboarding message for new or greeting users.
 */

const WELCOME_MESSAGE =
  '👋 Welcome to NafdacCheck!\n\n' +
  'Verify any NAFDAC-registered product:\n' +
  '• Drugs & medicines\n' +
  '• Food & beverages\n' +
  '• Cosmetics & supplements\n' +
  '• Bottled water\n\n' +
  'Send a NAFDAC number, product name,\n' +
  'or a photo of the pack. 🇳🇬';

/**
 * Send the onboarding welcome message.
 * @param {Function} sendReply - The sendReply function from index.js
 * @param {Object} res - Express response object
 */
function handleOnboard(sendReply, res) {
  sendReply(res, WELCOME_MESSAGE);
}

module.exports = { handleOnboard };
