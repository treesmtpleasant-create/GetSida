import { useState } from 'react'
import { X, CreditCard, Building2, FileText, CheckCircle2 } from 'lucide-react'
import { fmtCurrency, fmtDate } from '../lib/utils'
import { useStore } from '../lib/store'

export default function PaymentModal({ bill, onClose }) {
  const { dispatch } = useStore()
  const [method, setMethod] = useState('EFT')
  const [bankAccount, setBankAccount] = useState('RBC Business Chequing ···4821')
  const [chequeNo, setChequeNo] = useState('1042')
  const [memo, setMemo] = useState(`Payment — ${bill.invoiceNo}`)
  const [done, setDone] = useState(false)

  const banks = ['RBC Business Chequing ···4821', 'TD Business Savings ···3304']
  const cards = ['Visa Business ···9221', 'Mastercard ···0044']

  function handleApprove() {
    dispatch({ type: 'APPROVE_BILL', payload: { id: bill.id, method } })
    setDone(true)
    setTimeout(onClose, 1800)
  }

  if (done) return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-4 shadow-xl">
        <div className="w-14 h-14 rounded-full bg-sida-green-light flex items-center justify-center">
          <CheckCircle2 size={28} className="text-sida-green" />
        </div>
        <div className="text-lg font-medium text-sida-navy">Payment approved</div>
        <div className="text-sm text-sida-navy/60">{method === 'Cheque' ? `Cheque #${chequeNo}` : `${method} payment`} of {fmtCurrency(bill.amount)} scheduled</div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
          <div className="font-medium text-sida-navy">Approve Payment</div>
          <button onClick={onClose} className="p-1 hover:bg-sida-cream rounded-lg"><X size={16} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Bill summary */}
          <div className="bg-sida-cream rounded-xl p-4 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-sida-navy/60">Vendor</span>
              <span className="font-medium">{bill.vendor}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-sida-navy/60">Invoice</span>
              <span className="font-mono text-xs">{bill.invoiceNo}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-sida-navy/60">Due date</span>
              <span>{fmtDate(bill.dueDate)}</span>
            </div>
            <div className="flex justify-between text-sm pt-1 border-t border-black/[0.06] mt-1">
              <span className="font-medium">Amount</span>
              <span className="font-bold text-sida-navy text-base">{fmtCurrency(bill.amount)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <label className="label">Payment method</label>
            <div className="grid grid-cols-3 gap-2">
              {['EFT', 'Cheque', 'Credit Card'].map(m => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`border rounded-xl p-3 flex flex-col items-center gap-1.5 transition-all text-sm ${method === m ? 'border-sida-green bg-sida-green-light' : 'border-black/10 hover:border-black/20'}`}
                >
                  {m === 'EFT' && <Building2 size={16} className={method === m ? 'text-sida-green' : 'text-sida-navy/40'} />}
                  {m === 'Cheque' && <FileText size={16} className={method === m ? 'text-sida-green' : 'text-sida-navy/40'} />}
                  {m === 'Credit Card' && <CreditCard size={16} className={method === m ? 'text-sida-green' : 'text-sida-navy/40'} />}
                  <span className={method === m ? 'text-sida-green font-medium' : 'text-sida-navy/60'}>{m}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Account selection */}
          {method !== 'Credit Card' ? (
            <div>
              <label className="label">Pay from bank account</label>
              <select className="select" value={bankAccount} onChange={e => setBankAccount(e.target.value)}>
                {banks.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="label">Pay with credit card</label>
              <select className="select" value={bankAccount} onChange={e => setBankAccount(e.target.value)}>
                {cards.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          )}

          {/* Cheque number */}
          {method === 'Cheque' && (
            <div>
              <label className="label">Cheque number</label>
              <input className="input font-mono" value={chequeNo} onChange={e => setChequeNo(e.target.value)} />
              <div className="mt-2 p-3 bg-sida-cream rounded-lg text-xs text-sida-navy/50">
                Sida will generate a cheque document. Print and mail, or use your bank's EFT cheque service.
              </div>
            </div>
          )}

          <div>
            <label className="label">Memo</label>
            <input className="input" value={memo} onChange={e => setMemo(e.target.value)} />
          </div>

          {/* Journal preview */}
          <div className="border border-black/[0.06] rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-wider text-sida-navy/40 mb-3 font-medium">Journal entry — Sida will post automatically</div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-sida-navy/60">Dr Accounts Payable</span>
                <span className="text-sida-green">{fmtCurrency(bill.amount)}</span>
              </div>
              <div className="flex justify-between pl-4">
                <span className="text-sida-navy/60">Cr {method === 'Credit Card' ? 'Credit Card Payable' : 'Cash & Bank'}</span>
                <span className="text-sida-red">{fmtCurrency(bill.amount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-black/[0.06]">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleApprove} className="btn-primary flex-1">
            Approve & Schedule Payment
          </button>
        </div>
      </div>
    </div>
  )
}
