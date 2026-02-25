import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function StepReview({ backupId }) {
  const [files, setFiles] = useState([])
  const [selected, setSelected] = useState(null)
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!backupId) return
    loadList()
  }, [backupId])

  async function loadList() {
    setStatus('加载中...')
    try {
      const resp = await axios.get('/api/backup/' + backupId + '/list')
      const mf = resp.data || {}
      // collect work files
      const list = (mf.articles || [])
        .map(a => ({ id: a.id, title: a.title || a.id || a.url, path: a.cleanedInputPath }))
        .filter(x => x.path)
      setFiles(list)
      setStatus('')
    } catch (e) {
      console.error(e)
      setStatus('加载失败')
    }
  }

  async function openFile(f) {
    if (!f || !f.path) return
    setSelected(f.id)
    setContent('加载中...')
    try {
      // path may be like work/<name>.md
      const url = `/api/work/${backupId}/${f.path}`
      const resp = await axios.get(url)
      setContent(resp.data || '')
    } catch (e) {
      console.error(e)
      setContent('加载失败: ' + (e.response?.data || e.message))
    }
  }

  async function copyContent() {
    try {
      await navigator.clipboard.writeText(content || '')
      alert('已复制到剪贴板')
    } catch (e) {
      console.error(e)
      alert('复制失败: ' + e.message)
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 12, height: '100%' }}>
        <div style={{ width: 360, borderRight: '1px solid #eee', padding: 12, overflow: 'auto', background: '#f9f9f9' }}>
          <h3>Step 3: 审核与预览</h3>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>左侧为已生成的文档，点击查看右侧预览</div>
          <div style={{ marginBottom: 8 }}>
            <button onClick={loadList}>刷新列表</button>
          </div>
          {files.length === 0 && <div style={{ color: '#999' }}>暂无已生成的文档</div>}
          {files.map(f => (
            <div key={f.id} style={{ padding: 8, borderBottom: '1px solid #eee', cursor: 'pointer', background: selected === f.id ? '#eef' : 'transparent' }} onClick={() => openFile(f)}>
              <div style={{ fontWeight: 'bold' }}>{f.title}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{f.path}</div>
            </div>
          ))}
          <div style={{ marginTop: 8 }}>{status}</div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 8, borderBottom: '1px solid #eee', display: 'flex', gap: 8 }}>
            <button onClick={copyContent} disabled={!content}>复制</button>
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>{selected || ''}</div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{content}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}

