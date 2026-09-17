import { useState } from 'react'
import { Download, ExternalLink, BarChart3, TrendingUp, DollarSign } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useStore } from '../lib/store'
import { fmtCurrency, fmtPercent } from '../lib/utils'
import SidaInsight from '../components/SidaInsight'
import clsx from 'clsx'

const PL_DATA = {
  revenue: [
    { name: 'Sales Revenue', amount: 42180 },
    { name: 'Other Income', amount: 420 },
  ],
  cogs: [
    { name: 'Cost of Goods Sold', amount: 11980 },
    { name: 'Waste/Shrinkage', amount: 287 },
  ],
  expenses: [
    { name: 'Wages & Salaries', amount: 13540 },
    { name: 'Rent', amount: 3800 },
    { name: 'Utilities', amount: 624 },
    { name: 'Supplies', amount: 480 },
    { name: 'Marketing', amount: 350 },
    { name: 'Insurance', amount: 240 },
    { name: 'Depreciation', amount: 350 },
    { name: 'Bank Fees', amount: 210 },
    { name: 'Miscellaneous', amount: 180 },
  ]
}

const PIE_COLORS = ['#2A9D6E', '#1B2B4B', '#FCD34D', '#ff3962', '#94a3b8', '#64748b']

const monthlyData = [
  { month: 'Nov', revenue: 38400, expenses: 30200 },
  { month: 'Dec', revenue: 45200, expenses: 34100 },
  { month: 'Jan', revenue: 36800, expenses: 29800 },
  { month: 'Feb', revenue: 39200, expenses: 30400 },
  { month: 'Mar', revenue: 38900, expenses: 29600 },
  { month: 'Apr', revenue: 42180, expenses: 30240 },
]

const REPORTS = [
  { id: 'pl', icon: '📈', title: 'Profit & Loss', sub: 'April 2026', tag: 'GAAP · ASPE' },
  { id: 'bs', icon: '⚖️', title: 'Balance Sheet', sub: 'As of Apr 30, 2026', tag: 'Auto-balanced' },
  { id: 'cf', icon: '💧', title: 'Cash Flow', sub: 'Indirect method', tag: 'CPA standard' },
  { id: 'yoy', icon: '📅', title: 'Year-over-Year', sub: 'Apr 2026 vs Apr 2025', tag: 'Trend analysis' },
  { id: 'cost', icon: '🍕', title: 'Cost Breakdown', sub: 'by category', tag: 'vs Industry avg' },
  { id: 'recon', icon: '🏦', title: 'Bank Reconciliation', sub: 'RBC — April', tag: '97% auto-matched' },
  { id: 'amort', icon: '🏗', title: 'Amortization Schedule', sub: 'All capital assets', tag: 'CCA compliant' },
  { id: 'payroll', icon: '💼', title: 'Payroll Summary', sub: 'April 2026 · T4 ready', tag: 'CRA compliant' },
  { id: 'inv', icon: '📦', title: 'Inventory Valuation', sub: 'Weighted avg cost', tag: 'ASPE compliant' },
  { id: 'tax', icon: '🏛', title: 'GST/HST Return', sub: 'Q1 2026', tag: 'CRA ready' },
  { id: 'ar_aging', icon: '📋', title: 'AR Aging', sub: 'By customer', tag: '' },
  { id: 'ap_aging', icon: '🗂', title: 'AP Aging', sub: 'By vendor', tag: '' },
]

