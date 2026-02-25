const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const OPENAI_BASE = process.env.OPENAI_BASE_URL || 'https://api.openai.com';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function callOpenAI(messages, model = OPENAI_MODEL) {
  if (!OPENAI_KEY) throw new Error('OpenAI API key not configured');
  const url = `${OPENAI_BASE.replace(/\/$/, '')}/v1/chat/completions`;
  const resp = await axios.post(url, { model, messages }, { headers: { Authorization: `Bearer ${OPENAI_KEY}` } });
  return resp.data;
}

async function translateHtmlToMarkdown(cleanHtml, metadata) {
  const prompt = fs.readFileSync(path.join(__dirname, 'prompts', 'translate_prompt.md'), 'utf-8');
  const userMessage = `Translate the following HTML to Chinese Markdown. Metadata: ${JSON.stringify(metadata)}\n\nHTML:\n${cleanHtml}`;
  const messages = [
    { role: 'system', content: 'You are a professional translator.' },
    { role: 'user', content: prompt + '\n\n' + userMessage },
  ];

  const result = await callOpenAI(messages);
  const content = result?.choices?.[0]?.message?.content || '';
  return content;
}

module.exports = { translateHtmlToMarkdown };

