import { useState } from 'react'
import { Plus, Send } from 'lucide-react'
import { useStore } from '../lib/store'
import { fmtCurrency, fmtDate, getDueDays, getDueLabel, statusColor, statusLabel } from '../lib/utils'
import SidaInsight from '../components/SidaInsight'
import clsx from 'clsx'

export default function AR() {
  const { state } = useStore()

  const totalAR = state.arInvoices.filter(i => i.status !== 'paid').reduce((s,i) => s+i.amount, 0)
  const overdue = state.arInvoices.filter(i => i.status === 'overdue')

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <SidaInsight message={`You have ${fmtCurrency(totalAR)} in outstanding receivables. ${overdue.length > 0 ? `⚠ ${overdue.length} invoice is overdue — I can send an automated reminder for you.` : 'All invoices are within terms.'} Revenue from POS sales is recorded automatically — these invoices are for your corporate catering accounts.`} />

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total outstanding', value: fmtCurrency(totalAR), sub: `${state.arInvoices.filter(i=>i.status!=='paid').length} invoices` },
          { label: 'Overdue', value: fmtCurrency(overdue.reduce((s,i)=>s+i.amount,0)), sub: `${overdue.length} invoice`, red: overdue.length > 0 },
          { label: 'Due this week', value: fmtCurrency(state.arInvoices.filter(i=>getDueDays(i.dueDate)<=7 && getDueDays(i.dueDate)>=0).reduce((s,i)=>s+i.amount,0)), sub: 'Next 7 days' },
          { label: 'Collected (MTD)', value: fmtCurrency(38200), sub: 'April 2026', green: true },
        ].map(c => (
          <div key={c.label} className="stat-card">
            <div className="label">{c.label}</div>
            <div className={clsx('text-xl font-semibold mt-1', c.red ? 'text-sida-red' : c.green ? 'text-sida-green' : 'text-sida-navy')}>{c.value}</div>
            <div className="text-xs text-sida-navy/40 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-black/[0.06]">
          <div className="text-sm font-medium text-sida-navy flex-1">Customer invoices</div>
          <button className="btn-primary text-xs flex items-center gap-1.5"><Plus size={12} /> New invoice</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.06]">
                {['Invoice','Customer','Date','Due','Amount','Tax','Status','Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.arInvoices.map(inv => {
                const { label, cls } = getDueLabel(getDueDays(inv.dueDate))
                return (
                  <tr key={inv.id} className={clsx('border-b border-black/[0.04] hover:bg-sida-cream/30', inv.status === 'overdue' ? 'bg-red-50' : '')}>
                    <td className="px-4 py-3 font-mono text-xs text-sida-navy/60">{inv.invoiceNo}</td>
                    <td className="px-4 py-3 font-medium text-sida-navy">{inv.customer}</td>
                    <td className="px-4 py-3 text-sida-navy/60 text-xs">{fmtDate(inv.date)}</td>
                    <td className="px-4 py-3"><span className={clsx('badge', cls)}>{label}</span></td>
                    <td className="px-4 py-3 font-medium">{fmtCurrency(inv.amount)}</td>
                    <td className="px-4 py-3 text-xs text-sida-green">{fmtCurrency(inv.tax)}</td>
                    <td className="px-4 py-3"><span className={clsx('badge', statusColor[inv.status])}>{statusLabel[inv.status]}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-xs text-sida-green hover:underline">View</button>
                        {inv.status !== 'paid' && (
                          <button className="flex items-center gap-1 text-xs text-sida-navy/60 hover:text-sida-navy">
                            <Send size={10} /> Remind
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customers */}
      <div className="card p-5">
        <div className="text-sm font-medium text-sida-navy mb-4">Customers</div>
        <div className="space-y-3">
          {state.customers.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-3 bg-sida-cream rounded-xl">
              <div className="w-8 h-8 rounded-full bg-sida-navy flex items-center justify-center text-white text-xs font-medium">
                {c.name.split('')[0]}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-sida-navy">{c.name}</div>
                <div className="text-xs text-sida-navy/50">{c.terms} · YTD: {fmtCurrency(c.ytdRevenue)}</div>
              </div>
              <div className="text-right">
                <div className={clsx('text-sm font-semibold', c.balance > 0 ? 'text-sida-red' : 'text-sida-green')}>{fmtCurrency(c.balance)}</div>
                <div className="text-xs text-sida-navy/40">outstanding</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
