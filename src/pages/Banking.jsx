import { useState } from 'react'
import { CheckCircle2, AlertCircle, Landmark } from 'lucide-react'
import { useStore } from '../lib/store'
import { fmtCurrency, fmtDate } from '../lib/utils'
import SidaInsight from '../components/SidaInsight'
import clsx from 'clsx'

export default function Banking() {
  const { state } = useStore()
  const [resolving, setResolving] = useState(null)

  const matched = state.bankTransactions.filter(t => t.matched)
  const unmatched = state.bankTransactions.filter(t => !t.matched)
  const matchRate = ((matched.length / state.bankTransactions.length) * 100).toFixed(0)

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <SidaInsight message={`Your RBC account is connected via Plaid — transactions import automatically. I matched ${matched.length} of ${state.bankTransactions.length} transactions to ledger entries (${matchRate}% auto-match rate). ${unmatched.length > 0 ? `${unmatched.length} transaction needs your attention — it may be personal or unrecorded.` : 'Nothing needs your review.'}`} />

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Bank balance', value: fmtCurrency(48320.50), sub: 'RBC ···4821 · live' },
          { label: 'Book balance', value: fmtCurrency(48320.50), sub: 'General ledger' },
          { label: 'Difference', value: fmtCurrency(0), sub: 'Fully reconciled', green: true },
          { label: 'Auto-match rate', value: `${matchRate}%`, sub: `${matched.length} of ${state.bankTransactions.length} transactions` },
        ].map(c => (
          <div key={c.label} className="stat-card">
            <div className="label">{c.label}</div>
            <div className={clsx('text-xl font-semibold mt-1', c.green ? 'text-sida-green' : 'text-sida-navy')}>{c.value}</div>
            <div className="text-xs text-sida-navy/40 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Bank accounts */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { name: 'RBC Business Chequing', num: '···4821', balance: 48320.50, connected: true, type: 'Chequing' },
          { name: 'TD Business Savings', num: '···3304', balance: 12400.00, connected: true, type: 'Savings' },
          { name: 'Visa Business Card', num: '···9221', balance: -4200.00, connected: true, type: 'Credit Card' },
        ].map(acct => (
          <div key={acct.num} className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-sida-navy flex items-center justify-center flex-shrink-0">
              <Landmark size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-sida-navy">{acct.name} {acct.num}</div>
              <div className="text-xs text-sida-navy/50">{acct.type} · Plaid connected</div>
            </div>
            <div className="text-right">
              <div className={clsx('text-base font-semibold', acct.balance < 0 ? 'text-sida-red' : 'text-sida-navy')}>{fmtCurrency(Math.abs(acct.balance))}</div>
              <div className="flex items-center gap-1 justify-end mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sida-green"></span>
                <span className="text-[10px] text-sida-green">Live</span>
              </div>
            </div>
          </div>
        ))}
        <div className="card p-4 flex items-center gap-4 border-dashed cursor-pointer hover:border-sida-green/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-sida-cream flex items-center justify-center flex-shrink-0 text-xl">+</div>
          <div>
            <div className="text-sm font-medium text-sida-navy">Connect another account</div>
            <div className="text-xs text-sida-navy/50">Bank, credit card, or line of credit</div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="card">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-black/[0.06]">
          <div className="text-sm font-medium text-sida-navy flex-1">Bank transactions — April 2026</div>
          {unmatched.length > 0 && (
            <div className="badge badge-yellow text-xs">{unmatched.length} need review</div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.06]">
                {['Date','Description','Amount','Match status','Ledger entry','Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.bankTransactions.map(tx => (
                <tr key={tx.id} className={clsx('border-b border-black/[0.04] transition-colors', !tx.matched ? 'bg-yellow-50 hover:bg-yellow-100/50' : 'hover:bg-sida-cream/30')}>
                  <td className="px-4 py-3 text-sida-navy/60 text-xs">{fmtDate(tx.date)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-sida-navy">{tx.desc}</td>
                  <td className={clsx('px-4 py-3 font-medium', tx.amount > 0 ? 'text-sida-green' : 'text-sida-red')}>
                    {tx.amount > 0 ? '+' : ''}{fmtCurrency(tx.amount)}
                  </td>
                  <td className="px-4 py-3">
                    {tx.matched
                      ? <span className="flex items-center gap-1 text-sida-green text-xs"><CheckCircle2 size={12} /> Auto-matched</span>
                      : <span className="flex items-center gap-1 text-yellow-600 text-xs"><AlertCircle size={12} /> Needs review</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-xs text-sida-navy/50">
                    {tx.matched ? 'Journal entry posted' : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {!tx.matched && (
                      <button
                        onClick={() => setResolving(tx.id)}
                        className="btn-primary text-xs py-1 px-2.5"
                      >
                        {resolving === tx.id ? '✓ Resolved' : 'Categorize'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
