import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function StepCleanPreview({ backupId }) {
  const [articles, setArticles] = useState([])
  const [selected, setSelected] = useState(null)
  const [previewHtml, setPreviewHtml] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!backupId) return
    async function load() {
      try {
        const resp = await axios.get('/api/backup/' + backupId + '/list')
        const mf = resp.data
        setArticles(mf.articles || [])
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [backupId])

  async function handleClean(article) {
    setStatus('清洗中...')
    try {
      const resp = await axios.post('/api/clean', { id: backupId, articleId: article.id })
      setPreviewHtml(resp.data.previewHtml)
      setSelected(article.id)
      setStatus('完成')
    } catch (e) {
      console.error(e)
      setStatus('失败')
    }
  }

  return (
    <div>
      <h2>Step 3: 去噪预览</h2>
      <div>
        {articles.map(a => (
          <div key={a.id} style={{ border: '1px solid #ddd', padding: 8, margin: 6 }}>
            <div><strong>{a.url}</strong></div>
            <div>ID: {a.id}</div>
            <button onClick={() => handleClean(a)}>清洗并预览</button>
          </div>
        ))}
      </div>
      <div>
        <h3>预览</h3>
        <div dangerouslySetInnerHTML={{ __html: previewHtml }} style={{ border: '1px solid #ccc', padding: 12 }} />
      </div>
      <div>{status}</div>
    </div>
  )
}

