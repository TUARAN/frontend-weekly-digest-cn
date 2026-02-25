import React, { useState } from 'react'
import StepUpload from './pages/StepUpload'
import StepConfirmUrls from './pages/StepConfirmUrls'
import StepReview from './pages/StepReview'

export default function App() {
  const [backupId, setBackupId] = useState(null)
  const [step, setStep] = useState(1)

  const steps = [
    { id: 1, title: '上传' },
    { id: 2, title: '确认并抓取' },
    { id: 3, title: '审核与预览' }
  ]

  function next() {
    if (step < steps.length) setStep(step + 1)
  }
  function back() {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className={step === 2 ? 'app fullwidth' : 'app'} style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: 12, borderBottom: '1px solid #eee' }}>
        <h1 style={{ margin: 0 }}>Article Extractor</h1>
        <div style={{ marginTop: 6, color: '#666' }}>{steps.find(s => s.id === step).title}</div>
      </header>

      <main style={{ flex: 1, overflow: 'auto', padding: step === 2 ? 0 : 12 }}>
        {step === 1 && <StepUpload onUploaded={(id) => { setBackupId(id); }} />}
        {step === 2 && backupId && <StepConfirmUrls backupId={backupId} />}
        {step === 3 && backupId && <StepReview backupId={backupId} />}

        {!backupId && step > 1 && (
          <div style={{ color: 'red', marginTop: 12 }}>
            请先完成第1步上传并创建备份，才能继续后续步骤。
          </div>
        )}
      </main>

      <footer style={{ padding: 12, borderTop: '1px solid #eee', display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={back} disabled={step === 1}>上一步</button>
        <button onClick={next} disabled={step === steps.length || (!backupId && step > 1)}>下一步</button>
        <div style={{ marginLeft: 'auto', color: '#666' }}>{backupId ? `Backup: ${backupId}` : '未创建备份'}</div>
      </footer>
    </div>
  )
}
