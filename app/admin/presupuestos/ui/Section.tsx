'use client'

import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

interface StatCardProps {
  icon: any
  label: string
  value: string | number
  color?: 'emerald' | 'blue' | 'amber' | 'red' | 'purple' | 'gray'
  trend?: number
  trendLabel?: string
  onClick?: () => void
}

const COLORS = {
  emerald: { text: 'text-[#10B981]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/20' },
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  gray: { text: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  color = 'emerald',
  trend,
  trendLabel,
  onClick,
}: StatCardProps) {
  const c = COLORS[color]
  const TrendIcon = trend === undefined ? Minus : trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus
  const trendColor =
    trend === undefined ? 'text-white/30' : trend > 0 ? 'text-[#10B981]' : trend < 0 ? 'text-red-400' : 'text-white/30'

  return (
    <div
      onClick={onClick}
      className={`border border-white/10 bg-white/[.02] rounded-2xl p-5 transition-all hover:border-white/20 ${
        onClick ? 'cursor-pointer hover:bg-white/[.04]' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={`size-10 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon className={`size-5 ${c.text}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
            <TrendIcon className="size-3.5" />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-[10px] uppercase tracking-[.16em] text-white/40 mt-4">{label}</p>
      <strong className={`block mt-1 font-serif text-3xl ${c.text}`}>{value}</strong>
      {trendLabel && <p className="text-white/30 text-xs mt-1">{trendLabel}</p>}
    </div>
  )
}