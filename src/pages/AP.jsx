import { useState } from 'react'
import { Plus, Filter, Search, FileText, Building2, CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { useStore } from '../lib/store'
import { fmtCurrency, fmtDate, getDueDays, getDueLabel, statusColor, statusLabel, initials } from '../lib/utils'
import SidaInsight from '../components/SidaInsight'
import PaymentModal from '../components/PaymentModal'
import clsx from 'clsx'

function BillDetail({ bill, onPay, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl animate-slide-in">
        <div className="flex justify-between items-center px-6 py-4 border-b border-black/[0.06]">
          <div>
            <div className="font-medium text-sida-navy">{bill.vendor}</div>
            <div className="text-xs text-sida-navy/50 font-mono">{bill.invoiceNo}</div>
          </div>
          <button onClick={onClose} className="text-sida-navy/40 hover:text-sida-navy text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div><div className="label">Invoice date</div><div>{fmtDate(bill.date)}</div></div>
            <div><div className="label">Due date</div><div className={getDueDays(bill.dueDate) < 0 ? 'text-sida-red' : ''}>{fmtDate(bill.dueDate)}</div></div>
            <div><div className="label">Status</div><span className={clsx('badge', statusColor[bill.status])}>{statusLabel[bill.status]}</span></div>
          </div>
          <div className="border border-black/[0.06] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-sida-cream">
                <tr>
                  <th className="text-left px-4 py-2 table-header">Description</th>
                  <th className="text-right px-4 py-2 table-header">Qty</th>
                  <th className="text-right px-4 py-2 table-header">Unit</th>
                  <th className="text-right px-4 py-2 table-header">Total</th>
                </tr>
              </thead>
              <tbody>
                {bill.lines.map((l,i) => (
                  <tr key={i} className="border-t border-black/[0.04]">
                    <td className="px-4 py-2 text-sida-navy">{l.desc}</td>
                    <td className="px-4 py-2 text-right text-sida-navy/60">{l.qty}</td>
                    <td className="px-4 py-2 text-right text-sida-navy/60">{fmtCurrency(l.unit)}</td>
                    <td className="px-4 py-2 text-right font-medium">{fmtCurrency(l.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-sida-cream border-t border-black/10">
                <tr><td colSpan={3} className="px-4 py-2 text-sm font-medium">Subtotal</td><td className="px-4 py-2 text-right font-medium">{fmtCurrency(bill.net)}</td></tr>
                {bill.tax > 0 && <tr><td colSpan={3} className="px-4 py-2 text-sm">GST (5%)</td><td className="px-4 py-2 text-right">{fmtCurrency(bill.tax)}</td></tr>}
                <tr className="font-bold"><td colSpan={3} className="px-4 py-2">Total due</td><td className="px-4 py-2 text-right text-sida-navy">{fmtCurrency(bill.amount)}</td></tr>
              </tfoot>
            </table>
          </div>
          <div className="text-xs text-sida-navy/40">Memo: {bill.memo}</div>
          {bill.tax > 0 && (
            <div className="ai-chip text-xs">✓ ITC of {fmtCurrency(bill.tax)} tracked — will reduce your GST remittance</div>
          )}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-black/[0.06]">
          <button onClick={onClose} className="btn-secondary flex-1">Close</button>
          {bill.status === 'pending_approval' && (
            <button onClick={() => { onClose(); onPay(bill) }} className="btn-primary flex-1">
              Approve & Pay
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AP() {
  const { state } = useStore()
  const [payingBill, setPayingBill] = useState(null)
  const [viewingBill, setViewingBill] = useState(null)
  const [filter, setFilter] = useState('all')

  const filtered = state.apBills.filter(b =>
    filter === 'all' ? true :
    filter === 'pending' ? b.status === 'pending_approval' :
    filter === 'paid' ? b.status === 'paid' : true
  )

  const totalOwing = state.apBills.filter(b => b.status !== 'paid').reduce((s,b) => s+b.amount, 0)
  const overdue = state.apBills.filter(b => b.status !== 'paid' && getDueDays(b.dueDate) < 0)

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <SidaInsight message={`You owe ${fmtCurrency(totalOwing)} across ${state.apBills.filter(b=>b.status!=='paid').length} vendors. ${overdue.length > 0 ? `⚠ ${overdue.length} bill is overdue — I've flagged it. Approve a payment to avoid late fees.` : 'All bills are within terms — nothing overdue.'} I auto-posted every invoice from scanned documents — no manual entry needed.`} />

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total owing', value: fmtCurrency(totalOwing), sub: `${state.apBills.filter(b=>b.status!=='paid').length} bills`, cls: 'text-sida-navy' },
          { label: 'Due this week', value: fmtCurrency(state.apBills.filter(b => b.status !== 'paid' && getDueDays(b.dueDate) <= 7 && getDueDays(b.dueDate) >= 0).reduce((s,b)=>s+b.amount,0)), sub: 'Next 7 days', cls: 'text-sida-yellow-dark' },
          { label: 'Overdue', value: fmtCurrency(overdue.reduce((s,b)=>s+b.amount,0)), sub: `${overdue.length} bills`, cls: overdue.length > 0 ? 'text-sida-red' : 'text-sida-navy' },
          { label: 'Paid this month', value: fmtCurrency(state.apBills.filter(b=>b.status==='paid').reduce((s,b)=>s+b.amount,0)), sub: 'April 2026', cls: 'text-sida-green' },
        ].map(c => (
          <div key={c.label} className="stat-card">
            <div className="label">{c.label}</div>
            <div className={clsx('text-xl font-semibold mt-1', c.cls)}>{c.value}</div>
            <div className="text-xs text-sida-navy/40 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Bills table */}
      <div className="card">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-black/[0.06]">
          <div className="text-sm font-medium text-sida-navy flex-1">Bills</div>
          <div className="flex gap-1">
            {['all','pending','paid'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={clsx('px-3 py-1 rounded-lg text-xs font-medium transition-colors', filter === f ? 'bg-sida-navy text-white' : 'hover:bg-sida-cream text-sida-navy/60')}>
                {f === 'pending' ? 'Needs approval' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn-primary text-xs flex items-center gap-1.5"><Plus size={12} /> Add bill</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.06]">
                {['Vendor','Invoice','Date','Due','Amount','ITC','Status','Payment','Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(bill => {
                const { label: dueLabel, cls: dueCls } = getDueLabel(getDueDays(bill.dueDate))
                return (
                  <tr key={bill.id} className="border-b border-black/[0.04] hover:bg-sida-cream/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-sida-navy">{bill.vendor}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-sida-navy/60">{bill.invoiceNo}</td>
                    <td className="px-4 py-3 text-sida-navy/60">{fmtDate(bill.date)}</td>
                    <td className="px-4 py-3">
                      {bill.status !== 'paid' ? (
                        <span className={clsx('badge', dueCls)}>{dueLabel}</span>
                      ) : <span className="text-sida-navy/40 text-xs">{fmtDate(bill.dueDate)}</span>}
                    </td>
                    <td className="px-4 py-3 font-medium">{fmtCurrency(bill.amount)}</td>
                    <td className="px-4 py-3 text-xs">
                      {bill.tax > 0 ? <span className="text-sida-green">{fmtCurrency(bill.tax)}</span> : <span className="text-sida-navy/30">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('badge', statusColor[bill.status])}>{statusLabel[bill.status]}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-sida-navy/50">
                      {bill.payMethod ? (
                        <span className="flex items-center gap-1">
                          {bill.payMethod === 'EFT' && <Building2 size={11} />}
                          {bill.payMethod === 'Cheque' && <FileText size={11} />}
                          {bill.payMethod === 'Credit Card' && <CreditCard size={11} />}
                          {bill.payMethod}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setViewingBill(bill)} className="text-xs text-sida-green hover:underline">View</button>
                        {bill.status === 'pending_approval' && (
                          <button onClick={() => setPayingBill(bill)} className="btn-primary text-xs py-1 px-2.5">Pay</button>
                        )}
                        {bill.status === 'paid' && (
                          <span className="flex items-center gap-0.5 text-xs text-sida-green"><CheckCircle2 size={11} /> Paid</span>
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

      {viewingBill && <BillDetail bill={viewingBill} onPay={setPayingBill} onClose={() => setViewingBill(null)} />}
      {payingBill && <PaymentModal bill={payingBill} onClose={() => setPayingBill(null)} />}
    </div>
  )
}
