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
  CreditCard,
  AlertCircle,
  Layers,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { storage } from '@/lib/storage'
import { TutorProfile, PlanTier, BillingCycle } from '@/lib/types'
import { ClassioLogo } from '@/components/ui/classio-logo'
import { adminStorage } from '@/lib/admin-storage'
import { PRICING_PLANS } from '@/lib/plans'
import { PLAN_LIMITS } from '@/lib/plan-gates'

interface RegisteredAccount {
  email: string
  name: string
  password?: string
  phone: string
  subject: string
  plan: PlanTier
  billing: BillingCycle
  maxLimit: number
  createdAt: string
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan') as PlanTier | null
  const billingParam = (searchParams.get('billing') || 'monthly') as BillingCycle
  const modeParam = searchParams.get('mode')

  const { lang, toggleLang, isRTL } = useLanguage()

  const [mode, setMode] = useState<'signin' | 'signup'>(modeParam === 'signup' ? 'signup' : 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(planParam || 'growth')
  const [selectedBilling, setSelectedBilling] = useState<BillingCycle>(billingParam)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Sync plan and ensure clean new user session when in signup mode
  useEffect(() => {
    if (planParam && PRICING_PLANS.some((p) => p.id === planParam)) {
      setSelectedPlan(planParam)
    }
    if (mode === 'signup' && typeof window !== 'undefined') {
      // Clear any old session so the new teacher starts 100% fresh
      localStorage.removeItem('classio_auth_user')
    }
  }, [planParam, mode])

  // Helper: Find registered user in localStorage or admin storage
  const findRegisteredUser = (emailToCheck: string): RegisteredAccount | null => {
    if (typeof window === 'undefined') return null
    const cleanEmail = emailToCheck.trim().toLowerCase()

    try {
      const regRaw = localStorage.getItem('classio_registered_accounts')
      if (regRaw) {
        const list: RegisteredAccount[] = JSON.parse(regRaw)
        const found = list.find((u) => u.email.toLowerCase() === cleanEmail)
        if (found) return found
      }
    } catch (e) {
      console.error(e)
    }

    // Also check adminStorage for platform-managed tutors
    const adminTutor = adminStorage.getTutorById(cleanEmail)
    if (adminTutor) {
      return {
        email: adminTutor.email,
        name: adminTutor.name,
        phone: adminTutor.phone,
        subject: adminTutor.subject,
        plan: (adminTutor.subscription_plan as PlanTier) || 'free',
        billing: adminTutor.subscription_cycle || 'monthly',
        maxLimit: adminTutor.max_students_limit || 10,
        createdAt: adminTutor.created_at,
      }
    }

    return null
  }

  const selectedPlanObj = PRICING_PLANS.find((p) => p.id === selectedPlan) || PRICING_PLANS[2]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setLoading(true)

    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail || !cleanEmail.includes('@')) {
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
      const settings = adminStorage.getSettings()

      // --- SIGN IN FLOW ---
      if (mode === 'signin') {
        const existingAccount = findRegisteredUser(cleanEmail)

        // Strict Requirement: No one can log in unless they signed up first!
        if (!existingAccount) {
          setErrorMsg(
            lang === 'en'
              ? 'No registered account found with this email. You must sign up and choose your plan first (even if Free).'
              : 'لا يوجد حساب مسجل بهذا البريد الإلكتروني. يجب إنشاء حساب جديد واختيار باقتك أولاً (حتى لو كانت مجانية).'
          )
          setLoading(false)
          return
        }

        // Check if tutor account is suspended
        const existingTutor = adminStorage.getTutorById(cleanEmail)
        if (existingTutor && existingTutor.status === 'suspended') {
          throw new Error(
            lang === 'en'
              ? `Your tutor account is suspended. Reason: ${existingTutor.suspension_reason || 'Administrative hold'}`
              : `حسابك مجمد من قبل إدارة المنصة. السبب: ${existingTutor.suspension_reason || 'قرار إداري'}`
          )
        }

        // Check password match if stored
        if (existingAccount.password && existingAccount.password !== password) {
          setErrorMsg(lang === 'en' ? 'Incorrect password. Please try again.' : 'كلمة المرور غير صحيحة، يرجى المحاولة ثانية.')
          setLoading(false)
          return
        }

        // Update active session for this existing user
        const planLimit = existingAccount.maxLimit || PLAN_LIMITS[existingAccount.plan] || 10
        localStorage.setItem(
          'classio_auth_user',
          JSON.stringify({
            email: existingAccount.email,
            name: existingAccount.name,
            phone: existingAccount.phone,
            subject: existingAccount.subject,
            plan: existingAccount.plan,
            planLimit: planLimit,
          })
        )

        setSuccessMsg(
          lang === 'en'
            ? `Welcome back, ${existingAccount.name}! Loading your dashboard...`
            : `مرحباً بعودتك، أ. ${existingAccount.name}! جاري الدخول للوحة التحكم...`
        )

        setTimeout(() => {
          if (planParam && planParam !== 'free') {
            router.push(`/checkout?plan=${planParam}&billing=${selectedBilling}`)
          } else {
            router.push('/dashboard')
          }
        }, 600)
        return
      }

      // --- SIGN UP FLOW ---
      if (mode === 'signup') {
        // Block registration if disabled by Super Admin
        if (!settings.allow_tutor_registration) {
          throw new Error(
            lang === 'en'
              ? 'New tutor registrations are temporarily disabled by the platform administration.'
              : 'التسجيل العام للمدرسين الجدد متوقف حالياً بقرار من إدارة المنصة.'
          )
        }

        if (!name.trim()) {
          setErrorMsg(lang === 'en' ? 'Please enter your full name.' : 'يرجى كتابة الاسم بالكامل.')
          setLoading(false)
          return
        }

        if (!phone.trim()) {
          setErrorMsg(lang === 'en' ? 'Please enter your phone number.' : 'يرجى إدخال رقم الهاتف للتواصل.')
          setLoading(false)
          return
        }

        // Check if email already registered
        const alreadyExists = findRegisteredUser(cleanEmail)
        if (alreadyExists) {
          setErrorMsg(
            lang === 'en'
              ? 'An account already exists with this email. Please sign in below or use a different email.'
              : 'يوجد حساب مسجل بالفعل بهذا البريد الإلكتروني. يرجى تسجيل الدخول أدناه أو استخدام بريد جديد.'
          )
          setLoading(false)
          return
        }

        const planLimit = PLAN_LIMITS[selectedPlan] || 10

        // 1. Save new account in classio_registered_accounts
        const newAccount: RegisteredAccount = {
          email: cleanEmail,
          name: name.trim(),
          password: password,
          phone: phone.trim(),
          subject: subject.trim() || 'عام',
          plan: selectedPlan,
          billing: selectedBilling,
          maxLimit: planLimit,
          createdAt: new Date().toISOString(),
        }

        try {
          const regRaw = localStorage.getItem('classio_registered_accounts')
          const list: RegisteredAccount[] = regRaw ? JSON.parse(regRaw) : []
          list.push(newAccount)
          localStorage.setItem('classio_registered_accounts', JSON.stringify(list))
        } catch (e) {
          console.error(e)
        }

        // 2. Register tutor in platform admin registry
        adminStorage.registerTutor({
          name: newAccount.name,
          email: newAccount.email,
          phone: newAccount.phone,
          subject: newAccount.subject,
          subscription_plan: selectedPlan,
          subscription_cycle: selectedBilling,
          max_students_limit: planLimit,
        })

        // 3. Save initial isolated profile for THIS new teacher (0 students, completely clean)
        const tutorId = `tutor-${Date.now()}`
        const newProfile: TutorProfile = {
          id: tutorId,
          name: newAccount.name,
          title: 'معلم خاص',
          subject: newAccount.subject,
          phone: newAccount.phone,
          email: newAccount.email,
          avatar_initials: (newAccount.name.slice(0, 2) || 'CL').toUpperCase(),
          center_names: [],
          instapay_handle: 'sayed017@instapay',
          vodafone_cash_number: '',
          default_monthly_fee: 500,
          subscription_plan: selectedPlan,
          subscription_cycle: selectedBilling,
          max_students_limit: planLimit,
        }
        await storage.saveProfile(newProfile)

        // 4. Set active auth session strictly for THIS new teacher
        localStorage.setItem(
          'classio_auth_user',
          JSON.stringify({
            email: newAccount.email,
            name: newAccount.name,
            phone: newAccount.phone,
            subject: newAccount.subject,
            plan: selectedPlan,
            planLimit: planLimit,
          })
        )

        // Routing based on selected plan:
        if (selectedPlan === 'free') {
          setSuccessMsg(
            lang === 'en'
              ? 'Free account created successfully! Entering your clean dashboard...'
              : 'تم إنشاء حسابك بالباقة المجانية بنجاح! جاري الدخول للوحة التحكم النظيفة...'
          )
          setTimeout(() => {
            router.push('/dashboard')
          }, 700)
        } else {
          setSuccessMsg(
            lang === 'en'
              ? 'Account created! Redirecting to payment & InstaPay plan activation...'
              : 'تم إنشاء الحساب بنجاح! جاري الانتقال لتأكيد السداد وتفعيل الباقة عبر إنستاباي...'
          )
          setTimeout(() => {
            router.push(`/checkout?plan=${selectedPlan}&billing=${selectedBilling}`)
          }, 700)
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (lang === 'en' ? 'An error occurred during authentication.' : 'حدث خطأ أثناء المصادقة.'))
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

        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className="text-xs font-bold text-slate-600 hover:text-[#0f2c59] px-3 py-1.5 hidden sm:inline-block"
          >
            {lang === 'en' ? 'View Pricing' : 'خطط الأسعار'}
          </Link>

          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#0f2c59]" />
            <span>{lang === 'en' ? 'عربي' : 'English'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8">
          {/* Card Title */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <ClassioLogo size="lg" showWordmark={false} />
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              {mode === 'signin'
                ? lang === 'en'
                  ? 'Sign In to Classio'
                  : 'تسجيل الدخول إلى كلاسيو'
                : lang === 'en'
                ? 'Create Your Tutor Account'
                : 'إنشاء حساب مدرس جديد'}
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">
              {mode === 'signin'
                ? lang === 'en'
                  ? 'Access your private workspace and student records'
                  : 'أدر طلابك ومجموعاتك وتابع تحصيلك الدراسي بكل احترافية'
                : lang === 'en'
                ? 'Create your account to activate your chosen tutoring plan'
                : 'أنشئ حسابك لبدء تفعيل باقتك المختارة فوراً'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setErrorMsg('')
                setSuccessMsg('')
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
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
                setSuccessMsg('')
                localStorage.removeItem('classio_auth_user')
                setName('')
                setEmail('')
                setPhone('')
                setPassword('')
                setSubject('')
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                mode === 'signup' ? 'bg-white text-[#0f2c59] shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {lang === 'en' ? 'Create Account' : 'حساب جديد'}
            </button>
          </div>

          {/* Error & Success Alerts */}
          {errorMsg && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup')
                    setErrorMsg('')
                    localStorage.removeItem('classio_auth_user')
                  }}
                  className="self-start text-[11px] font-black text-rose-800 underline hover:text-rose-900 cursor-pointer pt-1"
                >
                  {lang === 'en' ? '→ Switch to Sign Up & Choose Plan' : '← اضغط هنا لإنشاء حساب جديد واختيار باقتك'}
                </button>
              )}
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                {/* Desired Plan Highlight Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider block">
                      {lang === 'en' ? 'Creating account for plan:' : 'جاري إنشاء الحساب لباقة:'}
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      Classio {selectedPlanObj.name} ({selectedPlanObj.studentsLabel})
                    </span>
                  </div>
                  <span className="text-xs font-price font-bold text-[#0f2c59] bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                    {selectedPlanObj.id === 'free'
                      ? (lang === 'en' ? 'Free Forever' : 'مجاناً للأبد')
                      : selectedPlanObj.isCustomMeeting
                      ? (lang === 'en' ? '1-on-1 Meeting' : 'جلسة خاصة')
                      : `EGP ${selectedBilling === 'annual' ? Math.round(selectedPlanObj.annualPrice / 12) : selectedPlanObj.monthlyPrice}/mo`}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {lang === 'en' ? 'Full Name (Teacher / Center)' : 'الاسم بالكامل (المعلم أو السنتر)'}
                  </label>
                  <div className="relative">
                    <User className="absolute top-3 start-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={lang === 'en' ? 'e.g. Mr. Mohamed Hassan' : 'مثال: أ. محمد حسن'}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 ps-10 pe-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#0f2c59] focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'en' ? 'Subject / Specialty' : 'المادة الدراسية'}
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute top-3 start-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={lang === 'en' ? 'e.g. Physics, Math' : 'مثال: فيزياء، رياضيات'}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 ps-10 pe-3 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#0f2c59] focus:outline-none transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'en' ? 'Phone Number' : 'رقم الهاتف'}
                    </label>
                    <div className="relative">
                      <Phone className="absolute top-3 start-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        dir="ltr"
                        placeholder="010XXXXXXXX"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 ps-10 pe-3 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#0f2c59] focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Plan Selection Section */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#0f2c59]" />
                      <span>{lang === 'en' ? 'Change Desired Plan:' : 'تعديل الباقة المطلوبة:'}</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {selectedPlan === 'free'
                        ? lang === 'en' ? 'Free Forever' : 'مجانية للأبد'
                        : lang === 'en' ? '3-Day Free Trial' : 'تجربة مجانية 3 أيام'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRICING_PLANS.map((p) => {
                      const isSelected = selectedPlan === p.id
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPlan(p.id)}
                          className={`p-2.5 rounded-2xl border text-start transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#0f2c59] bg-[#0f2c59] text-white shadow-sm ring-2 ring-[#0f2c59]/20'
                              : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-xs font-black">{p.name}</span>
                            {p.id === 'growth' && (
                              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-amber-300 text-slate-900' : 'bg-amber-100 text-amber-800'}`}>
                                ⭐ {lang === 'en' ? 'Popular' : 'شائع'}
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                            {p.studentsLabel}
                          </span>
                          <span className={`text-xs font-price font-bold mt-1 ${isSelected ? 'text-amber-300' : 'text-[#0f2c59]'}`}>
                            {p.id === 'free'
                              ? lang === 'en' ? 'EGP 0 Free' : 'مجاناً 0 ج.م'
                              : p.isCustomMeeting
                              ? lang === 'en' ? 'Meeting' : 'جلسة خاصة'
                              : `EGP ${p.monthlyPrice}/mo`}
                          </span>
                        </button>
                      )
                    })}
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
                  placeholder="teacher@example.com"
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
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 ps-10 pe-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#0f2c59] focus:outline-none transition"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 rounded-2xl bg-[#0f2c59] hover:bg-[#1a3d6d] text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              {loading
                ? lang === 'en'
                  ? 'Verifying...'
                  : 'جاري التحقق...'
                : mode === 'signin'
                ? lang === 'en'
                  ? 'Sign In to Workspace'
                  : 'دخول مساحة العمل'
                : selectedPlan === 'free'
                ? lang === 'en'
                  ? 'Create Free Account & Open Dashboard'
                  : 'إنشاء الحساب المجاني ودخول اللوحة'
                : lang === 'en'
                ? `Create Account & Proceed to ${selectedPlan.toUpperCase()} Payment`
                : `إنشاء الحساب والمتابعة لسداد باقة ${selectedPlan.toUpperCase()}`}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              {lang === 'en' ? 'Accepted Payment Method: InstaPay (sayed017@instapay) • Vodafone Cash & Fawry coming soon' : 'طريقة الدفع المعتمدة: إنستاباي (sayed017@instapay) • فودافون كاش وفوري قريباً'}
            </p>
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
