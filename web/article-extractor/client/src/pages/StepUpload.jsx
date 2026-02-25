import React, { useState } from 'react'
import axios from 'axios'

export default function StepUpload({ onUploaded }) {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [articles, setArticles] = useState([])

  async function handleUpload() {
    if (!file) return alert('请选择一个 Markdown 文件');
    const fd = new FormData()
    fd.append('file', file)
    setStatus('上传中...')
    try {
      const resp = await axios.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setStatus('上传完成')
      // show parsed articles returned by backend and pass them to parent
      const parsed = (resp.data && resp.data.articles) || []
      setArticles(parsed)
      // call onUploaded with id and parsed articles (parent can ignore second param if not needed)
      onUploaded(resp.data.id, parsed)
    } catch (e) {
      console.error(e)
      setStatus('上传失败')
      alert('上传失败: ' + (e.response?.data?.error || e.message))
    }
  }

  return (
    <div className="step-upload">
      <h2>Step 1: 上传周刊 Markdown</h2>
      <input type="file" accept=".md" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>上传并提取链接</button>
      <div>{status}</div>
      {articles && articles.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h4>解析到的文章 ({articles.length})</h4>
          <div style={{ overflow: 'auto', border: '1px solid #eee', padding: 8 }}>
            {articles.map(a => (
              <div key={a.id || a.url} style={{ padding: 6, borderBottom: '1px solid #f2f2f2' }}>
                <div style={{ fontWeight: 600 }}>{a.title || a.url}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{a.url}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
