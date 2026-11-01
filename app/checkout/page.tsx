'use client'

import React, { useState, Suspense } from 'react'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { PRICING_PLANS, PRICING_RULES } from '@/lib/plans'
import { storage } from '@/lib/storage'
import { adminStorage } from '@/lib/admin-storage'
import { PlanTier, BillingCycle } from '@/lib/types'
import { ClassioLogo } from '@/components/ui/classio-logo'
import { formatPrice } from '@/lib/localization'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialPlanId = (searchParams.get('plan') || 'growth') as PlanTier
  const initialBilling = (searchParams.get('billing') || 'annual') as BillingCycle

  const { lang, toggleLang, isRTL } = useLanguage()

  const [planId, setPlanId] = useState<PlanTier>(initialPlanId)
  const [billing, setBilling] = useState<BillingCycle>(initialBilling)
  const [paymentMethod, setPaymentMethod] = useState<'instapay' | 'vodafone_cash' | 'fawry' | 'card'>('instapay')
  const [copiedKey, setCopiedKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Transaction form states
  const [senderRef, setSenderRef] = useState('')
  const [walletPhone, setWalletPhone] = useState('')
  const [fawryPhone, setFawryPhone] = useState('')
  const [fawryCode, setFawryCode] = useState(`78${Math.floor(100000 + Math.random() * 900000)}`)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')

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
      const profile = await storage.getProfile()
      const refCode = senderRef || walletPhone || fawryCode || `TXN-${Math.floor(100000 + Math.random() * 900000)}`

      // If paying by card: instant activation
      if (paymentMethod === 'card') {
        const updatedProfile = {
          ...profile,
          subscription_plan: selectedPlan.id,
          subscription_cycle: billing,
          max_students_limit: selectedPlan.studentsLimit,
        }
        await storage.saveProfile(updatedProfile)
        setSuccess(true)
      } else {
        // If InstaPay, Vodafone Cash, Fawry: submit to Super Admin verification queue
        adminStorage.submitSubscriptionRequest({
          tutor_id: profile.id || 'tutor-1',
          tutor_name: profile.name,
          tutor_email: profile.email || 'ahmed.mahmoud@example.com',
          plan_id: selectedPlan.id,
          billing_cycle: billing,
          amount: finalPrice,
          payment_method: paymentMethod,
          transaction_ref: refCode,
          sender_phone: walletPhone || fawryPhone || profile.phone,
          admin_notes: `طلب ترقية عبر ${paymentMethod} بمبلغ ${finalPrice} ج.م`,
        })
        setSuccess(true)
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const finalPrice =
    billing === 'annual' ? selectedPlan.annualPrice : selectedPlan.monthlyPrice

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
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
            {lang === 'en' ? '← All Plans' : '← خطط الأسعار'}
          </Link>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#0f2c59]" />
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
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 ${paymentMethod === 'card' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              {paymentMethod === 'card'
                ? lang === 'en'
                  ? 'Subscription Activated!'
                  : 'تم تفعيل اشتراكك بنجاح!'
                : lang === 'en'
                ? 'Payment Submitted for Verification!'
                : 'تم استلام إشعار السداد وقيد التحقق المالي!'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              {paymentMethod === 'card'
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
                <span>{lang === 'en' ? 'Billing Cycle:' : 'دورة الفوترة:'}</span>
                <span>{billing === 'annual' ? (lang === 'en' ? 'Annual (12 Months)' : 'سنوي (١٢ شهر)') : (lang === 'en' ? 'Monthly' : 'شهري')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{lang === 'en' ? 'Student Capacity:' : 'الحد الأقصى للطلاب:'}</span>
                <span>{selectedPlan.studentsLabel}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700 pt-2 border-t border-slate-200">
                <span>{lang === 'en' ? 'Total Amount:' : 'الإجمالي:'}</span>
                <span>{formatPrice(finalPrice, lang)}</span>
              </div>
            </div>

            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3.5 rounded-2xl bg-[#0f2c59] hover:bg-[#1a3d6d] text-white font-bold text-xs shadow-md cursor-pointer"
            >
              {lang === 'en' ? 'Enter My Dashboard Now' : 'دخول لوحة تحكم المدرس الآن'}
            </Button>
          </div>
        ) : (
          /* Checkout Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: Payment Method & Details (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
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
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'vodafone_cash' && (
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        {lang === 'en' ? 'Vodafone Cash Wallet Number:' : 'رقم محفظة فودافون كاش:'}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('01023456789', 'vodafone')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        {copiedKey === 'vodafone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'vodafone' ? (lang === 'en' ? 'Copied!' : 'تم النسخ!') : (lang === 'en' ? 'Copy Number' : 'نسخ الرقم')}</span>
                      </button>
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-slate-200 font-mono text-base font-bold text-slate-900 text-center tracking-wider">
                      01023456789
                    </div>

                    <div className="text-[11px] text-slate-500 leading-relaxed">
                      {lang === 'en'
                        ? 'Transfer from any Vodafone Cash, Orange Cash, or Etisalat Cash wallet. Dial *9*7# on Vodafone or use the app.'
                        : 'التحويل متاح من أي محفظة إلكترونية (فودافون، أورنج، اتصالات، أو البنوك). اطلب *9*7# أو استخدم التطبيق.'}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {lang === 'en' ? 'Your Wallet Number & Transaction Code' : 'رقم المحفظة المحول منها وكود العملية'}
                      </label>
                      <input
                        type="text"
                        required
                        value={walletPhone}
                        onChange={(e) => setWalletPhone(e.target.value)}
                        dir="ltr"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'fawry' && (
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        {lang === 'en' ? 'Your Fawry Payment Reference Code:' : 'كود الدفع المرجعي لخدمة فوري (Fawry):'}
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

                    <div className="bg-white rounded-xl p-3 border border-amber-300 font-mono text-xl font-black text-amber-900 text-center tracking-widest shadow-2xs">
                      {fawryCode}
                    </div>

                    <div className="text-[11px] text-slate-500 leading-relaxed">
                      {lang === 'en'
                        ? 'Pay at any Fawry merchant, kiosk, supermarket, or the myFawry mobile app using this 8-digit reference code within 48 hours.'
                        : 'توجه لأي منفذ فوري، سوبرماركت، صيدلية، أو عبر تطبيق myFawry وادفع برقم الكود المرجعي أعلاه (كود خدمة كلاسيو التعليمية).'}
                    </div>

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
                  className="w-full py-3.5 rounded-2xl bg-[#0f2c59] hover:bg-[#1a3d6d] text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  {loading
                    ? lang === 'en'
                      ? 'Activating Subscription...'
                      : 'جاري تفعيل الاشتراك...'
                    : lang === 'en'
                    ? `Confirm & Activate ${selectedPlan.name} Plan`
                    : `تأكيد وتفعيل باقة ${selectedPlan.nameAr}`}
                </Button>
              </form>
            </div>

            {/* Right Col: Order Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
                {/* Plan Switcher */}
                <div className="pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500">
                      {lang === 'en' ? 'Selected Plan:' : 'الخطة المختارة:'}
                    </span>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-black">
                      {selectedPlan.studentsLabel}
                    </span>
                  </div>

                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value as PlanTier)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-800 outline-none"
                  >
                    {PRICING_PLANS.map((p) => (
                      <option key={p.id} value={p.id}>
                        Classio {p.name} ({p.studentsLabel}) — {billing === 'annual' ? `${p.annualPrice} EGP/yr` : `${p.monthlyPrice} EGP/mo`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Billing Cycle Switcher */}
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

                {/* Pricing Calculation */}
                <div className="space-y-3 py-4 border-t border-b border-slate-100 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>{lang === 'en' ? 'Plan Base Fee:' : 'قيمة الباقة:'}</span>
                    <span className="font-bold">
                      {billing === 'annual'
                        ? `${selectedPlan.annualPrice} ${lang === 'en' ? 'EGP / Year' : 'ج.م / سنوياً'}`
                        : `${selectedPlan.monthlyPrice} ${lang === 'en' ? 'EGP / Month' : 'ج.م / شهرياً'}`}
                    </span>
                  </div>

                  {billing === 'annual' && selectedPlan.annualSaving > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-xl">
                      <span>{lang === 'en' ? 'Annual Discount (Pay 10, Get 12):' : 'خصم السنوي (ادفع 10 واحصل على 12):'}</span>
                      <span>-{selectedPlan.annualSaving} {lang === 'en' ? 'EGP' : 'ج.م'}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-black text-slate-900 text-sm pt-2">
                    <span>{lang === 'en' ? 'Total Due Today:' : 'المبلغ المطلوب:'}</span>
                    <span className="text-lg text-[#0f2c59]">
                      {formatPrice(finalPrice, lang)}
                    </span>
                  </div>
                </div>

                {/* Features Included List */}
                <div className="pt-4">
                  <h4 className="text-xs font-bold text-slate-700 mb-2.5">
                    {lang === 'en' ? 'Features Included:' : 'المميزات المضمنة في باقتك:'}
                  </h4>
                  <ul className="space-y-2">
                    {(lang === 'en' ? selectedPlan.features : selectedPlan.featuresAr).map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="bg-blue-50/70 rounded-3xl border border-blue-200/80 p-5 space-y-2 text-xs text-blue-950">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#0f2c59]" />
                  <span>{lang === 'en' ? 'Classio Tutor Guarantees' : 'ضمانات كلاسيو للمدرسين'}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {lang === 'en' ? PRICING_RULES.dataProtection.en : PRICING_RULES.dataProtection.ar}
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {lang === 'en' ? PRICING_RULES.freeForever.en : PRICING_RULES.freeForever.ar}
                </p>
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
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-xs font-bold text-slate-500">Loading Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
