import clsx from 'clsx'

export default function SidaInsight({ message, tone = 'default', className }) {
  const tones = {
    default: 'bg-sida-green-light border-sida-green/20 text-sida-green',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    alert: 'bg-sida-red-light border-sida-red/20 text-sida-red',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  }
  return (
    <div className={clsx('border rounded-xl p-4 flex gap-3 items-start', tones[tone], className)}>
      <div className="w-8 h-8 rounded-full bg-sida-green flex items-center justify-center text-white text-xs font-bold flex-shrink-0">S</div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider opacity-60 mb-1">Sida · AI Bookkeeper</div>
        <div className="text-sm leading-relaxed">{message}</div>
      </div>
    </div>
  )
}
