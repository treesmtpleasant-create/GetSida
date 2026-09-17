import { Bell, Search, HelpCircle, User } from 'lucide-react'
import { useStore } from '../lib/store'

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  upload: 'Upload Documents',
  ap: 'Bills & Payments',
  ar: 'Invoices & Accounts Receivable',
  banking: 'Banking & Reconciliation',
  expenses: 'Expenses',
  inventory: 'Inventory',
  payroll: 'Payroll & Staff Scheduling',
  vendors: 'Vendors',
  reports: 'Financial Reports',
  ledger: 'General Ledger',
  assets: 'Capital Assets & Depreciation',
  tax: 'Tax & Remittances',
  chartofaccounts: 'Chart of Accounts',
  settings: 'Settings',
  notifications: 'Alerts & Notifications',
}

export default function Topbar() {
  const { state, dispatch } = useStore()
  const unread = state.notifications.filter(n => !n.read).length

  return (
    <header className="h-14 bg-white border-b border-black/[0.06] flex items-center px-6 gap-4 flex-shrink-0 sticky top-0 z-10">
      <div className="flex-1">
        <h1 className="text-base font-medium text-sida-navy">{PAGE_TITLES[state.activePage] || 'Sida'}</h1>
      </div>
      <div className="flex items-center gap-1 bg-sida-cream rounded-lg px-3 py-2 text-sm text-sida-navy/40 w-48">
        <Search size={13} className="mr-1 flex-shrink-0" />
        <span>Search anything...</span>
      </div>
      <button
        className="relative p-2 hover:bg-sida-cream rounded-lg transition-colors"
        onClick={() => dispatch({ type: 'SET_PAGE', payload: 'notifications' })}
      >
        <Bell size={16} className="text-sida-navy/60" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-sida-red rounded-full"></span>
        )}
      </button>
      <button className="p-2 hover:bg-sida-cream rounded-lg transition-colors">
        <HelpCircle size={16} className="text-sida-navy/60" />
      </button>
      <div className="flex items-center gap-2 pl-2 border-l border-black/10">
        <div className="w-7 h-7 rounded-full bg-sida-navy flex items-center justify-center text-white text-xs font-medium">M</div>
        <span className="text-sm font-medium text-sida-navy">Marcus</span>
      </div>
    </header>
  )
}
