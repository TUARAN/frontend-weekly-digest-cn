const els = {
  urls: document.getElementById('urls'),
  issue: document.getElementById('issue'),
  modeWeekly: document.getElementById('modeWeekly'),
  modeManual: document.getElementById('modeManual'),
  weeklyOptions: document.getElementById('weeklyOptions'),
  start: document.getElementById('start'),
  clear: document.getElementById('clear'),
  status: document.getElementById('status'),
  progress: document.getElementById('progress'),
  jobId: document.getElementById('jobId'),
  logs: document.getElementById('logs'),
  results: document.getElementById('results'),
};

let pollingTimer = null;

function setStatus(text) {
  els.status.textContent = text;
  els.status.dataset.status = text;
}

function appendLogs(lines) {
  const text = Array.isArray(lines) ? lines.join('\n') : String(lines || '');
  els.logs.textContent = text;
  els.logs.scrollTop = els.logs.scrollHeight;
}

function renderResults(results) {
  if (!Array.isArray(results) || results.length === 0) {
    els.results.innerHTML = '<div class="muted">暂无结果</div>';
    return;
  }

  const rows = results.map((r) => {
    const ok = r.success;
    const title = r.title ? escapeHtml(r.title) : '';
    const urlText = escapeHtml(r.url);
    const urlHref = escapeAttr(r.url);
    const issueText = r.issue ? `第 ${escapeHtml(r.issue)} 期` : '';

    const openLink = `<a href="${urlHref}" target="_blank" rel="noreferrer">打开原文</a>`;
    const fileLink = ok && (r.fileUrl || r.filename)
      ? `<a href="${escapeAttr(r.fileUrl || `/output/${encodeURIComponent(r.filename)}`)}" target="_blank" rel="noreferrer">下载 Markdown</a>`
      : '';

    const err = !ok ? `<div class="error">${escapeHtml(r.error || '失败')}</div>` : '';

    return `
      <div class="result ${ok ? 'ok' : 'bad'}">
        <div class="top">
          <div class="title">${title || '(无标题)'}</div>
          <div class="tag">${ok ? 'success' : 'failed'}</div>
        </div>
        ${issueText ? `<div class="meta">${issueText}</div>` : ''}
        <div class="url">${urlText}</div>
        <div class="actions">${openLink}${fileLink ? ` · ${fileLink}` : ''}</div>
        ${err}
      </div>
    `;
  }).join('');

  els.results.innerHTML = rows;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(str) {
  // allow normal URLs but escape quotes and angle brackets
  return escapeHtml(String(str || ''));
}

async function createJob(urlsText) {
  const mode = els.modeWeekly.checked ? 'weekly' : 'manual';
  const issueValue = (els.issue.value || '').trim();
  const resp = await fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode,
      issue: issueValue || null,
      urlsText,
    }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${resp.status}`);
  }

  return resp.json();
}

async function fetchJob(id) {
  const resp = await fetch(`/api/jobs/${encodeURIComponent(id)}`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

function startPolling(jobId) {
  if (pollingTimer) clearInterval(pollingTimer);

  pollingTimer = setInterval(async () => {
    try {
      const job = await fetchJob(jobId);
      setStatus(job.status);
      els.progress.textContent = `${job.done}/${job.total}`;
      appendLogs(job.logs);
      renderResults(job.results);

      if (job.status === 'done' || job.status === 'error') {
        clearInterval(pollingTimer);
        pollingTimer = null;
        els.start.disabled = false;
      }
    } catch (e) {
      // ignore transient errors
    }
  }, 1000);
}

els.start.addEventListener('click', async () => {
  const urlsText = els.urls.value || '';
  els.start.disabled = true;
  els.results.innerHTML = '';
  els.logs.textContent = '';

  try {
    setStatus('creating');
    const { id } = await createJob(urlsText);
    els.jobId.textContent = id;
    setStatus('running');
    els.progress.textContent = '0/0';
    startPolling(id);
  } catch (e) {
    setStatus('error');
    els.start.disabled = false;
    els.logs.textContent = `创建任务失败：${e.message}`;
  }
});

els.clear.addEventListener('click', () => {
  els.urls.value = '';
});

function updateMode() {
  const weekly = els.modeWeekly.checked;
  els.weeklyOptions.style.display = weekly ? 'flex' : 'none';
  els.urls.disabled = weekly;
  els.urls.placeholder = weekly
    ? '周刊模式下无需填写链接'
    : 'https://example.com/a\nhttps://example.com/b\n...';
}

els.modeWeekly.addEventListener('change', updateMode);
els.modeManual.addEventListener('change', updateMode);

setStatus('idle');
renderResults([]);
updateMode();
