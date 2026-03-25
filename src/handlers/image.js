'use strict';

const fetch = require('node-fetch');
const { Buffer } = require('buffer');
const { callAI } = require('../ai');
const { verifyByNumber } = require('../nafdac');
const { formatVerified, formatNotFound } = require('../utils/format');

async function downloadImageAsBase64(mediaUrl) {
  const auth = Buffer.from(
    `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
  ).toString('base64');

  const response = await fetch(mediaUrl, {
    headers: { Authorization: `Basic ${auth}` }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const buffer = await response.buffer();
  return buffer.toString('base64');
}

async function handleImage(mediaUrl, mediaType, sendReply, res) {
  try {
    console.log('[image.js] Starting image handler. MediaUrl:', mediaUrl, 'MediaType:', mediaType);
    
    let base64Image;
    try {
      base64Image = await downloadImageAsBase64(mediaUrl);
      console.log('[image.js] Image downloaded. Base64 length:', base64Image.length);
    } catch (err) {
      console.error('[image.js] Image Download Error:', err.message);
      return sendReply(res, "I couldn't fetch that image. Please try again.");
    }

    console.log('[image.js] Sending to AI Vision...');
    
    // OpenRouter uses OpenAI vision format
    const extracted = await callAI([
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mediaType};base64,${base64Image}`
            }
          },
          {
            type: 'text',
            text: `Look at this image of a product pack, label, or blister strip.
Find the NAFDAC registration number. It usually appears as: XX-XXXX or A1-5645 format.
Return ONLY the registration number if found, or "NOT_FOUND" if you cannot see one.
Return nothing else.`
          }
        ]
      }
    ]);

    console.log('[image.js] AI Vision extracted:', extracted);
    const cleaned = extracted.toUpperCase().replace(/['"]/g, '').trim();
    
    if (cleaned === 'NOT_FOUND' || !cleaned) {
      return sendReply(res, `📷 I couldn't read a NAFDAC number from that image.

Try:
• Taking a clearer, well-lit photo
• Zooming in on the registration number
• Or type the number directly (e.g. A1-5645)`);
    }

    console.log('[image.js] Cleaned number:', cleaned);

    const productInfo = await verifyByNumber(cleaned);
    if (!productInfo) {
      return sendReply(res, formatNotFound(cleaned));
    }
    return sendReply(res, formatVerified(productInfo));

  } catch (error) {
    console.error('[image.js] Image Vision Error:', error.message);
    return sendReply(res, "Image processing failed. Please type the NAFDAC number instead.");
  }
}

module.exports = { handleImage };
