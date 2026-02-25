import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'

export default function StepConfirmUrls({ backupId }) {
  const [articles, setArticles] = useState([])
  const [status, setStatus] = useState('')
  const [currentArticle, setCurrentArticle] = useState(null)
  const [hoverSelector, setHoverSelector] = useState('')
  const [selectedSelector, setSelectedSelector] = useState('')
  const [hoverRect, setHoverRect] = useState(null)
  const iframeRef = useRef(null)
  const [iframeSrc, setIframeSrc] = useState('')
  const [iframeReady, setIframeReady] = useState(false)
  const messageQueueRef = useRef([])

  useEffect(() => {
    if (!backupId) return
    async function fetchManifest() {
      try {
        const resp = await axios.get('/api/backup/' + backupId + '/list')
        if (resp.data && resp.data.articles) {
          setArticles(resp.data.articles)
        } else if (resp.data && resp.data.urls) {
          setArticles(resp.data.urls.map(u => ({ url: u, title: u })))
        } else {
          const mf = await axios.get('/api/manifest/' + backupId)
          if (mf.data && mf.data.articles) setArticles(mf.data.articles)
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchManifest()
  }, [backupId])

  useEffect(() => {
    function onMessage(e) {
      const msg = e.data
      if (!msg || !msg.type) return
      if (msg.type === 'preview-hover') {
        setHoverSelector(msg.selector)
        setHoverRect(msg.rect || null)
      } else if (msg.type === 'preview-select') {
        setSelectedSelector(msg.selector)
      } else if (msg.type === 'response') {
        if (msg.action === 'getInnerHtml') {
          (async () => {
            try {
              setStatus('保存中...')
              const articleId = (currentArticle && (currentArticle.id || currentArticle.url)) || ''
              const originalTitle = (currentArticle && (currentArticle.title || '')) || ''
              const originalUrl = (currentArticle && (currentArticle.url || '')) || ''
              const resp = await axios.post('/api/save-cleaned', { id: backupId, articleId, htmlFragment: msg.html || '', originalTitle, originalUrl })
              setStatus('已保存: ' + (resp.data.savedPath || ''))
              try {
                const saved = resp.data && resp.data.savedPath ? resp.data.savedPath : ''
                window.alert('已生成文件：' + (saved || '（路径未知）'))
              } catch (e) {
                // ignore alert errors
              }
            } catch (err) {
              console.error(err)
              setStatus('保存失败: ' + (err.response?.data?.error || err.message))
              try { window.alert('保存失败: ' + (err.response?.data?.error || err.message)) } catch (e) {}
            }
          })()
        } else if (msg.action === 'delete') {
          // Child confirmed deletion: check status
          if (msg.status === 'ok') {
            setStatus('已删除元素')
            // clear selected and hover selectors since element is gone
            setSelectedSelector('')
            setHoverSelector('')
          } else {
            setStatus('删除失败: ' + (msg.status || msg.error || '无选中元素'))
          }
        }
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [currentArticle, backupId])

  async function openPreview(article) {
    setSelectedSelector('')
    setHoverSelector('')
    setHoverRect(null)

    // refresh manifest and choose article
    let pick = article
    try {
      const mf = await axios.get('/api/backup/' + backupId + '/list')
      if (mf.data && mf.data.articles) {
        setArticles(mf.data.articles)
        const found = mf.data.articles.find(a => a.url === article.url || a.id === article.id)
        if (found) pick = found
      }
    } catch (e) {
      console.error('manifest refresh failed', e)
    }

    // if raw not present, fetch article now (single-article flow)
    let fr = null
    if (!pick.rawPath) {
      setStatus('正在抓取文章...')
      try {
        fr = await axios.post('/api/fetch-article', { id: backupId, url: article.url, title: article.title || article.url, mode: 'http' })
        const mf2 = await axios.get('/api/backup/' + backupId + '/list')
        if (mf2.data && mf2.data.articles) {
          setArticles(mf2.data.articles)
          // fetch-article now returns only { localUrl }
          const localUrl = fr.data && fr.data.localUrl
          if (localUrl) {
            // extract rawPath relative to /api/backups/<backupId>/
            const prefix = `/api/backups/${backupId}/`
            let rawPart = localUrl.startsWith(prefix) ? localUrl.slice(prefix.length) : null
            // try to find by exact rawPath or by endsWith
            const found2 = mf2.data.articles.find(a => (a.rawPath && (a.rawPath === rawPart || a.rawPath.endsWith(rawPart))) || a.url === article.url)
            if (found2) pick = found2
          } else {
            const found2 = mf2.data.articles.find(a => a.url === article.url)
            if (found2) pick = found2
          }
        }
        setStatus('抓取完成')
      } catch (err) {
        console.error('fetch article failed', err)
        setStatus('抓取失败: ' + (err.response?.data?.error || err.message))
        return
      }
    }

    // prefer using returned localUrl from fetch-article; fall back to existing rawPath local url; otherwise use preview endpoint
    let src
    if (fr && fr.data && fr.data.localUrl) src = fr.data.localUrl
    else if (pick && pick.rawPath) src = `/api/backups/${backupId}/${pick.rawPath}`
    else src = `/api/preview/${backupId}/${pick.id || encodeURIComponent(pick.url)}`
    // set src state before mounting iframe so iframeRef won't be null
    setIframeReady(false)
    // clear any queued messages from previous iframe and set new src
    messageQueueRef.current = []
    setIframeSrc(src)
    setCurrentArticle(pick)
  }

  function sendToIframe(msg) {
    // if iframe not ready yet, queue the message; otherwise postMessage directly
    if (iframeReady && iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(msg, '*')
    } else {
      messageQueueRef.current.push(msg)
    }
  }

  function handleIframeLoad() {
    setIframeReady(true)
    // flush queued messages
    try {
      const q = messageQueueRef.current || []
      for (const m of q) {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage(m, '*')
        }
      }
    } finally {
      messageQueueRef.current = []
    }
  }

  function handleGetContent() {
    if (!selectedSelector && !hoverSelector) return alert('请先选择或 hover 一个元素')
    const sel = selectedSelector || hoverSelector
    sendToIframe({ type: 'getInnerHtml', selector: sel })
  }

  function handleDelete() {
    if (!selectedSelector && !hoverSelector) return alert('请先选择或 hover 一个元素')
    const sel = selectedSelector || hoverSelector
    sendToIframe({ type: 'delete', selector: sel })
  }

  function handleRefresh() {
    // Refresh by updating iframeSrc with a cache-busting timestamp
    if (!iframeSrc) {
      setStatus('没有可刷新的页面')
      return
    }
    setIframeReady(false)
    // clear any queued messages for previous iframe
    messageQueueRef.current = []
    try {
      // Build absolute URL so searchParams works for both relative and absolute src
      const newUrl = new URL(iframeSrc, window.location.origin)
      newUrl.searchParams.set('r', Date.now())
      setIframeSrc(newUrl.toString())
    } catch (e) {
      // fallback: simple append
      const sep = iframeSrc.includes('?') ? '&' : '?'
      setIframeSrc(iframeSrc + sep + 'r=' + Date.now())
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 12, height: '100%' }}>
        <div style={{ width: 360, borderRight: '1px solid #eee', padding: 12, overflow: 'auto', background: '#f9f9f9' }}>
          <h3>Step 2: 确认 URL 列表</h3>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>点击标题在右侧打开预览（单篇抓取）</div>
          {articles.map(a => (
            <div key={a.id || a.url} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => openPreview(a)}>{a.title || a.url}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{a.url}</div>
                </div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8 }}>{status}</div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 8, borderBottom: '1px solid #eee', display: 'flex', gap: 8 }}>
            <button onClick={handleGetContent}>获取内容</button>
            <button onClick={handleDelete}>删除元素</button>
            <button onClick={handleRefresh}>刷新页面</button>
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>{selectedSelector || hoverSelector}</div>
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            {currentArticle ? (
              <iframe key={iframeSrc || 'preview-iframe'} ref={iframeRef} title="preview" src={iframeSrc} onLoad={handleIframeLoad} style={{ width: '100%', height: '100%', border: 'none' }}></iframe>
            ) : (
              <div style={{ color: '#999', padding: 24 }}>点击左侧文章标题以在右侧预览（页面将尽量铺满以便标注和删除噪音）</div>
            )}

            {hoverRect && (
              <div style={{ position: 'absolute', left: hoverRect.left, top: hoverRect.top, width: hoverRect.width, height: hoverRect.height, border: '2px solid rgba(255,106,0,0.9)', background: 'rgba(255,106,0,0.06)', pointerEvents: 'none', transform: 'translate(0,0)' }} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
