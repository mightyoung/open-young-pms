import React from 'react'
import * as Icons from 'lucide-react'

export const Icon = ({ name, size = 20, className = '' }) => {
  const IconComponent = Icons[name]
  if (!IconComponent) return null
  return <IconComponent size={size} className={className} />
}

export const LogoIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#logoGrad)" />
    <path
      d="M10 16L14 20L22 12"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
