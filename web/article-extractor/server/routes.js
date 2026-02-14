const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'tmp/uploads/' });
const storage = require('./storage');
const fetcher = require('./fetcher');
const cleaner = require('./cleaner');
const translator = require('./translator');
const fs = require('fs-extra');
const path = require('path');

const { extractUrlsFromMarkdown, extractLinksWithText } = require('./utils');

// serve preview helper script
router.get('/preview-helper.js', async (req, res) => {
  try {
    const helperPath = path.join(__dirname, 'preview-helper.js');
    if (!fs.existsSync(helperPath)) return res.status(404).send('not found');
    res.setHeader('Content-Type', 'application/javascript');
    return res.send(await fs.readFile(helperPath, 'utf-8'));
  } catch (err) {
    console.error(err);
    return res.status(500).send('error');
  }
});

// POST /api/upload - receive markdown file and extract urls
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const content = await storage.readUploadedFile(req.file.path);
    // create a backup directory named after the uploaded file (sanitized base name)
    // decode possible mojibake produced by multer: treat originalname as latin1 bytes and decode to utf8
    const originalNameRaw = req.file.originalname || `uploaded-${Date.now()}`;
    let originalName;
    try {
      originalName = Buffer.from(originalNameRaw, 'latin1').toString('utf-8');
    } catch (e) {
      // fallback to the raw name if decoding fails
      originalName = originalNameRaw;
    }
    const baseNameNoExt = path.basename(originalName, path.extname(originalName));
    const desiredBackupId = storage.sanitizeFileName(baseNameNoExt || originalName);
    const backupId = storage.createBackupDirNamed(desiredBackupId);
    // save the uploaded file into the created backup directory (use decoded originalName for proper UTF-8 filenames)
    const saved = await storage.saveUploadedFile(backupId, originalName, content);
    const dir = storage.getBackupDir(backupId);
    const uploadDirName = storage.sanitizeFileName(baseNameNoExt || saved.savedName || saved.originalName || `uploaded-${Date.now()}`);
    await fs.ensureDir(path.join(dir, uploadDirName));

    const urls = extractUrlsFromMarkdown(content || '');
    const links = extractLinksWithText(content || '');

    // filter out unwanted domains
    const IGNORED_DOMAINS = ['frontendweekly.cn', 'github.com'];
    function isIgnoredDomain(raw) {
      if (!raw) return false;
      try {
        const u = new URL(raw);
        const host = (u.hostname || '').toLowerCase();
        return IGNORED_DOMAINS.some(d => host === d || host.endsWith('.' + d));
      } catch (e) {
        // if parsing fails, try simple string match
        try {
          const hostOnly = raw.replace(/^https?:\/\//i, '').split(/[\/#?]/)[0].toLowerCase();
          return IGNORED_DOMAINS.some(d => hostOnly === d || hostOnly.endsWith('.' + d));
        } catch (e2) { return false; }
      }
    }

    // apply filter
    const filteredLinks = (links || []).filter(l => !isIgnoredDomain(l.url));
    const filteredUrls = (urls || []).filter(u => !isIgnoredDomain(u));
    // prepare articles array with id/title/url for frontend display
    const articles = [];
    let idx = 0;
    for (const l of filteredLinks) {
      const title = (l.text || l.url || '').toString().trim();
      const id = storage.sanitizeFileName(title) || `article-${Date.now()}-${idx++}`;
      articles.push({ id, url: l.url, title });
    }
    // add any urls not present in links
    for (const u of filteredUrls) {
      if (!articles.find(a => a.url === u)) {
        const title = u;
        const id = storage.sanitizeFileName(title) || `article-${Date.now()}-${idx++}`;
        articles.push({ id, url: u, title });
      }
    }
    const manifestData = { urls: filteredUrls, articles, uploaded: { originalName: saved.originalName, savedName: saved.savedName, uploadDir: uploadDirName } };
    await storage.writeManifest(backupId, manifestData);
    return res.json({ id: backupId, urls: filteredUrls, articles, uploaded: manifestData.uploaded });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/fetch-article
router.post('/fetch-article', async (req, res) => {
  try {
    const { id, url, title, mode = 'http' } = req.body;
    if (!id || !url) return res.status(400).json({ error: 'Missing id or url' });
    // title is provided by frontend and used as filename
    const dir = storage.getBackupDir(id);
    const manifest = await storage.readManifest(id) || {};

    // determine parent directory from upload info (created during upload)
    const parentDirName = (manifest.uploaded && manifest.uploaded.uploadDir) ? manifest.uploaded.uploadDir : (manifest.uploaded && manifest.uploaded.savedName ? storage.sanitizeFileName(manifest.uploaded.savedName) : 'uploads');

    // determine filename from title (frontend provides); fallback to sanitized URL
    let fileBase = title ? storage.sanitizeFileName(title) : storage.sanitizeFileName(url);
    if (!fileBase) fileBase = `article-${Date.now()}`;
    const rawPath = `${parentDirName}/${fileBase}.html`;
    const rawFullPath = path.join(dir, rawPath);

    // if the file already exists, return its local url
    if (fs.existsSync(rawFullPath)) {
      const localUrl = `/api/backups/${id}/${rawPath}`;
      return res.json({ localUrl });
    }

    // fetch the page
    const fetched = await fetcher.fetchPage(url, { mode });
    if (!fetched.success) return res.status(500).json({ error: fetched.error });

    // prepare HTML: remove external scripts for safety, inject base tag
    let html = fetched.html || '';
    html = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    const baseTag = `<base href="${fetched.finalUrl || url}">`;
    if (/<head[^>]*>/i.test(html)) html = html.replace(/<head[^>]*>/i, match => match + '\n' + baseTag);
    else html = baseTag + html;

    // inject a simple marker script to indicate this file was processed (and can be used by UI if needed)
    const marker = `\n<script id="__fw_marker__">(function(){window.__fw_processed = true; window.__fw_source = ${JSON.stringify(url)};})();</script>\n`;
    // inject external preview helper script reference using absolute URL so saved pages resolve correctly
    const helperRef = `\n<script src="${req.protocol}://${req.get('host')}/api/preview-helper.js"></script>\n`;
    if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, marker + helperRef + '\n</body>');
    else html = html + marker + helperRef;

    // ensure parent dir exists and write file
    await fs.ensureDir(path.join(dir, parentDirName));
    await fs.writeFile(rawFullPath, html, 'utf-8');

    // update manifest: record this article
    manifest.articles = manifest.articles || [];
    // use fileBase as id for mapping
    manifest.articles.push({ id: fileBase, url, rawPath });
    await storage.writeManifest(id, manifest);

    // return only local accessible url
    const localUrl = `/api/backups/${id}/${rawPath}`;
    return res.json({ localUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/clean
router.post('/clean', async (req, res) => {
  try {
    const { id, articleId } = req.body;
    if (!id || !articleId) return res.status(400).json({ error: 'Missing id or articleId' });
    const dir = storage.getBackupDir(id);
    const manifest = await storage.readManifest(id) || {};
    let article = (manifest.articles || []).find(a => a.id === articleId);

    // fallback: if article not in manifest, try to find raw file
    if (!article) {
      const rawPathCandidate = `raw/${articleId}.html`;
      const rawFull = path.join(dir, rawPathCandidate);
      if (fs.existsSync(rawFull)) {
        article = { id: articleId, url: null, rawPath: rawPathCandidate, resources: [] };
        manifest.articles = manifest.articles || [];
        manifest.articles.push(article);
      } else {
        // try to match any raw file starting with articleId
        const rawDir = path.join(dir, 'raw');
        if (fs.existsSync(rawDir)) {
          const files = fs.readdirSync(rawDir);
          const match = files.find(f => f.startsWith(articleId));
          if (match) {
            article = { id: articleId, url: null, rawPath: `raw/${match}`, resources: [] };
            manifest.articles = manifest.articles || [];
            manifest.articles.push(article);
          }
        }
      }
    }

    if (!article) return res.status(404).json({ error: 'Article not found in manifest or raw files' });

    const rawHtml = await fs.readFile(path.join(dir, article.rawPath), 'utf-8');
    const { cleanHtml, metadata } = cleaner.basicClean(rawHtml);
    const cleanPath = `clean/${article.id}.html`;
    await fs.writeFileSync(path.join(dir, cleanPath), cleanHtml, 'utf-8');
    article.cleanPath = cleanPath;
    article.metadata = metadata;
    await storage.writeManifest(id, manifest);
    return res.json({ articleId: article.id, cleanPath, previewHtml: cleanHtml, metadata });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/translate
router.post('/translate', async (req, res) => {
  try {
    const { id, articleId } = req.body;
    if (!id || !articleId) return res.status(400).json({ error: 'Missing id or articleId' });
    if (process.env.ENABLE_MODEL_CALL !== 'true') return res.status(400).json({ error: 'Model call disabled' });
    const dir = storage.getBackupDir(id);
    const manifest = await storage.readManifest(id);
    const article = (manifest.articles || []).find(a => a.id === articleId);
    if (!article || !article.cleanPath) return res.status(404).json({ error: 'Article cleaned content not found' });
    const cleanHtml = await fs.readFile(path.join(dir, article.cleanPath), 'utf-8');
    const md = await translator.translateHtmlToMarkdown(cleanHtml, article.metadata || {});
    const outDir = path.join(dir, 'translated', articleId);
    await fs.ensureDir(outDir);
    const outPath = path.join(outDir, 'index.md');
    await fs.writeFile(outPath, md, 'utf-8');
    article.translatedPath = `translated/${articleId}/index.md`;
    await storage.writeManifest(id, manifest);
    return res.json({ articleId, translatedPath: article.translatedPath });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});


// GET /api/manifest/:id
router.get('/manifest/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mf = await storage.readManifest(id);
    if (!mf) return res.status(404).json({ error: 'manifest not found' });
    return res.json(mf);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/backup/:id/list
router.get('/backup/:id/list', async (req, res) => {
  try {
    const { id } = req.params;
    const mf = await storage.readManifest(id);
    if (!mf) return res.status(404).json({ error: 'backup not found' });
    return res.json(mf);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// preview endpoint: serves a cleaned version of raw HTML with injected helper script
router.get('/preview/:id/:articleId', async (req, res) => {
  try {
    const { id, articleId } = req.params;
    const dir = storage.getBackupDir(id);
    const mf = await storage.readManifest(id) || {};
    const article = (mf.articles || []).find(a => a.id === articleId);

    // locate raw file
    let rawPath = article ? article.rawPath : `raw/${articleId}.html`;
    const rawFull = path.join(dir, rawPath);
    if (!fs.existsSync(rawFull)) {
      // try to find a file that starts with articleId
      const files = fs.existsSync(path.join(dir, 'raw')) ? fs.readdirSync(path.join(dir, 'raw')) : [];
      const match = files.find(f => f.startsWith(articleId));
      if (match) rawPath = `raw/${match}`;
    }

    const rawFullFinal = path.join(dir, rawPath);
    if (!fs.existsSync(rawFullFinal)) return res.status(404).send('Raw HTML not found');

    let html = await fs.readFile(rawFullFinal, 'utf-8');

    // remove script tags to avoid executing external scripts in preview
    html = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');

    // inject base tag to preserve relative URLs
    const baseTag = `<base href="${article && article.url ? article.url : ''}">`;
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head[^>]*>/i, match => match + '\n' + baseTag);
    } else {
      html = baseTag + html;
    }

    // rewrite asset URLs to point to /api/backups/<backupId>/... if assets exist
    // simple replacement: replace src="/path -> src="/api/backups/<id>/path
    html = html.replace(/src="\/(?!api\/backups)([^"]*)"/gi, `src="/api/backups/${id}/$1"`);
    html = html.replace(/href="\/(?!api\/backups)([^"]*)"/gi, `href="/api/backups/${id}/$1"`);

    // inject external preview helper script reference using absolute URL so saved pages resolve correctly
    const helperRef = `\n<script src="${req.protocol}://${req.get('host')}/api/preview-helper.js"></script>\n`;
    // insert helper reference before closing body
    if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, helperRef + '\n</body>');
    else html = html + helperRef;

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    console.error(err);
    return res.status(500).send('error: ' + err.message);
  }
});

// GET /api/work/:id/* - serve generated work files (markdown) as plain text for preview
router.get('/work/:id/*', async (req, res) => {
  try {
    const { id } = req.params;
    const relPath = req.params[0]; // wildcard part
    if (!id || !relPath) return res.status(400).send('missing id or path');
    const dir = storage.getBackupDir(id);
    const target = path.join(dir, relPath);
    const resolved = path.resolve(target);
    // ensure resolved path is inside backup dir to prevent path traversal
    if (!resolved.startsWith(path.resolve(dir))) return res.status(403).send('forbidden');
    if (!fs.existsSync(resolved)) return res.status(404).send('file not found');
    const stat = await fs.stat(resolved);
    if (!stat.isFile()) return res.status(400).send('not a file');
    const content = await fs.readFile(resolved, 'utf-8');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(content);
  } catch (err) {
    console.error(err);
    return res.status(500).send('error: ' + err.message);
  }
});

// POST /api/save-cleaned
router.post('/save-cleaned', async (req, res) => {
  try {
    const { id, articleId, htmlFragment } = req.body;
    if (!id || !articleId || typeof htmlFragment !== 'string') return res.status(400).json({ error: 'Missing id/articleId/htmlFragment' });
    const dir = storage.getBackupDir(id);
    const mf = await storage.readManifest(id) || {};
    const article = (mf.articles || []).find(a => a.id === articleId || a.url === articleId);
    if (!article) return res.status(404).json({ error: 'Article not found in manifest' });

    // determine filename from article title (fallback to sanitized url or id)
    const rawTitle = article.title || article.url || articleId;
    let fileBase = storage.sanitizeFileName(rawTitle || `article-${Date.now()}`);
    if (!fileBase) fileBase = `article-${Date.now()}`;

    // ensure work dir exists under backup
    const workDir = path.join(dir, 'work');
    await fs.ensureDir(workDir);

    // output file named from title
    const outName = `${fileBase}.md`;
    const outPath = path.join(workDir, outName);

    // read prompt template (raw) and replace placeholder if frontend provided values
    const promptPath = path.join(__dirname, 'prompts', 'translate_prompt.md');
    let tpl = '';
    if (fs.existsSync(promptPath)) tpl = await fs.readFile(promptPath, 'utf-8');

    // Allow frontend to pass original title/url to replace the specific placeholder
    // front-end may send originalTitle and originalUrl in the request body
    const originalTitle = (req.body && req.body.originalTitle) || '';
    const originalUrl = (req.body && req.body.originalUrl) || '';
    if (tpl && (originalTitle || originalUrl)) {
      const replacement = `[${originalTitle || ''}](${originalUrl || ''})`;
      // exact match replace of the placeholder string in template
      tpl = tpl.split('[${原文英文标题}](${原文链接})').join(replacement);
    }

    // build final content: template first (possibly patched), then cleaned html wrapped in a markdown html code fence
    const finalContent = (tpl ? tpl + '\n\n' : '') + '```html\n' + htmlFragment + '\n```\n';

    // overwrite the file with the template followed by the html fragment
    await fs.writeFile(outPath, finalContent, 'utf-8');

    // update manifest
    article.cleanedInputPath = `work/${outName}`;
    mf.articles = mf.articles || [];
    await storage.writeManifest(id, mf);

    return res.json({ savedPath: article.cleanedInputPath });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
