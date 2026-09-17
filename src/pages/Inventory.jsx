import { useState } from 'react'
import { Plus, AlertTriangle } from 'lucide-react'
import { useStore } from '../lib/store'
import { fmtCurrency, fmtDate } from '../lib/utils'
import SidaInsight from '../components/SidaInsight'
import clsx from 'clsx'

export default function Inventory() {
  const { state } = useStore()
  const [filter, setFilter] = useState('all')

  const filtered = state.inventory.filter(i =>
    filter === 'all' ? true :
    filter === 'low' ? i.onHand <= i.reorder :
    filter === 'ok' ? i.onHand > i.reorder : true
  )
  const lowCount = state.inventory.filter(i => i.onHand <= i.reorder).length
  const totalValue = state.inventory.reduce((s,i) => s+i.value, 0)

  const getStatus = (item) => {
    if (item.onHand <= item.reorder * 0.3) return { label: 'Critical', cls: 'badge-red' }
    if (item.onHand <= item.reorder) return { label: 'Low', cls: 'badge-yellow' }
    return { label: 'OK', cls: 'badge-green' }
  }

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <SidaInsight message={`Perpetual inventory is active — every delivery invoice and POS sale updates your stock automatically. ${lowCount} items are below reorder level. I've detected $287 in waste variance this month — posted to COGS shrinkage account. No counting required.`} />

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total SKUs', value: state.inventory.length, sub: 'All items' },
          { label: 'Inventory value', value: fmtCurrency(totalValue), sub: 'Weighted avg cost' },
          { label: 'COGS this month', value: fmtCurrency(11980), sub: 'Auto-posted · 0 manual entries' },
          { label: 'Waste detected', value: fmtCurrency(287), sub: '2.4% of COGS', red: true },
        ].map(c => (
          <div key={c.label} className="stat-card">
            <div className="label">{c.label}</div>
            <div className={clsx('text-xl font-semibold mt-1', c.red ? 'text-sida-red' : 'text-sida-navy')}>{c.value}</div>
            <div className="text-xs text-sida-navy/40 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {lowCount > 0 && (
        <div className="border border-sida-yellow/40 bg-yellow-50 rounded-xl p-4 flex gap-3 items-start">
          <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <span className="font-medium">{lowCount} items below reorder level.</span>
            {' '}Sida has prepared purchase orders. Review and send with one tap.
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-black/[0.06]">
          <div className="text-sm font-medium text-sida-navy flex-1">Inventory Ledger</div>
          <div className="flex gap-1">
            {['all','low','ok'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={clsx('px-3 py-1 rounded-lg text-xs font-medium transition-colors', filter === f ? 'bg-sida-navy text-white' : 'hover:bg-sida-cream text-sida-navy/60')}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn-primary text-xs flex items-center gap-1.5"><Plus size={12} /> Add item</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.06]">
                {['Item','Category','On Hand','Reorder at','Unit Cost','Total Value','Status','Last Updated'].map(h => (
                  <th key={h} className="px-4 py-3 text-left table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const { label, cls } = getStatus(item)
                return (
                  <tr key={item.id} className="border-b border-black/[0.04] hover:bg-sida-cream/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-sida-navy">{item.name}</td>
                    <td className="px-4 py-3 text-sida-navy/60 text-xs">{item.category}</td>
                    <td className="px-4 py-3">
                      <span className={item.onHand <= item.reorder ? 'text-sida-red font-medium' : 'text-sida-navy'}>
                        {item.onHand} {item.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sida-navy/60">{item.reorder} {item.unit}</td>
                    <td className="px-4 py-3">{fmtCurrency(item.cost)}</td>
                    <td className="px-4 py-3 font-medium text-sida-green">{fmtCurrency(item.value)}</td>
                    <td className="px-4 py-3"><span className={clsx('badge', cls)}>{label}</span></td>
                    <td className="px-4 py-3 text-sida-navy/40 text-xs">{fmtDate(item.lastUpdated)}</td>
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
