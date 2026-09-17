import { createContext, useContext, useReducer } from 'react'

const today = new Date()
const fmt = (d) => d.toISOString().split('T')[0]
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }

const initialState = {
  business: {
    name: "Maple Street Café",
    bn: "82741 3002 RT0001",
    gstNumber: "82741 3002 RT0001",
    pstNumber: "PST-BC-99284",
    industry: "food_service",
    region: "BC",
    country: "CA",
    fiscalYearEnd: "December 31",
    bankConnected: true,
    posConnected: "Square",
    accountantEmail: "cpa@firma.ca",
  },
  accounts: [
    { id: 'CASH', code: '1010', name: 'Cash & Bank', type: 'Asset', balance: 48320.50 },
    { id: 'AR', code: '1100', name: 'Accounts Receivable', type: 'Asset', balance: 3240.00 },
    { id: 'INV', code: '1200', name: 'Inventory', type: 'Asset', balance: 8340.00 },
    { id: 'PREPAID', code: '1300', name: 'Prepaid Expenses', type: 'Asset', balance: 1200.00 },
    { id: 'EQUIP', code: '1500', name: 'Equipment', type: 'Asset', balance: 42000.00 },
    { id: 'ACCUM_DEPR', code: '1510', name: 'Accumulated Depreciation', type: 'Asset', balance: -12600.00 },
    { id: 'AP', code: '2000', name: 'Accounts Payable', type: 'Liability', balance: 9840.00 },
    { id: 'GST_PAY', code: '2100', name: 'GST Payable', type: 'Liability', balance: 2109.00 },
    { id: 'PST_PAY', code: '2110', name: 'PST Payable', type: 'Liability', balance: 842.00 },
    { id: 'CPP_PAY', code: '2200', name: 'CPP Payable', type: 'Liability', balance: 480.00 },
    { id: 'EI_PAY', code: '2210', name: 'EI Payable', type: 'Liability', balance: 280.00 },
    { id: 'TAX_PAY', code: '2220', name: 'Income Tax Payable', type: 'Liability', balance: 1080.00 },
    { id: 'CREDITCARD', code: '2300', name: 'Credit Card Payable', type: 'Liability', balance: 4200.00 },
    { id: 'EQUITY', code: '3000', name: "Owner's Equity", type: 'Equity', balance: 72000.00 },
    { id: 'DRAWINGS', code: '3100', name: "Owner's Drawings", type: 'Equity', balance: -8000.00 },
    { id: 'REVENUE', code: '4000', name: 'Sales Revenue', type: 'Revenue', balance: 42180.00 },
    { id: 'OTHER_INC', code: '4100', name: 'Other Income', type: 'Revenue', balance: 420.00 },
    { id: 'COGS', code: '5000', name: 'Cost of Goods Sold', type: 'COGS', balance: 11980.00 },
    { id: 'COGS_WASTE', code: '5010', name: 'COGS — Waste/Shrinkage', type: 'COGS', balance: 287.00 },
    { id: 'WAGES', code: '6000', name: 'Wages & Salaries', type: 'Expense', balance: 13540.00 },
    { id: 'RENT', code: '6100', name: 'Rent', type: 'Expense', balance: 3800.00 },
    { id: 'UTILITIES', code: '6200', name: 'Utilities', type: 'Expense', balance: 624.00 },
    { id: 'SUPPLIES', code: '6300', name: 'Supplies', type: 'Expense', balance: 480.00 },
    { id: 'MARKETING', code: '6400', name: 'Marketing & Advertising', type: 'Expense', balance: 350.00 },
    { id: 'INSURANCE', code: '6500', name: 'Insurance', type: 'Expense', balance: 240.00 },
    { id: 'DEPR', code: '6600', name: 'Depreciation Expense', type: 'Expense', balance: 350.00 },
    { id: 'BANKFEES', code: '6700', name: 'Bank & Merchant Fees', type: 'Expense', balance: 210.00 },
    { id: 'MISC', code: '6900', name: 'Miscellaneous', type: 'Expense', balance: 180.00 },
  ],
  vendors: [
    { id: 'v1', name: 'Sysco Foods Canada', category: 'Food Supplier', terms: 'Net 30', email: 'ap@sysco.ca', phone: '604-555-0101', balance: 3240.00, ytdSpend: 28400 },
    { id: 'v2', name: 'Local Bakery Co.', category: 'Food Supplier', terms: 'Net 7', email: 'orders@localbakery.ca', phone: '604-555-0202', balance: 480.00, ytdSpend: 4200 },
    { id: 'v3', name: 'BC Hydro', category: 'Utilities', terms: 'Net 21', email: '', phone: '', balance: 312.00, ytdSpend: 2496 },
    { id: 'v4', name: '1847 Holdings (Landlord)', category: 'Rent', terms: '1st of month', email: 'pm@1847.ca', phone: '604-555-0303', balance: 3800.00, ytdSpend: 15200 },
    { id: 'v5', name: 'TELUS Business', category: 'Telecom', terms: 'Net 30', email: '', phone: '', balance: 180.00, ytdSpend: 720 },
    { id: 'v6', name: 'Pacific Coffee Roasters', category: 'Food Supplier', terms: 'Net 14', email: 'orders@pacificroasters.ca', phone: '604-555-0404', balance: 828.00, ytdSpend: 6200 },
  ],
  apBills: [
    { id: 'bill1', vendor: 'Sysco Foods Canada', vendorId: 'v1', invoiceNo: 'SYS-2026-4891', date: fmt(addDays(today,-5)), dueDate: fmt(addDays(today,25)), amount: 3240.00, tax: 162.00, net: 3078.00, status: 'approved', payMethod: null, account: 'INV', memo: 'Weekly food delivery — Apr 12', lines: [{desc:'Chicken breast 10kg',qty:10,unit:28.50,total:285},{desc:'Mixed vegetables case',qty:5,unit:42.00,total:210},{desc:'Olive oil 4L x6',qty:6,unit:18.00,total:108}] },
    { id: 'bill2', vendor: 'Local Bakery Co.', vendorId: 'v2', invoiceNo: 'LBC-0284', date: fmt(addDays(today,-2)), dueDate: fmt(addDays(today,5)), amount: 480.00, tax: 24.00, net: 456.00, status: 'pending_approval', payMethod: null, account: 'INV', memo: 'Bread & pastries — weekly', lines: [{desc:'Sourdough loaves x24',qty:24,unit:8.50,total:204},{desc:'Croissant tray x4',qty:4,unit:42.00,total:168}] },
    { id: 'bill3', vendor: 'BC Hydro', vendorId: 'v3', invoiceNo: 'BCH-88221', date: fmt(addDays(today,-10)), dueDate: fmt(addDays(today,11)), amount: 312.00, tax: 0, net: 312.00, status: 'pending_approval', payMethod: null, account: 'UTILITIES', memo: 'April electricity', lines: [{desc:'Commercial electricity — April 2026',qty:1,unit:312,total:312}] },
    { id: 'bill4', vendor: '1847 Holdings (Landlord)', vendorId: 'v4', invoiceNo: 'RENT-MAY-26', date: fmt(addDays(today,-1)), dueDate: fmt(addDays(today,14)), amount: 3800.00, tax: 0, net: 3800.00, status: 'pending_approval', payMethod: null, account: 'RENT', memo: 'May 2026 rent', lines: [{desc:'Commercial rent — May 2026',qty:1,unit:3800,total:3800}] },
    { id: 'bill5', vendor: 'Pacific Coffee Roasters', vendorId: 'v6', invoiceNo: 'PCR-2026-191', date: fmt(addDays(today,-3)), dueDate: fmt(addDays(today,11)), amount: 828.00, tax: 41.40, net: 786.60, status: 'paid', payMethod: 'EFT', account: 'INV', memo: 'Espresso beans 30kg + oat milk', lines: [{desc:'Ethiopian blend 30kg',qty:30,unit:24.00,total:720},{desc:'Oat milk 12x1L',qty:12,unit:4.50,total:54}] },
  ],
  customers: [
    { id: 'c1', name: 'Corporate Catering — TechCorp', email: 'finance@techcorp.ca', phone: '604-555-0501', terms: 'Net 15', balance: 2400.00, ytdRevenue: 14400 },
    { id: 'c2', name: 'Daily POS Sales', email: '', phone: '', terms: 'Immediate', balance: 0, ytdRevenue: 38200 },
    { id: 'c3', name: 'Event Catering — Various', email: 'events@maplecafe.ca', phone: '', terms: 'Net 7', balance: 840.00, ytdRevenue: 5200 },
  ],
  arInvoices: [
    { id: 'inv1', customer: 'Corporate Catering — TechCorp', customerId: 'c1', invoiceNo: 'INV-2026-041', date: fmt(addDays(today,-12)), dueDate: fmt(addDays(today,3)), amount: 1200.00, tax: 60.00, status: 'overdue', memo: 'Weekly catering — Apr 5', lines: [] },
    { id: 'inv2', customer: 'Corporate Catering — TechCorp', customerId: 'c1', invoiceNo: 'INV-2026-048', date: fmt(addDays(today,-5)), dueDate: fmt(addDays(today,10)), amount: 1200.00, tax: 60.00, status: 'sent', memo: 'Weekly catering — Apr 12', lines: [] },
    { id: 'inv3', customer: 'Event Catering — Various', customerId: 'c3', invoiceNo: 'INV-2026-049', date: fmt(addDays(today,-2)), dueDate: fmt(addDays(today,5)), amount: 840.00, tax: 42.00, status: 'sent', memo: 'Brunch event — Apr 15', lines: [] },
  ],
  employees: [
    { id: 'e1', name: 'Jamie Park', role: 'Head Barista', rate: 22.00, type: 'hourly', sin: '***-**-1234', color: '#2A9D6E' },
    { id: 'e2', name: 'Maria Kim', role: 'Kitchen Lead', rate: 20.00, type: 'hourly', sin: '***-**-5678', color: '#1B2B4B' },
    { id: 'e3', name: 'Alex Lee', role: 'Server', rate: 18.00, type: 'hourly', sin: '***-**-9012', color: '#ff3962' },
    { id: 'e4', name: 'Sam Reyes', role: 'Kitchen Staff', rate: 19.00, type: 'hourly', sin: '***-**-3456', color: '#FCD34D' },
  ],
  payrollRuns: [
    {
      id: 'pr1', period: 'April 1–15, 2026', runDate: fmt(addDays(today,-2)), status: 'pending_approval',
      lines: [
        { empId: 'e1', name: 'Jamie Park', hours: 42, gross: 924.00, cpp: 46.20, ei: 14.78, tax: 95.02, net: 768.00 },
        { empId: 'e2', name: 'Maria Kim', hours: 40, gross: 800.00, cpp: 40.00, ei: 12.80, tax: 83.20, net: 664.00 },
        { empId: 'e3', name: 'Alex Lee', hours: 28, gross: 504.00, cpp: 25.20, ei: 8.06, tax: 38.74, net: 432.00 },
        { empId: 'e4', name: 'Sam Reyes', hours: 32, gross: 608.00, cpp: 30.40, ei: 9.73, tax: 57.87, net: 510.00 },
      ]
    }
  ],
  inventory: [
    { id: 'i1', name: 'Espresso beans', unit: 'kg', onHand: 12.5, reorder: 10, cost: 28.00, value: 350, category: 'Beverages', lastUpdated: fmt(addDays(today,-1)) },
    { id: 'i2', name: 'Whole milk', unit: 'L', onHand: 48, reorder: 20, cost: 1.80, value: 86.40, category: 'Dairy', lastUpdated: fmt(today) },
    { id: 'i3', name: 'Oat milk', unit: 'L', onHand: 3, reorder: 12, cost: 3.50, value: 10.50, category: 'Dairy', lastUpdated: fmt(today) },
    { id: 'i4', name: 'Sourdough loaves', unit: 'units', onHand: 12, reorder: 20, cost: 4.20, value: 50.40, category: 'Bakery', lastUpdated: fmt(today) },
    { id: 'i5', name: 'Avocado', unit: 'cases', onHand: 2, reorder: 4, cost: 42.00, value: 84, category: 'Produce', lastUpdated: fmt(today) },
    { id: 'i6', name: 'Pastries — mixed', unit: 'units', onHand: 84, reorder: 40, cost: 1.95, value: 163.80, category: 'Bakery', lastUpdated: fmt(addDays(today,-1)) },
    { id: 'i7', name: 'Chicken breast', unit: 'kg', onHand: 9, reorder: 8, cost: 28.50, value: 256.50, category: 'Protein', lastUpdated: fmt(addDays(today,-5)) },
    { id: 'i8', name: 'Mixed vegetables', unit: 'cases', onHand: 4, reorder: 3, cost: 42.00, value: 168, category: 'Produce', lastUpdated: fmt(addDays(today,-5)) },
  ],
  assets: [
    { id: 'a1', name: 'Commercial Espresso Machine', cost: 18000, date: '2023-03-15', ccaClass: 8, ccaRate: 0.20, nbv: 9360, accDepr: 8640, monthlyDepr: 300, active: true },
    { id: 'a2', name: 'Walk-in Refrigerator', cost: 12000, date: '2022-09-01', ccaClass: 8, ccaRate: 0.20, nbv: 5040, accDepr: 6960, monthlyDepr: 200, active: true },
    { id: 'a3', name: 'POS System & Hardware', cost: 4800, date: '2024-01-10', ccaClass: 10, ccaRate: 0.30, nbv: 2352, accDepr: 2448, monthlyDepr: 120, active: true },
    { id: 'a4', name: 'Leasehold Improvements', cost: 28000, date: '2022-01-01', ccaClass: 13, ccaRate: 0.20, nbv: 14560, accDepr: 13440, monthlyDepr: 233, active: true },
  ],
  journalEntries: [
    { id: 'je1', date: fmt(today), memo: 'Square POS daily sales — Apr 17', source: 'POS Auto', entries: [{acct:'CASH',dr:4082,cr:0},{acct:'REVENUE',dr:0,cr:3840},{acct:'GST_PAY',dr:0,cr:192},{acct:'PST_PAY',dr:0,cr:50}], status:'posted', confidence:99 },
    { id: 'je2', date: fmt(today), memo: 'COGS from POS sales — recipes applied', source: 'Inventory Auto', entries: [{acct:'COGS',dr:1088,cr:0},{acct:'INV',dr:0,cr:1088}], status:'posted', confidence:99 },
    { id: 'je3', date: fmt(addDays(today,-2)), memo: 'Sysco Foods — delivery invoice SYS-2026-4891', source: 'Document AI', entries: [{acct:'INV',dr:3078,cr:0},{acct:'GST_PAY',dr:162,cr:0},{acct:'AP',dr:0,cr:3240}], status:'posted', confidence:98 },
    { id: 'je4', date: fmt(addDays(today,-3)), memo: 'Monthly depreciation — all assets', source: 'Auto-schedule', entries: [{acct:'DEPR',dr:853,cr:0},{acct:'ACCUM_DEPR',dr:0,cr:853}], status:'posted', confidence:100 },
    { id: 'je5', date: fmt(addDays(today,-5)), memo: 'BC Hydro utility bill', source: 'Document AI', entries: [{acct:'UTILITIES',dr:312,cr:0},{acct:'AP',dr:0,cr:312}], status:'posted', confidence:97 },
  ],
  bankTransactions: [
    { id: 'bt1', date: fmt(today), desc: 'SQUARE INC PAYMENT', amount: 4082.00, matched: true, accountId: 'CASH' },
    { id: 'bt2', date: fmt(addDays(today,-1)), desc: 'SYSCO FOODS EFT', amount: -3240.00, matched: true, accountId: 'CASH' },
    { id: 'bt3', date: fmt(addDays(today,-2)), desc: 'SQUARE INC PAYMENT', amount: 3940.00, matched: true, accountId: 'CASH' },
    { id: 'bt4', date: fmt(addDays(today,-3)), desc: 'BC HYDRO PAD', amount: -312.00, matched: true, accountId: 'CASH' },
    { id: 'bt5', date: fmt(addDays(today,-4)), desc: 'INTERAC E-TRANSFER REC', amount: 500.00, matched: false, accountId: 'CASH' },
    { id: 'bt6', date: fmt(addDays(today,-5)), desc: 'TELUS MOB PAY', amount: -180.00, matched: true, accountId: 'CASH' },
  ],
  taxRemittances: [
    { id: 'tx1', type: 'GST/HST', period: 'Q1 2026', amount: 2109.00, dueDate: fmt(addDays(today,44)), status: 'ready', filedDate: null },
    { id: 'tx2', type: 'Payroll — CPP/EI/Tax', period: 'April 2026', amount: 1840.00, dueDate: fmt(addDays(today,8)), status: 'ready', filedDate: null },
    { id: 'tx3', type: 'PST — BC', period: 'Q1 2026', amount: 842.00, dueDate: fmt(addDays(today,73)), status: 'upcoming', filedDate: null },
  ],
  notifications: [
    { id: 'n1', type: 'approval', title: 'Payroll run ready', desc: 'Apr 1–15 payroll of $6,820 gross ready for approval', time: '2 hours ago', read: false },
    { id: 'n2', type: 'alert', title: 'Oat milk — low stock', desc: '3 L remaining — approximately 1 day of stock', time: '4 hours ago', read: false },
    { id: 'n3', type: 'info', title: 'Bank reconciliation complete', desc: '94 transactions matched · 1 exception flagged', time: '6 hours ago', read: true },
    { id: 'n4', type: 'approval', title: 'Bill due in 5 days', desc: 'Local Bakery Co. $480 — due Apr 22', time: '1 day ago', read: true },
  ],
  uploadQueue: [],
  activePage: 'dashboard',
}

