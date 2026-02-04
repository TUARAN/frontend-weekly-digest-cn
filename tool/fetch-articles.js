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
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  timeout: 30000,
};

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

// 简单的 HTML 转 Markdown
function htmlToMarkdown(html, baseUrl) {
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
    const { markdown, images, title } = htmlToMarkdown(html, url);
    
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
    if (images.length > 0) {
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

// 主函数
async function main() {
  console.log('========================================');
  console.log('  批量链接解析工具');
  console.log('========================================\n');
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('用法:');
    console.log('  node fetch-articles.js <链接文件路径>');
    console.log('  node fetch-articles.js <URL1> <URL2> ...');
    console.log('\n示例:');
    console.log('  node fetch-articles.js urls.txt');
    console.log('  node fetch-articles.js https://example.com/article1 https://example.com/article2');
    process.exit(1);
  }
  
  // 确保输出目录存在
  ensureDirectoryExists(DEFAULT_CONFIG.outputDir);
  
  // 获取 URL 列表
  let urls = [];
  if (args.length === 1 && fs.existsSync(args[0])) {
    // 从文件读取
    console.log(`从文件读取链接: ${args[0]}`);
    urls = readUrlsFromFile(args[0]);
  } else {
    // 从命令行参数读取
    urls = args.filter(arg => /^https?:\/\//i.test(arg));
  }
  
  if (urls.length === 0) {
    console.error('错误: 没有找到有效的 URL');
    process.exit(1);
  }
  
  console.log(`找到 ${urls.length} 个链接\n`);
  
  // 处理所有链接
  const results = [];
  for (let i = 0; i < urls.length; i++) {
    const result = await processUrl(urls[i], i + 1);
    results.push({ url: urls[i], ...result });
    
    // 添加延迟避免请求过快
    if (i < urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // 输出统计
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

module.exports = { processUrl, htmlToMarkdown };
