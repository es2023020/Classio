'use client'

import React from 'react'
import Image from 'next/image'

interface ClassioLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'light' | 'dark'
  showWordmark?: boolean
  showBadge?: boolean
  className?: string
  badgeText?: string
}

export function ClassioLogo({
  size = 'md',
  variant = 'light',
  showWordmark = true,
  showBadge = true,
  className = '',
  badgeText = 'CRM',
}: ClassioLogoProps) {
  // Dimensions map
  const dimensions = {
    sm: { icon: 32, text: 'text-base', badge: 'text-[9px] px-1 py-0.2' },
    md: { icon: 42, text: 'text-xl', badge: 'text-[10px] px-1.5 py-0.5' },
    lg: { icon: 52, text: 'text-2xl', badge: 'text-xs px-2 py-0.5' },
    xl: { icon: 68, text: 'text-3xl', badge: 'text-xs px-2.5 py-1' },
  }[size]

  const isDark = variant === 'dark'

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Official Classio Squircle Icon */}
      <div
        className="relative flex-shrink-0 rounded-2xl overflow-hidden shadow-md shadow-indigo-950/15 transition-transform hover:scale-105"
        style={{ width: dimensions.icon, height: dimensions.icon }}
      >
        <Image
          src="/classio-icon.png"
          alt="Classio Logo"
          width={dimensions.icon}
          height={dimensions.icon}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-tight ${dimensions.text} ${
              isDark ? 'text-white' : 'text-[#30245C]'
            }`}
          >
            Classio
          </span>
          {showBadge && (
            <span
              className={`rounded-md font-black uppercase tracking-wider ${dimensions.badge} ${
                isDark
                  ? 'bg-white/20 text-white'
                  : 'bg-[#EEE8FF] text-[#7047EB]'
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
