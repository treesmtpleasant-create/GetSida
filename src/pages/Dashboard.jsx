import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { AlertTriangle, CheckCircle2, Clock, ArrowUpRight, ChevronRight } from 'lucide-react'
import { useStore } from '../lib/store'
import { fmtCurrency, fmtDate, getDueDays } from '../lib/utils'
import SidaInsight from '../components/SidaInsight'
import PaymentModal from '../components/PaymentModal'
import clsx from 'clsx'

const revenueData = [
  { week: 'W1', revenue: 38200, expenses: 28400, profit: 9800 },
  { week: 'W2', revenue: 41500, expenses: 30200, profit: 11300 },
  { week: 'W3', revenue: 39800, expenses: 29100, profit: 10700 },
  { week: 'W4', revenue: 43200, expenses: 31400, profit: 11800 },
  { week: 'W5', revenue: 40600, expenses: 29800, profit: 10800 },
  { week: 'W6', revenue: 42180, expenses: 30240, profit: 11940 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-black/10 rounded-lg p-3 shadow-sm text-xs">
      <div className="font-medium mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="flex gap-2 justify-between">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium">{fmtCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { state, dispatch } = useStore()
  const [payingBill, setPayingBill] = useState(null)

  const pendingBills = state.apBills.filter(b => b.status === 'pending_approval')
  const pendingPayroll = state.payrollRuns.filter(r => r.status === 'pending_approval')
  const overdueInvoices = state.arInvoices.filter(i => i.status === 'overdue')
  const totalApprovalItems = pendingBills.length + pendingPayroll.length

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <SidaInsight message="Good morning, Marcus. Revenue is up 8.3% this month — your food cost is at 28.4%, within your 30% target. I posted 14 journal entries overnight, reconciled your RBC account, and flagged 1 transaction needing your review. You have 3 approvals waiting." />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Revenue (MTD)', value: fmtCurrency(42180), delta: '+8.3% vs last month', up: true },
          { label: 'Food Cost %', value: '28.4%', delta: '✓ Under 30% target', up: true },
          { label: 'Labour Cost %', value: '32.1%', delta: '↑ High — review schedule', up: false },
          { label: 'Net Profit (MTD)', value: fmtCurrency(8436), delta: '+14% vs last month', up: true },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="label">{k.label}</div>
            <div className="text-2xl font-semibold text-sida-navy mt-1">{k.value}</div>
            <div className={clsx('text-xs mt-1', k.up ? 'text-sida-green' : 'text-sida-red')}>{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="card p-5 col-span-2">
          <div className="text-sm font-medium text-sida-navy mb-4">Revenue vs Expenses — 6 Weeks</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={revenueData} barGap={2}>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Revenue" fill="#2A9D6E" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#e2e8f0" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick stats */}
        <div className="space-y-3">
          <div className="stat-card">
            <div className="label">Cash in bank</div>
            <div className="text-xl font-semibold text-sida-navy">{fmtCurrency(48320.50)}</div>
            <div className="text-xs text-sida-navy/40 mt-1">RBC ···4821 · synced just now</div>
          </div>
          <div className="stat-card">
            <div className="label">Bills due this week</div>
            <div className="text-xl font-semibold text-sida-red">{fmtCurrency(pendingBills.reduce((s,b) => s+b.amount,0))}</div>
            <div className="text-xs text-sida-navy/40 mt-1">{pendingBills.length} bills pending approval</div>
          </div>
          <div className="stat-card">
            <div className="label">AR outstanding</div>
            <div className="text-xl font-semibold text-sida-navy">{fmtCurrency(3240)}</div>
            <div className="text-xs text-sida-red mt-1">{overdueInvoices.length} invoice overdue</div>
          </div>
        </div>
      </div>

      {/* Approvals needed */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-sida-navy">Needs your approval ({totalApprovalItems})</div>
          <button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'ap' })} className="text-xs text-sida-green flex items-center gap-1">View all <ChevronRight size={12} /></button>
        </div>
        <div className="space-y-2">
          {pendingBills.map(bill => {
            const days = getDueDays(bill.dueDate)
            return (
              <div key={bill.id} className="flex items-center gap-3 p-3 bg-sida-cream rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-white border border-black/[0.06] flex items-center justify-center text-sm">🧾</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-sida-navy truncate">{bill.vendor}</div>
                  <div className="text-xs text-sida-navy/50">{bill.invoiceNo} · {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `Due in ${days}d`}</div>
                </div>
                <div className="text-sm font-semibold text-sida-navy">{fmtCurrency(bill.amount)}</div>
                <button onClick={() => setPayingBill(bill)} className="btn-primary text-xs py-1.5 px-3">Pay</button>
              </div>
            )
          })}
          {pendingPayroll.map(run => (
            <div key={run.id} className="flex items-center gap-3 p-3 bg-sida-cream rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-white border border-black/[0.06] flex items-center justify-center text-sm">👥</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-sida-navy">Payroll — {run.period}</div>
                <div className="text-xs text-sida-navy/50">4 staff · {fmtCurrency(run.lines.reduce((s,l)=>s+l.gross,0))} gross</div>
              </div>
              <button
                onClick={() => dispatch({ type: 'APPROVE_PAYROLL', payload: run.id })}
                className="btn-primary text-xs py-1.5 px-3"
              >Approve</button>
            </div>
          ))}
          {totalApprovalItems === 0 && (
            <div className="flex items-center gap-2 text-sm text-sida-green py-2">
              <CheckCircle2 size={16} /> All caught up — no approvals needed
            </div>
          )}
        </div>
      </div>

      {/* Recent auto-posted */}
      <div className="card p-5">
        <div className="text-sm font-medium text-sida-navy mb-4">Recent auto-posted by Sida</div>
        <div className="space-y-0">
          {state.journalEntries.slice(0,5).map(je => (
            <div key={je.id} className="flex items-center gap-3 py-3 border-b border-black/[0.04] last:border-0">
              <div className="w-1.5 h-1.5 rounded-full bg-sida-green flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-sida-navy truncate">{je.memo}</div>
                <div className="text-xs text-sida-navy/40 mt-0.5">{fmtDate(je.date)} · {je.source} · {je.confidence}% confidence</div>
              </div>
              <span className="badge badge-green text-[10px]">Posted</span>
            </div>
          ))}
        </div>
      </div>

      {payingBill && <PaymentModal bill={payingBill} onClose={() => setPayingBill(null)} />}
    </div>
  )
}
