'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Check,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Zap,
  HelpCircle,
  UsersRound,
  CalendarCheck,
  Receipt,
  FileSpreadsheet,
  Headphones,
  Award,
  Globe,
  Sliders,
  Calendar,
  PhoneCall,
  Clock,
  Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { PRICING_PLANS, PRICING_RULES } from '@/lib/plans'
import { BillingCycle, PlanTier } from '@/lib/types'
import { ClassioLogo } from '@/components/ui/classio-logo'
import { formatPrice } from '@/lib/localization'

export default function PricingPage() {
  const { lang, toggleLang, isRTL } = useLanguage()
  const [billing, setBilling] = useState<BillingCycle>('monthly')
  const [studentCount, setStudentCount] = useState<number>(65)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Determine which plan corresponds to the slider
  const recommendedPlanId: PlanTier =
    studentCount <= 10
      ? 'free'
      : studentCount <= 30
      ? 'starter'
      : studentCount <= 99
      ? 'growth'
      : studentCount <= 250
      ? 'pro'
      : studentCount <= 500
      ? 'power'
      : 'enterprise'

  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight

  const faqs = [
    {
      q: {
        en: 'How does the 3-day free trial work?',
        ar: 'كيف تعمل فترة التجربة المجانية لمدة 3 أيام؟',
      },
      a: {
        en: 'Every paid plan (Starter, Growth, Pro, Power) includes an instant 3-day full-access trial. You get full access to all features immediately with zero risk, allowing you to test attendance, WhatsApp cards, and payments in your center.',
        ar: 'تتضمن جميع الخطط المدفوعة فترة تجربة مجانية كاملة المزايا لمدة 3 أيام فورية. يمكنك اختبار إدارة الحصص، رسائل الواتساب، والتحصيل في السنتر بدون أي مخاطرة أو التزام مالي مسبق.',
      },
    },
    {
      q: {
        en: 'Are these prices really for a limited time?',
        ar: 'هل هذه الأسعار سارية لفترة محدودة بالفعل؟',
      },
      a: {
        en: 'Yes! These discounted introductory rates are active for the current academic launch window. Once you subscribe, your rate is locked in for the entire active subscription cycle.',
        ar: 'نعم! هذه الأسعار الترويجية المخفضة متاحة لفترة محدودة بمناسبة انطلاق العام الدراسي. عند اشتراكك الآن، يُثبَّت هذا السعر المخفض لحسابك طوال استمرار اشتراكك.',
      },
    },
    {
      q: {
        en: 'How does the Enterprise plan and the 1-on-1 meeting work?',
        ar: 'كيف تعمل خطة المؤسسات (Enterprise) وجلسة العمل الخاصة؟',
      },
      a: {
        en: 'For educators and centers with over 500 active students, we arrange a dedicated 1-on-1 strategy meeting with Classio leadership. We analyze your center structure, multiple assistants, and tailor custom software workflows for your teaching methodology.',
        ar: 'لكبار المعلمين والسناتر والمراكز التي تضم أكثر من 500 طالب نشط، نقوم بعقد جلسة عمل خاصة 1-on-1 مع قيادة كلاسيو لمناقشة هيكل السنتر والمساعدين وتخصيص ميزات برمجية مخصصة بالكامل حسب طريقة تدريسك.',
      },
    },
    {
      q: {
        en: 'Which Egyptian payment methods do you accept?',
        ar: 'ما هي طرق الدفع المصرية المقبولة للاشتراك؟',
      },
      a: {
        en: 'We currently accept instant bank transfers via InstaPay (IPN handle: sayed017@instapay). Vodafone Cash and Fawry will be available soon.',
        ar: 'نقبل حالياً التحويل اللحظي المباشر عبر تطبيق إنستاباي (InstaPay) على المعرف (sayed017@instapay). وسيتوفر الدفع عبر فودافون كاش وفوري قريباً.',
      },
    },
    {
      q: {
        en: 'What is the benefit of the annual subscription?',
        ar: 'ما هي ميزة ومقدار التوفير في الاشتراك السنوي؟',
      },
      a: {
        en: 'With annual billing, you pay for only 10 months and receive 12 months of full access — you save 2 complete months (saving up to 1,598 EGP on Power plan).',
        ar: 'في الاشتراك السنوي، تدفع قيمة 10 أشهر فقط وتستمتع بـ 12 شهراً كاملاً — أي أنك توفر شهرين كاملين مجاناً (توفير يصل حتى 1,598 ج.م سنوياً في باقة قوة).',
      },
    },
    {
      q: {
        en: 'Is the Free plan truly free forever?',
        ar: 'هل الخطة المجانية (Free) مجانية للأبد بالفعل؟',
      },
      a: {
        en: 'Yes, 100%. If you manage 1 to 10 active students, Classio is completely free forever with no credit card required and no expiration date.',
        ar: 'نعم بنسبة 100%. إذا كنت تدير من 1 إلى 10 طلاب نشطين، تظل منصة كلاسيو مجانية تماماً للأبد بدون أي بطاقة بنكية وبدون أي تاريخ انتهاء.',
      },
    },
  ]

  const featureMatrix = [
    {
      title: { en: 'Student Capacity', ar: 'سعة عدد الطلاب' },
      values: ['1–10', '11–30', '31–99', '100–250', '251–500', '+500 (Custom)'],
    },
    {
      title: { en: 'Daily Attendance & Absence Tracking', ar: 'تسجيل الحضور والغياب اليومي' },
      values: [true, true, true, true, true, true],
    },
    {
      title: { en: 'Payment Ledger & Digital Receipts', ar: 'سجل المدفوعات والإيصالات الرقمية' },
      values: [true, true, true, true, true, true],
    },
    {
      title: { en: 'InstaPay & Vodafone Cash Support', ar: 'دعم إنستاباي وفودافون كاش' },
      values: [true, true, true, true, true, true],
    },
    {
      title: { en: 'Class Scheduling & Timetables', ar: 'جدول الحصص ومواعيد السناتر' },
      values: [false, true, true, true, true, true],
    },
    {
      title: { en: 'Homework & Lesson Notes', ar: 'متابعة الواجبات وتحضير الحصص' },
      values: [false, false, true, true, true, true],
    },
    {
      title: { en: 'Student Success Profiles & Topic Mastery', ar: 'ملفات نجاح الطلاب ومصفوفة إتقان الدروس' },
      values: [false, false, true, true, true, true],
    },
    {
      title: { en: 'WhatsApp Progress Cards to Parents', ar: 'كروت التقدم الأكاديمي الشهرية لواتساب' },
      values: [false, false, true, true, true, true],
    },
    {
      title: { en: 'Fast Barcode / ID Scanner', ar: 'قارئ الباركود ومسح كود الطالب السريع' },
      values: [false, false, false, true, true, true],
    },
    {
      title: { en: 'Advanced Financial Analytics', ar: 'تحليلات مالية متقدمة وإيرادات السناتر' },
      values: [false, false, false, true, true, true],
    },
    {
      title: { en: 'Bulk Student Excel / CSV Import & Export', ar: 'استيراد وتصدير بيانات الطلاب Excel / CSV' },
      values: [false, false, false, true, true, true],
    },
    {
      title: { en: 'Automated Batch WhatsApp Queue', ar: 'طابور رسائل واتساب الجماعي التلقائي' },
      values: [false, false, false, false, true, true],
    },
    {
      title: { en: '1-on-1 Strategy Meeting & Custom Tailoring', ar: 'جلسة عمل خاصة 1-on-1 وتطوير ميزات حسب الطلب' },
      values: [false, false, false, false, false, true],
    },
    {
      title: { en: 'Dedicated Account Manager & VIP Support', ar: 'مدير حساب مخصص ودعم فني VIP مباشر' },
      values: [false, false, false, false, false, true],
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Limited-Time Urgency Announcement Bar */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white text-xs font-black py-2.5 px-4 text-center shadow-inner relative z-30 flex items-center justify-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[11px] tracking-wide uppercase">
          <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-bounce" />
          {lang === 'en' ? 'Limited Time Offer' : 'عرض خاص لفترة محدودة'}
        </span>
        <span className="font-bold">
          {lang === 'en'
            ? '🔥 Special Launch Rates: Free up to 10 students, Starter at 99 EGP, Growth at 299 EGP, Pro at 449 EGP, Power at 799 EGP! Lock in your price today.'
            : '🔥 خصومات إطلاق كلاسيو لفترة محدودة: مجاني حتى 10 طلاب، بداية 99 ج.م، نمو 299 ج.م، احترافي 449 ج.م، قوة 799 ج.م! ثبّت باقتك الآن.'}
        </span>
      </div>

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="inline-block group">
            <ClassioLogo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <Link href="/" className="hover:text-[#0f2c59] transition">
              {lang === 'en' ? 'Overview' : 'الرئيسية'}
            </Link>
            <Link href="/pricing" className="text-[#0f2c59] border-b-2 border-[#0f2c59] pb-1">
              {lang === 'en' ? 'Pricing Plans' : 'خطط الأسعار'}
            </Link>
            <Link href="/partnerships" className="hover:text-[#0f2c59] transition">
              {lang === 'en' ? 'Partnerships' : 'الشراكات'}
            </Link>
            <Link href="/login" className="hover:text-[#0f2c59] transition">
              {lang === 'en' ? 'Sign In' : 'تسجيل الدخول'}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <Globe className="size-3.5 text-[#0f2c59]" />
              <span>{lang === 'en' ? 'عربي' : 'English'}</span>
            </button>

            <Link href="/login" className="hidden sm:inline-block">
              <Button variant="outline" className="text-xs font-bold rounded-xl px-4 cursor-pointer">
                {lang === 'en' ? 'Tutor Sign In' : 'دخول المدرس'}
              </Button>
            </Link>

            <Link href="/checkout?plan=growth&billing=annual">
              <Button className="bg-[#0f2c59] hover:bg-[#1a3d6d] text-white text-xs font-black rounded-xl px-4 cursor-pointer shadow-sm">
                {lang === 'en' ? 'Try Free for 3 Days' : 'جرب مجاناً لمدة 3 أيام'}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-10 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100/70 border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 mb-4 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>
              {lang === 'en'
                ? '⚡ Limited Time Introductory Pricing • 3-Day Free Trial'
                : '⚡ أسعار مخفضة لفترة محدودة بمناسبة العام الدراسي • تجربة مجانية 3 أيام'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {lang === 'en' ? (
              <>
                Simple, Transparent Plans Built for{' '}
                <span className="text-[#0f2c59] underline decoration-amber-400 decoration-wavy decoration-2">
                  Private Tutors
                </span>
              </>
            ) : (
              <>
                خطط اشتراك شفافة ومدروسة مصممة خصيصاً{' '}
                <span className="text-[#0f2c59] underline decoration-amber-400 decoration-wavy decoration-2">
                  للمعلم الخصوصي في مصر
                </span>
              </>
            )}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {lang === 'en'
              ? 'Manage attendance, collect center fees via InstaPay & Vodafone Cash, and delight parents with progress cards. Free forever for up to 10 students.'
              : 'تابع الحضور، حصّل اشتراكات السنتر عبر إنستاباي وفودافون كاش، وأبهر أولياء الأمور بكروت المتابعة. مجاناً للأبد حتى 10 طلاب.'}
          </p>

          {/* Interactive Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center p-1.5 bg-slate-200/80 rounded-2xl shadow-inner border border-slate-300/70">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 text-xs font-black rounded-xl transition cursor-pointer ${
                billing === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'en' ? 'Monthly Billing' : 'الاشتراك الشهري'}
            </button>

            <button
              onClick={() => setBilling('annual')}
              className={`relative px-5 py-2 text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                billing === 'annual'
                  ? 'bg-[#0f2c59] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{lang === 'en' ? 'Annual Billing' : 'الاشتراك السنوي'}</span>
              <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-slate-950">
                {lang === 'en' ? 'Save 2 Months Free' : 'وفّر شهرين مجاناً'}
              </span>
            </button>
          </div>

          <p className="mt-2.5 text-xs font-bold text-emerald-700">
            {lang === 'en'
              ? '✨ Pay for 10 months and enjoy 12 months of full access on any plan'
              : '✨ ادفع قيمة 10 شهور فقط واحصل على 12 شهراً كاملاً (وفر حتى 1,598 ج.م)'}
          </p>
        </div>
      </section>

      {/* Interactive Student Slider / Plan Finder */}
      <section className="max-w-4xl mx-auto w-full px-4 sm:px-6 -mt-4 mb-8 z-10 relative">
        <div className="rounded-3xl bg-white border-2 border-[#0f2c59]/20 p-5 sm:p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="size-4 text-[#0f2c59]" />
                <h3 className="text-sm font-black text-slate-900">
                  {lang === 'en' ? 'Interactive Plan Finder:' : 'مكتشف الخطة المثالية لعدد طلابك:'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'en'
                  ? 'Drag the slider to your current active student count to see your recommended plan'
                  : 'حرّك المؤشر حسب عدد طلابك الحاليين لاقتراح الخطة الأنسب لك فوراً'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-price text-3xl font-black text-[#0f2c59]">{studentCount > 500 ? '+500' : studentCount}</span>
              <span className="text-xs font-bold text-slate-500">{lang === 'en' ? 'Students' : 'طالباً'}</span>
            </div>
          </div>

          <div className="mt-4">
            <input
              type="range"
              min="1"
              max="550"
              value={studentCount}
              onChange={(e) => setStudentCount(Number(e.target.value))}
              className="w-full accent-[#0f2c59] cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-1">
              <span>1–10 (Free)</span>
              <span>30 (Starter)</span>
              <span>99 (Growth)</span>
              <span>250 (Pro)</span>
              <span>500 (Power)</span>
              <span>+500 (Enterprise)</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs font-bold border-t border-slate-100 pt-3">
            <span className="text-slate-600">
              {lang === 'en' ? 'Recommended Tier for You:' : 'الخطة المقترحة لك:'}{' '}
              <span className="text-[#0f2c59] font-black uppercase underline">
                {lang === 'en' ? recommendedPlanId : PRICING_PLANS.find((p) => p.id === recommendedPlanId)?.nameAr}
              </span>
            </span>

            <Link
              href={`/checkout?plan=${recommendedPlanId}&billing=${billing}`}
              className="inline-flex items-center gap-1 text-[#0f2c59] font-black hover:underline cursor-pointer"
            >
              <span>{lang === 'en' ? 'Select This Plan' : 'اختيار هذه الخطة'}</span>
              <ArrowIcon className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid (6 Plans) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRICING_PLANS.map((plan) => {
            const isRecommended = plan.id === recommendedPlanId
            const isPopular = plan.popular
            const isEnterprise = plan.id === 'enterprise'
            const isFree = plan.id === 'free'

            const price = billing === 'annual' ? plan.annualPrice : plan.monthlyPrice
            const periodLabel = isFree
              ? (lang === 'en' ? 'Forever Free' : 'مجاني للأبد')
              : billing === 'annual'
              ? (lang === 'en' ? '/year' : '/سنوياً')
              : (lang === 'en' ? '/month' : '/شهرياً')

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl p-6 transition-all duration-300 ${
                  isPopular
                    ? 'bg-gradient-to-b from-[#0f2c59] to-[#0a1e3f] text-white shadow-2xl ring-4 ring-[#0f2c59]/25 scale-[1.02] z-10'
                    : isRecommended
                    ? 'bg-white border-2 border-emerald-500 shadow-lg ring-2 ring-emerald-500/20'
                    : isEnterprise
                    ? 'bg-gradient-to-b from-purple-950/20 to-slate-900/10 border-2 border-purple-400/40 bg-white shadow-md'
                    : 'bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300'
                }`}
              >
                {/* Badges */}
                <div className="flex items-center justify-between min-h-6 mb-2">
                  <div className="flex gap-1.5 flex-wrap">
                    {isPopular && (
                      <span className="rounded-full bg-amber-400 px-3 py-0.5 text-[11px] font-black text-slate-950 shadow-xs">
                        {lang === 'en' ? '★ Most Popular' : '★ الأكثر طلباً'}
                      </span>
                    )}
                    {isEnterprise && (
                      <span className="rounded-full bg-purple-100 text-purple-900 border border-purple-300 px-3 py-0.5 text-[11px] font-black">
                        {lang === 'en' ? '👑 Custom Meeting' : '👑 جلسة خاصة (+٥٠٠)'}
                      </span>
                    )}
                    {isFree && (
                      <span className="rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-0.5 text-[11px] font-black">
                        {lang === 'en' ? '🌱 Start Here' : '🌱 ابدأ مجاناً (حتى 10 طلاب)'}
                      </span>
                    )}
                    {!isFree && !isEnterprise && (
                      <span className="rounded-full bg-rose-500/15 text-rose-600 border border-rose-500/30 px-2.5 py-0.5 text-[10px] font-black flex items-center gap-1">
                        <Flame className="w-3 h-3 text-rose-500" />
                        {lang === 'en' ? 'Limited Time' : 'لفترة محدودة'}
                      </span>
                    )}
                    {isRecommended && !isPopular && (
                      <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-black text-white">
                        {lang === 'en' ? 'Matched for your students' : 'مطابق لعدد طلابك'}
                      </span>
                    )}
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      isPopular ? 'bg-white/15 text-slate-200' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {lang === 'en' ? plan.studentsLabel : plan.studentsLabelAr}
                  </span>
                </div>

                {/* Plan Header */}
                <div>
                  <h3 className={`text-xl font-black ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                    {lang === 'en' ? plan.name : plan.nameAr}
                  </h3>
                  <p className={`mt-1 text-xs leading-relaxed ${isPopular ? 'text-slate-300' : 'text-slate-500'}`}>
                    {lang === 'en' ? plan.desc : plan.descAr}
                  </p>
                </div>

                {/* Price Display */}
                {isEnterprise ? (
                  <div className="my-5 pb-5 border-b border-slate-200/40">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-price text-3xl sm:text-4xl font-black text-purple-700 tracking-tight">
                        {lang === 'en' ? 'Strategy Meeting' : 'في جلسة عمل خاصة'}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs font-bold text-purple-900 bg-purple-100/90 px-2.5 py-1 rounded-xl inline-block">
                      {lang === 'en' ? 'Tailored to your mega center & +500 students' : 'حسب احتياجات المعلم وسعة +500 طالب'}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500 font-semibold">
                      {lang === 'en' ? '1-on-1 consultation with Classio engineering team' : 'جلسة تخطيط وتخصيص ميزات كاملة للمركز'}
                    </p>
                  </div>
                ) : (
                  <div className="my-5 pb-5 border-b border-slate-200/40">
                    {/* Crossed-out original price for limited time */}
                    {!isFree && plan.originalMonthlyPrice && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs line-through text-slate-400 font-bold decoration-rose-500 decoration-2">
                          {billing === 'annual'
                            ? `EGP ${plan.originalMonthlyPrice * 10}`
                            : `EGP ${plan.originalMonthlyPrice}`}
                        </span>
                        <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          {lang === 'en' ? 'Limited Discount' : 'خصم خاص مؤقت'}
                        </span>
                      </div>
                    )}

                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className={`text-base font-black ${isPopular ? 'text-amber-300' : 'text-slate-500'}`}>
                        EGP
                      </span>
                      <span
                        className={`font-price text-4xl sm:text-5xl font-black tracking-tight tabular-nums ${
                          isPopular
                            ? 'text-amber-400 drop-shadow-[0_2px_12px_rgba(251,191,36,0.3)]'
                            : 'text-slate-900'
                        }`}
                      >
                        {price}
                      </span>
                      <span className={`text-xs font-bold ${isPopular ? 'text-slate-300' : 'text-slate-500'}`}>
                        {billing === 'annual' ? '/ year' : '/ month'}
                      </span>
                    </div>

                    {billing === 'annual' && plan.annualSaving > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-bold">
                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          {`Annual: EGP ${plan.annualPrice} (Save EGP ${plan.annualSaving})`}
                        </span>
                      </div>
                    )}

                    {!isFree && (
                      <p className={`mt-2 text-[11px] font-semibold ${isPopular ? 'text-slate-300' : 'text-slate-400'}`}>
                        {lang === 'en' ? '✓ 3-day full access free trial included' : '✓ يشمل تجربة مجانية كاملة لمدة 3 أيام'}
                      </p>
                    )}
                  </div>
                )}

                {/* Feature List */}
                <div className="flex-1 space-y-2.5">
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${isPopular ? 'text-slate-300' : 'text-slate-400'}`}>
                    {lang === 'en' ? "What's Included:" : 'المميزات المتضمنة:'}
                  </p>
                  {(lang === 'en' ? plan.features : plan.featuresAr).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <div
                        className={`size-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isPopular ? 'bg-amber-400 text-slate-950 font-black' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <Check className="size-2.5 stroke-[3]" />
                      </div>
                      <span className={`font-semibold ${isPopular ? 'text-slate-100' : 'text-slate-700'}`}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="mt-6 pt-2">
                  <Link
                    href={
                      isEnterprise
                        ? `https://wa.me/201299930937?text=${encodeURIComponent(
                            lang === 'ar'
                              ? 'مرحباً كلاسيو، أرغب في حجز جلسة عمل خاصة لمناقشة باقة المؤسسات (Enterprise) لعدد طلاب +500 طالب.'
                              : 'Hello Classio, I want to schedule an Enterprise strategy meeting for +500 students.'
                          )}`
                        : `/checkout?plan=${plan.id}&billing=${billing}`
                    }
                    className="block w-full"
                    target={isEnterprise ? '_blank' : undefined}
                    rel={isEnterprise ? 'noopener noreferrer' : undefined}
                  >
                    <Button
                      className={`w-full rounded-2xl py-3 text-xs font-black shadow-md transition cursor-pointer ${
                        isPopular
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black'
                          : isEnterprise
                          ? 'bg-purple-800 hover:bg-purple-700 text-white font-black'
                          : isFree
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold'
                          : 'bg-[#0f2c59] hover:bg-[#1a3d6d] text-white font-bold'
                      }`}
                    >
                      {isEnterprise
                        ? (lang === 'en' ? 'Schedule Strategy Meeting' : 'احجز جلسة عمل خاصة (1-on-1)')
                        : isFree
                        ? (lang === 'en' ? 'Get Started Free' : 'ابدأ مجاناً للأبد')
                        : (lang === 'en' ? 'Start 3-Day Free Trial' : 'ابدأ التجربة المجانية (3 أيام)')}
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* The 5 Egyptian Pricing Commitments */}
      <section className="bg-white py-14 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              {lang === 'en' ? 'Our Commitments to Tutors' : 'التزاماتنا الصارمة للمعلم'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {lang === 'en' ? 'Transparent Pricing Rules & Guarantees' : 'قواعد التسعير وحماية حقوق المعلم'}
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              {lang === 'en'
                ? 'We built Classio specifically for the real-life workflows and challenges of private tutoring in Egypt.'
                : 'صممنا كلاسيو ليراعي الواقع الحقيقي وظروف التدريس الخصوصي وإدارة السناتر في مصر.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 hover:bg-white hover:shadow-xs transition">
              <div className="size-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 mb-3 font-bold">
                <Flame className="size-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {lang === 'en' ? 'Limited Time Launch Pricing' : 'أسعار مخفضة لفترة محدودة'}
              </h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {lang === 'en' ? PRICING_RULES.limitedTime.en : PRICING_RULES.limitedTime.ar}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 hover:bg-white hover:shadow-xs transition">
              <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#0f2c59] mb-3 font-bold">
                <Sparkles className="size-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {lang === 'en' ? '3-Day Free Trial' : 'تجربة مجانية 3 أيام'}
              </h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {lang === 'en' ? PRICING_RULES.trial.en : PRICING_RULES.trial.ar}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 hover:bg-white hover:shadow-xs transition">
              <div className="size-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-3 font-bold">
                <UsersRound className="size-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {lang === 'en' ? 'Free Forever (Up to 10 Students)' : 'مجاني للأبد (حتى 10 طلاب)'}
              </h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {lang === 'en' ? PRICING_RULES.freeForever.en : PRICING_RULES.freeForever.ar}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 hover:bg-white hover:shadow-xs transition">
              <div className="size-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 mb-3 font-bold">
                <Award className="size-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {lang === 'en' ? 'Annual Subscriptions (Save 2 Months)' : 'الاشتراك السنوي (وفّر شهرين)'}
              </h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {lang === 'en' ? PRICING_RULES.annualSavings.en : PRICING_RULES.annualSavings.ar}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 hover:bg-white hover:shadow-xs transition">
              <div className="size-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 mb-3 font-bold">
                <Calendar className="size-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {lang === 'en' ? 'Enterprise +500 Students Meeting' : 'جلسة عمل خاصة للمؤسسات (+٥٠٠ طالب)'}
              </h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {lang === 'en' ? PRICING_RULES.enterpriseMeeting.en : PRICING_RULES.enterpriseMeeting.ar}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 hover:bg-white hover:shadow-xs transition">
              <div className="size-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 mb-3 font-bold">
                <ShieldCheck className="size-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {lang === 'en' ? 'Strict Data Protection Guarantee' : 'ضمان حماية بيانات الطلاب وعدم الحذف مطلقاً'}
              </h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {lang === 'en' ? PRICING_RULES.dataProtection.en : PRICING_RULES.dataProtection.ar}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix Table */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            {lang === 'en' ? 'Detailed Breakdown' : 'المقارنة الشاملة للمميزات'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {lang === 'en' ? 'Compare All Plans Side-by-Side' : 'مقارنة دقيقة بين كافة الخطط'}
          </h2>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="p-4 text-start font-bold text-slate-800 min-w-48">
                  {lang === 'en' ? 'Feature / Capability' : 'الميزة / الإمكانية'}
                </th>
                {PRICING_PLANS.map((p) => (
                  <th key={p.id} className="p-4 text-center font-black text-slate-900 min-w-28">
                    <div>{lang === 'en' ? p.name : p.nameAr}</div>
                    <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                      {lang === 'en' ? p.studentsLabel : p.studentsLabelAr}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {featureMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="p-4 font-bold text-slate-800">
                    {lang === 'en' ? row.title.en : row.title.ar}
                  </td>
                  {row.values.map((val, colIdx) => (
                    <td key={colIdx} className="p-4 text-center font-semibold text-slate-700">
                      {typeof val === 'boolean' ? (
                        val ? (
                          <div className="inline-flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                            <Check className="size-3 stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )
                      ) : (
                        <span className="font-price font-bold text-[#0f2c59]">{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="bg-slate-100/70 py-16 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              {lang === 'en' ? 'Got Questions?' : 'الأسئلة الشائعة'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {lang === 'en' ? 'Frequently Asked Questions' : 'كل ما تحتاج لمعرفته عن خطط وأسعار كلاسيو'}
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-start font-bold text-sm text-slate-900 cursor-pointer hover:bg-slate-50"
                  >
                    <span>{lang === 'en' ? faq.q.en : faq.q.ar}</span>
                    <span className="size-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-600">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {lang === 'en' ? faq.a.en : faq.a.ar}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-gradient-to-r from-[#0b192c] via-[#0f2c59] to-[#1e3e62] py-14 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {lang === 'en' ? 'Ready to Elevate Your Tutoring Practice?' : 'جاهز لتنظيم وإدارة حصصك واشتراكاتك باحترافية؟'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300">
            {lang === 'en'
              ? 'Join private tutors across Egypt managing attendance, fees, and student progress with Classio.'
              : 'انضم لمئات المعلمين في مصر الذين يعتمدون على كلاسيو يومياً في السناتر والمجموعات الخاصة.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/checkout?plan=growth&billing=annual">
              <Button className="rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-6 py-3 cursor-pointer shadow-lg">
                {lang === 'en' ? 'Start 3-Day Free Trial' : 'ابدأ التجربة المجانية (3 أيام)'}
              </Button>
            </Link>
            <Link href="/checkout?plan=free">
              <Button variant="outline" className="rounded-2xl border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-5 py-3 cursor-pointer">
                {lang === 'en' ? 'Use Free Forever' : 'ابدأ بالخطة المجانية (حتى 10 طلاب)'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <ClassioLogo size="sm" />
          <p>© {new Date().getFullYear()} Classio. {lang === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة للمعلم المصري.'}</p>
          <div className="flex items-center gap-4 font-bold text-[#0f2c59]">
            <Link href="/pricing">{lang === 'en' ? 'Pricing' : 'الأسعار'}</Link>
            <Link href="/login">{lang === 'en' ? 'Sign In' : 'تسجيل الدخول'}</Link>
            <Link href="/dashboard">{lang === 'en' ? 'Dashboard' : 'لوحة التحكم'}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
