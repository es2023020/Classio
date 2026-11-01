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
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-red-500/20 text-white px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 p-0.5 shadow-lg shadow-red-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm lg:text-base tracking-wide uppercase bg-gradient-to-r from-red-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">
                {lang === 'ar' ? 'غرفة العمليات المركزية — السوبر أدمن' : 'Classio Root Command Center'}
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-700/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {lang === 'ar' ? 'محمي بالكامل' : 'ENCRYPTED ROOT'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {lang === 'ar' ? 'التحكم الإداري الحصري والمطلق في المنصة والمدرسين' : 'Single Authorized Master Operator Console'}
            </p>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Cairo Live Time */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono">{cairoTime}</span>
            <span className="text-[10px] text-slate-500">القاهرة</span>
          </div>

          {/* Maintenance Mode Alert if Active */}
          {settings.maintenance_mode && (
            <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-600/50 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-medium hidden sm:inline">
                {lang === 'ar' ? 'وضع الصيانة نشط' : 'Maintenance Active'}
              </span>
            </div>
          )}

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {/* Quick Screen Lock */}
          <button
            onClick={onLockSession}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 transition-colors"
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
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40 transition-colors"
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
