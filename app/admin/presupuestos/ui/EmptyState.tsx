'use client'

import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="size-16 rounded-2xl bg-white/[.03] border border-white/10 flex items-center justify-center mb-5">
        <Icon className="size-8 text-white/20" />
      </div>
      <h3 className="text-white font-medium text-lg mb-1">{title}</h3>
      {description && <p className="text-white/40 text-sm max-w-sm mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}