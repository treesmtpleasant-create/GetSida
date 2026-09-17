import { StoreProvider, useStore } from './lib/store'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './pages/Dashboard'
import UploadPage from './pages/Upload'
import AP from './pages/AP'
import AR from './pages/AR'
import Reports from './pages/Reports'
import Inventory from './pages/Inventory'
import Payroll from './pages/Payroll'
import Tax from './pages/Tax'
import Ledger from './pages/Ledger'
import Assets from './pages/Assets'
import Banking from './pages/Banking'
import Vendors from './pages/Vendors'
import { Expenses, ChartOfAccounts, Notifications, Settings } from './pages/Misc'

function PageRouter() {
  const { state } = useStore()
  const page = state.activePage

  const pages = {
    dashboard: Dashboard,
    upload: UploadPage,
    ap: AP,
    ar: AR,
    banking: Banking,
    expenses: Expenses,
    inventory: Inventory,
    payroll: Payroll,
    vendors: Vendors,
    reports: Reports,
    ledger: Ledger,
    assets: Assets,
    tax: Tax,
    chartofaccounts: ChartOfAccounts,
    notifications: Notifications,
    settings: Settings,
  }

  const Page = pages[page] || Dashboard
  return <Page />
}

function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-sida-cream">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <PageRouter />
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  )
}
