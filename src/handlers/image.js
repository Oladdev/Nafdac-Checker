const fetch = require('node-fetch');
const { Buffer } = require('buffer');
const { client, MODEL } = require('../claude');
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
    let base64Image;
    try {
      base64Image = await downloadImageAsBase64(mediaUrl);
    } catch (err) {
      console.error('Image Download Error:', err);
      return sendReply(res, "I couldn't fetch that image. Please try again.");
    }

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Image
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
      }]
    });

    const extracted = response.content[0].text.trim().toUpperCase();
    
    if (extracted === 'NOT_FOUND' || !extracted) {
      return sendReply(res, `📷 I couldn't read a NAFDAC number from that image.

Try:
• Taking a clearer, well-lit photo
• Zooming in on the registration number
• Or type the number directly (e.g. A1-5645)`);
    }

    const productInfo = await verifyByNumber(extracted);
    if (!productInfo) {
      return sendReply(res, formatNotFound(extracted));
    }
    return sendReply(res, formatVerified(productInfo));

  } catch (error) {
    console.error('Image Vision Error:', error);
    return sendReply(res, "Image processing failed. Please type the NAFDAC number instead.");
  }
}

module.exports = { handleImage };
