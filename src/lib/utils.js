export const fmtCurrency = (n, currency = 'CAD') =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n ?? 0)

export const fmtDate = (d) => {
  if (!d) return '—'
  const dt = typeof d === 'string' ? new Date(d + 'T12:00:00') : d
  return dt.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const fmtPercent = (n, dec = 1) => `${(n ?? 0).toFixed(dec)}%`

export const getDueDays = (dateStr) => {
  const due = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  return Math.round((due - today) / 86400000)
}

export const getDueLabel = (days) => {
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, cls: 'badge-red' }
  if (days === 0) return { label: 'Due today', cls: 'badge-red' }
  if (days <= 7) return { label: `Due in ${days}d`, cls: 'badge-yellow' }
  return { label: `Due ${days}d`, cls: 'badge-gray' }
}

export const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

export const statusColor = {
  posted: 'badge-green',
  paid: 'badge-green',
  approved: 'badge-navy',
  pending_approval: 'badge-yellow',
  overdue: 'badge-red',
  sent: 'badge-gray',
  filed: 'badge-green',
  ready: 'badge-yellow',
  upcoming: 'badge-gray',
}

export const statusLabel = {
  posted: 'Posted',
  paid: 'Paid',
  approved: 'Approved',
  pending_approval: 'Needs approval',
  overdue: 'Overdue',
  sent: 'Sent',
  filed: 'Filed',
  ready: 'Ready to file',
  upcoming: 'Upcoming',
}
