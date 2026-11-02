'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Smartphone,
  Building,
  Zap,
  Globe,
  Store,
  HelpCircle,
  Tag,
  Calendar,
  Flame,
  MessageCircle,
  X,
  QrCode,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { PRICING_PLANS, PRICING_RULES } from '@/lib/plans'
import { storage } from '@/lib/storage'
import { adminStorage } from '@/lib/admin-storage'
import { PlanTier, BillingCycle, TutorProfile } from '@/lib/types'
import { ClassioLogo } from '@/components/ui/classio-logo'
import { formatPrice } from '@/lib/localization'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialPlanId = (searchParams.get('plan') || 'growth') as PlanTier
  const initialBilling = (searchParams.get('billing') || 'monthly') as BillingCycle

  const { lang, toggleLang, isRTL } = useLanguage()

  const [planId, setPlanId] = useState<PlanTier>(initialPlanId)
  const [billing, setBilling] = useState<BillingCycle>(initialBilling)
  const [copiedKey, setCopiedKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [validationError, setValidationError] = useState('')

  // Pop-up Modal state for serious user
  const [showInstaPayModal, setShowInstaPayModal] = useState(false)

  // Tutor account info states
  const [tutorName, setTutorName] = useState('')
  const [tutorEmail, setTutorEmail] = useState('')
  const [tutorPhone, setTutorPhone] = useState('')
  const [tutorSubject, setTutorSubject] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Transaction form states inside modal
  const [senderRef, setSenderRef] = useState('')
  const [senderPhoneInput, setSenderPhoneInput] = useState('')

  // Enterprise Meeting form states
  const [enterpriseTutorName, setEnterpriseTutorName] = useState('')
  const [enterprisePhone, setEnterprisePhone] = useState('')
  const [enterpriseStudentsCount, setEnterpriseStudentsCount] = useState('650')
  const [enterpriseCenterNames, setEnterpriseCenterNames] = useState('')
  const [enterpriseNotes, setEnterpriseNotes] = useState('')

  // Check existing session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authRaw = localStorage.getItem('classio_auth_user')
      if (authRaw) {
        try {
          const parsed = JSON.parse(authRaw)
          if (parsed.email) {
            setTutorEmail(parsed.email)
            setTutorName(parsed.name || '')
            setTutorPhone(parsed.phone || '')
            setSenderPhoneInput(parsed.phone || '')
            setTutorSubject(parsed.subject || '')
            setIsLoggedIn(true)
          }
        } catch (e) {}
      }
    }
  }, [])

  const selectedPlan = PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[2] // default Growth

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(''), 2500)
  }

  const finalPrice =
    selectedPlan.isCustomMeeting
      ? 0
      : billing === 'annual'
      ? selectedPlan.annualPrice
      : selectedPlan.monthlyPrice

  // Triggered when user clicks "Proceed to Pay via InstaPay"
  const handleOpenInstaPayModal = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!isLoggedIn) {
      if (!tutorName.trim()) {
        setValidationError(lang === 'en' ? 'Please enter your full name.' : 'يرجى كتابة الاسم بالكامل.')
        return
      }
      if (!tutorEmail.trim() || !tutorEmail.includes('@')) {
        setValidationError(lang === 'en' ? 'Please enter a valid email address.' : 'يرجى إدخال بريد إلكتروني صحيح.')
        return
      }
      if (!tutorPhone.trim()) {
        setValidationError(lang === 'en' ? 'Please enter your phone number.' : 'يرجى إدخال رقم الهاتف للتواصل.')
        return
      }
    }

    if (!senderPhoneInput && tutorPhone) {
      setSenderPhoneInput(tutorPhone)
    }

    setShowInstaPayModal(true)
  }

  // Final subscription confirmation
  const handleConfirmSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const finalEmail = (enterprisePhone ? `enterprise_${enterprisePhone}@classio.app` : tutorEmail || 'teacher@classio.app').trim().toLowerCase()
      const finalName = (enterpriseTutorName || tutorName || finalEmail.split('@')[0]).trim()
      const finalPhone = (enterprisePhone || tutorPhone || senderPhoneInput || '').trim()
      const finalSubject = tutorSubject.trim() || 'عام'

      // 1. Save user auth session
      localStorage.setItem(
        'classio_auth_user',
        JSON.stringify({
          email: finalEmail,
          name: finalName,
          phone: finalPhone,
          subject: finalSubject,
          plan: selectedPlan.id,
          planLimit: selectedPlan.studentsLimit,
        })
      )

      // 2. Save tutor profile in isolated storage
      const tutorId = `tutor-${Date.now()}`
      const newProfile: TutorProfile = {
        id: tutorId,
        name: finalName,
        title: 'معلم خاص',
        subject: finalSubject,
        phone: finalPhone,
        email: finalEmail,
        avatar_initials: (finalName.slice(0, 2) || 'CL').toUpperCase(),
        center_names: enterpriseCenterNames ? [enterpriseCenterNames] : [],
        instapay_handle: 'sayed017@instapay',
        vodafone_cash_number: '',
        default_monthly_fee: 500,
        subscription_plan: selectedPlan.id,
        subscription_cycle: billing,
        max_students_limit: selectedPlan.studentsLimit,
      }
      await storage.saveProfile(newProfile)

      // 3. Register tutor in platform admin registry
      adminStorage.registerTutor({
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
        subject: finalSubject,
        subscription_plan: selectedPlan.id,
        subscription_cycle: billing,
        max_students_limit: selectedPlan.studentsLimit,
      })

      // 4. Save in registered accounts list so tutor can log in subsequent times
      try {
        const regRaw = localStorage.getItem('classio_registered_accounts')
        const list = regRaw ? JSON.parse(regRaw) : []
        if (!list.some((u: any) => u.email.toLowerCase() === finalEmail)) {
          list.push({
            email: finalEmail,
            name: finalName,
            phone: finalPhone,
            subject: finalSubject,
            plan: selectedPlan.id,
            billing: billing,
            maxLimit: selectedPlan.studentsLimit,
            createdAt: new Date().toISOString(),
          })
          localStorage.setItem('classio_registered_accounts', JSON.stringify(list))
        }
      } catch (e) {}

      if (selectedPlan.isCustomMeeting) {
        adminStorage.submitSubscriptionRequest({
          tutor_id: tutorId,
          tutor_name: finalName,
          tutor_email: finalEmail,
          plan_id: 'enterprise',
          billing_cycle: billing,
          amount: 0,
          payment_method: 'instapay',
          transaction_ref: `MEETING-${Math.floor(100000 + Math.random() * 900000)}`,
          sender_phone: finalPhone,
          admin_notes: `طلب جلسة عمل خاصة للمؤسسات (+٥٠٠ طالب). السناتر: ${enterpriseCenterNames || 'غير محدد'}. عدد الطلاب المتوقع: ${enterpriseStudentsCount}. ملاحظات: ${enterpriseNotes}`,
        })
        setShowInstaPayModal(false)
        setSuccess(true)
        setLoading(false)
        return
      }

      const refCode = senderRef || `IPN-${Math.floor(100000 + Math.random() * 900000)}`

      adminStorage.submitSubscriptionRequest({
        tutor_id: tutorId,
        tutor_name: finalName,
        tutor_email: finalEmail,
        plan_id: selectedPlan.id,
        billing_cycle: billing,
        amount: finalPrice,
        payment_method: 'instapay',
        transaction_ref: refCode,
        sender_phone: senderPhoneInput || finalPhone,
        admin_notes: `سداد اشتراك كلاسيو عبر InstaPay (sayed017@instapay / sayed017@gmail.com) بمبلغ ${finalPrice} ج.م`,
      })

      setShowInstaPayModal(false)
      setSuccess(true)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Limited-Time Offer Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white text-xs font-black py-2 px-4 text-center shadow-inner flex items-center justify-center gap-2 flex-wrap">
        <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-bounce" />
        <span>
          {lang === 'en'
            ? '⚡ Limited Time Launch Pricing: Lock in your introductory rate today for the entire year!'
            : '⚡ أسعار مخفضة لفترة محدودة بمناسبة انطلاق العام الدراسي: ثبّت باقتك الآن بالسعر الحالي طوال العام!'}
        </span>
      </div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between border-b border-slate-200/60 bg-white">
        <Link href="/" className="inline-block group">
          <ClassioLogo size="md" />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className="text-xs font-bold text-slate-600 hover:text-[#0f2c59] px-3 py-1.5"
          >
            {lang === 'en' ? '← All Plans' : '← كافة خطط الأسعار'}
          </Link>

          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Globe className="size-3.5 text-[#0f2c59]" />
            <span>{lang === 'en' ? 'عربي' : 'English'}</span>
          </button>

          <Link
            href="/dashboard"
            className="text-xs font-bold text-slate-600 hover:text-[#0f2c59] px-3 py-1.5"
          >
            {lang === 'en' ? 'Back to App' : 'العودة للتطبيق'}
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success ? (
          /* Success Screen */
          <div className="max-w-lg mx-auto bg-white rounded-3xl border border-emerald-200 p-8 shadow-xl text-center">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 ${selectedPlan.isCustomMeeting ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-600'}`}>
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              {selectedPlan.isCustomMeeting
                ? lang === 'en'
                  ? 'Strategy Meeting Requested!'
                  : 'تم استلام طلب جلسة العمل الخاصة بنجاح!'
                : lang === 'en'
                ? 'Payment Submitted for Verification!'
                : 'تم استلام إشعار السداد وقيد التحقق المالي!'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              {selectedPlan.isCustomMeeting
                ? lang === 'en'
                  ? 'Our senior enterprise team has received your request. We will reach out on WhatsApp within 2 hours to confirm your 1-on-1 strategy meeting.'
                  : 'استلم فريق قيادة كلاسيو طلبك لجلسة العمل الخاصة (+٥٠٠ طالب). سنتواصل معك مباشرة عبر واتساب خلال ساعتين لتأكيد موعد الجلسة.'
                : lang === 'en'
                ? `Your payment of ${finalPrice} EGP via InstaPay has been submitted. Our finance team is verifying the transfer and will activate your ${selectedPlan.name} plan shortly.`
                : `تم إرسال إشعار سداد مبلغ ${finalPrice} ج.م عبر إنستاباي (InstaPay). جاري مطابقة التحويل في الحساب البنكي وسيتم تفعيل باقة (${selectedPlan.nameAr}) وتوسيع سعة الطلاب (${selectedPlan.studentsLimit} طالب) فور الاعتماد.`}
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-start text-xs space-y-2 mb-6">
              <div className="flex justify-between font-bold text-slate-800">
                <span>{lang === 'en' ? 'Plan:' : 'الخطة:'}</span>
                <span>Classio {selectedPlan.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{lang === 'en' ? 'Student Capacity:' : 'الحد الأقصى للطلاب:'}</span>
                <span>{selectedPlan.studentsLabel}</span>
              </div>
              {!selectedPlan.isCustomMeeting && (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>{lang === 'en' ? 'Billing Cycle:' : 'دورة الفوترة:'}</span>
                    <span>{billing === 'annual' ? (lang === 'en' ? 'Annual (12 Months)' : 'سنوي (١٢ شهر)') : (lang === 'en' ? 'Monthly' : 'شهري')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{lang === 'en' ? 'Payment Channel:' : 'وسيلة السداد:'}</span>
                    <span className="font-bold text-blue-900">InstaPay (sayed017@instapay)</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700 pt-2 border-t border-slate-200">
                    <span>{lang === 'en' ? 'Total Amount:' : 'الإجمالي:'}</span>
                    <span>{formatPrice(finalPrice, lang)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3.5 rounded-2xl bg-[#0f2c59] hover:bg-[#1a3d6d] text-white font-bold text-xs shadow-md cursor-pointer"
              >
                {lang === 'en' ? 'Enter My Dashboard Now' : 'دخول لوحة تحكم المدرس الآن'}
              </Button>

              {selectedPlan.isCustomMeeting && (
                <a
                  href={`https://wa.me/201299930937?text=${encodeURIComponent(
                    lang === 'ar'
                      ? 'مرحباً كلاسيو، لقد قمت بتقديم طلب جلسة عمل خاصة لخطة المؤسسات (+٥٠٠ طالب) وأود التنسيق الفوري.'
                      : 'Hello Classio, I just requested an Enterprise strategy meeting and want to coordinate immediately.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Chat Directly on WhatsApp' : 'تحدث مباشرة عبر واتساب مع الإدارة'}</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          /* Checkout Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: Payment Method & Details (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
              {selectedPlan.isCustomMeeting ? (
                /* Enterprise 1-on-1 Meeting Form */
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h1 className="text-xl font-black text-slate-900">
                      {lang === 'en' ? 'Enterprise Strategy Meeting' : 'حجز جلسة عمل خاصة لكبار المعلمين'}
                    </h1>
                    <span className="rounded-full bg-purple-100 text-purple-900 border border-purple-300 font-bold px-2.5 py-0.5 text-xs">
                      {lang === 'en' ? '+500 Students' : '+٥٠٠ طالب مخصص'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-6">
                    {lang === 'en'
                      ? 'Schedule a direct 1-on-1 strategy meeting with Classio leadership to customize your mega-center software deployment.'
                      : 'احجز جلسة عمل مباشرة 1-on-1 مع فريق قيادة كلاسيو لمناقشة متطلبات سناترك وتفصيل الميزات البرمجية الخاصة بك.'}
                  </p>

                  <form onSubmit={handleConfirmSubscription} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {lang === 'en' ? 'Teacher / Center Name' : 'اسم المعلم أو السنتر التعليمي'}
                      </label>
                      <input
                        type="text"
                        required
                        value={enterpriseTutorName}
                        onChange={(e) => setEnterpriseTutorName(e.target.value)}
                        placeholder={lang === 'en' ? 'e.g. Prof. Ahmed - El-Rowad Center' : 'مثال: أ. أحمد محمود — سنتر الرواد'}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {lang === 'en' ? 'WhatsApp Phone Number' : 'رقم الهاتف / واتساب للتواصل'}
                        </label>
                        <input
                          type="tel"
                          required
                          value={enterprisePhone}
                          onChange={(e) => setEnterprisePhone(e.target.value)}
                          dir="ltr"
                          placeholder="01012345678"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {lang === 'en' ? 'Estimated Total Students' : 'العدد التقديري للطلاب'}
                        </label>
                        <input
                          type="text"
                          required
                          value={enterpriseStudentsCount}
                          onChange={(e) => setEnterpriseStudentsCount(e.target.value)}
                          placeholder="600, 1000, 2500..."
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {lang === 'en' ? 'Center Locations & Halls' : 'أسماء وأماكن السناتر والفروع'}
                      </label>
                      <input
                        type="text"
                        value={enterpriseCenterNames}
                        onChange={(e) => setEnterpriseCenterNames(e.target.value)}
                        placeholder={lang === 'en' ? 'e.g. Nasr City, Tagamoa, Mohandessin' : 'مثال: سنتر الأوائل بمدينة نصر، سنتر النخبة بالتجمع'}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {lang === 'en' ? 'Custom Requirements & Notes' : 'أي متطلبات أو ميزات خاصة ترغب بها'}
                      </label>
                      <textarea
                        rows={3}
                        value={enterpriseNotes}
                        onChange={(e) => setEnterpriseNotes(e.target.value)}
                        placeholder={lang === 'en' ? 'Tell us about your team of assistants, attendance scanners, etc.' : 'أخبرنا عن فريق المساعدين، عدد السكرتارية، قارئات الباركود...'}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-2xl bg-purple-800 hover:bg-purple-700 text-white font-black text-xs shadow-md transition cursor-pointer"
                      >
                        {loading
                          ? lang === 'en' ? 'Submitting Request...' : 'جاري إرسال الطلب...'
                          : lang === 'en' ? 'Confirm Meeting Request (1-on-1)' : 'تأكيد حجز جلسة العمل الخاصة (1-on-1)'}
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Standard Paid Plans Checkout */
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h1 className="text-xl font-black text-slate-900">
                      {lang === 'en' ? 'Complete Your Subscription' : 'إتمام سداد الاشتراك'}
                    </h1>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 text-xs">
                      {lang === 'en' ? '3-Day Free Trial' : 'تجربة مجانية 3 أيام'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-6">
                    {lang === 'en'
                      ? 'Payment accepted via instant bank transfer on InstaPay. Vodafone Cash and Fawry are coming soon.'
                      : 'السداد متاح حالياً عبر التحويل المباشر في إنستاباي (InstaPay). وسيتوفر فودافون كاش وفوري قريباً.'}
                  </p>

                  {/* Tutor Account Details */}
                  {isLoggedIn ? (
                    <div className="mb-6 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                          {lang === 'en' ? 'Subscribing Account:' : 'حساب المشترك المعتمد:'}
                        </div>
                        <div className="text-xs font-bold text-slate-800 mt-0.5">
                          {tutorName || tutorEmail.split('@')[0]} — {tutorEmail}
                        </div>
                      </div>
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        {lang === 'en' ? 'Verified Session' : 'جلسة نشطة'}
                      </span>
                    </div>
                  ) : (
                    <div className="mb-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          {lang === 'en' ? '1. Your Tutor Workspace Account' : '١. بيانات حساب المعلم ومساحة العمل'}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {lang === 'en' ? 'Your clean dashboard will be created for this account' : 'سيتم إنشاء لوحة تحكم خاصة بك'}
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {lang === 'en' ? 'Full Name (Teacher / Center)' : 'الاسم بالكامل (المعلم أو السنتر)'}
                        </label>
                        <input
                          type="text"
                          required
                          value={tutorName}
                          onChange={(e) => setTutorName(e.target.value)}
                          placeholder={lang === 'en' ? 'e.g. Mr. Mohamed Hassan' : 'مثال: أ. محمد حسن'}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {lang === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
                          </label>
                          <input
                            type="email"
                            required
                            value={tutorEmail}
                            onChange={(e) => setTutorEmail(e.target.value)}
                            dir="ltr"
                            placeholder="teacher@example.com"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {lang === 'en' ? 'Phone Number' : 'رقم الهاتف'}
                          </label>
                          <input
                            type="tel"
                            required
                            value={tutorPhone}
                            onChange={(e) => setTutorPhone(e.target.value)}
                            dir="ltr"
                            placeholder="010XXXXXXXX"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {lang === 'en' ? 'Subject / Specialty' : 'المادة الدراسية / التخصص'}
                        </label>
                        <input
                          type="text"
                          value={tutorSubject}
                          onChange={(e) => setTutorSubject(e.target.value)}
                          placeholder={lang === 'en' ? 'e.g. Mathematics, English, Physics' : 'مثال: الرياضيات، اللغة الإنجليزية، الفيزياء'}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Payment Methods Section */}
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-slate-800">
                      {lang === 'en' ? '2. Payment Methods' : '٢. وسيلة السداد'}
                    </div>

                    {/* Method Selector Pills: InstaPay is active, Vodafone & Fawry coming soon, Bank Card removed */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* InstaPay (Active) */}
                      <div className="p-3.5 rounded-2xl border-2 border-[#0f2c59] bg-blue-50/70 ring-2 ring-[#0f2c59]/20 flex flex-col justify-between relative shadow-xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-[#0f2c59]" />
                            <span className="text-xs font-black text-slate-900">InstaPay</span>
                          </div>
                          <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                            {lang === 'en' ? 'Active' : 'متاح الآن'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-600 font-semibold leading-tight">
                          {lang === 'en' ? 'Instant bank transfer via InstaPay IPN' : 'تحويل لحظي مباشر عبر إنستاباي'}
                        </span>
                      </div>

                      {/* Vodafone Cash (Coming Soon) */}
                      <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 opacity-75 flex flex-col justify-between relative">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-600">{lang === 'en' ? 'Vodafone Cash' : 'فودافون كاش'}</span>
                          </div>
                          <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lang === 'en' ? 'Soon' : 'قريباً'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {lang === 'en' ? 'Mobile Wallets (Available soon)' : 'محافظ المحمول (سيتوفر قريباً)'}
                        </span>
                      </div>

                      {/* Fawry Pay (Coming Soon) */}
                      <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 opacity-75 flex flex-col justify-between relative">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-600">{lang === 'en' ? 'Fawry Pay' : 'فوري كود'}</span>
                          </div>
                          <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lang === 'en' ? 'Soon' : 'قريباً'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {lang === 'en' ? 'Kiosks & POS (Available soon)' : 'ماكينات فوري (سيتوفر قريباً)'}
                        </span>
                      </div>
                    </div>

                    {/* InstaPay Info Card */}
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-[#0f2c59]" />
                          <span className="text-xs font-bold text-slate-800">
                            {lang === 'en' ? 'Official InstaPay Payment Details:' : 'بيانات الدفع المعتمدة عبر إنستاباي:'}
                          </span>
                        </div>
                        <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          {lang === 'en' ? 'Instant Activation' : 'تفعيل فوري'}
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                        <div className="text-xs font-mono font-bold text-slate-900">
                          sayed017@instapay
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('sayed017@instapay', 'instapay_preview')}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f2c59] hover:underline cursor-pointer"
                        >
                          {copiedKey === 'instapay_preview' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'instapay_preview' ? (lang === 'en' ? 'Copied!' : 'تم النسخ!') : (lang === 'en' ? 'Copy' : 'نسخ المعرف')}</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {lang === 'en'
                          ? 'Click the button below to display the official InstaPay QR code modal, scan it with your banking app, and confirm your transaction.'
                          : 'اضغط على الزر أدناه لعرض نافذة كود الـ QR الرسمية لتطبيق إنستاباي لمسح الكود وتأكيد التحويل مباشرة.'}
                      </p>
                    </div>

                    {validationError && (
                      <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span>{validationError}</span>
                      </div>
                    )}

                    {/* Serious User Button: Opens Modal */}
                    <Button
                      type="button"
                      onClick={handleOpenInstaPayModal}
                      className="w-full py-4 rounded-2xl bg-[#0f2c59] hover:bg-[#1a3d6d] text-white font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4 text-amber-300" />
                      <span>
                        {lang === 'en'
                          ? `Proceed to Pay ${formatPrice(finalPrice, lang)} via InstaPay (Show QR)`
                          : `المتابعة للسداد عبر إنستاباي وعرض كود الـ QR (${formatPrice(finalPrice, lang)})`}
                      </span>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Order Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
                {/* Plan Switcher */}
                <div className="pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-slate-700">
                      {lang === 'en' ? 'Select Plan:' : 'اختر الباقة:'}
                    </span>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-black">
                      {selectedPlan.studentsLabel}
                    </span>
                  </div>

                  {/* Visual Plan Switcher Grid */}
                  <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                    {PRICING_PLANS.filter(p => p.id !== 'free').map((p) => {
                      const isSelected = p.id === planId
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPlanId(p.id)}
                          className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? 'border-[#0f2c59] bg-[#0f2c59] text-white shadow-sm font-bold'
                              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="text-[11px] font-black truncate w-full">{p.name}</span>
                          <span className={`text-[10px] font-price font-bold ${isSelected ? 'text-amber-300' : 'text-[#0f2c59]'}`}>
                            {p.isCustomMeeting ? (lang === 'en' ? 'Meeting' : 'جلسة عمل') : `EGP ${billing === 'annual' ? Math.round(p.annualPrice / 12) : p.monthlyPrice}/mo`}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value as PlanTier)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-800 outline-none"
                  >
                    {PRICING_PLANS.map((p) => (
                      <option key={p.id} value={p.id}>
                        Classio {p.name} ({p.studentsLabel}) {p.isCustomMeeting ? '— Custom Meeting' : billing === 'annual' ? `— ${p.annualPrice} EGP/yr` : `— ${p.monthlyPrice} EGP/mo`}
                      </option>
                    ))}
                  </select>
                </div>

                {!selectedPlan.isCustomMeeting && (
                  /* Billing Cycle Switcher */
                  <div className="my-4">
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      {lang === 'en' ? 'Choose Billing Frequency:' : 'اختر دورة الفوترة:'}
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setBilling('monthly')}
                        className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                          billing === 'monthly'
                            ? 'bg-white text-[#0f2c59] shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {lang === 'en' ? 'Monthly' : 'شهري'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setBilling('annual')}
                        className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer relative ${
                          billing === 'annual'
                            ? 'bg-[#0f2c59] text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {lang === 'en' ? 'Annual (Save 2 Mo.)' : 'سنوي (وفّر شهرين)'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Pricing Calculation */}
                {selectedPlan.isCustomMeeting ? (
                  <div className="py-4 border-t border-b border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 font-bold">{lang === 'en' ? 'Meeting Fee:' : 'رسوم جلسة العمل:'}</span>
                      <span className="font-price font-black text-emerald-600 text-sm">{lang === 'en' ? 'Free 1-on-1' : 'مجانية بالكامل'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {lang === 'en'
                        ? 'Custom deployment & pricing will be agreed upon during your strategy session.'
                        : 'يتم تحديد خطة الأسعار والميزات الخاصة أثناء جلسة التخطيط وفق متطلبات السنتر.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 py-4 border-t border-b border-slate-100 text-xs">
                    {/* Limited Time Discount Line */}
                    {selectedPlan.originalMonthlyPrice && (
                      <div className="flex justify-between text-rose-600 bg-rose-50 p-2 rounded-xl items-center font-bold">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-600" />
                          {lang === 'en' ? 'Limited Time Launch Discount:' : 'خصم خاص لفترة محدودة:'}
                        </span>
                        <span className="font-price font-bold">
                          {billing === 'annual'
                            ? `-EGP ${(selectedPlan.originalMonthlyPrice * 12) - selectedPlan.annualPrice}`
                            : `-EGP ${selectedPlan.originalMonthlyPrice - selectedPlan.monthlyPrice}`}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600">
                      <span>{lang === 'en' ? 'Plan Base Fee:' : 'قيمة الباقة:'}</span>
                      <span className="font-price font-bold text-slate-800">
                        {billing === 'annual'
                          ? `EGP ${selectedPlan.annualPrice} / year`
                          : `EGP ${selectedPlan.monthlyPrice} / month`}
                      </span>
                    </div>

                    {billing === 'annual' && selectedPlan.annualSaving > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-xl">
                        <span>{lang === 'en' ? 'Annual Discount (Pay 10, Get 12):' : 'خصم السنوي (ادفع 10 واحصل على 12):'}</span>
                        <span className="font-price font-bold">-EGP {selectedPlan.annualSaving}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-black text-slate-900 text-sm pt-2">
                      <span>{lang === 'en' ? 'Total Due Today:' : 'المبلغ المطلوب:'}</span>
                      <span className="font-price text-2xl font-black text-[#0f2c59]">
                        {formatPrice(finalPrice, lang)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Features Highlights */}
                <div className="pt-4">
                  <p className="text-xs font-bold text-slate-700 mb-2">
                    {lang === 'en' ? `Included in ${selectedPlan.name}:` : `المميزات المتضمنة في باقة ${selectedPlan.nameAr}:`}
                  </p>
                  <ul className="space-y-2">
                    {(lang === 'en' ? selectedPlan.features : selectedPlan.featuresAr).map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <Check className="size-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {lang === 'en' ? '100% Student Data Protection' : 'حماية بيانات الطلاب بنسبة 100%'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {lang === 'en'
                        ? 'We never delete your records or hold your data hostage'
                        : 'لا نقوم بحذف أي سجل لطالب على الإطلاق حتى عند تجاوز السعة'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {lang === 'en' ? '3-Day Free Trial on Paid Plans' : 'تجربة مجانية كاملة 3 أيام'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {lang === 'en'
                        ? 'Test in your centers with zero upfront commitment'
                        : 'جرّب المنصة في سناترك بكامل طاقتها بدون أي مخاطرة'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* INSTAPAY POP-UP MODAL (Triggered when user is serious)        */}
      {/* ============================================================== */}
      {showInstaPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-slate-100 my-8">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowInstaPayModal(false)}
              className="absolute top-5 end-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold mb-2">
                <Smartphone className="w-3.5 h-3.5 text-[#0f2c59]" />
                <span>InstaPay Official Gateway</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {lang === 'en' ? 'Complete Payment via InstaPay' : 'سداد الاشتراك عبر تطبيق إنستاباي'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'en'
                  ? 'Scan the QR code or transfer directly to the official handle below'
                  : 'امسح كود الـ QR بكاميرا تطبيق إنستاباي أو حوّل للمعرف المعتمد أدناه'}
              </p>
            </div>

            {/* Amount Banner */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 mb-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">
                  {lang === 'en' ? 'Subscription Amount:' : 'المبلغ المطلوب سداده:'}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Classio {selectedPlan.name} ({billing === 'annual' ? (lang === 'en' ? 'Annual' : 'سنوي') : (lang === 'en' ? 'Monthly' : 'شهري')})
                </span>
              </div>
              <span className="font-price text-xl font-black text-[#0f2c59]">
                {formatPrice(finalPrice, lang)}
              </span>
            </div>

            {/* Centered QR Code Image */}
            <div className="text-center mb-5">
              <div className="inline-block p-3 rounded-3xl bg-white border-2 border-slate-200 shadow-md">
                <img
                  src="/images/instapay-qr.png"
                  alt="InstaPay QR Code"
                  className="w-52 sm:w-56 h-auto mx-auto rounded-xl object-contain"
                />
              </div>
              <p className="text-[11px] font-bold text-slate-500 mt-2">
                {lang === 'en'
                  ? 'Scan with your InstaPay mobile app for instant payment'
                  : 'امسح الكود بكاميرا تطبيق InstaPay للتحويل الفوري المباشر'}
              </p>
            </div>

            {/* InstaPay Account Handle Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  {lang === 'en' ? 'Official InstaPay Address (IPA):' : 'معرف إنستاباي المعتمد (InstaPay IPN):'}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('sayed017@instapay', 'modal_handle')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f2c59] hover:underline cursor-pointer"
                >
                  {copiedKey === 'modal_handle' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'modal_handle' ? (lang === 'en' ? 'Copied!' : 'تم النسخ!') : (lang === 'en' ? 'Copy Handle' : 'نسخ المعرف')}</span>
                </button>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-slate-200 font-mono text-center font-black text-sm text-[#0f2c59]">
                sayed017@instapay
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>{lang === 'en' ? 'Account Email:' : 'البريد المرتبط بالحساب:'}</span>
                <span className="font-mono font-semibold text-slate-700">sayed017@gmail.com</span>
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleConfirmSubscription} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Sender Name or Reference Number' : 'اسم صاحب الحساب المحوِّل منه أو رقم العملية (مرجع الحوالة)'}
                </label>
                <input
                  type="text"
                  required
                  value={senderRef}
                  onChange={(e) => setSenderRef(e.target.value)}
                  placeholder={lang === 'en' ? 'e.g. Ahmed Mahmoud / IPN-9988' : 'مثال: أ. أحمد محمود / رقم الحوالة'}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Phone Number for Confirmation' : 'رقم الهاتف لتأكيد وصول التحويل'}
                </label>
                <input
                  type="tel"
                  required
                  value={senderPhoneInput}
                  onChange={(e) => setSenderPhoneInput(e.target.value)}
                  dir="ltr"
                  placeholder="010XXXXXXXX"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition cursor-pointer mt-2"
              >
                {loading
                  ? lang === 'en' ? 'Confirming Payment...' : 'جاري تأكيد السداد...'
                  : lang === 'en'
                  ? `Confirm Payment Sent (${formatPrice(finalPrice, lang)}) & Activate Plan`
                  : `تأكيد إرسال التحويل (${formatPrice(finalPrice, lang)}) وتفعيل الباقة الآن`}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-bold text-xs text-slate-500">Loading Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
