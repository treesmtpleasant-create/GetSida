import { useState } from 'react'
import { CheckCircle2, Users, DollarSign, Clock, Plus } from 'lucide-react'
import { useStore } from '../lib/store'
import { fmtCurrency, fmtDate, initials } from '../lib/utils'
import SidaInsight from '../components/SidaInsight'
import clsx from 'clsx'

const SCHEDULE = {
  Mon: { e1: '7am–3pm', e2: '9am–5pm', e3: null, e4: '11am–7pm' },
  Tue: { e1: '7am–3pm', e2: '9am–5pm', e3: '10am–4pm', e4: null },
  Wed: { e1: null, e2: '9am–5pm', e3: '10am–6pm', e4: '11am–7pm' },
  Thu: { e1: '7am–3pm', e2: '9am–5pm', e3: '10am–4pm', e4: '11am–7pm' },
  Fri: { e1: '7am–3pm', e2: '9am–5pm', e3: '12pm–8pm', e4: '11am–7pm' },
  Sat: { e1: '8am–4pm', e2: null, e3: '10am–6pm', e4: '9am–5pm' },
  Sun: { e1: '8am–4pm', e2: null, e3: '10am–4pm', e4: null },
}

export default function Payroll() {
  const { state, dispatch } = useStore()
  const [activeTab, setActiveTab] = useState('payroll')
  const [approved, setApproved] = useState({})

  const run = state.payrollRuns[0]
  const totals = run.lines.reduce((acc, l) => ({
    gross: acc.gross + l.gross,
    cpp: acc.cpp + l.cpp,
    ei: acc.ei + l.ei,
    tax: acc.tax + l.tax,
    net: acc.net + l.net,
  }), { gross: 0, cpp: 0, ei: 0, tax: 0, net: 0 })

  const labourPct = (totals.gross / 42180 * 100).toFixed(1)

  function approveRun() {
    dispatch({ type: 'APPROVE_PAYROLL', payload: run.id })
  }

  return (
    <div className="p-6 space-y-5 animate-slide-in">
      <SidaInsight message={`Payroll for ${run.period} is ready. I calculated all CPP, EI, and income tax deductions from current CRA tables. Total gross is ${fmtCurrency(totals.gross)} — labour is running at ${labourPct}% of revenue, slightly above your 30% target. Review the schedule to optimize shifts.`} />

      {/* Tabs */}
      <div className="flex gap-1 bg-sida-cream rounded-xl p-1 w-fit">
        {[['payroll','Payroll Run'],['schedule','Staff Schedule'],['employees','Employees']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-colors', activeTab === id ? 'bg-white text-sida-navy shadow-sm' : 'text-sida-navy/50 hover:text-sida-navy')}>
            {label}
          </button>
        ))}
      </div>

      {/* PAYROLL RUN */}
      {activeTab === 'payroll' && (
        <>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Gross payroll', value: fmtCurrency(totals.gross) },
              { label: 'CPP + EI + Tax', value: fmtCurrency(totals.cpp + totals.ei + totals.tax) },
              { label: 'Net to deposit', value: fmtCurrency(totals.net) },
              { label: 'Labour % revenue', value: `${labourPct}%`, warn: parseFloat(labourPct) > 30 },
            ].map(c => (
              <div key={c.label} className="stat-card">
                <div className="label">{c.label}</div>
                <div className={clsx('text-xl font-semibold mt-1', c.warn ? 'text-sida-red' : 'text-sida-navy')}>{c.value}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.06]">
              <div>
                <div className="text-sm font-medium text-sida-navy">Payroll Run — {run.period}</div>
                <div className="text-xs text-sida-navy/50">CRA payroll tables applied · EFT direct deposit ready</div>
              </div>
              <div className="flex gap-2">
                <span className={clsx('badge', run.status === 'paid' ? 'badge-green' : 'badge-yellow')}>
                  {run.status === 'paid' ? 'Paid ✓' : 'Pending approval'}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/[0.06]">
                    {['Employee','Hours','Gross Pay','CPP','EI','Income Tax','Net Pay','Payslip'].map(h => (
                      <th key={h} className="px-4 py-3 text-left table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {run.lines.map(line => {
                    const emp = state.employees.find(e => e.id === line.empId)
                    return (
                      <tr key={line.empId} className="border-b border-black/[0.04] hover:bg-sida-cream/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0" style={{ background: emp?.color }}>
                              {initials(line.name)}
                            </div>
                            <div>
                              <div className="font-medium text-sida-navy">{line.name}</div>
                              <div className="text-xs text-sida-navy/50">{emp?.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sida-navy/70">{line.hours} hrs</td>
                        <td className="px-4 py-3 font-medium">{fmtCurrency(line.gross)}</td>
                        <td className="px-4 py-3 text-sida-navy/60">{fmtCurrency(line.cpp)}</td>
                        <td className="px-4 py-3 text-sida-navy/60">{fmtCurrency(line.ei)}</td>
                        <td className="px-4 py-3 text-sida-navy/60">{fmtCurrency(line.tax)}</td>
                        <td className="px-4 py-3 font-semibold text-sida-green">{fmtCurrency(line.net)}</td>
                        <td className="px-4 py-3">
                          <button className="text-xs text-sida-green hover:underline">View PDF</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-sida-cream border-t border-black/10 font-semibold text-sm">
                  <tr>
                    <td className="px-4 py-3" colSpan={2}>Totals</td>
                    <td className="px-4 py-3">{fmtCurrency(totals.gross)}</td>
                    <td className="px-4 py-3">{fmtCurrency(totals.cpp)}</td>
                    <td className="px-4 py-3">{fmtCurrency(totals.ei)}</td>
                    <td className="px-4 py-3">{fmtCurrency(totals.tax)}</td>
                    <td className="px-4 py-3 text-sida-green">{fmtCurrency(totals.net)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Journal entry preview */}
            <div className="px-5 py-4 border-t border-black/[0.06]">
              <div className="text-xs uppercase tracking-wider text-sida-navy/40 font-medium mb-3">Journal entry Sida will post on approval</div>
              <div className="bg-sida-cream rounded-xl p-4 font-mono text-xs space-y-1.5">
                <div className="flex justify-between"><span className="text-sida-navy/60">Dr Wages Expense</span><span className="text-sida-green">{fmtCurrency(totals.gross)}</span></div>
                <div className="flex justify-between pl-6"><span className="text-sida-navy/60">Cr CPP Payable</span><span className="text-sida-red">{fmtCurrency(totals.cpp)}</span></div>
                <div className="flex justify-between pl-6"><span className="text-sida-navy/60">Cr EI Payable</span><span className="text-sida-red">{fmtCurrency(totals.ei)}</span></div>
                <div className="flex justify-between pl-6"><span className="text-sida-navy/60">Cr Income Tax Payable</span><span className="text-sida-red">{fmtCurrency(totals.tax)}</span></div>
                <div className="flex justify-between pl-6"><span className="text-sida-navy/60">Cr Bank (EFT)</span><span className="text-sida-red">{fmtCurrency(totals.net)}</span></div>
              </div>
            </div>

            {run.status !== 'paid' && (
              <div className="flex gap-3 px-5 py-4 border-t border-black/[0.06]">
                <button className="btn-secondary flex-1">Edit hours</button>
                <button onClick={approveRun} className="btn-primary flex-1">
                  Approve & Run Payroll (EFT Direct Deposit)
                </button>
              </div>
            )}
            {run.status === 'paid' && (
              <div className="flex items-center gap-2 px-5 py-4 border-t border-black/[0.06] text-sida-green">
                <CheckCircle2 size={16} /> <span className="text-sm font-medium">Payroll processed — direct deposits sent, journal entry posted, CRA remittance scheduled</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="card">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.06]">
            <div className="text-sm font-medium text-sida-navy">Week of Apr 14–20, 2026</div>
            <div className="flex gap-2">
              <div className="text-xs bg-sida-green-light text-sida-green px-3 py-1.5 rounded-lg font-medium">Labour cost: 32.1% revenue</div>
              <button className="btn-primary text-xs">Publish schedule</button>
            </div>
          </div>
          <div className="overflow-x-auto p-2">
            <table className="w-full text-xs min-w-[700px]">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left table-header w-36">Employee</th>
                  {Object.keys(SCHEDULE).map(day => (
                    <th key={day} className="px-2 py-2 text-center table-header">{day}</th>
                  ))}
                  <th className="px-3 py-2 text-right table-header">Hrs</th>
                </tr>
              </thead>
              <tbody>
                {state.employees.map(emp => {
                  const hrs = Object.values(SCHEDULE).filter(d => d[emp.id]).length * 8
                  return (
                    <tr key={emp.id} className="border-t border-black/[0.04]">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full text-white text-[10px] font-medium flex items-center justify-center flex-shrink-0" style={{ background: emp.color }}>
                            {initials(emp.name)}
                          </div>
                          <div>
                            <div className="font-medium text-sida-navy">{emp.name.split(' ')[0]}</div>
                            <div className="text-sida-navy/40">${emp.rate}/hr</div>
                          </div>
                        </div>
                      </td>
                      {Object.entries(SCHEDULE).map(([day, shifts]) => (
                        <td key={day} className="px-1 py-2 text-center">
                          {shifts[emp.id] ? (
                            <div className="text-[10px] px-1.5 py-1 rounded-lg font-medium text-white" style={{ background: emp.color }}>
                              {shifts[emp.id]}
                            </div>
                          ) : (
                            <div className="text-sida-navy/20 text-base">—</div>
                          )}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right font-medium text-sida-navy">{hrs}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EMPLOYEES */}
      {activeTab === 'employees' && (
        <div className="card">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.06]">
            <div className="text-sm font-medium text-sida-navy">Employees ({state.employees.length})</div>
            <button className="btn-primary text-xs flex items-center gap-1.5"><Plus size={12} /> Add employee</button>
          </div>
          <div className="divide-y divide-black/[0.04]">
            {state.employees.map(emp => (
              <div key={emp.id} className="flex items-center gap-4 px-5 py-4 hover:bg-sida-cream/50 transition-colors">
                <div className="w-10 h-10 rounded-full text-white font-medium flex items-center justify-center text-sm flex-shrink-0" style={{ background: emp.color }}>
                  {initials(emp.name)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sida-navy">{emp.name}</div>
                  <div className="text-xs text-sida-navy/50">{emp.role} · ${emp.rate}/hr · {emp.type}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-sida-navy">SIN {emp.sin}</div>
                  <div className="text-xs text-sida-navy/40">T4 generated at year-end</div>
                </div>
                <button className="btn-ghost text-xs">Edit</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
