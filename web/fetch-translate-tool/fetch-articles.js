#!/usr/bin/env node

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

/**
 * 批量链接解析工具
 * 用于读取链接、抓取内容、下载图片并生成本地 markdown 文件
 */

// 默认配置（CLI 与可视化 UI 均可复用）
const DEFAULT_CONFIG = {
  outputDir: path.join(__dirname, 'output'),
  imagesDir: path.join(__dirname, 'output', 'images'),
  downloadImages: false,
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  timeout: 30000,
};

// OpenAI-compatible translation (optional)
const LLM_BASE_URL = process.env.OPENAI_BASE_URL || '';
const LLM_API_KEY = process.env.OPENAI_API_KEY || '';
const LLM_MODEL = process.env.OPENAI_MODEL || '';
const LLM_ENABLED = process.env.OPENAI_ENABLE_TRANSLATION === 'true';

function resolveConfig(override = {}) {
  return {
    ...DEFAULT_CONFIG,
    ...override,
  };
}

// 确保输出目录存在
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// HTTP/HTTPS 请求封装
function httpGet(url, options = {}, config = DEFAULT_CONFIG) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      headers: {
        'User-Agent': config.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        ...options.headers,
      },
      timeout: config.timeout,
    };

    protocol.get(url, requestOptions, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // 处理重定向
        const redirectUrl = new URL(res.headers.location, url).href;
        return httpGet(redirectUrl, options, config).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        if (options.binary) {
          resolve(Buffer.concat(chunks));
        } else {
          resolve(Buffer.concat(chunks).toString('utf-8'));
        }
      });
    }).on('error', reject);
  });
}

function httpPostJson(url, body, options = {}, config = DEFAULT_CONFIG) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const payload = Buffer.from(JSON.stringify(body));
    const requestOptions = {
      method: 'POST',
      headers: {
        'User-Agent': config.userAgent,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': String(payload.length),
        ...(options.headers || {}),
      },
      timeout: config.timeout,
    };

    const req = protocol.request(parsedUrl, requestOptions, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf-8');
        resolve({ statusCode: res.statusCode || 0, text });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy(new Error(`Request timeout: ${url}`));
    });
    req.write(payload);
    req.end();
  });
}

async function translateWithLLM(text, config = DEFAULT_CONFIG) {
  if (!LLM_ENABLED || !LLM_BASE_URL || !LLM_API_KEY || !LLM_MODEL) return null;

  const endpoint = `${LLM_BASE_URL.replace(/\/$/, '')}/chat/completions`;
  const { statusCode, text: respText } = await httpPostJson(
    endpoint,
    {
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: 'You are a professional translator.' },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
    },
    {
      headers: {
        Authorization: `Bearer ${LLM_API_KEY}`,
      },
    },
    {
      ...config,
      userAgent: config.userAgent,
    }
  );

  if (statusCode < 200 || statusCode >= 300) {
    throw new Error(`LLM request failed: HTTP ${statusCode} ${respText}`);
  }

  let data;
  try {
    data = JSON.parse(respText);
  } catch {
    throw new Error(`LLM response is not JSON: ${respText.slice(0, 300)}`);
  }

  const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  return typeof content === 'string' ? content : null;
}

function splitMarkdown(markdown, maxChars = 6000) {
  const blocks = String(markdown || '').split(/\n\n+/g);
  const chunks = [];
  let buffer = '';

  for (const block of blocks) {
    const next = buffer ? `${buffer}\n\n${block}` : block;
    if (next.length <= maxChars) {
      buffer = next;
      continue;
    }

    if (buffer) chunks.push(buffer);
    if (block.length > maxChars) {
      chunks.push(block);
      buffer = '';
    } else {
      buffer = block;
    }
  }

  if (buffer) chunks.push(buffer);
  return chunks;
}

async function translateMarkdown(markdown, config = DEFAULT_CONFIG) {
  const chunks = splitMarkdown(markdown);
  const translated = [];

  for (const chunk of chunks) {
    const prompt = `请把下面 Markdown 翻译成中文。要求：\n- 保留 Markdown 结构、链接、代码块、内联代码、列表与引用\n- 不要添加多余内容\n- 保留专有名词，必要时加括号中文释义\n\n${chunk}`;
    const result = await translateWithLLM(prompt, config);
    translated.push(result || chunk);
  }

  return translated.join('\n\n');
}

