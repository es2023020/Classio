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
  CreditCard,
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
  const [paymentMethod, setPaymentMethod] = useState<'instapay' | 'vodafone_cash' | 'fawry' | 'card'>('instapay')
  const [copiedKey, setCopiedKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Tutor account info states
  const [tutorName, setTutorName] = useState('')
  const [tutorEmail, setTutorEmail] = useState('')
  const [tutorPhone, setTutorPhone] = useState('')
  const [tutorSubject, setTutorSubject] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Transaction form states
  const [senderRef, setSenderRef] = useState('')
  const [walletPhone, setWalletPhone] = useState('')
  const [fawryPhone, setFawryPhone] = useState('')
  const [fawryCode, setFawryCode] = useState(`78${Math.floor(100000 + Math.random() * 900000)}`)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')

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

  const handleConfirmSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const finalEmail = (enterprisePhone ? `enterprise_${enterprisePhone}@classio.app` : tutorEmail || 'teacher@classio.app').trim().toLowerCase()
      const finalName = (enterpriseTutorName || tutorName || finalEmail.split('@')[0]).trim()
      const finalPhone = (enterprisePhone || tutorPhone || walletPhone || fawryPhone || '').trim()
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
        instapay_handle: '',
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
      })

      if (selectedPlan.isCustomMeeting) {
        adminStorage.submitSubscriptionRequest({
          tutor_id: tutorId,
          tutor_name: finalName,
          tutor_email: finalEmail,
          plan_id: 'enterprise',
          billing_cycle: billing,
          amount: 0,
          payment_method: 'card',
          transaction_ref: `MEETING-${Math.floor(100000 + Math.random() * 900000)}`,
          sender_phone: finalPhone,
          admin_notes: `طلب جلسة عمل خاصة للمؤسسات (+٥٠٠ طالب). السناتر: ${enterpriseCenterNames || 'غير محدد'}. عدد الطلاب المتوقع: ${enterpriseStudentsCount}. ملاحظات: ${enterpriseNotes}`,
        })
        setSuccess(true)
        setLoading(false)
        return
      }

      const refCode = senderRef || walletPhone || fawryCode || `TXN-${Math.floor(100000 + Math.random() * 900000)}`

      adminStorage.submitSubscriptionRequest({
        tutor_id: tutorId,
        tutor_name: finalName,
        tutor_email: finalEmail,
        plan_id: selectedPlan.id,
        billing_cycle: billing,
        amount: finalPrice,
        payment_method: paymentMethod,
        transaction_ref: refCode,
        sender_phone: walletPhone || fawryPhone || finalPhone,
        admin_notes: `سداد اشتراك كلاسيو عبر ${paymentMethod} بمبلغ ${finalPrice} ج.م`,
      })
      setSuccess(true)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const finalPrice =
    selectedPlan.isCustomMeeting
      ? 0
      : billing === 'annual'
      ? selectedPlan.annualPrice
      : selectedPlan.monthlyPrice

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
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 ${selectedPlan.isCustomMeeting ? 'bg-purple-100 text-purple-700' : paymentMethod === 'card' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              {selectedPlan.isCustomMeeting
                ? lang === 'en'
                  ? 'Strategy Meeting Requested!'
                  : 'تم استلام طلب جلسة العمل الخاصة بنجاح!'
                : paymentMethod === 'card'
                ? lang === 'en'
                  ? 'Subscription Activated!'
                  : 'تم تفعيل اشتراكك بنجاح!'
                : lang === 'en'
                ? 'Payment Submitted for Verification!'
                : 'تم استلام إشعار السداد وقيد التحقق المالي!'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              {selectedPlan.isCustomMeeting
                ? lang === 'en'
                  ? 'Our senior enterprise team has received your request. We will reach out on WhatsApp within 2 hours to confirm your 1-on-1 strategy meeting.'
                  : 'استلم فريق قيادة كلاسيو طلبك لجلسة العمل الخاصة (+٥٠٠ طالب). سنتواصل معك مباشرة عبر واتساب خلال ساعتين لتأكيد موعد الجلسة.'
                : paymentMethod === 'card'
                ? lang === 'en'
                  ? `You are now on the Classio ${selectedPlan.name} Plan. Your account can now host up to ${selectedPlan.studentsLimit} active students with full features.`
                  : `أنت الآن مشترك في باقة ${selectedPlan.nameAr}. تم توسيع سعة حسابك لتشمل حتى ${selectedPlan.studentsLimit} طالب نشط مع كامل المميزات.`
                : lang === 'en'
                ? `Your payment of ${finalPrice} EGP via ${paymentMethod} has been submitted. Our finance team is verifying the transfer and will activate your ${selectedPlan.name} plan shortly.`
                : `تم إرسال إشعار سداد مبلغ ${finalPrice} ج.م عبر (${paymentMethod}). جاري مطابقة التحويل في الحساب البنكي وسيتم تفعيل باقة (${selectedPlan.nameAr}) وتوسيع سعة الطلاب (${selectedPlan.studentsLimit} طالب) فور الاعتماد.`}
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
                      ? 'Accepted Egyptian payment channels: InstaPay, Vodafone Cash, Fawry Pay, or Bank Cards'
                      : 'طرق الدفع المصرية المعتمدة: إنستاباي، فودافون كاش، خدمة فوري، أو البطاقات البنكية'}
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

                  <div className="text-xs font-bold text-slate-800 mb-2">
                    {lang === 'en' ? '2. Select Payment Method' : '٢. اختر وسيلة الدفع'}
                  </div>

                  {/* Payment Method Selector Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('instapay')}
                      className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                        paymentMethod === 'instapay'
                          ? 'border-[#0f2c59] bg-blue-50/60 ring-2 ring-[#0f2c59]/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-[#0f2c59]" />
                      <span className="text-xs font-bold text-slate-900">InstaPay</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{lang === 'en' ? 'Instant Bank' : 'تحويل لحظي'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('vodafone_cash')}
                      className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                        paymentMethod === 'vodafone_cash'
                          ? 'border-[#0f2c59] bg-rose-50/60 ring-2 ring-[#0f2c59]/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Building className="w-5 h-5 text-rose-600" />
                      <span className="text-xs font-bold text-slate-900">{lang === 'en' ? 'Vodafone' : 'فودافون كاش'}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{lang === 'en' ? 'Wallets' : 'محافظ المحمول'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('fawry')}
                      className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                        paymentMethod === 'fawry'
                          ? 'border-[#0f2c59] bg-amber-50/60 ring-2 ring-[#0f2c59]/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Store className="w-5 h-5 text-amber-600" />
                      <span className="text-xs font-bold text-slate-900">{lang === 'en' ? 'Fawry Pay' : 'فوري كود'}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{lang === 'en' ? 'Kiosks' : 'أي سوبرماركت'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                        paymentMethod === 'card'
                          ? 'border-[#0f2c59] bg-emerald-50/60 ring-2 ring-[#0f2c59]/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">{lang === 'en' ? 'Bank Card' : 'بطاقة بنكية'}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">Meeza / Visa</span>
                    </button>
                  </div>

                  {/* Form Content per Method */}
                  <form onSubmit={handleConfirmSubscription} className="space-y-4">
                    {paymentMethod === 'instapay' && (
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">
                            {lang === 'en' ? 'Official InstaPay Address:' : 'معرف إنستاباي المعتمد (InstaPay):'}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('classio.eg@instapay', 'instapay')}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f2c59] hover:underline cursor-pointer"
                          >
                            {copiedKey === 'instapay' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === 'instapay' ? (lang === 'en' ? 'Copied!' : 'تم النسخ!') : (lang === 'en' ? 'Copy Handle' : 'نسخ المعرف')}</span>
                          </button>
                        </div>

                        <div className="bg-white rounded-xl p-3 border border-slate-200 font-mono text-sm font-bold text-slate-900 text-center">
                          classio.eg@instapay
                        </div>

                        <div className="text-[11px] text-slate-500 leading-relaxed">
                          {lang === 'en'
                            ? 'Transfer the subscription fee using your InstaPay mobile banking app, then enter your account name or transfer reference number below.'
                            : 'قم بالتحويل عبر تطبيق إنستاباي البنكي على المعرف أعلاه، ثم اكتب اسم الحساب المحوِّل منه أو رقم العملية بالأسفل.'}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            {lang === 'en' ? 'Sender Account Name / Reference Number' : 'اسم حساب الراسل أو رقم الحوالة'}
                          </label>
                          <input
                            type="text"
                            required
                            value={senderRef}
                            onChange={(e) => setSenderRef(e.target.value)}
                            placeholder={lang === 'en' ? 'e.g. Ahmed Mahmoud / IPN-9988' : 'مثال: أ. أحمد محمود / رقم العملية'}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'vodafone_cash' && (
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">
                            {lang === 'en' ? 'Classio Official Business Wallet:' : 'محفظة كلاسيو الرسمية المعتمدة:'}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('201299930937', 'vfcash')}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                          >
                            {copiedKey === 'vfcash' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === 'vfcash' ? (lang === 'en' ? 'Copied!' : 'تم النسخ!') : (lang === 'en' ? 'Copy Wallet' : 'نسخ رقم المحفظة')}</span>
                          </button>
                        </div>

                        <div className="bg-white rounded-xl p-3 border border-slate-200 font-bold text-rose-600 text-center text-xs">
                          {lang === 'en' ? 'Official Classio Business Wallet Account' : 'حساب محفظة كلاسيو التجارية المعتمدة'}
                        </div>

                        <div className="text-[11px] text-slate-500 leading-relaxed">
                          {lang === 'en'
                            ? 'Send the exact subscription amount from any Egyptian mobile wallet (Vodafone, Orange, Etisalat, WE Pay), then enter your sender phone number below.'
                            : 'حوّل المبلغ المطلوب من أي محفظة إلكترونية (فودافون كاش، اتصالات، أورنج، وي باي)، ثم اكتب رقم هاتفك المحوِّل منه أدناه.'}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            {lang === 'en' ? 'Sender Wallet Phone Number' : 'رقم المحفظة التي حوّلت منها'}
                          </label>
                          <input
                            type="tel"
                            required
                            value={walletPhone}
                            onChange={(e) => setWalletPhone(e.target.value)}
                            dir="ltr"
                            placeholder="010XXXXXXXX"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'fawry' && (
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">
                            {lang === 'en' ? 'Fawry Payment Code:' : 'كود سداد فوري الخاص بك:'}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(fawryCode, 'fawry')}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
                          >
                            {copiedKey === 'fawry' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === 'fawry' ? (lang === 'en' ? 'Copied!' : 'تم النسخ!') : (lang === 'en' ? 'Copy Code' : 'نسخ الكود')}</span>
                          </button>
                        </div>

                        <div className="bg-white rounded-xl p-3 border border-slate-200 font-mono text-lg font-black text-amber-600 text-center tracking-widest" dir="ltr">
                          {fawryCode}
                        </div>

                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {lang === 'en'
                            ? 'Head to any supermarket, kiosk, or pharmacy with a Fawry machine and pay under "Classio Services" using this reference code.'
                            : 'توجّه لأي سوبرماركت أو كشك به ماكينة فوري واطلب دفع كود الخدمة المرجعي أعلاه (خدمات كلاسيو للتعليم).'}
                        </p>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            {lang === 'en' ? 'Phone Number to Receive Fawry SMS Receipt' : 'رقم الهاتف لاستلام إشعار سداد فوري بالرسائل'}
                          </label>
                          <input
                            type="tel"
                            required
                            value={fawryPhone}
                            onChange={(e) => setFawryPhone(e.target.value)}
                            dir="ltr"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            {lang === 'en' ? 'Card Number' : 'رقم البطاقة البنكية'}
                          </label>
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            dir="ltr"
                            placeholder="4000 1234 5678 9010"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#0f2c59]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              {lang === 'en' ? 'Expiry Date' : 'تاريخ الانتهاء'}
                            </label>
                            <input
                              type="text"
                              required
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              dir="ltr"
                              placeholder="MM/YY"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#0f2c59]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              {lang === 'en' ? 'Security Code (CVC)' : 'رمز الأمان (CVC)'}
                            </label>
                            <input
                              type="password"
                              required
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              maxLength={4}
                              dir="ltr"
                              placeholder="123"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#0f2c59]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3-Day Free Trial Notice */}
                    <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                      <Zap className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>
                        {lang === 'en'
                          ? '3-Day Free Trial: Available to every new tutor trying a paid plan.'
                          : 'تجربة مجانية لمدة 3 أيام: متاحة لكل مدرس جديد عند تجربة أي خطة مدفوعة.'}
                      </span>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-2xl bg-[#0f2c59] hover:bg-[#1a3d6d] text-white font-black text-xs shadow-md transition cursor-pointer"
                    >
                      {loading
                        ? lang === 'en' ? 'Activating Subscription...' : 'جاري تفعيل الاشتراك...'
                        : lang === 'en'
                        ? `Confirm & Activate ${selectedPlan.name} Plan`
                        : `تأكيد وتفعيل باقة ${selectedPlan.nameAr}`}
                    </Button>
                  </form>
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
