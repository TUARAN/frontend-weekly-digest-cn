import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function StepTranslate({ backupId }) {
  const [articles, setArticles] = useState([])
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!backupId) return
    async function load() {
      try {
        const resp = await axios.get('/api/backup/' + backupId + '/list')
        setArticles(resp.data.articles || [])
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [backupId])

  async function handleTranslate(article) {
    setStatus('翻译中...')
    try {
      const resp = await axios.post('/api/translate', { id: backupId, articleId: article.id })
      setStatus('完成: ' + resp.data.translatedPath)
    } catch (e) {
      console.error(e)
      setStatus('失败')
    }
  }

  return (
    <div>
      <h2>Step 4: 翻译</h2>
      <div>
        {articles.map(a => (
          <div key={a.id} style={{ border: '1px solid #ddd', padding: 8, margin: 6 }}>
            <div><strong>{a.url}</strong></div>
            <div>ID: {a.id}</div>
            <button onClick={() => handleTranslate(a)}>翻译（AI）</button>
          </div>
        ))}
      </div>
      <div>{status}</div>
    </div>
  )
}

