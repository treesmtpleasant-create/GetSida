import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useStore } from '../lib/store'
import { fmtCurrency, initials } from '../lib/utils'
import SidaInsight from '../components/SidaInsight'

export default function Vendors() {
  const { state } = useStore()
  const [selected, setSelected] = useState(state.vendors[0])

  const vendorBills = (vendorId) => state.apBills.filter(b => b.vendorId === vendorId)

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <SidaInsight message="Vendor profiles are built automatically from uploaded invoices — names, addresses, and tax numbers are extracted and stored. Payment terms are set per vendor, and Sida tracks due dates and flags payments for approval before they're late." />

      <div className="grid grid-cols-5 gap-4">
        <div className="card col-span-2">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.06]">
            <div className="text-sm font-medium text-sida-navy">Vendors ({state.vendors.length})</div>
            <button className="btn-primary text-xs flex items-center gap-1.5"><Plus size={12} /> Add vendor</button>
          </div>
          <div className="divide-y divide-black/[0.04]">
            {state.vendors.map(v => (
              <button
                key={v.id}
                onClick={() => setSelected(v)}
                className={`w-full text-left px-5 py-4 hover:bg-sida-cream/50 transition-colors ${selected?.id === v.id ? 'bg-sida-green-light border-l-2 border-sida-green' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sida-navy/10 flex items-center justify-center text-xs font-bold text-sida-navy flex-shrink-0">
                    {initials(v.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-sida-navy truncate">{v.name}</div>
                    <div className="text-xs text-sida-navy/50">{v.category} · {v.terms}</div>
                  </div>
                  {v.balance > 0 && (
                    <div className="text-xs font-medium text-sida-red">{fmtCurrency(v.balance)}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-3 space-y-4">
          {selected && (
            <>
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-sida-navy flex items-center justify-center text-white font-bold">
                    {initials(selected.name)}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-sida-navy">{selected.name}</div>
                    <div className="text-xs text-sida-navy/50">{selected.category}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    { label: 'Payment terms', val: selected.terms },
                    { label: 'Email', val: selected.email || '—' },
                    { label: 'Phone', val: selected.phone || '—' },
                    { label: 'Balance owing', val: fmtCurrency(selected.balance), red: selected.balance > 0 },
                    { label: 'YTD spend', val: fmtCurrency(selected.ytdSpend) },
                  ].map(f => (
                    <div key={f.label}>
                      <div className="label">{f.label}</div>
                      <div className={f.red ? 'text-sida-red font-medium' : 'text-sida-navy'}>{f.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="px-5 py-3.5 border-b border-black/[0.06] text-sm font-medium text-sida-navy">
                  Bills from {selected.name}
                </div>
                {vendorBills(selected.id).length === 0 ? (
                  <div className="p-6 text-center text-sm text-sida-navy/40">No bills yet</div>
                ) : (
                  <div className="divide-y divide-black/[0.04]">
                    {vendorBills(selected.id).map(bill => (
                      <div key={bill.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-sida-navy">{bill.invoiceNo}</div>
                          <div className="text-xs text-sida-navy/50">{bill.memo}</div>
                        </div>
                        <div className="text-sm font-medium text-sida-navy">{fmtCurrency(bill.amount)}</div>
                        <span className={`badge ${bill.status === 'paid' ? 'badge-green' : bill.status === 'pending_approval' ? 'badge-yellow' : 'badge-navy'} text-[10px]`}>
                          {bill.status === 'paid' ? 'Paid' : bill.status === 'pending_approval' ? 'Needs approval' : 'Approved'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
