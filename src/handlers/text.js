'use strict';

const { genAI, MODEL } = require('../gemini');
const { verifyByNumber } = require('../nafdac');
const { formatVerified, formatNotFound } = require('../utils/format');

async function handleText(messageBody, sendReply, res) {
  try {
    const input = messageBody.trim();
    
    // Check if it's already a NAFDAC number format using Regex
    const regNoPattern = /^[a-z0-9]{1,2}-\d{3,6}$/i;
    
    if (regNoPattern.test(input)) {
      const regNoToVerify = input.toUpperCase();
      const productInfo = await verifyByNumber(regNoToVerify);
      if (!productInfo) {
        return sendReply(res, formatNotFound(regNoToVerify));
      }
      return sendReply(res, formatVerified(productInfo));
    }

    // Otherwise, send to Gemini for intent detection + number resolution
    const model = genAI.getGenerativeModel({ model: MODEL });

    const prompt = `You are a NAFDAC product verification assistant. A Nigerian user has sent a message that may contain a product name, question, or unclear text.

Your ONLY job is to extract a NAFDAC registration number to look up.

Rules:
1. If the message contains a NAFDAC reg number (format: XX-XXXX, e.g. A1-5645), extract it and return ONLY the number.
2. If the message contains a product name, return your best guess at the most common NAFDAC reg number for that product in Nigeria. Return ONLY the number.
3. If you cannot determine any reg number, return exactly: UNKNOWN
4. Return NOTHING else — no explanation, no punctuation, just the reg number or UNKNOWN.

Examples:
User: "lonart ds"        → A1-5645
User: "coartem tablet"   → A4-0912
User: "paracetamol"      → UNKNOWN (too generic, many reg numbers)
User: "A1-5645"          → A1-5645

User message: "${input}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const extracted = response.text().trim().toUpperCase();
    
    console.log('[text.js] Gemini extracted:', extracted);

    if (extracted === 'UNKNOWN' || !extracted) {
      return sendReply(res, `🤔 I couldn't identify a specific product from that.

Try:
• Sending the NAFDAC number directly (e.g. A1-5645)
• Being more specific (e.g. "lonart ds tablet")
• Sending a photo of the product pack`);
    }

    const productInfo = await verifyByNumber(extracted);
    if (!productInfo) {
      return sendReply(res, formatNotFound(extracted));
    }
    return sendReply(res, formatVerified(productInfo));
    
  } catch (error) {
    console.error('[text.js] Text Handler Error:', error.message);
    return sendReply(res, "Sorry, I couldn't process that right now. Please try sending the NAFDAC number directly (e.g. A1-5645).");
  }
}

module.exports = { handleText };
