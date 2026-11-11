'use client'

import React, { useState, useEffect } from 'react'
import {
  ShieldAlert,
  Lock,
  LogOut,
  Globe,
  Radio,
  Clock,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import { adminAuth } from '@/lib/admin-auth'
import { adminStorage } from '@/lib/admin-storage'
import { PlatformSystemSettings } from '@/lib/admin-types'

interface AdminHeaderProps {
  lang: 'ar' | 'en'
  toggleLang: () => void
  onLockSession: () => void
  settings: PlatformSystemSettings
}

export function AdminHeader({ lang, toggleLang, onLockSession, settings }: AdminHeaderProps) {
  const [cairoTime, setCairoTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCairoTime(
        now.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
          timeZone: 'Africa/Cairo',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [lang])

  return (
    <header className="sticky top-0 z-50 bg-[#30245C] border-b border-[#483387] text-white px-4 lg:px-8 py-3.5 transition-colors shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7047EB] p-0.5 shadow-md shadow-indigo-950/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#30245C] rounded-[14px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-[#EEE8FF]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm lg:text-base tracking-tight text-white">
                {lang === 'ar' ? 'غرفة العمليات المركزية — السوبر أدمن' : 'Classio Root Command Center'}
              </h1>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EEE8FF] text-[#7047EB]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A] animate-ping" />
                {lang === 'ar' ? 'محمي بالكامل' : 'ENCRYPTED ROOT'}
              </span>
            </div>
            <p className="text-[11px] text-[#A5A2B2] hidden sm:block">
              {lang === 'ar' ? 'التحكم الإداري الحصري والمطلق في المنصة والمدرسين' : 'Single Authorized Master Operator Console'}
            </p>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cairo Live Time */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#EEE8FF] bg-[#1e143f] px-3 py-1.5 rounded-xl border border-[#483387]">
            <Clock className="w-3.5 h-3.5 text-[#7047EB]" />
            <span className="font-mono">{cairoTime}</span>
            <span className="text-[10px] text-[#A5A2B2]">{lang === 'ar' ? 'القاهرة' : 'Cairo'}</span>
          </div>

          {/* Maintenance Mode Alert if Active */}
          {settings.maintenance_mode && (
            <div className="flex items-center gap-1.5 text-xs text-[#EAA12C] bg-[#FFF4DE] px-2.5 py-1 rounded-xl border border-[#EAA12C]/40 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-[#EAA12C]" />
              <span className="text-[11px] font-medium hidden sm:inline">
                {lang === 'ar' ? 'وضع الصيانة نشط' : 'Maintenance Active'}
              </span>
            </div>
          )}

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-[#483387] hover:bg-[#5D35D5] border border-white/10 text-white transition-colors cursor-pointer"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#EEE8FF]" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {/* Quick Screen Lock */}
          <button
            onClick={onLockSession}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-[#483387] hover:bg-[#5D35D5] border border-white/10 text-[#EEE8FF] transition-colors cursor-pointer"
            title={lang === 'ar' ? 'قفل الشاشة السريع' : 'Lock Screen (PIN)'}
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'قفل' : 'Lock'}</span>
          </button>

          {/* Panic Killswitch / Obliterate Session */}
          <button
            onClick={() => {
              if (window.confirm(lang === 'ar' ? 'هل تريد الخروج الفوري وإغلاق الجلسة المشفرة؟' : 'Panic exit and terminate super-admin session?')) {
                adminAuth.panicLockout()
              }
            }}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#E05252] hover:bg-[#c93f3f] text-white transition-colors cursor-pointer"
            title="Terminate Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'خروج آمن' : 'Exit'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