const BILL_DOC_TYPES = ['supplier_invoice', 'expense_receipt', 'capital_asset_invoice']

function processDocument(state, { parsed, fileName }) {
  const now = fmt(new Date())
  const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const isBill = BILL_DOC_TYPES.includes(parsed.documentType)
  const autoApprove = parsed.confidence >= 90
  const tax = parsed.taxAmount || 0
  const net = parsed.totalAmount - tax

  let vendors = state.vendors
  let vendorId = null
  if (parsed.vendorName) {
    const existing = vendors.find(v => v.name.toLowerCase() === parsed.vendorName.toLowerCase())
    if (existing) {
      vendorId = existing.id
      vendors = vendors.map(v => v.id === vendorId ? { ...v, balance: v.balance + (isBill ? parsed.totalAmount : 0), ytdSpend: v.ytdSpend + (isBill ? parsed.totalAmount : 0) } : v)
    } else if (isBill) {
      vendorId = `v_${uid()}`
      vendors = [...vendors, { id: vendorId, name: parsed.vendorName, category: parsed.suggestedCategory || 'Other', terms: 'Net 30', email: '', phone: '', balance: parsed.totalAmount, ytdSpend: parsed.totalAmount }]
    }
  }

  let apBills = state.apBills
  if (isBill) {
    apBills = [{
      id: `bill_${uid()}`,
      vendor: parsed.vendorName || 'Unknown vendor',
      vendorId,
      invoiceNo: parsed.invoiceNumber || fileName,
      date: parsed.documentDate || now,
      dueDate: parsed.dueDate || now,
      amount: parsed.totalAmount,
      tax,
      net,
      status: autoApprove ? 'approved' : 'pending_approval',
      payMethod: null,
      account: parsed.suggestedAccountId,
      memo: parsed.summary,
      lines: (parsed.lineItems || []).map(l => ({ desc: l.description, qty: l.quantity ?? 1, unit: l.unitPrice ?? l.total, total: l.total })),
    }, ...apBills]
  }

  let journalEntries = state.journalEntries
  if (autoApprove) {
    const entries = isBill
      ? [
          { acct: parsed.suggestedAccountId, dr: net, cr: 0 },
          ...(tax ? [{ acct: 'GST_PAY', dr: tax, cr: 0 }] : []),
          { acct: 'AP', dr: 0, cr: parsed.totalAmount },
        ]
      : parsed.documentType === 'pos_export'
      ? [
          { acct: 'CASH', dr: parsed.totalAmount, cr: 0 },
          { acct: 'REVENUE', dr: 0, cr: net },
          ...(tax ? [{ acct: 'GST_PAY', dr: 0, cr: tax }] : []),
        ]
      : [
          { acct: parsed.suggestedAccountId, dr: parsed.totalAmount, cr: 0 },
          { acct: 'CASH', dr: 0, cr: parsed.totalAmount },
        ]
    journalEntries = [{
      id: `je_${uid()}`,
      date: now,
      memo: parsed.summary,
      source: 'Claude Document AI',
      entries,
      status: 'posted',
      confidence: parsed.confidence,
    }, ...journalEntries]
  }

  const notifications = [{
    id: `n_${uid()}`,
    type: autoApprove ? 'info' : 'approval',
    title: autoApprove ? 'Document processed' : 'Document needs review',
    desc: `${fileName}: ${parsed.summary}`,
    time: 'Just now',
    read: false,
  }, ...state.notifications]

  return { ...state, vendors, apBills, journalEntries, notifications }
}

