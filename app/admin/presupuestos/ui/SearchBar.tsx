'use client'

import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  children?: React.ReactNode
}

export default function SearchBar({ value, onChange, placeholder = 'Buscar...', children }: SearchBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/[.02] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white text-sm outline-none focus:border-[#10B981] transition-colors"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      {children}
    </div>
  )
}