function toAbsoluteUrl(maybeRelativeUrl, baseUrl) {
  try {
    return new URL(maybeRelativeUrl, baseUrl).href;
  } catch {
    return maybeRelativeUrl;
  }
}

function getLongestCapture(html, patterns) {
  let longest = null;
  for (const pattern of patterns) {
    const globalPattern = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
    for (const match of html.matchAll(globalPattern)) {
      const captured = match[1];
      if (!captured) continue;
      if (!longest || captured.length > longest.length) {
        longest = captured;
      }
    }
  }
  return longest;
}

function parseJinaMarkdownProxy(text, fallbackTitle = 'Untitled') {
  if (typeof text !== 'string' || text.length === 0) return null;
  const marker = 'Markdown Content:';
  const idx = text.indexOf(marker);
  if (idx === -1) return null;

  const header = text.slice(0, idx);
  const body = text.slice(idx + marker.length).trim();
  if (!body) return null;

  const titleMatch = header.match(/\bTitle:\s*(.+)\s*$/m);
  const title = (titleMatch?.[1] || fallbackTitle).trim();

  // Many sites return a generic title via the proxy; keep it but ensure a stable H1.
  const markdown = `# ${title}\n\n${body}\n`;
  return { markdown, title };
}

// 简单的 HTML 转 Markdown
function htmlToMarkdown(html, baseUrl, options = {}) {
  const { downloadImages = false } = options;
  // 移除 script 和 style 标签
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // 提取文章内容（尝试常见的内容容器，取“最长”的那段以避免过早截断）
  const contentPatterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<div[^>]*class=['"][^'"]*(content|post|prose|markdown|article)[^'"]*['"][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id=['"][^'"]*(content|main|article)[^'"]*['"][^>]*>([\s\S]*?)<\/div>/i,
  ].map((pattern) => {
    // 标准化成单捕获组：如果 pattern 有多个捕获组，取最后一个内容组
    const source = pattern.source;
    if (source.includes('(content|post|prose|markdown|article)')) {
      return new RegExp(source.replace('(content|post|prose|markdown|article)', '(?:content|post|prose|markdown|article)').replace('(\\[\\s\\S\\]*?)', '([\\s\\S]*?)'), pattern.flags);
    }
    if (source.includes('(content|main|article)')) {
      return new RegExp(source.replace('(content|main|article)', '(?:content|main|article)').replace('(\\[\\s\\S\\]*?)', '([\\s\\S]*?)'), pattern.flags);
    }
    return pattern;
  });

  let content = getLongestCapture(html, contentPatterns) || html;

  // 回退策略：部分站点（大量嵌套 div）会导致用正则截取容器时“过早结束”。
  // 如果提取结果过短，则从首个 <h1> 开始截取到订阅区/页脚附近。
  if (content.length < 2000) {
    const h1Index = html.search(/<h1\b/i);
    if (h1Index !== -1) {
      const endCandidates = [
        html.search(/<footer\b/i),
        html.search(/Subscribe to our monthly newsletter/i),
        html.search(/Interested in the future of Javascript tooling\?/i),
      ].filter((idx) => idx !== -1 && idx > h1Index);

      const endIndex = endCandidates.length > 0 ? Math.min(...endCandidates) : html.length;
      content = html.slice(h1Index, endIndex);
    }
  }
  
  // 提取标题
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  let title = titleMatch ? titleMatch[1].trim() : 'Untitled';
  
  // 清理标题中的网站名称
  title = title.split(/[-–|]/)[0].trim();
  
  let markdown = `# ${title}\n\n`;
  
  // 提取图片
  const images = [];
  const seenImageNames = new Set();
  function reserveImageName(candidateName) {
    const clean = (candidateName || '').split('?')[0].split('#')[0] || `image-${images.length + 1}.jpg`;
    let name = clean;
    let suffix = 2;
    while (seenImageNames.has(name)) {
      const ext = path.extname(clean) || '.jpg';
      const base = path.basename(clean, ext);
      name = `${base}-${suffix}${ext}`;
      suffix++;
    }
    seenImageNames.add(name);
    return name;
  }

  content = content.replace(/<img\b([^>]*?)>/gi, (fullMatch, attrs) => {
    const srcMatch = attrs.match(/\bsrc=["']([^"']+)["']/i);
    const srcsetMatch = attrs.match(/\bsrcset=["']([^"']+)["']/i);
    const candidateSrc = srcMatch?.[1] || srcsetMatch?.[1]?.split(',')?.pop()?.trim()?.split(' ')?.[0];
    if (!candidateSrc || candidateSrc.startsWith('data:')) return '';

    const imgUrl = toAbsoluteUrl(candidateSrc, baseUrl);
    if (!downloadImages) {
      return `![](${imgUrl})`;
    }

    try {
      const imgPathname = new URL(imgUrl).pathname;
      const imgName = reserveImageName(path.basename(imgPathname));
      images.push({ url: imgUrl, name: imgName });
      return `![](images/${imgName})`;
    } catch {
      return '';
    }
  });
  
  // 转换标题标签
  content = content.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n');
  content = content.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n');
  content = content.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n');
  content = content.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n');
  content = content.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n##### $1\n');
  content = content.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\n###### $1\n');
  
  // 转换链接（相对路径转绝对 URL）
  content = content.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, (match, href, text) => {
    const abs = toAbsoluteUrl(href, baseUrl);
    return `[${text}](${abs})`;
  });
  
  // 转换列表
  content = content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  content = content.replace(/<ul[^>]*>(.*?)<\/ul>/gi, '\n$1\n');
  content = content.replace(/<ol[^>]*>(.*?)<\/ol>/gi, '\n$1\n');
  
  // 转换段落
  content = content.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n');
  
  // 转换换行
  content = content.replace(/<br\s*\/?>/gi, '\n');
  
  // 转换强调
  content = content.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  content = content.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  content = content.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  content = content.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  
  // 转换代码
  content = content.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  content = content.replace(/<pre[^>]*>(.*?)<\/pre>/gi, '\n```\n$1\n```\n');
  
  // 移除所有剩余的 HTML 标签
  content = content.replace(/<[^>]+>/g, '');
  
  // 解码 HTML 实体
  content = content.replace(/&nbsp;/g, ' ');
  content = content.replace(/&lt;/g, '<');
  content = content.replace(/&gt;/g, '>');
  content = content.replace(/&amp;/g, '&');
  content = content.replace(/&quot;/g, '"');
  content = content.replace(/&#39;/g, "'");
  
  // 清理多余的空行
  content = content.replace(/\n{3,}/g, '\n\n');
  
  markdown += content.trim();
  
  return { markdown, images, title };
}

