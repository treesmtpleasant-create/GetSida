import { useState, useRef, useCallback } from 'react'
import { Upload, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { useStore } from '../lib/store'
import { fmtCurrency } from '../lib/utils'
import SidaInsight from '../components/SidaInsight'
import clsx from 'clsx'

const DOC_TYPES = [
  { label: 'Supplier invoice', icon: '🧾', desc: 'Updates inventory + posts AP entry + tracks ITC' },
  { label: 'Expense receipt', icon: '🧾', desc: 'Categorizes expense + posts to correct account' },
  { label: 'POS daily export', icon: '📊', desc: 'Posts revenue + COGS via recipe engine' },
  { label: 'Bank statement', icon: '🏦', desc: 'Runs reconciliation + flags exceptions' },
  { label: 'Capital asset invoice', icon: '🏗', desc: 'Detects asset + assigns CCA class + schedules depreciation' },
  { label: 'Payroll hours file', icon: '👥', desc: 'Calculates payroll + deductions + posts journal entry' },
]

const DOC_TYPE_ICON = {
  supplier_invoice: '🧾',
  expense_receipt: '🧾',
  pos_export: '📊',
  bank_statement: '🏦',
  capital_asset_invoice: '🏗',
  payroll_hours: '👥',
  other: '📄',
}

const FAKE_STEPS = [
  'Reading document...',
  'Classifying document type...',
  'Extracting line items, amounts, taxes...',
  'Matching vendor to directory...',
]

const DEMO_STEPS = [
  { step: 'OCR reading document...', delay: 600 },
  { step: 'Classifying document type...', delay: 1200 },
  { step: 'Extracting line items, amounts, taxes...', delay: 2000 },
  { step: 'Matching vendor to directory...', delay: 2600 },
  { step: 'Calculating ITC and posting journal entry...', delay: 3400 },
  { step: 'Done — entry posted ✓', delay: 4000 },
]

const MAX_FILE_BYTES = 4 * 1024 * 1024

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '')
    reader.onerror = () => reject(new Error('Could not read file.'))
    reader.readAsDataURL(file)
  })
}

