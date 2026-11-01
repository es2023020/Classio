'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  UsersRound,
  CheckCircle2,
  CalendarCheck2,
  WalletCards,
  Award,
  BookOpen,
  BarChart3,
  MessageCircle,
  QrCode,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  Check,
  Zap,
  Smartphone,
  FileSpreadsheet,
  Flame,
} from 'lucide-react'
import { LandingNavbar } from '@/components/landing/navbar'
import { LandingFooter } from '@/components/landing/footer'
import { useLanguage } from '@/lib/language-context'
import { PRICING_PLANS, PRICING_RULES } from '@/lib/plans'
import { BillingCycle } from '@/lib/types'
import { ClassioLogo } from '@/components/ui/classio-logo'

export default function LandingPage() {
  const { lang, toggleLang, isRTL } = useLanguage()
  const [billing, setBilling] = useState<BillingCycle>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Translations content with NO placeholders
  const t = {
    en: {
      badge: '🇪🇬 Built for Egyptian Tutors & Educational Centers',
      heroTitle: 'Run Your Tutoring Business.\nProve Real Student Progress.',
      heroSub:
        'Classio is the all-in-one platform for private tutors in Egypt. Manage students, attendance, homework, and fees via InstaPay & Vodafone Cash — while demonstrating measurable academic improvement to parents.',
      ctaTrial: 'Start 3-Day Free Trial',
      ctaDemo: 'Open Interactive Demo',
      trust: 'Trusted by 500+ private tutors across Cairo, Alexandria & Mansoura',
      stats: [
        { value: '500+', label: 'Active Egyptian Tutors' },
        { value: '18,500+', label: 'Students Managed' },
        { value: '96%', label: 'Parent Satisfaction Rate' },
        { value: '#1', label: 'Tutor Platform in Egypt' },
      ],
      featuresTitle: 'Everything an Individual Tutor Needs to Excel',
      featuresSub:
        'From tracking student attendance and collecting monthly fees to sending one-tap WhatsApp progress reports and topic mastery matrices.',
      features: [
        {
          icon: Award,
          title: 'Student Success Profiles',
          desc: 'Track trajectory (improving, steady, needs attention), mastery matrix for individual topics, and recommended next actions.',
          color: 'bg-blue-50 text-[#0f2c59]',
        },
        {
          icon: CalendarCheck2,
          title: 'Daily Attendance & Barcode Scan',
          desc: 'Mark attendance in seconds with student codes or barcode scanner (⌘K). Instant 1-tap WhatsApp notifications for absent students.',
          color: 'bg-emerald-50 text-emerald-700',
        },
        {
          icon: WalletCards,
          title: 'Egyptian Payment Collection',
          desc: 'Seamlessly track Cash, InstaPay, and Vodafone Cash. Generate digital PDF-ready receipts and send polite WhatsApp fee reminders.',
          color: 'bg-amber-50 text-amber-700',
        },
        {
          icon: MessageCircle,
          title: '1-Tap WhatsApp Parent Cards',
          desc: 'Generate pre-formatted WhatsApp messages for monthly progress cards, attendance alerts, quiz results, and lesson summaries.',
          color: 'bg-green-50 text-green-700',
        },
        {
          icon: BookOpen,
          title: 'Lesson Planning & Homework',
          desc: 'Log curriculum chapters, textbook pages, exercise assignments, and broadcast lesson recaps directly to parents.',
          color: 'bg-purple-50 text-purple-700',
        },
        {
          icon: BarChart3,
          title: 'Reports & One-Click Excel Export',
          desc: 'Export complete student rosters, payment ledgers, and overdue balance sheets to UTF-8 Excel files with one click.',
          color: 'bg-rose-50 text-rose-700',
        },
      ],
      successSectionTitle: 'Why Tutors Choose Classio: The Student Success Profile',
      successSectionSub:
        'Other apps only tell you who attended or paid. Classio tells you whether the student is actually mastering the curriculum — helping you prove your value to parents every single month.',
      pricingTitle: 'Simple, Transparent Pricing for Every Stage',
      pricingSub:
        'Start free forever with up to 10 students, or lock in limited-time launch rates with our 3-day free trial.',
      monthly: 'Monthly Billing',
      annual: 'Annual Billing',
      annualBadge: 'Save 2 Months (Pay 10, Get 12)',
      choosePlan: 'Choose Plan',
      pricingRulesTitle: 'Classio Pricing & Student Guarantees',
      testimonialsTitle: 'Loved by Private Tutors Across Egypt',
      testimonialsSub:
        'See how educators from secondary stages and language schools run their classes with Classio.',
      faqTitle: 'Frequently Asked Questions',
      faqSub: 'Everything you need to know about Classio, payments, and offline storage.',
      faqs: [
        {
          q: 'Is there a truly free plan?',
          a: 'Yes! The Free plan is forever free for tutors managing up to 10 students. No credit card required, no expiration date, and no hidden charges.',
        },
        {
          q: 'How does the 3-day free trial work?',
          a: 'When you select any paid plan (Starter, Growth, Pro, Power, or Enterprise), you enjoy full access for 3 days with zero upfront payment. You can upgrade, downgrade, or cancel at any time.',
        },
        {
          q: 'Does Classio work offline without internet?',
          a: 'Yes. Classio is designed offline-first with local storage persistence. You can take attendance and record fees inside basement centers with zero mobile reception. It syncs to Supabase cloud automatically when connected.',
        },
        {
          q: 'How do parents receive updates without downloading an app?',
          a: 'Parents do not need to install anything! Classio builds official WhatsApp Web / Mobile direct links with customized Arabic & English message cards. One click sends the message from your WhatsApp.',
        },
        {
          q: 'What happens if I exceed my student limit?',
          a: 'Classio will gently alert you with an upgrade prompt. Your student records and past history are strictly protected and NEVER deleted or locked.',
        },
        {
          q: 'Can I export all my data to Excel?',
          a: 'Yes, Classio includes one-click export for student rosters, payment records, and attendance sheets with UTF-8 BOM encoding for perfect Arabic display in Microsoft Excel.',
        },
      ],
      finalCtaTitle: 'Ready to Run Your Teaching Business Like a Pro?',
      finalCtaSub:
        'Join hundreds of tutors who save hours each week and build trust with parents using Classio.',
      finalCtaBtn: 'Start Free Today — No Credit Card Required',
    },
    ar: {
      badge: '🇪🇬 مصمم خصيصاً لمدرسي الدروس الخصوصية والسناتر في مصر',
      heroTitle: 'أدِر سنترك بذكاء واحترافية.\nوأثبت تطور مستوى طلابك لأولياء الأمور.',
      heroSub:
        'كلاسيو (Classio) هو النظام الرقمي المتكامل للمدرسين الخصوصيين في مصر. أدر حضور الطلاب، الواجبات، والتحصيل عبر إنستاباي وفودافون كاش مع إبراز تحسن مستوى الطالب الفعلي لأولياء الأمور.',
      ctaTrial: 'ابدأ تجربة مجانية (٣ أيام)',
      ctaDemo: 'تجربة حية فورية',
      trust: 'يثق به أكثر من ٥٠٠ مدرس خصوصي في القاهرة، الإسكندرية، والمنصورة',
      stats: [
        { value: '+٥٠٠', label: 'مدرس خصوصي نشط' },
        { value: '+١٨,٥٠٠', label: 'طالب تحت الإدارة' },
        { value: '٩٦٪', label: 'رضا أولياء الأمور' },
        { value: '#١', label: 'المنصة الأولى للمدرسين بمصر' },
      ],
      featuresTitle: 'كل ما يحتاجه المدرس في منصة واحدة متكاملة',
      featuresSub:
        'من رصد الغياب والتحصيل المالي حتى تقارير واتساب الفورية ومصفوفة إتقان أجزاء المنهج.',
      features: [
        {
          icon: Award,
          title: 'ملفات نجاح الطلاب ومسار التعلم',
          desc: 'رصد مسار الطالب (في تحسن، مستقر، يحتاج متابعة)، ومصفوفة إتقان الدروس (قوي، يحتاج تدريب، إعادة شرح)، مع الإجراء الموصى به.',
          color: 'bg-blue-50 text-[#0f2c59]',
        },
        {
          icon: CalendarCheck2,
          title: 'دفتر الحضور ومسح الباركود السريع',
          desc: 'تسجيل الحضور في ثوانٍ بكود الطالب أو عبر الباركود (⌘K). إشعارات غياب فورية بضغطة واحدة لأولياء الأمور على واتساب.',
          color: 'bg-emerald-50 text-emerald-700',
        },
        {
          icon: WalletCards,
          title: 'التحصيل عبر إنستاباي وفودافون كاش',
          desc: 'متابعة الدفع نقداً، عبر إنستاباي، أو فودافون كاش. إصدار إيصالات استلام رقمية جاهزة للطباعة، وتذكيرات متأخرات ودية.',
          color: 'bg-amber-50 text-amber-700',
        },
        {
          icon: MessageCircle,
          title: 'كروت تقارير واتساب بنقرة واحدة',
          desc: 'توليد رسائل واتساب رسمية منسقة لكروت التقدم الأكاديمي، إشعارات الغياب، درجات الكويزات، وملخصات الحصة.',
          color: 'bg-green-50 text-green-700',
        },
        {
          icon: BookOpen,
          title: 'تحضير الحصص وإدارة الواجبات',
          desc: 'توثيق فصول المنهج المشروحة، صفحات المذكرة، تمارين الواجب وتاريخ التسليم، مع إرسال ملخص الحصة لأولياء الأمور.',
          color: 'bg-purple-50 text-purple-700',
        },
        {
          icon: BarChart3,
          title: 'التقارير وتصدير كشوفات Excel بنقرة واحدة',
          desc: 'تصدير كشوفات الطلاب، المقبوضات المالية، والمتأخرات إلى ملفات Excel متوافقة 100% مع اللغة العربية بنقرة واحدة.',
          color: 'bg-rose-50 text-rose-700',
        },
      ],
      successSectionTitle: 'السر وراء تميز كلاسيو: ملف نجاح الطالب الأكاديمي',
      successSectionSub:
        'البرامج العادية تكتفي بإخبارك من حضر ومن دفع. كلاسيو يخبرك هل الطالب يتحسن ويفهم المنهج فعلاً أم لا — لتثبت لأولياء الأمور قيمة شرحك كل شهر.',
      pricingTitle: 'خطط أسعار واضحة وشفافة لجميع أحجام المجموعات',
      pricingSub:
        'ابدأ مجاناً للأبد حتى 10 طلاب، أو ثبّت الأسعار المخفضة لفترة محدودة مع تجربة مجانية لمدة 3 أيام.',
      monthly: 'اشتراك شهري',
      annual: 'اشتراك سنوي',
      annualBadge: 'وفّر شهرين كاملين (ادفع ١٠ شهور واحصل على ١٢)',
      choosePlan: 'اختر الخطة',
      pricingRulesTitle: 'قواعد الأسعار وضمانات كلاسيو',
      testimonialsTitle: 'ماذا يقول كبار المدرسين عن منصة كلاسيو',
      testimonialsSub:
        'تجارب حقيقية لمدرسي الثانوية العامة والشهادات الإعدادية واللغات بمصر.',
      faqTitle: 'الأسئلة الشائعة حول المنصة',
      faqSub: 'كل ما تحتاج لمعرفته حول الحسابات، التحصيل، وطريقة عمل المنصة.',
      faqs: [
        {
          q: 'هل توجد خطة مجانية حقيقية؟',
          a: 'نعم! خطة Free مجانية تماماً للأبد للمدرسين الذين يديرون حتى 10 طلاب. بدون أي بطاقة بنكية وبدون فترة انتهاء صلاحية.',
        },
        {
          q: 'كيف تعمل التجربة المجانية لمدة 3 أيام؟',
          a: 'عند اختيارك لأي باقة مدفوعة (Starter, Growth, Pro, Power, Enterprise)، تحصل على صلاحيات كاملة لمدة 3 أيام مجاناً وبدون أي خصم مالي مسبق.',
        },
        {
          q: 'هل تعمل المنصة بدون اتصال بالإنترنت في السنتر؟',
          a: 'نعم بكل تأكيد. تم بناء كلاسيو وفق معيار Offline-First، بحيث يمكنك تسجيل الحضور والمدفوعات داخل السناتر في الأدوار الأرضية بدون شبكة، وتتزامن تلقائياً عند عودة الاتصال.',
        },
        {
          q: 'كيف يستلم ولي الأمر التقارير دون تحميل أي تطبيق؟',
          a: 'لا يحتاج ولي الأمر لتحميل أي برنامج إضافي! كلاسيو يُنشئ روابط واتساب مباشرة ترسل كروت التقدم وإشعارات الغياب الرسمية من رقمك بضغطة زر واحدة.',
        },
        {
          q: 'ماذا يحدث إذا تجاوزت الحد الأقصى لعدد الطلاب؟',
          a: 'تظهر لك رسالة تنبيه ودية لتحديث خطتك. بيانات طلابك وسجلاتهم محمية تماماً ولا يتم حذف أو تجميد أي بيانات أبداً.',
        },
        {
          q: 'هل يمكنني استيراد وتصدير بيانات الطلاب إلى Excel؟',
          a: 'نعم، كلاسيو يتيح استيراد مئات الطلاب من ملفات Excel في ثوانٍ، وتصدير كافة الكشوفات والتقارير المالية بترميز UTF-8 سليم للغة العربية.',
        },
      ],
      finalCtaTitle: 'هل أنت جاهز لتنظيم سنترك والانتقال لمستوى الاحتراف؟',
      finalCtaSub:
        'انضم إلى مئات المدرسين المصريين الذين يوفرون ساعات عمل أسبوعياً ويبنون ثقة حقيقية مع أولياء الأمور.',
      finalCtaBtn: 'ابدأ مجاناً اليوم — بدون بطاقة ائتمان',
    },
  }[lang]

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Navbar */}
      <LandingNavbar lang={lang} onToggleLang={toggleLang} />

      {/* ── 1. HERO SECTION ─────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-b from-[#0b192c] via-[#0f2c59] to-[#122b52] text-white">
        {/* Glow Gradients */}
        <div className="absolute top-0 start-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 end-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md mb-6 shadow-xs animate-in fade-in">
              <Zap className="w-3.5 h-3.5" />
              <span>{t.badge}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] mb-6 whitespace-pre-line text-white">
              {t.heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-normal leading-relaxed mb-8 max-w-2xl mx-auto">
              {t.heroSub}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10">
              <Link
                href="/login?mode=signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-7 py-4 shadow-lg shadow-emerald-950/40 transition-all hover:scale-105"
              >
                <span>{t.ctaTrial}</span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm px-7 py-4 backdrop-blur-md transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t.ctaDemo}</span>
              </Link>
            </div>

            {/* Trust Proof */}
            <p className="text-xs text-slate-400 font-semibold">{t.trust}</p>
          </div>

          {/* Interactive Hero Mockup Card */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl border border-white/20 bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xl shadow-2xl">
            <div className="rounded-2xl bg-white p-4 sm:p-6 text-slate-900 shadow-inner">
              {/* Mockup Topbar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <ClassioLogo size="sm" showBadge={false} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-sm text-[#0f2c59]">Student Success Profile</span>
                      <span className="rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5">
                        {lang === 'en' ? 'Improving' : 'في تحسن'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      {lang === 'en' ? 'Grade 10 · Mathematics · Center Group A' : 'الصف الأول الثانوي · الرياضيات · سنتر الأوائل'}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'en' ? 'InstaPay Fee Paid ✓' : 'تم السداد عبر إنستاباي ✓'}</span>
                </div>
              </div>

              {/* Mockup 4 KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'en' ? 'Attendance' : 'نسبة الحضور'}</div>
                  <div className="text-xl font-black text-slate-900 mt-1">94%</div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'en' ? 'Latest Exam' : 'آخر امتحان'}</div>
                  <div className="text-xl font-black text-emerald-600 mt-1">92/100</div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'en' ? 'Homework Rate' : 'تسليم الواجب'}</div>
                  <div className="text-xl font-black text-blue-600 mt-1">88%</div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'en' ? 'Target Goal' : 'الهدف الأكاديمي'}</div>
                  <div className="text-xl font-black text-amber-600 mt-1">95/100</div>
                </div>
              </div>

              {/* Mockup Topic Mastery & Next Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="rounded-2xl border border-slate-200/80 p-3.5 bg-white space-y-2">
                  <div className="text-xs font-bold text-slate-700">{lang === 'en' ? 'Topic Mastery Breakdown' : 'مصفوفة إتقان أجزاء المنهج'}</div>
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                    <span className="font-semibold">{lang === 'en' ? 'Algebra & Equations' : 'الجبر والمعادلات'}</span>
                    <span className="rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                      {lang === 'en' ? 'Strong' : 'متقن وممتاز'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                    <span className="font-semibold">{lang === 'en' ? 'Geometry & Proofs' : 'الهندسة والبرهان'}</span>
                    <span className="rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5">
                      {lang === 'en' ? 'Needs Practice' : 'يحتاج تدريب'}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-3.5 space-y-1.5">
                  <div className="text-xs font-bold text-[#0f2c59] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{lang === 'en' ? 'Next Recommended Tutor Action' : 'الإجراء الموصى به للمدرس'}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {lang === 'en'
                      ? 'Assign 5 geometry proof exercises and review mistakes during the first 15 minutes of the next session.'
                      : 'تكليف الطالب بـ ٥ مسائل برهان هندسي ومراجعة أخطائه في أول ربع ساعة من الحصة القادمة.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. METRICS SOCIAL PROOF ─────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-200/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {t.stats.map((s, i) => (
              <div key={i} className="p-3">
                <div className="text-3xl sm:text-4xl font-black text-[#0f2c59] tracking-tight">{s.value}</div>
                <div className="text-xs sm:text-sm font-bold text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. FEATURES SHOWCASE ────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">
              {t.featuresTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              {t.featuresSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.features.map((feat, i) => {
              const Icon = feat.icon
              return (
                <div
                  key={i}
                  className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs hover:shadow-md hover:-translate-y-1 transition duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${feat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-black text-slate-900 mb-2">{feat.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{feat.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 4. STUDENT SUCCESS DIFFERENTIATOR SPOTLIGHT ─────────────────── */}
      <section id="success-profile" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold mb-4">
                <Award className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'The Pedagogical Advantage' : 'القيمة المضافة الحقيقية'}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
                {t.successSectionTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium mb-6">
                {t.successSectionSub}
              </p>

              <div className="space-y-3.5">
                {[
                  lang === 'en'
                    ? 'Student Success Profile with auto-computed 3-state trajectory (Improving, Steady, Needs Attention).'
                    : 'ملف نجاح الطالب مع مؤشر مسار أكاديمي ثلاثي ذكي (في تحسن مستمر، مستقر، يحتاج متابعة).',
                  lang === 'en'
                    ? 'Individual topic mastery breakdown (e.g. Algebra Strong, Geometry Needs Practice).'
                    : 'مصفوفة إتقان أجزاء المنهج لكل طالب على حدة لبيان نقاط القوة والضعف.',
                  lang === 'en'
                    ? 'Next recommended tutor action tailored to each student’s actual exam scores.'
                    : 'تحديد الإجراء القادم الموصى به للمدرس بناءً على نتائج امتحانات الطالب الفعلية.',
                  lang === 'en'
                    ? 'One-tap WhatsApp monthly progress card with customized emojis, stats, and tutor encouragement.'
                    : 'إرسال كارت التقدم الشهري الفخم لواتساب ولي الأمر بنقرة زر واحدة بدون برامج إضافية.',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison Box */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {lang === 'en' ? 'The Difference' : 'الفرق الجوهري'}
              </div>

              <div className="rounded-2xl bg-white p-4 border border-rose-200">
                <div className="text-xs font-bold text-rose-600 mb-1">
                  {lang === 'en' ? '❌ Generic School CRM' : '❌ البرامج الإدارية العادية'}
                </div>
                <p className="text-xs text-slate-500">
                  {lang === 'en'
                    ? 'Only tracks if Ahmed paid 850 EGP and whether he attended on Tuesday.'
                    : 'تخبرك فقط أن الطالب سدد ٨٥٠ ج.م وحضر يوم الثلاثاء، دون معرفة مستواه الدراسي.'}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50/90 p-4 border border-emerald-300">
                <div className="text-xs font-black text-emerald-800 mb-1">
                  {lang === 'en' ? '✅ Classio Tutor & Student Success' : '✅ منصة Classio المتكاملة للمدرس'}
                </div>
                <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                  {lang === 'en'
                    ? 'Tells you Ahmed scored 78/100, is weak in Geometry proofs, attended 92% of classes, and provides an actionable practice plan you can send to his mother on WhatsApp.'
                    : 'تخبرك أن الطالب درجته ٧٨/١٠٠، ضعيف في براهين الهندسة، حضوره ٩٢٪، وتزودك بخطة علاجية فورية ترسلها لوالدته على واتساب في نهاية الشهر.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. HOW IT WORKS ─────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">
              {lang === 'en' ? 'Up and Running in 3 Minutes' : 'ابدأ عملك في ٣ دقائق فقط'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              {lang === 'en'
                ? 'No technical setup. No credit card required. Works right in your browser.'
                : 'بدون أي تعقيدات تقنية، وبدون بطاقة بنكية. يعمل مباشرة من هاتفك أو جهازك.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: lang === 'en' ? 'Create Your Tutor Account' : 'أنشئ حسابك كمدرس',
                desc:
                  lang === 'en'
                    ? 'Sign up free in seconds. Your first 9 students are free forever.'
                    : 'سجل مجاناً في ثوانٍ. أول ٩ طلاب مجانيون تماماً للأبد.',
              },
              {
                step: '02',
                title: lang === 'en' ? 'Import Your Students' : 'استورد بيانات طلابك',
                desc:
                  lang === 'en'
                    ? 'Upload your Excel roster or add students with our quick-entry form.'
                    : 'ارفع كشف طلابك من Excel أو أضفهم بسهولة عبر النموذج السريع.',
              },
              {
                step: '03',
                title: lang === 'en' ? 'Manage Classes & Impress Parents' : 'أدر حصصك وأبهر أولياء الأمور',
                desc:
                  lang === 'en'
                    ? 'Record attendance, log InstaPay fees, and broadcast WhatsApp cards.'
                    : 'سجل الحضور، حصّل الاشتراكات عبر إنستاباي، وأرسل تقارير واتساب.',
              },
            ].map((s, idx) => (
              <div key={idx} className="rounded-3xl border border-slate-200/80 bg-white p-7 text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-[#0f2c59] text-white flex items-center justify-center text-sm font-black font-mono mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. PRICING SECTION (6 TIERS - ENGLISH PRICES & LIMITED TIME OFFERS) ── */}
      <section id="pricing" className="py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            {/* Limited Time Urgency Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 text-rose-600 px-4 py-1.5 text-xs font-black mb-3 border border-rose-200 shadow-xs">
              <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
              <span>{lang === 'en' ? '⚡ Limited Time Launch Rates — Lock In Your Price Today' : '⚡ أسعار مخفضة لفترة محدودة بمناسبة انطلاق العام الدراسي'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">
              {t.pricingTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              {t.pricingSub}
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="mt-8 inline-flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => setBilling('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  billing === 'monthly'
                    ? 'bg-white text-[#0f2c59] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.monthly}
              </button>
              <button
                type="button"
                onClick={() => setBilling('annual')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  billing === 'annual'
                    ? 'bg-[#0f2c59] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{t.annual}</span>
                <span className="rounded-md bg-amber-400 text-slate-950 px-1.5 py-0.5 text-[9px] font-black">
                  {lang === 'en' ? 'Save 2 Mo' : 'وفّر شهرين'}
                </span>
              </button>
            </div>
          </div>

          {/* 6 Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRICING_PLANS.map((plan) => {
              const isPopular = plan.popular
              const isEnterprise = plan.id === 'enterprise'
              const isFree = plan.id === 'free'
              const price = billing === 'annual' ? plan.annualPrice : plan.monthlyPrice
              const featuresList = lang === 'en' ? plan.features : plan.featuresAr

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl border p-7 transition duration-200 flex flex-col justify-between ${
                    isPopular
                      ? 'border-[#0f2c59] bg-[#0f2c59] text-white shadow-2xl ring-4 ring-[#0f2c59]/20'
                      : isEnterprise
                      ? 'border-purple-300 bg-gradient-to-b from-purple-50/50 to-white shadow-md'
                      : 'border-slate-200 bg-white shadow-xs hover:shadow-md'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 start-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-sm">
                      {lang === 'en' ? '★ Most Popular' : '★ الأكثر طلباً'}
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-lg font-black ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                        {lang === 'en' ? plan.name : plan.nameAr}
                      </h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isPopular ? 'bg-white/20 text-slate-100' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {lang === 'en' ? plan.studentsLabel : plan.studentsLabelAr}
                      </span>
                    </div>

                    <p className={`text-xs font-semibold mb-6 leading-relaxed ${isPopular ? 'text-slate-300' : 'text-slate-500'}`}>
                      {lang === 'en' ? plan.desc : plan.descAr}
                    </p>

                    {/* Price Display */}
                    {isEnterprise ? (
                      <div className="mb-6 pb-6 border-b border-slate-200/50">
                        <div className="font-price text-2xl sm:text-3xl font-black text-purple-700 tracking-tight">
                          By consultation
                        </div>
                        <p className="mt-1 text-xs font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-lg inline-block">
                          Custom capacity (+500 students)
                        </p>
                      </div>
                    ) : (
                      <div className="mb-6 pb-6 border-b border-slate-100/60">
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
                          <span className={`text-sm font-black ${isPopular ? 'text-amber-300' : 'text-slate-500'}`}>
                            EGP
                          </span>
                          <span className={`font-price text-4xl sm:text-5xl font-black tracking-tight tabular-nums ${
                            isPopular ? 'text-amber-400 drop-shadow-sm' : 'text-slate-900'
                          }`}>
                            {price}
                          </span>
                          <span className={`text-xs font-bold ${isPopular ? 'text-slate-300' : 'text-slate-500'}`}>
                            {billing === 'annual' ? '/ year' : '/ month'}
                          </span>
                        </div>

                        {billing === 'annual' && plan.annualSaving > 0 && (
                          <div className="mt-2 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 inline-block">
                            {`Annual: EGP ${plan.annualPrice} (Save EGP ${plan.annualSaving})`}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Features checklist */}
                    <ul className="space-y-2.5 mb-8">
                      {featuresList.map((f, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-xs">
                          <div className={`size-4 rounded-full flex items-center justify-center shrink-0 ${
                            isPopular ? 'bg-amber-400 text-slate-950 font-black' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            <Check className="size-2.5 stroke-[3]" />
                          </div>
                          <span className={`font-semibold ${isPopular ? 'text-slate-100' : 'text-slate-700'}`}>
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
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
                    target={isEnterprise ? '_blank' : undefined}
                    rel={isEnterprise ? 'noopener noreferrer' : undefined}
                    className={`w-full py-3.5 rounded-2xl text-center text-xs font-black transition shadow-md cursor-pointer ${
                      isPopular
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                        : isEnterprise
                        ? 'bg-purple-800 hover:bg-purple-700 text-white'
                        : isFree
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-[#0f2c59] hover:bg-[#1a3d6d] text-white'
                    }`}
                  >
                    {isEnterprise
                      ? (lang === 'en' ? 'Schedule Strategy Meeting' : 'احجز جلسة عمل خاصة (1-on-1)')
                      : isFree
                      ? (lang === 'en' ? 'Start Free Forever' : 'ابدأ مجاناً للأبد')
                      : (lang === 'en' ? 'Start 3-Day Free Trial' : 'ابدأ التجربة المجانية (3 أيام)')}
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Pricing Rules Box */}
          <div className="mt-14 rounded-3xl border border-blue-200 bg-blue-50/70 p-6 sm:p-8">
            <h3 className="text-sm font-black text-[#0f2c59] mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>{t.pricingRulesTitle}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 leading-relaxed font-medium">
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{lang === 'en' ? PRICING_RULES.trial.en : PRICING_RULES.trial.ar}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{lang === 'en' ? PRICING_RULES.freeForever.en : PRICING_RULES.freeForever.ar}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{lang === 'en' ? PRICING_RULES.annualSavings.en : PRICING_RULES.annualSavings.ar}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{lang === 'en' ? PRICING_RULES.dataProtection.en : PRICING_RULES.dataProtection.ar}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. FAQ ACCORDION ────────────────────────────────────────────── */}
      <section id="faq" className="py-20 bg-[#f8fafc] border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">
              {t.faqTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">{t.faqSub}</p>
          </div>

          <div className="space-y-3">
            {t.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-start font-bold text-xs sm:text-sm text-slate-800 hover:text-[#0f2c59] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 text-[#0f2c59]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-50 pt-3 font-normal">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 8. PARTNERSHIPS & INVESTORS CTA ─────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-[#0b192c] via-[#0f2c59] to-[#163a6e] border-t border-blue-900/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-start">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300 mb-4">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Investors & Partners' : 'المستثمرون والشركاء'}</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white mb-3 leading-tight">
                {lang === 'en'
                  ? "Invest in Egypt's #1 EdTech CRM for Tutors"
                  : 'استثمر في أول منصة إدارة سناتر ومدرسين في مصر'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl leading-relaxed">
                {lang === 'en'
                  ? 'Classio targets a $2.1B+ private education market. Join us as an investor, educational center partner, FinTech collaborator, or publishing partner.'
                  : 'تستهدف كلاسيو سوق دروس خصوصية تتجاوز قيمته ٢.١ مليار دولار. انضم إلينا مستثمراً أو سنتراً أو شريكاً في FinTech أو النشر التعليمي.'}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 justify-center lg:justify-start">
                {[
                  lang === 'en' ? '500+ Tutors' : '+٥٠٠ مدرس',
                  lang === 'en' ? '18,500+ Students' : '+١٨,٥٠٠ طالب',
                  lang === 'en' ? '96% Retention' : '٩٦٪ استبقاء',
                  lang === 'en' ? '$2.1B+ TAM' : 'سوق بمليارات الدولارات',
                ].map((stat, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold bg-white/10 border border-white/10 text-slate-300 rounded-full px-3 py-1"
                  >
                    {stat}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto lg:w-auto">
              <Link
                href="/partnerships"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm px-7 py-4 shadow-lg shadow-amber-950/30 transition-all hover:scale-105 whitespace-nowrap"
              >
                <span>{lang === 'en' ? 'View Partnership Deck →' : 'عرض ملف الشراكة ←'}</span>
              </Link>
              <a
                href="https://wa.me/201299930937"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm px-7 py-4 backdrop-blur-md transition-all whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'en' ? 'WhatsApp Us' : 'تواصل عبر واتساب'}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. FINAL CALL TO ACTION ─────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-[#0b192c] via-[#0f2c59] to-[#122b52] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-amber-300 mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Classio Platform</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4">
            {t.finalCtaTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mb-8 font-medium">
            {t.finalCtaSub}
          </p>
          <Link
            href="/login?mode=signup"
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-8 py-4 shadow-xl shadow-emerald-950/40 transition hover:scale-105"
          >
            <span>{t.finalCtaBtn}</span>
            <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter lang={lang} />
    </div>
  )
}
