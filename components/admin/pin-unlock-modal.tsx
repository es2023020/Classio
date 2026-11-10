'use client'

import React, { useState } from 'react'
import { Lock, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react'
import { adminAuth } from '@/lib/admin-auth'

interface PinUnlockModalProps {
  isOpen: boolean
  onUnlocked: () => void
  lang: 'ar' | 'en'
}

export function PinUnlockModal({ isOpen, onUnlocked, lang }: PinUnlockModalProps) {
  const [pin, setPin] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      const ok = await adminAuth.unlockWithPin(pin)
      if (ok) {
        setPin('')
        onUnlocked()
      } else {
        setErrorMsg(
          lang === 'ar'
            ? 'رمز الأمان (PIN) غير صحيح! حاول مجدداً.'
            : 'Incorrect Security PIN. Try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-red-500/30 rounded-2xl p-6 shadow-2xl shadow-red-950/80 text-white relative">
        <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-500/40 mx-auto flex items-center justify-center mb-4">
          <Lock className="w-7 h-7 text-red-400" />
        </div>

        <h3 className="text-center font-black text-lg text-slate-100">
          {lang === 'ar' ? 'جلسة السوبر أدمن مقفلة' : 'Super-Admin Console Locked'}
        </h3>
        <p className="text-center text-xs text-slate-400 mt-1 mb-6">
          {lang === 'ar'
            ? 'أدخل رمز الأمان السداسي (Master PIN) لاستئناف التحكم'
            : 'Enter 6-digit Master Security PIN to resume control'}
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-600/50 rounded-xl flex items-center gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 text-center">
              {lang === 'ar' ? 'رمز الأمان (Master PIN)' : 'Master Security PIN'}
            </label>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              autoFocus
              className="w-full text-center tracking-[0.5em] text-2xl font-mono py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={pin.length < 6 || loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-900/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>
              {loading
                ? lang === 'ar'
                  ? 'جاري التحقق...'
                  : 'Verifying...'
                : lang === 'ar'
                ? 'إلغاء القفل واستئناف'
                : 'Unlock Command Console'}
            </span>
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800 text-center">
          <button
            onClick={() => adminAuth.panicLockout()}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors"
          >
            {lang === 'ar' ? 'إنهاء الجلسة والخروج الآمن' : 'Terminate Session & Return Home'}
          </button>
        </div>
      </div>
    </div>
  )
}
