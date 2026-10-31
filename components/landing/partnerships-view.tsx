'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  TrendingUp,
  Building2,
  Briefcase,
  Users,
  WalletCards,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Globe,
  MessageCircle,
  FileText,
  Download,
  Mail,
  Phone,
  Send,
  ShieldCheck,
  Award,
  Zap,
  BarChart3,
  Calendar,
  Layers,
  ChevronDown,
  Check,
  Star,
  ExternalLink,
} from 'lucide-react'
import { ClassioLogo } from '@/components/ui/classio-logo'
import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'

export function PartnershipsView() {
  const { lang, toggleLang, isRTL } = useLanguage()

  // Form State
  const [partnerType, setPartnerType] = useState<
    'investor' | 'center' | 'fintech' | 'publisher' | 'other'
  >('investor')
  const [fullName, setFullName] = useState('')
  const [orgName, setOrgName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [investmentOrSize, setInvestmentOrSize] = useState('')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Persist lead locally
    const lead = {
      partnerType,
      fullName,
      orgName,
      email,
      phone,
      investmentOrSize,
      notes,
      createdAt: new Date().toISOString(),
    }
    try {
      const existing = JSON.parse(localStorage.getItem('classio_partner_leads') || '[]')
      localStorage.setItem('classio_partner_leads', JSON.stringify([lead, ...existing]))
    } catch {
      // ignore
    }
    setSubmitted(true)
  }

  const handleWhatsAppDirect = () => {
    const text =
      lang === 'en'
        ? `Hello Classio Team, I am interested in exploring a ${partnerType} partnership with Classio.`
        : `السلام عليكم فريق كلاسيو، أود الاستفسار وبحث فرصة شراكة من نوع (${partnerType}) معكم.`
    window.open(`https://wa.me/201012345678?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleDownloadDeck = () => {
    setIsDownloading(true)
    setTimeout(() => {
      setIsDownloading(false)
      const content = `CLASSIO PLATFORM - INVESTOR EXECUTIVE SUMMARY (2026-2027)
======================================================
Market: Egypt Shadow Education & Tutoring ($2.1B+ Annual TAM)
Traction: 500+ Active Tutors, 18,500+ Managed Students
Retention: 96% Tutor Retention Rate
Moat: Native Egyptian Payment Integration (InstaPay/Vodafone Cash), Pedagogical Success Tracking
Contact: partnerships@classio.app / WhatsApp: +20 101 234 5678`
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Classio-Investor-Teaser-2026.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <ClassioLogo size="md" />
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <Globe className="size-3.5 text-[#0f2c59]" />
              <span>{lang === 'en' ? 'العربية' : 'English'}</span>
            </button>

            <Link
              href="/dashboard"
              className="hidden sm:inline-flex rounded-xl bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-800 transition cursor-pointer"
            >
              {lang === 'en' ? 'Live Demo' : 'تجربة حية'}
            </Link>

            <a
              href="#contact-form"
              className="rounded-xl bg-[#0f2c59] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#1a3d6d] shadow-sm transition"
            >
              {lang === 'en' ? 'Get in Touch' : 'تواصل معنا'}
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/20 to-transparent py-16 sm:py-24 border-b border-slate-200/60">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200/70 px-4 py-1.5 text-xs font-bold text-[#0f2c59] mb-6">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>
              {lang === 'en'
                ? 'Strategic Partnerships & Investor Relations'
                : 'بوابة الشراكات الاستراتيجية وعلاقات المستثمرين'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            {lang === 'en' ? (
              <>
                Scaling Egypt’s <span className="text-[#0f2c59]">$2.1B+</span> Tutoring & Shadow Education Economy
              </>
            ) : (
              <>
                قيادة وتطوير اقتصاد الدروس الخصوصية في مصر{' '}
                <span className="text-[#0f2c59]">(أكثر من ٢.١ مليار دولار)</span>
              </>
            )}
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            {lang === 'en'
              ? 'Classio is the infrastructure powering independent tutors, tutoring centers, and academies across Cairo, Alexandria, and all Egyptian governorates. We bridge academic proof of progress with modern FinTech (InstaPay & Vodafone Cash).'
              : 'كلاسيو هي البنية التحتية الرقمية التي تدير أعمال آلاف المدرسين والسناتر التعليمية في القاهرة والإسكندرية والمحافظات. نجمع بين إثبات النجاح الأكاديمي للطلاب وحلول الدفع الرقمي عبر إنستاباي ومحافظ الهواتف الذكية.'}
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="#contact-form"
              className="flex items-center gap-2 rounded-2xl bg-[#0f2c59] px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-[#1a3d6d] shadow-lg shadow-blue-900/10 transition cursor-pointer"
            >
              <span>{lang === 'en' ? 'Inquire / Request Investor Deck' : 'طلب العرض الاستثماري / الشراكة'}</span>
              <ArrowRight className={`size-4 ${isRTL ? 'rotate-180' : ''}`} />
            </a>

            <button
              onClick={handleDownloadDeck}
              disabled={isDownloading}
              className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
            >
              <Download className="size-4 text-[#0f2c59]" />
              <span>
                {isDownloading
                  ? (lang === 'en' ? 'Preparing Teaser...' : 'جارِ التحميل...')
                  : (lang === 'en' ? 'Download Executive Summary (PDF)' : 'تحميل الملخص التنفيذي')}
              </span>
            </button>

            <button
              onClick={handleWhatsAppDirect}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer"
            >
              <MessageCircle className="size-4" />
              <span>{lang === 'en' ? 'VIP WhatsApp Desk' : 'واتساب الشراكات المباشر'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Key Market Metrics / The Egypt Opportunity */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <div className="card-glass p-5 text-center">
            <p className="text-2xl sm:text-4xl font-black text-[#0f2c59] tracking-tight">$2.1 Billion</p>
            <p className="mt-1 text-xs sm:text-sm font-bold text-slate-700">
              {lang === 'en' ? 'Egypt Tutoring TAM' : 'سوق الدروس الخصوصية في مصر'}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {lang === 'en' ? 'Annual household education expenditure' : 'إنفاق سنوي للأسرة المصرية'}
            </p>
          </div>

          <div className="card-glass p-5 text-center">
            <p className="text-2xl sm:text-4xl font-black text-emerald-600 tracking-tight">25M+ Students</p>
            <p className="mt-1 text-xs sm:text-sm font-bold text-slate-700">
              {lang === 'en' ? 'K-12 Population' : 'طالب في التعليم قبل الجامعي'}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {lang === 'en' ? 'Largest student base in MENA region' : 'أكبر قاعدة طلابية بالشرق الأوسط'}
            </p>
          </div>

          <div className="card-glass p-5 text-center">
            <p className="text-2xl sm:text-4xl font-black text-amber-600 tracking-tight">500+ Tutors</p>
            <p className="mt-1 text-xs sm:text-sm font-bold text-slate-700">
              {lang === 'en' ? 'Active Platform Tutors' : 'مدرس وسنتر نشط حالياً'}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {lang === 'en' ? '18,500+ verified active students' : 'أكثر من ١٨,٥٠٠ طالب نشط'}
            </p>
          </div>

          <div className="card-glass p-5 text-center">
            <p className="text-2xl sm:text-4xl font-black text-purple-600 tracking-tight">96%</p>
            <p className="mt-1 text-xs sm:text-sm font-bold text-slate-700">
              {lang === 'en' ? 'Tutor Retention Rate' : 'معدل بقاء واستمرار المدرسين'}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {lang === 'en' ? 'High LTV, zero churn on core centers' : 'اعتماد يومي كامل كأداة تشغيل أساسية'}
            </p>
          </div>
        </div>
      </section>

      {/* 4 Partnership Pillars */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {lang === 'en' ? 'Who We Partner With' : 'مسارات الشراكة والتعاون الاستراتيجي'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            {lang === 'en'
              ? 'We tailor strategic alliances for scale, mutual profitability, and educational impact.'
              : 'نصمم نماذج شراكة تلائم طبيعة عملك لتحقيق أقصى عائد وأعلى جودة تعليمية.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1: Investors & VCs */}
          <div className="card-glass p-6 sm:p-8 space-y-4 border-slate-200 hover:border-blue-300">
            <div className="size-12 rounded-2xl bg-blue-50 text-[#0f2c59] flex items-center justify-center">
              <Briefcase className="size-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {lang === 'en' ? 'Investors & Venture Capital Funds' : 'المستثمرون وصناديق رأس المال الجريء'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {lang === 'en'
                ? 'Join our journey digitizing informal education across Egypt and the MENA region. We operate with lean capital efficiency, strong recurring SaaS cash flow, and unprecedented defensibility at the grassroots educator level.'
                : 'شارك في بناء أكبر بنية تحتية رقمية لاقتصاد التعليم الموازي في مصر والشرق الأوسط. نموذج عمل SaaS قائم على تدفقات نقدية واضحة ومعدل نمو متسارع مع عملاء لا يستغنون عن المنصة.'}
            </p>
            <ul className="space-y-2 text-xs font-semibold text-slate-700 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>{lang === 'en' ? 'High gross margin B2B SaaS structure' : 'هوامش ربحية مجملة مرتفعة لنموذج B2B SaaS'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>{lang === 'en' ? 'Negative working capital & upfront tuition cycles' : 'دورات تحصيل مسبقة وديناميكية مالية صحية'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>{lang === 'en' ? 'Regional expansion path into KSA and Gulf markets' : 'جاهزية للتوسع الإقليمي في السوق السعودي والخليجي'}</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2: Educational Centers */}
          <div className="card-glass p-6 sm:p-8 space-y-4 border-slate-200 hover:border-emerald-300">
            <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building2 className="size-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {lang === 'en' ? 'Educational Centers & Academies' : 'السناتر والمراكز والأكاديميات التعليمية'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {lang === 'en'
                ? 'Eliminate chaotic paper attendance and payment disputes. Classio equips your center with automated student barcodes, multi-teacher room scheduling, and automatic percentage splits.'
                : 'تخلص من أعباء الدفاتر الورقية والنزاعات المالية. سنترك بالكامل على نظام سحابي موحد: مسح باركود الطلاب، إدارة القاعات، وتوزيع نسب المدرسين تلقائياً وبكل دقة.'}
            </p>
            <ul className="space-y-2 text-xs font-semibold text-slate-700 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>{lang === 'en' ? 'White-label & co-branding for your center' : 'تخصيص الهوية والشعار لسنترك التعليمي'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>{lang === 'en' ? 'Rapid Excel batch import of all registered students' : 'استيراد فوري لكافة الطلاب والبيانات من ملفات Excel'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>{lang === 'en' ? 'Dedicated on-site training & support account manager' : 'تدريب عملي لفريق السكرتارية ومدير حساب مخصص'}</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3: FinTech & Payment Rails */}
          <div className="card-glass p-6 sm:p-8 space-y-4 border-slate-200 hover:border-amber-300">
            <div className="size-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <WalletCards className="size-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {lang === 'en' ? 'FinTech & Payment Partners' : 'شركاء التكنولوجيا المالية والمدفوعات'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {lang === 'en'
                ? 'Partner with Classio to route high-volume recurring tuition payments across Egypt. We process monthly tuition fees via InstaPay, Vodafone Cash, Fawry, and card rails.'
                : 'شراكة لمعالجة وتسهيل ملايين الجنيهات من تحصيلات المصاريف الشهرية عبر إنستاباي، محافظ المحمول الذكية، ماكينات فوري، وبطاقات ميزة والبنوك المصرية.'}
            </p>
            <ul className="space-y-2 text-xs font-semibold text-slate-700 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>{lang === 'en' ? 'Automated digital payment receipt generation' : 'إصدار إيصالات دفع رقمية فورية موثقة'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>{lang === 'en' ? 'Parent installment & bundle fee payment options' : 'حلول تقسيط المصاريف وتجميع الباقات لأولياء الأمور'}</span>
              </li>
            </ul>
          </div>

          {/* Pillar 4: Academic Publishers */}
          <div className="card-glass p-6 sm:p-8 space-y-4 border-slate-200 hover:border-purple-300">
            <div className="size-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <FileText className="size-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {lang === 'en' ? 'Publishers & Celebrity Subject Leaders' : 'دور النشر ومؤلفو المناهج والمدرسون الرواد'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {lang === 'en'
                ? 'Distribute copyrighted study notes, homework question banks, and exam papers directly to students with digital verification and student tracking.'
                : 'توزيع المذكرات وبنوك الأسئلة والامتحانات التراكمية مباشرة إلى آلاف الطلاب مع حفظ حقوق الملكية الفكرية ومتابعة درجات الحل.'}
            </p>
            <ul className="space-y-2 text-xs font-semibold text-slate-700 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>{lang === 'en' ? 'Integrated question bank & homework assignment sheets' : 'ربط بنوك الأسئلة بالواجبات والتكليفات الأسبوعية'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>{lang === 'en' ? 'Exclusive co-branded student portals' : 'بوابات خاصة تحمل اسم وهوية المدرس أو دار النشر'}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Contact & Deck Request Form */}
      <section id="contact-form" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="card-glass border-slate-200/80 p-6 sm:p-10 shadow-xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="rounded-full bg-blue-100/70 px-3 py-1 text-xs font-bold text-[#0f2c59]">
              {lang === 'en' ? 'Direct Leadership Channel' : 'قناة التواصل المباشرة مع الإدارة'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {lang === 'en' ? 'Request Pitch Deck or Partnership Meeting' : 'طلب العرض التقديمي أو اجتماع شراكة'}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              {lang === 'en'
                ? 'Fill out the brief below and our founders will respond within 12 business hours.'
                : 'سجل بياناتك وسيقوم فريق التأسيس بالتواصل معك خلال ١٢ ساعة عمل.'}
            </p>
          </div>

          {submitted ? (
            <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-8 text-center space-y-4 animate-in fade-in">
              <div className="size-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-8" />
              </div>
              <h3 className="text-xl font-black text-emerald-900">
                {lang === 'en' ? 'Inquiry Submitted Successfully!' : 'تم استلام طلبكم بنجاح!'}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
                {lang === 'en'
                  ? 'Thank you for reaching out to Classio. A founding partner will review your inquiry and follow up promptly with the requested materials.'
                  : 'شكراً لاهتمامكم بالشراكة مع كلاسيو. سيقوم أحد الشركاء المؤسسين بمراجعة طلبكم وإرسال المواد المطلوبة وتنسيق موعد اجتماع.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <button
                  onClick={handleWhatsAppDirect}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="size-4" />
                  {lang === 'en' ? 'Message on WhatsApp Now' : 'متابعة عبر واتساب مباشرة'}
                </button>
                <button
                  onClick={() => setSubmitted(false)}
                  className="rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                >
                  {lang === 'en' ? 'Submit Another Inquiry' : 'إرسال طلب آخر'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
              {/* Partner Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {lang === 'en' ? 'I am interested as a:' : 'أنا مهتم بالشراكة بصفتي:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'investor', label: lang === 'en' ? 'Investor / VC' : 'مستثمر / صندوق استثمار' },
                    { id: 'center', label: lang === 'en' ? 'Educational Center' : 'سنتر / مركز تعليمي' },
                    { id: 'fintech', label: lang === 'en' ? 'FinTech / Payments' : 'مدفوعات وتكنولوجيا مالية' },
                    { id: 'publisher', label: lang === 'en' ? 'Publisher / Author' : 'دار نشر / مؤلف' },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPartnerType(p.id as any)}
                      className={`rounded-xl p-2.5 text-xs font-bold border transition text-center cursor-pointer ${
                        partnerType === p.id
                          ? 'bg-[#0f2c59] text-white border-[#0f2c59] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Org */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'en' ? 'Your Full Name' : 'الاسم الكامل'} *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder={lang === 'en' ? 'e.g. Tarek Mansour' : 'مثال: طارق منصور'}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs outline-none focus:border-[#0f2c59] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'en' ? 'Organization / Fund / Center Name' : 'اسم المؤسسة / الصندوق / السنتر'} *
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    placeholder={lang === 'en' ? 'e.g. Nile Capital / Al-Rowad Center' : 'مثال: سنتر الأوائل / نايل كابيتال'}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs outline-none focus:border-[#0f2c59] focus:bg-white"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'en' ? 'Email Address' : 'البريد الإلكتروني الرسمي'} *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs outline-none focus:border-[#0f2c59] focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'en' ? 'Phone / WhatsApp Number' : 'رقم الهاتف / واتساب'} *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+20 10X XXX XXXX"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs outline-none focus:border-[#0f2c59] focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Investment Range or Center Size */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {partnerType === 'investor'
                    ? (lang === 'en' ? 'Typical Ticket Size / Stage' : 'حجم التذكرة الاستثمارية / المرحلة')
                    : (lang === 'en' ? 'Center Student Capacity / Branches' : 'عدد الطلاب المتوقع / عدد الفروع')}
                </label>
                <input
                  type="text"
                  value={investmentOrSize}
                  onChange={(e) => setInvestmentOrSize(e.target.value)}
                  placeholder={
                    partnerType === 'investor'
                      ? (lang === 'en' ? 'e.g. $50k - $250k Angel / Seed' : 'مثال: ٥٠ ألف إلى ٢٥٠ ألف دولار / جولة تمويلية أولى')
                      : (lang === 'en' ? 'e.g. 1,200 students across 3 centers' : 'مثال: ١,٢٠٠ طالب في ٣ سناتر')
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs outline-none focus:border-[#0f2c59] focus:bg-white"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Message & Strategic Objectives' : 'الرسالة وأهداف الشراكة'}
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'Tell us about your background, vision, or specific questions...'
                      : 'أخبرنا بنبذة عن أهدافكم أو أي استفسار محدد تودون مناقشته...'
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs outline-none focus:border-[#0f2c59] focus:bg-white"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-2xl bg-[#0f2c59] py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#1a3d6d] shadow-md transition cursor-pointer"
              >
                <Send className="size-4 me-2" />
                {lang === 'en' ? 'Submit Inquiry & Request Materials' : 'إرسال الطلب وطلب ملف الشراكة'}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Classio Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 font-bold">
            <Link href="/" className="hover:text-[#0f2c59]">
              {lang === 'en' ? 'Home' : 'الرئيسية'}
            </Link>
            <Link href="/dashboard" className="hover:text-[#0f2c59]">
              {lang === 'en' ? 'Dashboard' : 'لوحة التحكم'}
            </Link>
            <Link href="/pricing" className="hover:text-[#0f2c59]">
              {lang === 'en' ? 'Pricing' : 'الأسعار'}
            </Link>
            <a
              href="https://wa.me/201012345678"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <MessageCircle className="size-3" />
              WhatsApp Helpdesk
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