// 下载图片
async function downloadImage(url, outputPath, config) {
  try {
    console.log(`  下载图片: ${url}`);
    const imageData = await httpGet(url, { binary: true }, config);
    fs.writeFileSync(outputPath, imageData);
    console.log(`  ✓ 图片已保存: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`  ✗ 图片下载失败: ${url} - ${error.message}`);
    return false;
  }
}

// 处理单个链接
async function processUrl(url, index, configOverride = {}) {
  console.log(`\n[${index}] 处理: ${url}`);

  const config = resolveConfig(configOverride);
  
  try {
    // 获取网页内容
    console.log('  抓取网页内容...');
    const html = await httpGet(url, {}, config);
    
    // 转换为 Markdown
    console.log('  转换为 Markdown...');
    let { markdown, images, title } = htmlToMarkdown(html, url, {
      downloadImages: config.downloadImages,
    });

    // 对于 SPA/JS 渲染页面，HTML 往往没有正文；提取结果会非常短。
    // 这里做一个保守的兜底：内容过短则通过 jina.ai 的文本代理重试。
    if ((markdown || '').trim().length < 800) {
      try {
        console.log('  内容过短，尝试使用 Jina 代理抓取...');
        const proxyConfig = {
          ...config,
          // jina.ai 对部分浏览器 UA（例如 Chrome/120 这一串）会返回 403。
          // 这里使用更“温和”的 UA 来提高命中率。
          userAgent: 'Mozilla/5.0',
        };
        const jinaText = await httpGet(`https://r.jina.ai/http://${url}`, {}, proxyConfig);
        const parsed = parseJinaMarkdownProxy(jinaText, title);
        if (parsed?.markdown && parsed.markdown.trim().length > markdown.trim().length) {
          markdown = parsed.markdown;
          title = parsed.title;
          images = [];
        }
      } catch (proxyError) {
        // ignore proxy errors and continue with the original extraction
      }
    }
    
    // 可选：翻译 Markdown（覆盖写回同一文件内容）
    if (LLM_ENABLED && LLM_BASE_URL && LLM_API_KEY && LLM_MODEL) {
      try {
        console.log('  翻译为中文...');
        markdown = await translateMarkdown(markdown, config);
      } catch (e) {
        console.warn(`  ⚠ 翻译失败（将保留原文）: ${e && e.message ? e.message : String(e)}`);
      }
    }

    // 生成安全的文件名
    const safeTitle = title
      .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
    const timestamp = Date.now();
    const filename = `${safeTitle}-${timestamp}.md`;
    const outputPath = path.join(config.outputDir, filename);
    
    // 保存 Markdown 文件
    fs.writeFileSync(outputPath, markdown);
    console.log(`  ✓ Markdown 已保存: ${outputPath}`);
    
    // 下载图片
    if (config.downloadImages && images.length > 0) {
      console.log(`  找到 ${images.length} 张图片`);
      ensureDirectoryExists(config.imagesDir);
      
      for (const image of images) {
        const imagePath = path.join(config.imagesDir, image.name);
        await downloadImage(image.url, imagePath, config);
      }
    }
    
    return { success: true, title, filename };
  } catch (error) {
    console.error(`  ✗ 处理失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 读取链接列表
function readUrlsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // If this is a markdown/doc file, extract URLs from the whole content.
    const extracted = extractUrlsFromMarkdown(content);
    if (extracted && extracted.length) return extracted;

    return content
      .split('\n')
      .map(line => line.trim())
      .map(line => line.replace(/[\s\)\]\}>,.;:]+$/g, ''))
      .filter(line => line && !line.startsWith('#') && /^https?:\/\//i.test(line));
  } catch (error) {
    console.error(`读取文件失败: ${error.message}`);
    return [];
  }
}

function sanitizeUrl(raw) {
  return raw.replace(/[\s\)\]\}>,.;:]+$/g, '').trim();
}

function isLikelyArticleUrl(url) {
  const lower = url.toLowerCase();
  if (!/^https?:\/\//i.test(lower)) return false;
  if (/(\.(png|jpe?g|gif|webp|svg|mp4|mov|webm|mp3|pdf|zip))(\?|#|$)/i.test(lower)) return false;
  return true;
}

function extractUrlsFromMarkdown(markdown) {
  const matches = markdown.matchAll(/https?:\/\/[^\s<>")\]]+/gi);
  const urls = new Set();
  for (const match of matches) {
    const cleaned = sanitizeUrl(match[0]);
    if (isLikelyArticleUrl(cleaned)) {
      urls.add(cleaned);
    }
  }
  return Array.from(urls);
}

function findWeeklyIssues(weeklyDir, issueFilter = null) {
  if (!fs.existsSync(weeklyDir)) {
    console.error(`未找到 weekly 目录: ${weeklyDir}`);
    return [];
  }

  const dirents = fs.readdirSync(weeklyDir, { withFileTypes: true });
  return dirents
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => /^\d+$/.test(name))
    .filter((name) => (issueFilter ? name === String(issueFilter) : true))
    .sort((a, b) => Number(a) - Number(b));
}

function findIssueMainMarkdown(issueDir, issueNumber) {
  const files = fs.readdirSync(issueDir).filter((file) => file.endsWith('.md'));
  const exactName = `前端周刊第${issueNumber}期.md`;
  if (files.includes(exactName)) {
    return path.join(issueDir, exactName);
  }

  const candidates = files.filter((file) => new RegExp(`前端周刊第${issueNumber}期`, 'i').test(file));
  if (candidates.length > 0) {
    return path.join(issueDir, candidates[0]);
  }

  return files.length > 0 ? path.join(issueDir, files[0]) : null;
}

// 主函数
async function main() {
  console.log('========================================');
  console.log('  批量链接解析工具');
  console.log('========================================\n');
  
  const args = process.argv.slice(2);
  
  const weeklyIndex = args.indexOf('--weekly');
  const issueIndex = args.indexOf('--issue');
  const downloadImages = args.includes('--download-images');
  const translateOnlyIndex = args.indexOf('--translate-only');

  const outIndex = args.indexOf('--out');
  const imagesDirIndex = args.indexOf('--images-dir');
  const outputDirOverride = outIndex !== -1 && args[outIndex + 1] && !args[outIndex + 1].startsWith('--')
    ? path.resolve(args[outIndex + 1])
    : null;
  const imagesDirOverride = imagesDirIndex !== -1 && args[imagesDirIndex + 1] && !args[imagesDirIndex + 1].startsWith('--')
    ? path.resolve(args[imagesDirIndex + 1])
    : null;

  const useWeekly = args.length === 0 || weeklyIndex !== -1 || issueIndex !== -1;
  const issueFilter = issueIndex !== -1 ? args[issueIndex + 1] : null;

  if (translateOnlyIndex !== -1) {
    const targetDir = translateOnlyIndex !== -1 && args[translateOnlyIndex + 1] && !args[translateOnlyIndex + 1].startsWith('--')
      ? path.resolve(args[translateOnlyIndex + 1])
      : null;

    if (!LLM_ENABLED || !LLM_BASE_URL || !LLM_API_KEY || !LLM_MODEL) {
      console.error('错误: 未启用翻译。请设置 OPENAI_ENABLE_TRANSLATION=true，并提供 OPENAI_BASE_URL / OPENAI_API_KEY / OPENAI_MODEL');
      process.exit(1);
    }

    const dirToTranslate = targetDir || outputDirOverride || DEFAULT_CONFIG.outputDir;
    if (!fs.existsSync(dirToTranslate)) {
      console.error(`错误: 目录不存在: ${dirToTranslate}`);
      process.exit(1);
    }

    const files = fs.readdirSync(dirToTranslate)
      .filter((f) => f.endsWith('.md'))
      .filter((f) => !/^前端周刊第\d+期\.md$/.test(f));

    if (!files.length) {
      console.log(`未找到可翻译的 Markdown 文件: ${dirToTranslate}`);
      return;
    }

    console.log(`开始翻译：${files.length} 个文件 -> ${dirToTranslate}`);
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const filePath = path.join(dirToTranslate, file);
      try {
        console.log(`[${i + 1}/${files.length}] 翻译: ${file}`);
        const original = fs.readFileSync(filePath, 'utf-8');
        const translated = await translateMarkdown(original, resolveConfig({ outputDir: dirToTranslate }));
        fs.writeFileSync(filePath, translated);
        console.log(`  ✓ 完成: ${file}`);
      } catch (e) {
        console.log(`  ✗ 失败: ${file} - ${e && e.message ? e.message : String(e)}`);
      }
    }

    console.log('翻译任务完成');
    return;
  }

  if (useWeekly) {
    const weeklyPath = weeklyIndex !== -1 && args[weeklyIndex + 1] && !args[weeklyIndex + 1].startsWith('--')
      ? path.resolve(args[weeklyIndex + 1])
      : path.resolve(__dirname, '..', '..', 'weekly');

    const issues = findWeeklyIssues(weeklyPath, issueFilter);
    if (issues.length === 0) {
      console.error('错误: 没有找到可处理的周刊目录');
      process.exit(1);
    }

    const allResults = [];
    for (const issue of issues) {
      const issueDir = path.join(weeklyPath, issue);
      const mainMdPath = findIssueMainMarkdown(issueDir, issue);
      if (!mainMdPath) {
        console.log(`跳过第 ${issue} 期：未找到周刊 Markdown 文件`);
        continue;
      }

      const markdown = fs.readFileSync(mainMdPath, 'utf-8');
      const urls = extractUrlsFromMarkdown(markdown);
      if (urls.length === 0) {
        console.log(`跳过第 ${issue} 期：未找到可抓取链接`);
        continue;
      }

      console.log(`\n第 ${issue} 期：找到 ${urls.length} 个链接`);

      const issueImagesDir = path.join(issueDir, 'images');
      ensureDirectoryExists(issueDir);
      if (downloadImages) ensureDirectoryExists(issueImagesDir);

      const issueResults = [];
      for (let i = 0; i < urls.length; i++) {
        const result = await processUrl(urls[i], i + 1, {
          outputDir: issueDir,
          imagesDir: issueImagesDir,
          downloadImages,
        });
        issueResults.push({ url: urls[i], ...result });

        if (i < urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      allResults.push({ issue, results: issueResults });
    }

    console.log('\n========================================');
    console.log('  处理完成');
    console.log('========================================');

    for (const { issue, results } of allResults) {
      const successCount = results.filter(r => r.success).length;
      console.log(`第 ${issue} 期：成功 ${successCount}/${results.length}`);
      if (successCount < results.length) {
        console.log('  失败的链接:');
        results.filter(r => !r.success).forEach(r => {
          console.log(`    - ${r.url}: ${r.error}`);
        });
      }
    }

    console.log(`\n输出目录: ${path.resolve(weeklyPath)}`);
    return;
  }

  if (args.length === 0) {
    console.log('用法:');
    console.log('  node fetch-articles.js --weekly [weekly目录] [--issue 451] [--download-images]');
    console.log('  node fetch-articles.js <链接文件路径> [--out 输出目录] [--images-dir 图片目录] [--download-images]');
    console.log('  node fetch-articles.js <URL1> <URL2> ... [--download-images]');
    console.log('  node fetch-articles.js --translate-only [目录]  # 翻译目录下已抓取的 Markdown 文件');
    process.exit(1);
  }

  // 确保输出目录存在
  const manualOutputDir = outputDirOverride || DEFAULT_CONFIG.outputDir;
  const manualImagesDir = imagesDirOverride || path.join(manualOutputDir, 'images');
  ensureDirectoryExists(manualOutputDir);

  let urls = [];

  // Extract positionals (exclude flags and their values)
  const consumed = new Set();
  const flagsWithValues = new Set(['--weekly', '--issue', '--out', '--images-dir']);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      consumed.add(i);
      if (flagsWithValues.has(a) && args[i + 1] && !args[i + 1].startsWith('--')) {
        consumed.add(i + 1);
        i += 1;
      }
    }
  }
  const positionals = args.filter((_, idx) => !consumed.has(idx));

  const fileArg = positionals.length === 1 && fs.existsSync(positionals[0]) ? positionals[0] : null;
  if (fileArg) {
    console.log(`从文件读取链接: ${fileArg}`);
    urls = readUrlsFromFile(fileArg);
  } else {
    urls = positionals.filter(arg => /^https?:\/\//i.test(arg));
  }

  if (urls.length === 0) {
    console.error('错误: 没有找到有效的 URL');
    process.exit(1);
  }

  console.log(`找到 ${urls.length} 个链接\n`);

  const results = [];
  for (let i = 0; i < urls.length; i++) {
    const result = await processUrl(urls[i], i + 1, {
      outputDir: manualOutputDir,
      imagesDir: manualImagesDir,
      downloadImages,
    });
    results.push({ url: urls[i], ...result });

    if (i < urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n========================================');
  console.log('  处理完成');
  console.log('========================================');
  const successCount = results.filter(r => r.success).length;
  console.log(`成功: ${successCount}/${results.length}`);

  if (successCount < results.length) {
    console.log('\n失败的链接:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.url}: ${r.error}`);
    });
  }

  console.log(`\n输出目录: ${path.resolve(DEFAULT_CONFIG.outputDir)}`);
}

// 执行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('程序错误:', error);
    process.exit(1);
  });
}

module.exports = {
  processUrl,
  htmlToMarkdown,
  extractUrlsFromMarkdown,
  findWeeklyIssues,
  findIssueMainMarkdown,
};