export default function Reports() {
  const { state } = useStore()
  const [active, setActive] = useState('pl')

  const totalRevenue = PL_DATA.revenue.reduce((s,r)=>s+r.amount,0)
  const totalCOGS = PL_DATA.cogs.reduce((s,r)=>s+r.amount,0)
  const grossProfit = totalRevenue - totalCOGS
  const totalExp = PL_DATA.expenses.reduce((s,r)=>s+r.amount,0)
  const netIncome = grossProfit - totalExp

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <SidaInsight message={`April was strong — revenue grew 8.3% vs March. Gross margin held at ${fmtPercent(grossProfit/totalRevenue*100)}. Net income was ${fmtCurrency(netIncome)}. Your books are audit-ready — every entry has a source document attached and a full CPA-standard audit trail.`} />

      {/* Report grid */}
      <div className="grid grid-cols-4 gap-3">
        {REPORTS.map(r => (
          <button key={r.id} onClick={() => setActive(r.id)} className={clsx('card p-4 text-left transition-all hover:border-sida-green/40', active === r.id ? 'border-sida-green ring-1 ring-sida-green/20' : '')}>
            <div className="text-2xl mb-2">{r.icon}</div>
            <div className="text-sm font-medium text-sida-navy">{r.title}</div>
            <div className="text-xs text-sida-navy/50 mt-0.5">{r.sub}</div>
            {r.tag && <div className="mt-2 text-[10px] bg-sida-green-light text-sida-green px-2 py-0.5 rounded-full inline-block font-medium">{r.tag}</div>}
          </button>
        ))}
      </div>

      {/* P&L Report */}
      {active === 'pl' && (
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
            <div>
              <div className="font-medium text-sida-navy">Profit & Loss Statement</div>
              <div className="text-xs text-sida-navy/50">April 1–30, 2026 · {state.business.name}</div>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary text-xs flex items-center gap-1.5"><Download size={12} /> PDF</button>
              <button className="btn-secondary text-xs flex items-center gap-1.5"><Download size={12} /> Excel</button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {/* Revenue */}
            <div>
              <div className="text-xs uppercase tracking-wider text-sida-navy/40 font-medium mb-2">Revenue</div>
              {PL_DATA.revenue.map(r => (
                <div key={r.name} className="flex justify-between py-1.5 text-sm border-b border-black/[0.04]">
                  <span className="text-sida-navy/70 pl-3">{r.name}</span>
                  <span className="text-sida-green font-medium">{fmtCurrency(r.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 font-semibold text-sm bg-sida-cream rounded px-3 mt-1">
                <span>Total Revenue</span><span>{fmtCurrency(totalRevenue)}</span>
              </div>
            </div>
            {/* COGS */}
            <div>
              <div className="text-xs uppercase tracking-wider text-sida-navy/40 font-medium mb-2">Cost of Goods Sold</div>
              {PL_DATA.cogs.map(r => (
                <div key={r.name} className="flex justify-between py-1.5 text-sm border-b border-black/[0.04]">
                  <span className="text-sida-navy/70 pl-3">{r.name}</span>
                  <span className="text-sida-red">{fmtCurrency(r.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 font-semibold text-sm bg-sida-cream rounded px-3 mt-1">
                <span>Gross Profit</span><span className="text-sida-green">{fmtCurrency(grossProfit)} ({fmtPercent(grossProfit/totalRevenue*100)})</span>
              </div>
            </div>
            {/* Expenses */}
            <div>
              <div className="text-xs uppercase tracking-wider text-sida-navy/40 font-medium mb-2">Operating Expenses</div>
              {PL_DATA.expenses.map(r => (
                <div key={r.name} className="flex justify-between py-1.5 text-sm border-b border-black/[0.04]">
                  <span className="text-sida-navy/70 pl-3">{r.name}</span>
                  <span className="text-sida-navy">{fmtCurrency(r.amount)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between py-3 font-bold text-base bg-sida-navy text-white rounded-xl px-4">
              <span>Net Income</span><span className="text-sida-yellow">{fmtCurrency(netIncome)}</span>
            </div>
          </div>
          {/* Trend chart */}
          <div className="px-6 pb-6">
            <div className="text-sm font-medium text-sida-navy mb-3">6-Month Revenue Trend</div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v) => fmtCurrency(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#2A9D6E" fill="#e8f8f2" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#94a3b8" fill="#f1f5f9" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Cost breakdown */}
      {active === 'cost' && (
        <div className="card p-6">
          <div className="text-sm font-medium text-sida-navy mb-4">Cost Breakdown — April 2026</div>
          <div className="grid grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={[...PL_DATA.expenses.slice(0,5)].map(e=>({name:e.name,value:e.amount}))} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value">
                  {PL_DATA.expenses.slice(0,5).map((_,i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmtCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 pt-4">
              {PL_DATA.expenses.map((e,i) => (
                <div key={e.name} className="flex items-center gap-2 text-sm">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] || '#cbd5e1' }}></div>
                  <span className="flex-1 text-sida-navy/70 truncate">{e.name}</span>
                  <span className="font-medium text-sida-navy">{fmtPercent(e.amount/totalRevenue*100)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Balance sheet preview for other reports */}
      {active === 'bs' && (
        <div className="card p-6">
          <div className="font-medium text-sida-navy mb-1">Balance Sheet</div>
          <div className="text-xs text-sida-navy/50 mb-5">As of April 30, 2026 · Auto-balanced · ASPE compliant</div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs uppercase tracking-wider font-medium text-sida-navy/40 mb-2">Assets</div>
              {state.accounts.filter(a => a.type === 'Asset').map(a => (
                <div key={a.id} className="flex justify-between py-1.5 text-sm border-b border-black/[0.04]">
                  <span className="pl-2 text-sida-navy/70">{a.name}</span>
                  <span className={a.balance < 0 ? 'text-sida-red' : 'text-sida-green'}>{fmtCurrency(Math.abs(a.balance))}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 font-semibold text-sm bg-sida-cream rounded px-2 mt-1">
                <span>Total Assets</span><span>{fmtCurrency(state.accounts.filter(a=>a.type==='Asset').reduce((s,a)=>s+a.balance,0))}</span>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-medium text-sida-navy/40 mb-2">Liabilities & Equity</div>
              {state.accounts.filter(a => a.type === 'Liability' || a.type === 'Equity').map(a => (
                <div key={a.id} className="flex justify-between py-1.5 text-sm border-b border-black/[0.04]">
                  <span className="pl-2 text-sida-navy/70">{a.name}</span>
                  <span className="text-sida-navy">{fmtCurrency(Math.abs(a.balance))}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generic placeholder for other reports */}
      {!['pl','cost','bs'].includes(active) && (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">{REPORTS.find(r=>r.id===active)?.icon}</div>
          <div className="text-lg font-medium text-sida-navy mb-2">{REPORTS.find(r=>r.id===active)?.title}</div>
          <div className="text-sm text-sida-navy/50 mb-6">Generated automatically from your ledger · Always up to date</div>
          <button className="btn-primary mx-auto flex items-center gap-2"><Download size={14} /> Download Report</button>
        </div>
      )}
    </div>
  )
}
