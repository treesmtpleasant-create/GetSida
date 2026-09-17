import { useStore } from '../lib/store'
import { fmtCurrency, fmtDate } from '../lib/utils'
import SidaInsight from '../components/SidaInsight'
import clsx from 'clsx'
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react'

// EXPENSES PAGE
export function Expenses() {
  const { state } = useStore()
  const expenses = state.journalEntries.filter(je => je.source === 'Document AI')

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <SidaInsight message="Expenses are captured automatically from uploaded receipts and invoices. I categorize each expense to the correct account, extract GST/ITC, and post the journal entry — no manual coding required." />
      <div className="card">
        <div className="px-5 py-3.5 border-b border-black/[0.06] text-sm font-medium text-sida-navy">Auto-categorized expenses</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.06]">
                {['Date','Description','Source','Account','Amount','ITC','Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.journalEntries.map(je => (
                <tr key={je.id} className="border-b border-black/[0.04] hover:bg-sida-cream/30">
                  <td className="px-4 py-3 text-xs text-sida-navy/50">{fmtDate(je.date)}</td>
                  <td className="px-4 py-3 text-sida-navy">{je.memo}</td>
                  <td className="px-4 py-3 text-xs text-sida-navy/50">{je.source}</td>
                  <td className="px-4 py-3"><span className="badge badge-gray text-[10px]">Auto-assigned</span></td>
                  <td className="px-4 py-3 font-medium text-sida-navy">
                    {fmtCurrency(je.entries.reduce((s,e)=>s+e.dr,0))}
                  </td>
                  <td className="px-4 py-3 text-xs text-sida-green">—</td>
                  <td className="px-4 py-3"><span className="badge badge-green text-[10px]">Posted</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// CHART OF ACCOUNTS
export function ChartOfAccounts() {
  const { state } = useStore()
  const types = ['Asset','Liability','Equity','Revenue','COGS','Expense']

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <SidaInsight message="Your chart of accounts was configured automatically based on your industry (food service). Every account is mapped correctly for GAAP/ASPE compliance. Your accountant can review and adjust via the accountant portal." />
      {types.map(type => (
        <div key={type} className="card">
          <div className="px-5 py-3 border-b border-black/[0.06] text-sm font-medium text-sida-navy">{type}</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {state.accounts.filter(a=>a.type===type).map(acct => (
                  <tr key={acct.id} className="border-b border-black/[0.04] last:border-0 hover:bg-sida-cream/30">
                    <td className="px-4 py-2.5 font-mono text-xs text-sida-navy/40 w-16">{acct.code}</td>
                    <td className="px-4 py-2.5 text-sida-navy">{acct.name}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{fmtCurrency(Math.abs(acct.balance))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

// NOTIFICATIONS
export function Notifications() {
  const { state, dispatch } = useStore()
  const iconMap = {
    approval: <CheckCircle2 size={16} className="text-sida-green" />,
    alert: <AlertTriangle size={16} className="text-yellow-500" />,
    info: <Info size={16} className="text-blue-500" />,
  }
  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <div className="card divide-y divide-black/[0.04]">
        {state.notifications.map(n => (
          <div
            key={n.id}
            className={clsx('flex gap-3 px-5 py-4 cursor-pointer hover:bg-sida-cream/50 transition-colors', !n.read ? 'bg-sida-green-light/30' : '')}
            onClick={() => dispatch({ type: 'MARK_NOTIF_READ', payload: n.id })}
          >
            <div className="mt-0.5 flex-shrink-0">{iconMap[n.type]}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-sida-navy">{n.title}</div>
                <div className="text-xs text-sida-navy/40">{n.time}</div>
              </div>
              <div className="text-xs text-sida-navy/60 mt-0.5">{n.desc}</div>
            </div>
            {!n.read && <div className="w-2 h-2 rounded-full bg-sida-green mt-2 flex-shrink-0"></div>}
          </div>
        ))}
      </div>
    </div>
  )
}

// SETTINGS
export function Settings() {
  const { state } = useStore()
  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <div className="card p-5">
        <div className="text-sm font-medium text-sida-navy mb-4">Business information</div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Business name', val: state.business.name },
            { label: 'Business number', val: state.business.bn },
            { label: 'GST number', val: state.business.gstNumber },
            { label: 'PST number', val: state.business.pstNumber },
            { label: 'Industry', val: state.business.industry.replace('_', ' ') },
            { label: 'Region', val: `${state.business.region}, ${state.business.country}` },
            { label: 'Fiscal year end', val: state.business.fiscalYearEnd },
            { label: 'POS system', val: state.business.posConnected },
          ].map(f => (
            <div key={f.label}>
              <div className="label">{f.label}</div>
              <input className="input" defaultValue={f.val} />
            </div>
          ))}
        </div>
        <button className="btn-primary mt-4">Save changes</button>
      </div>

      <div className="card p-5">
        <div className="text-sm font-medium text-sida-navy mb-4">Integrations</div>
        <div className="space-y-3">
          {[
            { name: 'Square POS', status: 'connected', icon: '📱' },
            { name: 'RBC Business Chequing (Plaid)', status: 'connected', icon: '🏦' },
            { name: 'CRA My Business Account', status: 'connected', icon: '🇨🇦' },
            { name: 'Accountant portal', status: 'connected', icon: '👔' },
          ].map(i => (
            <div key={i.name} className="flex items-center gap-3 p-3 bg-sida-cream rounded-xl">
              <span className="text-xl">{i.icon}</span>
              <div className="flex-1 text-sm font-medium text-sida-navy">{i.name}</div>
              <span className="badge badge-green text-[10px]">Connected</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <div className="text-sm font-medium text-sida-navy mb-1">Accountant portal</div>
        <div className="text-xs text-sida-navy/50 mb-4">Your accountant gets read-only access to all ledgers, journals, and reports.</div>
        <div className="flex items-center gap-3">
          <input className="input flex-1" defaultValue={state.business.accountantEmail} />
          <button className="btn-secondary">Send invite</button>
        </div>
      </div>
    </div>
  )
}
