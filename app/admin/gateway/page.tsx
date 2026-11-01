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
  ChevronDown,
  ChevronUp,
  Terminal,
  ShieldCheck,
  Globe,
  Sparkles,
} from 'lucide-react'
import { adminAuth, MASTER_ADMIN_CONFIG } from '@/lib/admin-auth'

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
  const [showCredentialsHelp, setShowCredentialsHelp] = useState(false)

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

  const handleQuickFillOwner = () => {
    setFortressKey(MASTER_ADMIN_CONFIG.DEFAULT_FORTRESS_KEY)
    setEmail(MASTER_ADMIN_CONFIG.DEFAULT_EMAIL)
    setPassword(MASTER_ADMIN_CONFIG.DEFAULT_PASSWORD)
    setPin(MASTER_ADMIN_CONFIG.DEFAULT_MASTER_PIN)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setLoading(true)

    setTimeout(() => {
      const result = adminAuth.login(email, password, pin, fortressKey)

      if (result.success) {
        setSuccessMsg(lang === 'ar' ? result.messageAr : result.message)
        setTimeout(() => {
          router.push('/admin')
        }, 600)
      } else {
        setErrorMsg(lang === 'ar' ? result.messageAr : result.message)
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-red-500 selection:text-white ${
        lang === 'ar' ? 'font-sans' : 'font-sans'
      }`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Top Security Status Bar */}
      <div className="border-b border-red-500/20 bg-black/60 px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-mono text-[11px] text-red-400 font-bold uppercase tracking-wider">
            FORTRESS SECURE GATEWAY — CLASSIFIED ACCESS LEVEL 0
          </span>
        </div>
        <button
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-800"
        >
          <Globe className="w-3 h-3" />
          <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Fortress Card */}
          <div className="bg-slate-900/90 border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-950/80 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

            {/* Shield Icon & Heading */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/40 mx-auto flex items-center justify-center mb-3 shadow-lg shadow-red-950">
                <ShieldAlert className="w-8 h-8 text-red-400 animate-pulse" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-red-400 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                {lang === 'ar' ? 'بوابة السوبر أدمن المشفرة' : 'Master Fortress Vault'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'ar'
                  ? 'منطقة شديدة الحراسة مخصصة حصرياً لمالك المنصة ومتحكم النظام الأوحد'
                  : 'Zero-trust isolated root portal restricted to the single master operator'}
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-600/50 flex items-center gap-2.5 text-xs text-red-200 animate-shake">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-600/50 flex items-center gap-2.5 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Multi-Factor Authentication Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Barrier 1: Fortress Entry Passkey */}
              <div>
                <label className="block text-[11px] font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'ar' ? '1. رمز الدخول المشفر (Fortress Key)' : '1. Secret Fortress Entry Key'}
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={fortressKey}
                  onChange={(e) => setFortressKey(e.target.value)}
                  placeholder="master-fortress-..."
                  className="w-full text-xs font-mono p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-300 placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Barrier 2: Master Admin Email */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lang === 'ar' ? '2. بريد المالك الرئيسي (Master Email)' : '2. Master Admin Email'}</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@classio.app"
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Barrier 3: Root Password */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lang === 'ar' ? '3. كلمة المرور الجذرية (Root Password)' : '3. Root Password'}</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 pe-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 end-0 pe-2.5 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Barrier 4: 6-Digit Master Security PIN */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-rose-400" />
                    <span>{lang === 'ar' ? '4. رمز الأمان السداسي (Master PIN)' : '4. Master Security PIN (6 digits)'}</span>
                  </span>
                  <span className="text-[10px] text-slate-500">6 أرقام مشفرة</span>
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full text-center tracking-[0.4em] font-mono text-xl py-2 bg-slate-950 border border-slate-800 rounded-xl text-rose-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-red-950/60 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>
                  {loading
                    ? lang === 'ar'
                      ? 'جاري فك التشفير والتحقق من الهوية...'
                      : 'Authenticating Zero-Trust Identity...'
                    : lang === 'ar'
                    ? 'فتح غرفة العمليات والتحكم المركزي'
                    : 'Open Master Command Center'}
                </span>
              </button>
            </form>

            {/* Master Credentials Quick-Fill Assistant (For Platform Owner) */}
            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowCredentialsHelp(!showCredentialsHelp)}
                className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {lang === 'ar'
                      ? 'بيانات دخول المالك الافتراضية (Owner Credentials)'
                      : 'Master Owner Credentials Reference'}
                  </span>
                </span>
                {showCredentialsHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showCredentialsHelp && (
                <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-2">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500">Fortress Key:</span>
                    <span className="text-amber-400 font-bold">{MASTER_ADMIN_CONFIG.DEFAULT_FORTRESS_KEY}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500">Master Email:</span>
                    <span className="text-blue-300">{MASTER_ADMIN_CONFIG.DEFAULT_EMAIL}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500">Password:</span>
                    <span className="text-rose-300">{MASTER_ADMIN_CONFIG.DEFAULT_PASSWORD}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500">Master PIN:</span>
                    <span className="text-emerald-300 font-bold">{MASTER_ADMIN_CONFIG.DEFAULT_MASTER_PIN}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleQuickFillOwner}
                      className="w-full py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-700/40 text-xs font-sans font-bold flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {lang === 'ar' ? 'تعبئة بيانات المالك تلقائياً (1-Click Fill)' : '1-Click Auto-Fill Master Credentials'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Decoy Backlink */}
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {lang === 'ar' ? '← العودة للموقع الرئيسي للجمهور' : '← Return to Public Homepage'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Security Notice */}
      <footer className="border-t border-slate-900 bg-black/40 px-4 py-2.5 text-center text-[10px] text-slate-500 font-mono">
        CLASSIFIED ZERO-TRUST MASTER CONSOLE — ALL ACCESS LOGGED WITH IMMUTABLE FORENSIC TELEMETRY.
      </footer>
    </div>
  )
}
