'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Phone,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Globe,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { storage } from '@/lib/storage'
import { TutorProfile } from '@/lib/types'
import { ClassioLogo } from '@/components/ui/classio-logo'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan')
  const billingParam = searchParams.get('billing') || 'monthly'
  const modeParam = searchParams.get('mode')

  const { lang, toggleLang, isRTL } = useLanguage()

  const [mode, setMode] = useState<'signin' | 'signup'>(modeParam === 'signup' ? 'signup' : 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Quick Demo Tutors for instant evaluation
  const demoTutors = [
    {
      name: 'أحمد محمود',
      title: 'مدرس أول فيزياء',
      subject: 'فيزياء ثانوية عامة',
      email: 'ahmed.mahmoud@example.com',
      avatar: 'أم',
      phone: '01012345678',
    },
    {
      name: 'سارة نبيل',
      title: 'مدرسة كيمياء ولغات',
      subject: 'كيمياء ثانوية عامة ولغات',
      email: 'sara.nabil@example.com',
      avatar: 'سن',
      phone: '01123456789',
    },
    {
      name: 'عمر خالد',
      title: 'مدرس أول رياضيات',
      subject: 'الرياضيات البحتة والتطبيقية',
      email: 'omar.khaled@example.com',
      avatar: 'عخ',
      phone: '01234567890',
    },
  ]

  const handleQuickLogin = async (tutor: typeof demoTutors[0]) => {
    setLoading(true)
    setErrorMsg('')
    try {
      const currentProfile = await storage.getProfile()
      const updatedProfile: TutorProfile = {
        ...currentProfile,
        name: tutor.name,
        title: tutor.title,
        subject: tutor.subject,
        email: tutor.email,
        phone: tutor.phone,
        avatar_initials: tutor.avatar,
      }
      await storage.saveProfile(updatedProfile)
      localStorage.setItem('classio_auth_user', JSON.stringify({ email: tutor.email, name: tutor.name }))
      setSuccessMsg(lang === 'en' ? `Welcome, ${tutor.name}!` : `أهلاً بك، أستاذ ${tutor.name}!`)
      
      setTimeout(() => {
        if (planParam && planParam !== 'free') {
          router.push(`/checkout?plan=${planParam}&billing=${billingParam}`)
        } else {
          router.push('/dashboard')
        }
      }, 700)
    } catch {
      setErrorMsg(lang === 'en' ? 'Failed to sign in. Please try again.' : 'تعذر تسجيل الدخول، يرجى المحاولة ثانية.')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    if (!email || !email.includes('@')) {
      setErrorMsg(lang === 'en' ? 'Please provide a valid email address.' : 'يرجى إدخال بريد إلكتروني صحيح.')
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setErrorMsg(lang === 'en' ? 'Password must be at least 6 characters.' : 'كلمة المرور يجب أن لا تقل عن 6 أحرف.')
      setLoading(false)
      return
    }

    try {
      const currentProfile = await storage.getProfile()
      const initials = (name || email.split('@')[0])
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

      const updatedProfile: TutorProfile = {
        ...currentProfile,
        name: name || currentProfile.name || email.split('@')[0],
        subject: subject || currentProfile.subject,
        phone: phone || currentProfile.phone,
        email: email,
        avatar_initials: initials || 'CL',
      }
      await storage.saveProfile(updatedProfile)
      localStorage.setItem('classio_auth_user', JSON.stringify({ email, name: updatedProfile.name }))

      setSuccessMsg(
        lang === 'en'
          ? mode === 'signin'
            ? 'Signed in successfully! Redirecting...'
            : 'Account created successfully! Redirecting...'
          : mode === 'signin'
          ? 'تم تسجيل الدخول بنجاح! جاري الانتقال...'
          : 'تم إنشاء حسابك بنجاح! جاري الانتقال...'
      )

      setTimeout(() => {
        if (planParam && planParam !== 'free') {
          router.push(`/checkout?plan=${planParam}&billing=${billingParam}`)
        } else {
          router.push('/dashboard')
        }
      }, 700)
    } catch (err: any) {
      setErrorMsg(err?.message || (lang === 'en' ? 'An error occurred during authentication.' : 'حدث خطأ أثناء تسجيل الدخول.'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="inline-block group">
          <ClassioLogo size="md" />
        </Link>

        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition shadow-2xs"
        >
          <Globe className="w-3.5 h-3.5 text-[#0f2c59]" />
          <span>{lang === 'en' ? 'عربي' : 'English'}</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8">
          {/* Card Title */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <ClassioLogo size="lg" showWordmark={false} />
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              {mode === 'signin'
                ? lang === 'en'
                  ? 'Sign in to Classio'
                  : 'تسجيل الدخول إلى كلاسيو'
                : lang === 'en'
                ? 'Create Your Tutor Account'
                : 'إنشاء حساب مدرس جديد'}
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">
              {mode === 'signin'
                ? lang === 'en'
                  ? 'Manage your students, sessions, and academic success records'
                  : 'أدر طلابك ومجموعاتك وتابع تحصيلك الدراسي بكل احترافية'
                : lang === 'en'
                ? 'Start your 3-day free trial or access the free plan anytime'
                : 'ابدأ تجربتك المجانية أو استخدم الباقة المجانية الدائمة'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setErrorMsg('')
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                mode === 'signin' ? 'bg-white text-[#0f2c59] shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {lang === 'en' ? 'Sign In' : 'تسجيل الدخول'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setErrorMsg('')
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                mode === 'signup' ? 'bg-white text-[#0f2c59] shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {lang === 'en' ? 'New Account' : 'حساب جديد'}
            </button>
          </div>

          {/* Error & Success Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {lang === 'en' ? 'Full Name' : 'الاسم بالكامل'}
                  </label>
                  <div className="relative">
                    <User className="absolute top-3 start-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 ps-10 pe-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#0f2c59] focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'en' ? 'Subject' : 'المادة الدراسية'}
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute top-3 start-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 ps-10 pe-3 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#0f2c59] focus:outline-none transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'en' ? 'Phone' : 'رقم الهاتف'}
                    </label>
                    <div className="relative">
                      <Phone className="absolute top-3 start-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        dir="ltr"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 ps-10 pe-3 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#0f2c59] focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {lang === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
              </label>
              <div className="relative">
                <Mail className="absolute top-3 start-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 ps-10 pe-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#0f2c59] focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {lang === 'en' ? 'Password' : 'كلمة المرور'}
              </label>
              <div className="relative">
                <Lock className="absolute top-3 start-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 ps-10 pe-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#0f2c59] focus:outline-none transition"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-2xl bg-[#0f2c59] hover:bg-[#1a3d6d] text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              {loading
                ? lang === 'en'
                  ? 'Verifying...'
                  : 'جاري التحقق...'
                : mode === 'signin'
                ? lang === 'en'
                  ? 'Sign In to Workspace'
                  : 'دخول مساحة العمل'
                : lang === 'en'
                ? 'Create Account & Enter Dashboard'
                : 'إنشاء الحساب وبدء العمل'}
            </Button>
          </form>

          {/* Quick Demo Sign In Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              {lang === 'en' ? '— Or Quick Test As Demo Tutor —' : '— أو تجربة فورية كأحد المدرسين —'}
            </p>
            <div className="space-y-2">
              {demoTutors.map((tutor) => (
                <button
                  key={tutor.email}
                  type="button"
                  onClick={() => handleQuickLogin(tutor)}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-slate-200/90 hover:border-[#0f2c59] hover:bg-slate-50 text-start transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#0f2c59] text-white flex items-center justify-center text-xs font-bold font-mono">
                      {tutor.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-[#0f2c59]">{tutor.name}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{tutor.title}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#0f2c59] bg-blue-50 px-2 py-1 rounded-lg">
                    {lang === 'en' ? 'Open' : 'دخول'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-xs font-bold text-slate-500">Loading Classio...</div>}>
      <LoginForm />
    </Suspense>
  )
}
