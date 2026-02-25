const axios = require('axios');

const DEFAULT_TIMEOUT = 30000;

function buildProxyAgent(proxyUrl) {
  if (!proxyUrl) return null;
  try {
    const { HttpsProxyAgent } = require('https-proxy-agent');
    const agent = new HttpsProxyAgent(proxyUrl);
    return agent;
  } catch (err) {
    throw new Error("https-proxy-agent is required to use FETCH_PROXY but is not installed. Run 'npm install https-proxy-agent' in tools/article-extractor.");
  }
}

async function httpGet(url, options = {}) {
  const timeout = options.timeout || DEFAULT_TIMEOUT;
  const headers = options.headers || {};

  // Determine proxy: allow explicit disabling by setting FETCH_PROXY=none
  let proxyEnv = process.env.FETCH_PROXY || process.env.HTTP_PROXY || process.env.HTTPS_PROXY || null;
  if (proxyEnv && typeof proxyEnv === 'string' && ['none', 'false', '0'].includes(proxyEnv.toLowerCase())) {
    proxyEnv = null; // explicit disable
  }
  // default proxy to local 127.0.0.1:8999 if nothing else provided
  const proxyUrl = proxyEnv || 'http://127.0.0.1:8999';

  let agent = null;
  if (proxyUrl) {
    agent = buildProxyAgent(proxyUrl);
  }

  const axiosOpts = { headers, timeout, responseType: 'text', maxRedirects: 5 };
  if (agent) {
    axiosOpts.httpAgent = agent;
    axiosOpts.httpsAgent = agent;
    axiosOpts.proxy = false;
  }

  const response = await axios.get(url, axiosOpts);
  return { html: response.data, status: response.status, finalUrl: response.request?.res?.responseUrl || url };
}

async function fetchPage(url, { mode = 'http', timeout = DEFAULT_TIMEOUT } = {}) {
  // Support multiple fetch modes in the future; for now only 'http' is implemented.
  if (mode && mode !== 'http') {
    // return a clear error so callers can decide whether to fallback to puppeteer
    return { success: false, error: `Fetch mode '${mode}' not implemented` };
  }

  try {
    const res = await httpGet(url, { timeout, headers: { 'User-Agent': process.env.FETCH_USER_AGENT || 'Mozilla/5.0' } });
    return { success: true, html: res.html, finalUrl: res.finalUrl, status: res.status };
  } catch (err) {
    console.warn(`http fetch failed for ${url}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

module.exports = {
  fetchPage,
};
