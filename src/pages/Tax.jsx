import { useState } from 'react'
import { CheckCircle2, Calendar, ArrowRight } from 'lucide-react'
import { useStore } from '../lib/store'
import { fmtCurrency, fmtDate, statusColor, statusLabel } from '../lib/utils'
import SidaInsight from '../components/SidaInsight'
import clsx from 'clsx'

export default function Tax() {
  const { state, dispatch } = useStore()
  const [filing, setFiling] = useState(null)
  const [filed, setFiled] = useState({})

  function handleFile(id) {
    setFiling(id)
    setTimeout(() => {
      dispatch({ type: 'FILE_TAX', payload: id })
      setFiled(f => ({ ...f, [id]: true }))
      setFiling(null)
    }, 1800)
  }

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <SidaInsight message="All tax calculations are automatic — GST collected, ITC credits earned, and net remittances are tracked from every transaction. I've prepared your Q1 GST return and your April payroll remittance. Review and file with one tap — no forms to fill." />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'GST collected (April)', value: fmtCurrency(2109), sub: 'From Square POS sales' },
          { label: 'ITC credits (April)', value: fmtCurrency(1243), sub: 'From supplier invoices', green: true },
          { label: 'Net GST owing', value: fmtCurrency(866), sub: 'After ITC deduction' },
        ].map(c => (
          <div key={c.label} className="stat-card">
            <div className="label">{c.label}</div>
            <div className={clsx('text-xl font-semibold mt-1', c.green ? 'text-sida-green' : 'text-sida-navy')}>{c.value}</div>
            <div className="text-xs text-sida-navy/40 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Remittances */}
      <div className="card">
        <div className="px-5 py-3.5 border-b border-black/[0.06]">
          <div className="text-sm font-medium text-sida-navy">Tax remittances</div>
        </div>
        <div className="divide-y divide-black/[0.04]">
          {state.taxRemittances.map(tx => (
            <div key={tx.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-xl bg-sida-cream flex items-center justify-center text-xl flex-shrink-0">
                {tx.type.includes('GST') ? '🇨🇦' : tx.type.includes('Payroll') ? '💼' : '🏛'}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-sida-navy">{tx.type}</div>
                <div className="text-xs text-sida-navy/50 flex items-center gap-1.5 mt-0.5">
                  <Calendar size={10} /> Due {fmtDate(tx.dueDate)} · {tx.period}
                </div>
              </div>
              <div className="text-right mr-4">
                <div className="text-lg font-semibold text-sida-navy">{fmtCurrency(tx.amount)}</div>
                <span className={clsx('badge text-[10px]', statusColor[tx.status])}>{statusLabel[tx.status]}</span>
              </div>
              {tx.status === 'ready' && !filed[tx.id] && (
                <button
                  onClick={() => handleFile(tx.id)}
                  disabled={filing === tx.id}
                  className="btn-primary text-xs flex items-center gap-1.5 min-w-28"
                >
                  {filing === tx.id ? (
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Filing...</span>
                  ) : (
                    <>Review & file <ArrowRight size={11} /></>
                  )}
                </button>
              )}
              {(tx.status === 'filed' || filed[tx.id]) && (
                <div className="flex items-center gap-1.5 text-sida-green text-sm font-medium min-w-28">
                  <CheckCircle2 size={14} /> Filed
                </div>
              )}
              {tx.status === 'upcoming' && (
                <button className="btn-secondary text-xs min-w-28">Upcoming</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* GST breakdown */}
      <div className="card p-5">
        <div className="text-sm font-medium text-sida-navy mb-4">GST/HST Return — Q1 2026 Preview</div>
        <div className="space-y-2 font-mono text-sm">
          {[
            { label: 'Line 101 — Total sales', val: fmtCurrency(126540), indent: false },
            { label: 'Line 103 — GST/HST collected', val: fmtCurrency(6327), indent: false },
            { label: 'Line 106 — ITC claimed', val: fmtCurrency(3729), indent: false },
            { label: 'Line 109 — Net tax owing', val: fmtCurrency(2598), indent: false, bold: true },
          ].map(r => (
            <div key={r.label} className={clsx('flex justify-between py-2 border-b border-black/[0.04]', r.bold ? 'font-bold text-sida-navy' : 'text-sida-navy/70')}>
              <span>{r.label}</span>
              <span className={r.bold ? 'text-sida-navy' : ''}>{r.val}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-sida-navy/40">Auto-calculated from your ledger. All source entries have CRA audit-ready documentation attached.</div>
      </div>

      {/* Tax calendar */}
      <div className="card p-5">
        <div className="text-sm font-medium text-sida-navy mb-4">Tax remittance calendar</div>
        <div className="space-y-3">
          {[
            { date: 'Apr 25, 2026', label: 'Payroll source deductions — April', amount: fmtCurrency(1840), status: 'ready' },
            { date: 'May 31, 2026', label: 'GST remittance — Q1 2026', amount: fmtCurrency(2109), status: 'ready' },
            { date: 'Jun 15, 2026', label: 'Payroll source deductions — May', amount: 'TBD', status: 'upcoming' },
            { date: 'Jun 30, 2026', label: 'PST — BC provincial Q1', amount: fmtCurrency(842), status: 'upcoming' },
            { date: 'Aug 31, 2026', label: 'GST remittance — Q2 2026', amount: 'TBD', status: 'upcoming' },
          ].map(item => (
            <div key={item.date} className="flex items-center gap-3 py-2 border-b border-black/[0.04] last:border-0">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.status === 'ready' ? '#2A9D6E' : '#cbd5e1' }}></div>
              <div className="w-24 text-xs text-sida-navy/50 flex-shrink-0">{item.date}</div>
              <div className="flex-1 text-sm text-sida-navy">{item.label}</div>
              <div className="font-medium text-sm text-sida-navy">{item.amount}</div>
              <span className={clsx('badge text-[10px]', item.status === 'ready' ? 'badge-yellow' : 'badge-gray')}>{item.status === 'ready' ? 'Ready' : 'Upcoming'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
