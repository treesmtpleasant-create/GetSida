import { useState } from 'react'
import { Plus, TrendingDown } from 'lucide-react'
import { useStore } from '../lib/store'
import { fmtCurrency, fmtDate } from '../lib/utils'
import SidaInsight from '../components/SidaInsight'
import clsx from 'clsx'

const CCA_CLASSES = {
  8: 'Class 8 — Equipment (20%)',
  10: 'Class 10 — Computer/AV (30%)',
  13: 'Class 13 — Leasehold improvements (SL)',
  14: 'Class 14 — Patents & licenses',
  50: 'Class 50 — IT equipment (55%)',
}

export default function Assets() {
  const { state } = useStore()
  const [selected, setSelected] = useState(state.assets[0])

  const totalCost = state.assets.reduce((s,a) => s+a.cost, 0)
  const totalNBV = state.assets.reduce((s,a) => s+a.nbv, 0)
  const totalDepr = state.assets.reduce((s,a) => s+a.accDepr, 0)
  const monthlyTotal = state.assets.reduce((s,a) => s+a.monthlyDepr, 0)

  // Generate amortization schedule for selected asset
  const schedule = []
  if (selected) {
    let nbv = selected.cost
    const year = new Date(selected.date).getFullYear()
    for (let y = year; y <= year + 6 && nbv > 100; y++) {
      const depr = Math.min(nbv * selected.ccaRate, nbv)
      const open = nbv
      nbv = nbv - depr
      schedule.push({ year: y, opening: open, depr, closing: nbv })
    }
  }

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <SidaInsight message="Capital assets are detected automatically from uploaded invoices above your threshold. I assign the CCA class based on the asset description, generate the full amortization schedule, and post monthly depreciation entries automatically — no setup required." />

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total asset cost', value: fmtCurrency(totalCost) },
          { label: 'Net book value', value: fmtCurrency(totalNBV) },
          { label: 'Accumulated depreciation', value: fmtCurrency(totalDepr) },
          { label: 'Monthly depreciation', value: fmtCurrency(monthlyTotal) },
        ].map(c => (
          <div key={c.label} className="stat-card">
            <div className="label">{c.label}</div>
            <div className="text-xl font-semibold text-sida-navy mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Asset list */}
        <div className="card col-span-2">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.06]">
            <div className="text-sm font-medium text-sida-navy">Capital assets</div>
            <button className="btn-primary text-xs flex items-center gap-1.5"><Plus size={12} /> Add asset</button>
          </div>
          <div className="divide-y divide-black/[0.04]">
            {state.assets.map(asset => (
              <button
                key={asset.id}
                onClick={() => setSelected(asset)}
                className={clsx('w-full text-left px-5 py-4 hover:bg-sida-cream/50 transition-colors', selected?.id === asset.id ? 'bg-sida-green-light border-l-2 border-sida-green' : '')}
              >
                <div className="text-sm font-medium text-sida-navy">{asset.name}</div>
                <div className="text-xs text-sida-navy/50 mt-0.5">{CCA_CLASSES[asset.ccaClass]}</div>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-sida-navy/60">Cost: {fmtCurrency(asset.cost)}</span>
                  <span className="text-sida-green">NBV: {fmtCurrency(asset.nbv)}</span>
                </div>
                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sida-green rounded-full" style={{ width: `${(asset.nbv/asset.cost*100).toFixed(0)}%` }}></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Amortization schedule */}
        <div className="card col-span-3">
          <div className="px-5 py-3.5 border-b border-black/[0.06]">
            <div className="text-sm font-medium text-sida-navy">{selected?.name} — Amortization Schedule</div>
            <div className="text-xs text-sida-navy/50 mt-0.5">{selected && CCA_CLASSES[selected.ccaClass]} · Acquired {selected && fmtDate(selected.date)}</div>
          </div>

          {selected && (
            <>
              <div className="grid grid-cols-3 gap-4 p-5 border-b border-black/[0.06]">
                <div>
                  <div className="label">Original cost</div>
                  <div className="text-base font-semibold text-sida-navy">{fmtCurrency(selected.cost)}</div>
                </div>
                <div>
                  <div className="label">Net book value</div>
                  <div className="text-base font-semibold text-sida-green">{fmtCurrency(selected.nbv)}</div>
                </div>
                <div>
                  <div className="label">Monthly entry</div>
                  <div className="text-base font-semibold text-sida-navy">{fmtCurrency(selected.monthlyDepr)}</div>
                  <div className="text-[10px] text-sida-navy/40">Dr Depreciation Exp / Cr Accum Depr</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/[0.06]">
                      {['Year','Opening NBV','CCA Deduction','Closing NBV','% remaining'].map(h => (
                        <th key={h} className="px-4 py-3 text-left table-header">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row, i) => (
                      <tr key={row.year} className={clsx('border-b border-black/[0.04]', i === 0 ? 'bg-sida-cream/50' : 'hover:bg-sida-cream/30 transition-colors')}>
                        <td className="px-4 py-2.5 font-medium">{row.year}</td>
                        <td className="px-4 py-2.5">{fmtCurrency(row.opening)}</td>
                        <td className="px-4 py-2.5 text-sida-red">({fmtCurrency(row.depr)})</td>
                        <td className="px-4 py-2.5 text-sida-green font-medium">{fmtCurrency(row.closing)}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-sida-green rounded-full" style={{ width: `${(row.closing/selected.cost*100).toFixed(0)}%` }}></div>
                            </div>
                            <span className="text-xs text-sida-navy/50">{(row.closing/selected.cost*100).toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-black/[0.06]">
                <div className="text-xs text-sida-navy/40">Monthly journal entry posted automatically: Dr Depreciation Expense {fmtCurrency(selected.monthlyDepr)} / Cr Accumulated Depreciation {fmtCurrency(selected.monthlyDepr)}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
