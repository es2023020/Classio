'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldAlert,
  KeyRound,
  Lock,
  Mail,
  Fingerprint,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
  Terminal,
  Globe,
  Sparkles,
} from 'lucide-react'
import { adminAuth } from '@/lib/admin-auth'

export default function AdminGatewayPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')

  // Multi-barrier fields
  const [fortressKey, setFortressKey] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [remainingAttempts, setRemainingAttempts] = useState(5)

  // Check existing session or lockout on load
  useEffect(() => {
    const session = adminAuth.getSession()
    if (session && !session.is_locked) {
      router.push('/admin')
      return
    }

    const lockout = adminAuth.getLockoutStatus()
    if (lockout.isLocked) {
      setErrorMsg(
        lang === 'ar'
          ? `النظام مجمد بسبب محاولات دخول خاطئة. يرجى الانتظار ${lockout.remainingMinutes} دقيقة.`
          : `System is locked out due to failed attempts. Please wait ${lockout.remainingMinutes} minutes.`
      )
    }
  }, [router, lang])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setLoading(true)

    try {
      const result = await adminAuth.login(email, password, pin, fortressKey)

      if (result.success) {
        setSuccessMsg(lang === 'ar' ? result.messageAr : result.message)
        setTimeout(() => {
          router.push('/admin')
        }, 600)
      } else {
        setErrorMsg(lang === 'ar' ? result.messageAr : result.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-red-500 selection:text-white`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Top Security Status Bar */}
      <div className="border-b border-red-500/20 bg-black/60 px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-mono text-[11px] text-red-400 font-bold uppercase tracking-wider">
            ADMIN SECURE GATEWAY — RESTRICTED ACCESS
          </span>
        </div>
        <button
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          aria-label="Toggle language"
          className="flex items-center gap-1 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-800"
        >
          <Globe className="w-3 h-3" />
          <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Auth Card */}
          <div className="bg-slate-900/90 border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-950/80 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

            {/* Shield Icon & Heading */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/40 mx-auto flex items-center justify-center mb-3 shadow-lg shadow-red-950">
                <ShieldAlert className="w-8 h-8 text-red-400" aria-hidden="true" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-red-400 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                {lang === 'ar' ? 'بوابة الإدارة المشفرة' : 'Admin Control Center'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'ar'
                  ? 'منطقة محمية مخصصة حصراً لمالك المنصة'
                  : 'Restricted zone — platform owner access only'}
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div role="alert" className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-600/50 flex items-center gap-2.5 text-xs text-red-200">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div role="status" className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-600/50 flex items-center gap-2.5 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Multi-Factor Authentication Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Barrier 1: Fortress Entry Passkey */}
              <div>
                <label htmlFor="fortress-key" className="block text-[11px] font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>
                    {lang === 'ar' ? '1. رمز الدخول المشفر' : '1. Secret Entry Key'}
                  </span>
                </label>
                <input
                  id="fortress-key"
                  type="password"
                  required
                  value={fortressKey}
                  onChange={(e) => setFortressKey(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="off"
                  className="w-full text-xs font-mono p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-300 placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Barrier 2: Master Admin Email */}
              <div>
                <label htmlFor="admin-email" className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <span>{lang === 'ar' ? '2. بريد المالك الرئيسي' : '2. Admin Email'}</span>
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={lang === 'ar' ? 'admin@classio.app' : 'admin@classio.app'}
                  autoComplete="username"
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Barrier 3: Root Password */}
              <div>
                <label htmlFor="admin-password" className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <span>{lang === 'ar' ? '3. كلمة المرور' : '3. Password'}</span>
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 pe-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 end-0 pe-2.5 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {/* Barrier 4: 6-Digit Master Security PIN */}
              <div>
                <label htmlFor="admin-pin" className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
                    <span>{lang === 'ar' ? '4. رمز الأمان السداسي (PIN)' : '4. Security PIN (6 digits)'}</span>
                  </span>
                  <span className="text-[10px] text-slate-500">6 أرقام</span>
                </label>
                <input
                  id="admin-pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  autoComplete="off"
                  className="w-full text-center tracking-[0.4em] font-mono text-xl py-2 bg-slate-950 border border-slate-800 rounded-xl text-rose-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-red-950/60 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <KeyRound className="w-4 h-4" aria-hidden="true" />
                <span>
                  {loading
                    ? lang === 'ar'
                      ? 'جاري التحقق من الهوية...'
                      : 'Authenticating...'
                    : lang === 'ar'
                    ? 'فتح لوحة التحكم'
                    : 'Open Admin Dashboard'}
                </span>
              </button>
            </form>
          </div>

          {/* Back link */}
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {lang === 'ar' ? '← العودة للموقع الرئيسي' : '← Return to Homepage'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Security Notice */}
      <footer className="border-t border-slate-900 bg-black/40 px-4 py-2.5 text-center text-[10px] text-slate-500 font-mono">
        CLASSIO ADMIN — RESTRICTED ACCESS — ALL ATTEMPTS LOGGED
      </footer>
    </div>
  )
}
