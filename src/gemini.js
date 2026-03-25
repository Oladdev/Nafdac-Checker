'use strict';

/**
 * gemini.js — Gemini AI Client
 * Shared Google Generative AI client for text and vision handlers.
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = 'gemini-1.5-flash';

module.exports = { genAI, MODEL };
