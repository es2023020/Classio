'use client'

import React, { useState } from 'react'
import { X, Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { useLanguage } from '@/lib/language-context'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  currentUserEmail?: string
  onAuthSuccess: (email: string) => void
  onSignOut: () => void
  notify: (msg: string) => void
}

export function AuthModal({
  isOpen,
  onClose,
  currentUserEmail,
  onAuthSuccess,
  onSignOut,
  notify,
}: AuthModalProps) {
  const { lang, isRTL } = useLanguage()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const isCloudReady = isSupabaseConfigured()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      if (isCloudReady) {
        const client = getSupabase()
        if (client) {
          if (mode === 'signin') {
            const { data, error } = await client.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
            if (error) throw error
            const userEmail = data.user?.email || email.trim().toLowerCase()
            const existingAuth = localStorage.getItem('classio_auth_user')
            if (!existingAuth) {
              localStorage.setItem('classio_auth_user', JSON.stringify({
                email: userEmail,
                name: data.user?.user_metadata?.name || userEmail.split('@')[0],
                plan: data.user?.user_metadata?.plan || 'free',
                planLimit: 10,
              }))
            }
            onAuthSuccess(userEmail)
            notify(lang === 'en' ? 'Signed in successfully via Supabase' : 'تم تسجيل الدخول بنجاح عبر Supabase')
          } else {
            const { data, error } = await client.auth.signUp({ email: email.trim().toLowerCase(), password })
            if (error) throw error
            const userEmail = data.user?.email || email.trim().toLowerCase()
            localStorage.setItem('classio_auth_user', JSON.stringify({
              email: userEmail,
              name: userEmail.split('@')[0],
              plan: 'free',
              planLimit: 10,
            }))
            onAuthSuccess(userEmail)
            notify(lang === 'en' ? 'Account created! Please check your email for confirmation.' : 'تم إنشاء الحساب بنجاح! راجع بريدك للتأكيد.')
          }
          onClose()
          return
        }
      }

      // Offline / Local Storage Fallback
      if (!email.includes('@')) {
        throw new Error(lang === 'en' ? 'Please enter a valid email address.' : 'يرجى كتابة بريد إلكتروني صحيح.')
      }
      if (password.length < 6) {
        throw new Error(lang === 'en' ? 'Password must be at least 6 characters.' : 'كلمة المرور يجب أن لا تقل عن 6 أحرف.')
      }

      onAuthSuccess(email)
      notify(lang === 'en' ? 'Signed in to Classio workspace' : 'تم تسجيل الدخول إلى مساحة العمل')
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || (lang === 'en' ? 'Authentication error occurred.' : 'حدث خطأ أثناء المصادقة.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 md:p-8 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#7047EB] text-white shadow-md">
              <Lock className="size-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {currentUserEmail
                  ? (lang === 'en' ? 'Manage Tutor Account' : 'إدارة حساب المدرس')
                  : mode === 'signin'
                  ? (lang === 'en' ? 'Tutor Sign In' : 'تسجيل دخول المدرس')
                  : (lang === 'en' ? 'Create Tutor Account' : 'إنشاء حساب مدرس جديد')}
              </h2>
              <p className="text-xs text-slate-500">
                {currentUserEmail
                  ? (lang === 'en' ? 'Active session and workspace privileges' : 'بيانات الجلسة الحالية والصلاحيات')
                  : (lang === 'en' ? 'Secure student records and cloud database sync' : 'حماية بيانات طلابك وحساباتك السحابية')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {currentUserEmail ? (
          /* Already Logged In View */
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
              <span className="text-[11px] font-bold text-emerald-800">
                {lang === 'en' ? 'Currently Active Account:' : 'الحساب النشط حالياً:'}
              </span>
              <p className="mt-1 font-mono font-bold text-sm text-slate-800" dir="ltr">{currentUserEmail}</p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <ShieldCheck className="size-4" />
                <span>{lang === 'en' ? 'Your workspace is private and secured' : 'مساحة العمل محمية ومخصصة لك فقط'}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={onSignOut}
                className="w-full rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer"
              >
                {lang === 'en' ? 'Sign Out' : 'تسجيل الخروج من الحساب'}
              </Button>
              <Button
                onClick={onClose}
                className="w-full rounded-xl bg-[#7047EB] text-xs font-bold text-white cursor-pointer"
              >
                {lang === 'en' ? 'Continue Working' : 'متابعة العمل'}
              </Button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
            {errorMsg && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800 font-medium">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                {lang === 'en' ? 'Email Address *' : 'البريد الإلكتروني *'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-slate-800 outline-none focus:border-[#7047EB] focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                {lang === 'en' ? 'Password *' : 'كلمة المرور *'}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-slate-800 outline-none focus:border-[#7047EB] focus:bg-white font-mono"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#7047EB] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#5D35D5] cursor-pointer"
            >
              {loading
                ? (lang === 'en' ? 'Processing...' : 'جاري المعالجة...')
                : mode === 'signin'
                ? (lang === 'en' ? 'Sign In' : 'تسجيل الدخول')
                : (lang === 'en' ? 'Create Account & Start' : 'إنشاء حساب وتفعيل المنصة')}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-xs text-[#7047EB] hover:underline font-bold cursor-pointer"
              >
                {mode === 'signin'
                  ? (lang === 'en' ? "Don't have an account? Sign up" : 'ليس لديك حساب؟ سجل حساب جديد')
                  : (lang === 'en' ? 'Already have an account? Sign in' : 'لديك حساب بالفعل؟ تسجيل الدخول')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
