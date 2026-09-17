# Sida · AI Bookkeeper Platform

**Systems Integrated Data Accounting** — the AI bookkeeper for small business owners.

## What Sida does

Sida is a full-stack bookkeeping platform that operates like a human CPA-level bookkeeper:

- **Document AI** — upload any photo, PDF, or CSV; Sida reads it and posts the correct journal entry
- **Accounts Payable** — bills auto-created from invoices; owner approves payment by EFT, cheque, or credit card
- **Accounts Receivable** — customer invoices, AR aging, automated reminders
- **Perpetual Inventory** — every delivery and POS sale updates stock automatically; COGS posted per recipe
- **Payroll** — calculates CPP/EI/income tax, posts journal entry, runs EFT direct deposit
- **Capital Assets** — auto-detects from invoices, assigns CCA class, schedules depreciation
- **Bank Reconciliation** — Plaid-connected, auto-matches transactions, flags exceptions
- **Tax Remittances** — GST/HST, PST, payroll source deductions — calculated and filed in one tap
- **Financial Reports** — P&L, Balance Sheet, Cash Flow, AR/AP Aging — GAAP/ASPE compliant
- **General Ledger** — immutable double-entry, full audit trail, CPA portal access

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| State | React useReducer (global store) |
| Routing | React Router v6 |
| Fonts | DM Sans + DM Mono |

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open http://localhost:5173
```

## Build for production

```bash
npm run build
# Output in /dist — deploy to Vercel, Netlify, or any static host
```

## Deploy to Vercel (recommended)

```bash
npm install -g vercel
vercel
```

### Environment variables

Document AI (`/api/parse-document`) calls the Claude API server-side. Set this in your Vercel project (Settings → Environment Variables):

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key. Get one at [console.anthropic.com](https://console.anthropic.com). Never exposed to the browser — read only inside `api/parse-document.js`. |

Uploaded documents (image, PDF, or CSV, up to 4MB) are sent to Claude, which extracts vendor, line items, amounts, tax, and a suggested account, then the result is posted into AP bills, journal entries, and notifications automatically. Items under 90% confidence are flagged for manual review instead of auto-posted.

Note: `npm run dev` (Vite) does not serve `/api` routes — use `vercel dev` locally, or test against a deployed preview, to exercise document parsing end to end.

## Project structure

```
├── src/
│   ├── App.jsx              # Root app shell + page router
│   ├── main.jsx             # React entry point
│   ├── lib/
│   │   ├── store.jsx        # Global state (useReducer) + initial data
│   │   └── utils.js         # Currency, date, formatting helpers
│   ├── components/
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   ├── Topbar.jsx       # Top header bar
│   │   ├── SidaInsight.jsx  # AI insight card component
│   │   └── PaymentModal.jsx # AP payment approval modal (EFT/Cheque/Card)
│   ├── pages/
│   │   ├── Dashboard.jsx    # Main overview + KPIs + approvals
│   │   ├── Upload.jsx       # Document upload + AI processing
│   │   ├── AP.jsx           # Bills & payments (full AP workflow)
│   │   ├── AR.jsx           # Customer invoices + AR aging
│   │   ├── Banking.jsx      # Bank reconciliation + Plaid feeds
│   │   ├── Reports.jsx      # All financial reports
│   │   ├── Inventory.jsx    # Perpetual inventory ledger
│   │   ├── Payroll.jsx      # Payroll run + staff scheduling
│   │   ├── Tax.jsx          # GST/payroll remittances + calendar
│   │   ├── Ledger.jsx       # General ledger + trial balance
│   │   ├── Assets.jsx       # Capital assets + amortization schedules
│   │   ├── Vendors.jsx      # Vendor directory + terms
│   │   └── Misc.jsx         # Expenses, COA, Notifications, Settings
│   └── styles/
│       └── globals.css      # Tailwind + Sida design tokens
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Color system

| Token | Hex | Usage |
|-------|-----|-------|
| `--sida-green` | `#2A9D6E` | Primary action, success, AI brand |
| `--sida-navy` | `#1B2B4B` | Primary text, sidebar |
| `--sida-cream` | `#F7F7F5` | Page background, surfaces |
| `--sida-yellow` | `#FCD34D` | Warnings, pending states |
| `--sida-red` | `#ff3962` | Errors, overdue, danger |

## Next steps for production

1. **Backend API** — Node.js/TypeScript REST + GraphQL
2. **Document AI** — ✅ live via Claude API (`api/parse-document.js`); consider Google Document AI or AWS Textract for higher-volume OCR pre-processing
3. **Database** — PostgreSQL with event-sourced double-entry ledger (currently in-memory client state, reset on refresh)
4. **Banking** — Plaid API integration (read-only bank feeds)
5. **POS** — Square, Clover, Toast, Lightspeed webhooks
6. **Auth** — Auth0 or Clerk (owner / accountant / employee roles)
7. **Payments** — EFT via Stripe Treasury or direct ACH/EFT rails
8. **Tax filing** — CRA My Business Account API, HMRC MTD API
9. **PDF generation** — React-PDF for cheques, payslips, tax returns
10. **SOC 2 Type II** — required before commercial launch

## License

Proprietary — Sida AI · getsida.ai
