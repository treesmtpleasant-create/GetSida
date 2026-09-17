import { useStore } from '../lib/store'
import { LayoutDashboard, Upload, FileText, Package, CreditCard, Users, BarChart3, BookOpen, Landmark, Settings, ChevronRight, Bell, Receipt, Building2, PiggyBank, TrendingUp } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { section: 'Overview' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'upload', label: 'Upload Docs', icon: Upload },
  { id: 'notifications', label: 'Alerts', icon: Bell, badge: 2 },
  { section: 'Money In / Out' },
  { id: 'ap', label: 'Bills & Payments', icon: CreditCard },
  { id: 'ar', label: 'Invoices & AR', icon: Receipt },
  { id: 'banking', label: 'Banking & Recon.', icon: Landmark },
  { id: 'expenses', label: 'Expenses', icon: FileText },
  { section: 'Operations' },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'payroll', label: 'Payroll & Staff', icon: Users },
  { id: 'vendors', label: 'Vendors', icon: Building2 },
  { section: 'Finance' },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'ledger', label: 'General Ledger', icon: BookOpen },
  { id: 'assets', label: 'Assets & Depr.', icon: TrendingUp },
  { id: 'tax', label: 'Tax & Remit', icon: PiggyBank },
  { section: 'Admin' },
  { id: 'chartofaccounts', label: 'Chart of Accounts', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const { state, dispatch } = useStore()
  const unread = state.notifications.filter(n => !n.read).length

  return (
    <aside className="w-52 bg-sida-navy flex-shrink-0 flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-baseline gap-0.5">
          <span className="text-white font-bold text-xl tracking-tight">sida</span>
          <span className="w-2 h-2 rounded-full bg-sida-red inline-block mb-0.5 ml-0.5"></span>
        </div>
        <div className="text-white/30 text-[9px] tracking-widest uppercase mt-0.5">Systems Integrated Data Accounting</div>
      </div>

      {/* Business badge */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="text-white/80 text-xs font-medium truncate">{state.business.name}</div>
        <div className="text-white/35 text-[10px] mt-0.5">{state.business.region} · {state.business.industry.replace('_',' ')}</div>
        <div className="flex items-center gap-1 mt-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sida-green animate-pulse-dot"></span>
          <span className="text-sida-green text-[10px] font-medium">Sida is live</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map((item, i) => {
          if (item.section) return (
            <div key={i} className="px-2 pt-3 pb-1 text-[9px] text-white/25 uppercase tracking-widest font-medium">{item.section}</div>
          )
          const Icon = item.icon
          const active = state.activePage === item.id
          const badgeCount = item.id === 'notifications' ? unread : item.badge
          return (
            <button
              key={item.id}
              onClick={() => dispatch({ type: 'SET_PAGE', payload: item.id })}
              className={clsx(
                'w-full nav-item text-left',
                active && 'nav-item-active'
              )}
            >
              <Icon size={14} className="flex-shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {badgeCount > 0 && !active && (
                <span className="bg-sida-red text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">{badgeCount}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* AI status bar */}
      <div className="px-4 py-3 border-t border-white/10">
        <div className="text-white/40 text-[10px]">AI Bookkeeper</div>
        <div className="text-white/70 text-[11px] mt-0.5">14 entries posted today</div>
        <div className="text-white/40 text-[10px] mt-0.5">Last sync: just now</div>
      </div>
    </aside>
  )
}