function ProcessingCard({ item }) {
  const done = item.status === 'done'
  const error = item.status === 'error'
  return (
    <div className={clsx('border rounded-xl p-4 flex gap-3 items-start transition-all', done ? 'border-sida-green/30 bg-sida-green-light' : error ? 'border-sida-red/30 bg-sida-red-light' : 'border-black/[0.06] bg-white')}>
      <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0', done ? 'bg-sida-green-light' : 'bg-sida-cream')}>
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-sida-navy truncate">{item.name}</div>
          {done && <CheckCircle2 size={16} className="text-sida-green flex-shrink-0" />}
          {error && <AlertCircle size={16} className="text-sida-red flex-shrink-0" />}
        </div>
        <div className={clsx('text-xs mt-0.5', done ? 'text-sida-green' : error ? 'text-sida-red' : 'text-sida-navy/50')}>
          {item.currentStep}
        </div>
        {!done && !error && (
          <div className="mt-2 h-1 bg-sida-cream rounded-full overflow-hidden">
            <div className="h-full bg-sida-green rounded-full animate-progress"></div>
          </div>
        )}
        {done && item.result && (
          <div className="mt-2 p-2.5 bg-white rounded-lg border border-sida-green/20 text-xs space-y-1">
            {item.result.map((r, i) => (
              <div key={i} className="flex items-center gap-1.5 text-sida-navy/70">
                <span className="w-1 h-1 rounded-full bg-sida-green flex-shrink-0"></span>
                {r}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function UploadPage() {
  const { dispatch } = useStore()
  const [queue, setQueue] = useState([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const processFile = useCallback(async (file) => {
    const id = Date.now() + Math.random()
    setQueue(q => [{ id, name: file.name, icon: '📄', status: 'processing', currentStep: FAKE_STEPS[0] }, ...q])

    let stepIndex = 0
    const stepTimer = setInterval(() => {
      stepIndex = Math.min(stepIndex + 1, FAKE_STEPS.length - 1)
      setQueue(q => q.map(u => u.id === id ? { ...u, currentStep: FAKE_STEPS[stepIndex] } : u))
    }, 900)

    try {
      if (file.size > MAX_FILE_BYTES) {
        throw new Error('File is too large — please upload files under 4MB.')
      }
      const dataBase64 = await fileToBase64(file)
      const res = await fetch('/api/parse-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, mimeType: file.type, dataBase64 }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload.error || 'Failed to process document.')

      const parsed = payload.data
      dispatch({ type: 'PROCESS_DOCUMENT', payload: { parsed, fileName: file.name } })

      clearInterval(stepTimer)
      setQueue(q => q.map(u => u.id === id ? {
        ...u,
        icon: DOC_TYPE_ICON[parsed.documentType] || '📄',
        status: 'done',
        currentStep: parsed.confidence >= 90 ? 'Posted successfully' : 'Flagged for review — check Notifications',
        result: [
          parsed.summary,
          `${fmtCurrency(parsed.totalAmount)} classified as ${parsed.suggestedCategory}`,
          `Confidence ${parsed.confidence}%`,
        ],
      } : u))
    } catch (err) {
      clearInterval(stepTimer)
      setQueue(q => q.map(u => u.id === id ? { ...u, status: 'error', currentStep: err.message } : u))
    }
  }, [dispatch])

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    Array.from(e.dataTransfer.files).forEach(processFile)
  }

  function handleDemo(type) {
    const names = {
      'Supplier invoice': 'Sysco_Invoice_Apr17.pdf',
      'POS daily export': 'Square_POS_Apr17.csv',
      'Bank statement': 'RBC_Statement_Apr.pdf',
      'Capital asset invoice': 'Espresso_Machine_Invoice.pdf',
    }
    const name = names[type] || `${type}_document.pdf`
    const dt = DOC_TYPES.find(d => d.label === type) || DOC_TYPES[1]
    const id = Date.now() + Math.random()
    const item = { id, name, icon: dt.icon, status: 'processing', currentStep: 'Reading document...' }
    setQueue(q => [item, ...q])

    DEMO_STEPS.forEach(({ step, delay }) => {
      setTimeout(() => {
        setQueue(q => q.map(u => u.id === id ? { ...u, currentStep: step } : u))
      }, delay)
    })

    setTimeout(() => {
      const results = dt.icon === '📊'
        ? ['Revenue $3,842 posted to Sales account', 'COGS $1,088 auto-calculated from recipes', 'GST $192 tracked for remittance']
        : dt.icon === '🏦'
        ? ['94 transactions matched automatically', '1 exception flagged for review', 'Reconciliation report generated']
        : ['Inventory updated — 3 items received', 'AP entry posted: Dr Inventory / Cr AP', `ITC ${Math.floor(Math.random() * 200 + 50)}.00 tracked`]
      setQueue(q => q.map(u => u.id === id ? { ...u, status: 'done', currentStep: 'Posted successfully (demo preview — no data saved)', result: results } : u))
    }, 4200)
  }

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <SidaInsight message="Upload any business document — photo, PDF, or CSV. Sida reads it, figures out what it is, and posts the correct journal entry automatically. You'll only see a summary in plain language — no accounting terms." />

      {/* Drop zone */}
      <div
        className={clsx('border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer', dragging ? 'border-sida-green bg-sida-green-light' : 'border-black/15 hover:border-sida-green/50 bg-white')}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" multiple accept="image/*,application/pdf,text/csv,text/plain" className="hidden" onChange={e => Array.from(e.target.files).forEach(processFile)} />
        <div className="w-14 h-14 rounded-full bg-sida-cream flex items-center justify-center mx-auto mb-4">
          <Upload size={22} className="text-sida-navy/50" />
        </div>
        <div className="text-base font-medium text-sida-navy">Drop files here or tap to upload</div>
        <div className="text-sm text-sida-navy/50 mt-1">Photos, PDFs, or CSVs — up to 4MB, parsed live by Claude</div>
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {['Invoice', 'Receipt', 'POS export', 'Bank statement', 'Payroll file'].map(t => (
            <span key={t} className="bg-sida-cream text-sida-navy/60 text-xs px-3 py-1 rounded-full">{t}</span>
          ))}
        </div>
      </div>

      {/* Demo buttons */}
      <div>
        <div className="text-xs uppercase tracking-wider text-sida-navy/40 font-medium mb-3">Try a demo upload (preview only, no file)</div>
        <div className="grid grid-cols-3 gap-3">
          {['Supplier invoice', 'POS daily export', 'Bank statement', 'Capital asset invoice', 'Expense receipt', 'Payroll hours file'].map(type => {
            const dt = DOC_TYPES.find(d => d.label === type) || DOC_TYPES[1]
            return (
              <button key={type} onClick={() => handleDemo(type)} className="card p-4 text-left hover:border-sida-green/40 transition-all group">
                <div className="text-2xl mb-2">{dt.icon}</div>
                <div className="text-sm font-medium text-sida-navy">{type}</div>
                <div className="text-xs text-sida-navy/50 mt-1 leading-relaxed">{dt.desc}</div>
                <div className="flex items-center gap-1 mt-3 text-xs text-sida-green opacity-0 group-hover:opacity-100 transition-opacity">
                  Simulate upload <ArrowRight size={11} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Processing queue */}
      {queue.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-sida-navy">Processing queue</div>
          {queue.map(item => <ProcessingCard key={item.id} item={item} />)}
        </div>
      )}

      {/* How it works */}
      <div className="card p-5">
        <div className="text-sm font-medium text-sida-navy mb-4">How Sida processes your documents</div>
        <div className="space-y-3">
          {[
            { n: 1, title: 'Claude reads everything', desc: 'Extracts text and structure from photos at angles, PDFs, and CSVs — any format.' },
            { n: 2, title: 'AI classifies and extracts', desc: 'Determines document type, pulls vendor, line items, amounts, taxes — structured from unstructured.' },
            { n: 3, title: 'Journal entry posted automatically', desc: 'Correct double-entry posted — you never see Dr/Cr. Just a plain-English summary.' },
            { n: 4, title: 'You approve exceptions only', desc: 'Items below 90% confidence are flagged. Everything else is done.' },
          ].map(step => (
            <div key={step.n} className="flex gap-3">
              <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5', step.n < 4 ? 'bg-sida-green text-white' : 'bg-sida-yellow text-sida-navy')}>
                {step.n}
              </div>
              <div>
                <div className="text-sm font-medium text-sida-navy">{step.title}</div>
                <div className="text-xs text-sida-navy/50 mt-0.5 leading-relaxed">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
