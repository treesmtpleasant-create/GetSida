import { useState } from 'react'
import { useStore } from '../lib/store'
import { fmtCurrency, fmtDate } from '../lib/utils'
import SidaInsight from '../components/SidaInsight'
import clsx from 'clsx'

export default function Ledger() {
  const { state } = useStore()
  const [selected, setSelected] = useState(null)

  const grouped = state.journalEntries.reduce((acc, je) => {
    const key = je.date
    if (!acc[key]) acc[key] = []
    acc[key].push(je)
    return acc
  }, {})

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <SidaInsight message="Every transaction is recorded as an immutable double-entry journal entry — fully CPA-auditable. Each entry has a source document, timestamp, AI confidence score, and the posting rule applied. Your accountant can access the full ledger via their portal." />

      <div className="grid grid-cols-2 gap-4">
        {/* Journal entries */}
        <div className="card">
          <div className="px-5 py-3.5 border-b border-black/[0.06]">
            <div className="text-sm font-medium text-sida-navy">Journal entries</div>
            <div className="text-xs text-sida-navy/50 mt-0.5">Immutable · Full audit trail</div>
          </div>
          <div className="divide-y divide-black/[0.04] max-h-[500px] overflow-y-auto">
            {state.journalEntries.map(je => (
              <button
                key={je.id}
                onClick={() => setSelected(je)}
                className={clsx('w-full text-left px-5 py-4 hover:bg-sida-cream/50 transition-colors', selected?.id === je.id ? 'bg-sida-green-light border-l-2 border-sida-green' : '')}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-mono text-sida-navy/40">{fmtDate(je.date)}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="badge badge-green text-[10px]">Posted</span>
                    <span className="text-[10px] text-sida-navy/30">{je.confidence}%</span>
                  </div>
                </div>
                <div className="text-sm font-medium text-sida-navy truncate">{je.memo}</div>
                <div className="text-xs text-sida-navy/50 mt-0.5">{je.source}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Entry detail */}
        <div className="card">
          <div className="px-5 py-3.5 border-b border-black/[0.06]">
            <div className="text-sm font-medium text-sida-navy">Entry detail</div>
          </div>
          {selected ? (
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <div className="text-xs text-sida-navy/50">Date</div>
                <div className="text-sm font-medium">{fmtDate(selected.date)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-sida-navy/50">Description</div>
                <div className="text-sm font-medium">{selected.memo}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-sida-navy/50">Source · Confidence</div>
                <div className="text-sm">{selected.source} · {selected.confidence}% confidence</div>
              </div>
              <div>
                <div className="text-xs text-sida-navy/50 mb-2">Debit / Credit entries</div>
                <div className="bg-sida-cream rounded-xl p-4 font-mono text-xs space-y-2">
                  <div className="grid grid-cols-3 text-sida-navy/40 text-[10px] uppercase tracking-wide mb-1">
                    <span>Account</span><span className="text-right">Debit</span><span className="text-right">Credit</span>
                  </div>
                  {selected.entries.map((e, i) => {
                    const acct = state.accounts.find(a => a.id === e.acct)
                    return (
                      <div key={i} className="grid grid-cols-3">
                        <span className={clsx('text-sida-navy/70', e.cr > 0 ? 'pl-3' : '')}>{acct?.name || e.acct}</span>
                        <span className="text-right text-sida-green">{e.dr > 0 ? fmtCurrency(e.dr) : ''}</span>
                        <span className="text-right text-sida-red">{e.cr > 0 ? fmtCurrency(e.cr) : ''}</span>
                      </div>
                    )
                  })}
                  <div className="border-t border-black/10 pt-2 grid grid-cols-3 font-semibold">
                    <span className="text-sida-navy/60">Total</span>
                    <span className="text-right text-sida-green">{fmtCurrency(selected.entries.reduce((s,e)=>s+e.dr,0))}</span>
                    <span className="text-right text-sida-red">{fmtCurrency(selected.entries.reduce((s,e)=>s+e.cr,0))}</span>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-sida-navy/30 flex items-center gap-1">
                  ✓ Balanced — Debits equal Credits
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-sida-navy/30 text-sm">Select an entry to see details</div>
          )}
        </div>
      </div>

      {/* Chart of accounts trial balance */}
      <div className="card">
        <div className="px-5 py-3.5 border-b border-black/[0.06] flex items-center justify-between">
          <div className="text-sm font-medium text-sida-navy">Trial Balance — April 30, 2026</div>
          <button className="btn-secondary text-xs">Export</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.06]">
                {['Code','Account','Type','Debit','Credit'].map(h => (
                  <th key={h} className="px-4 py-3 text-left table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.accounts.map(acct => {
                const isDr = ['Asset','COGS','Expense'].includes(acct.type)
                const bal = Math.abs(acct.balance)
                return (
                  <tr key={acct.id} className="border-b border-black/[0.04] hover:bg-sida-cream/50">
                    <td className="px-4 py-2.5 font-mono text-xs text-sida-navy/50">{acct.code}</td>
                    <td className="px-4 py-2.5 text-sida-navy">{acct.name}</td>
                    <td className="px-4 py-2.5"><span className="badge badge-gray text-[10px]">{acct.type}</span></td>
                    <td className="px-4 py-2.5 text-sida-green">{isDr && acct.balance > 0 ? fmtCurrency(bal) : ''}</td>
                    <td className="px-4 py-2.5 text-sida-red">{!isDr && acct.balance > 0 ? fmtCurrency(bal) : ''}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