function reducer(state, action) {
  switch(action.type) {
    case 'SET_PAGE': return { ...state, activePage: action.payload }
    case 'APPROVE_BILL': return {
      ...state,
      apBills: state.apBills.map(b => b.id === action.payload.id
        ? { ...b, status: 'approved', payMethod: action.payload.method }
        : b
      )
    }
    case 'PAY_BILL': return {
      ...state,
      apBills: state.apBills.map(b => b.id === action.payload ? { ...b, status: 'paid' } : b)
    }
    case 'APPROVE_PAYROLL': return {
      ...state,
      payrollRuns: state.payrollRuns.map(r => r.id === action.payload ? { ...r, status: 'paid' } : r)
    }
    case 'FILE_TAX': return {
      ...state,
      taxRemittances: state.taxRemittances.map(t => t.id === action.payload ? { ...t, status: 'filed', filedDate: fmt(new Date()) } : t)
    }
    case 'ADD_UPLOAD': return { ...state, uploadQueue: [action.payload, ...state.uploadQueue] }
    case 'UPDATE_UPLOAD': return {
      ...state,
      uploadQueue: state.uploadQueue.map(u => u.id === action.payload.id ? { ...u, ...action.payload } : u)
    }
    case 'MARK_NOTIF_READ': return {
      ...state,
      notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n)
    }
    case 'ADD_VENDOR': return { ...state, vendors: [...state.vendors, action.payload] }
    case 'ADD_BILL': return { ...state, apBills: [action.payload, ...state.apBills] }
    case 'PROCESS_DOCUMENT': return processDocument(state, action.payload)
    default: return state
  }
}

const StoreContext = createContext(null)
export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}
export const useStore = () => useContext(StoreContext)
