'use client'

interface ProgressBarProps {
  label?: string
  value: number
  total?: number
  percent?: number
  color?: string
  icon?: any
  showPercent?: boolean
}

export default function ProgressBar({
  label,
  value,
  total,
  percent,
  color = '#10B981',
  icon: Icon,
  showPercent = false,
}: ProgressBarProps) {
  const p = percent ?? (total && total > 0 ? (value / total) * 100 : 0)
  const displayValue = percent !== undefined ? `${percent}%` : value

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="size-3.5 text-white/40" />}
            <span className="text-white/60 text-sm">{label}</span>
          </div>
          <span className="text-white font-medium text-sm">
            {displayValue}
            {showPercent && percent === undefined && '%'}
          </span>
        </div>
      )}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500 rounded-full"
          style={{ width: `${Math.min(p, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}