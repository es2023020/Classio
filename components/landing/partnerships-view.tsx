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
  BookOpen,
  Eye,
  Building,
} from 'lucide-react'
import { ClassioLogo } from '@/components/ui/classio-logo'
import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'

export function PartnershipsView() {
  const { lang, toggleLang, isRTL } = useLanguage()

  // Tab State: 'overview' | 'executive_summary' | 'contact'
  const [activeTab, setActiveTab] = useState<'overview' | 'executive_summary'>('executive_summary')

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
        ? `Hello Classio Leadership, I am reviewing the Executive Summary and would like to connect regarding a ${partnerType} partnership.`
        : `السلام عليكم فريق قيادة كلاسيو، لقد اطلعت على الملخص التنفيذي وأرغب في مناقشة فرصة شراكة من نوع (${partnerType}) معكم.`
    window.open(`https://wa.me/201299930937?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleDownloadDeck = () => {
    setIsDownloading(true)
    setTimeout(() => {
      setIsDownloading(false)
      const content = `CLASSIO | EXECUTIVE SUMMARY
======================================================
THE OPERATING PLATFORM FOR PRIVATE TUTORS
A simpler way to run, organise and grow a tutoring business.
EXECUTIVE SUMMARY • EGYPT • NOVEMBER 2026

1. THE OPPORTUNITY
------------------------------------------------------
Private tutoring is a major part of Egypt’s education landscape, but running a tutoring operation can be administratively fragmented. Tutors may coordinate students, groups, schedules, attendance, fees, homework, marks and parent updates across notebooks, spreadsheets and messaging apps. As student numbers grow, keeping everything organised becomes increasingly difficult.

Classio is an Arabic-first, mobile-first SaaS platform that brings these essential activities together in one practical workspace. It helps tutors spend less time on administration and more time teaching, supporting students and growing their businesses.

2. WHAT CLASSIO DELIVERS
------------------------------------------------------
- STUDENT MANAGEMENT: Student profiles, groups and class information organised in one place.
- DAILY OPERATIONS: Scheduling, attendance, homework and lesson notes with less manual coordination.
- PAYMENTS & VISIBILITY: Fee tracking, outstanding balances and reports for better operational visibility.
- LEARNING PROGRESS: Marks, assessments and progress records to support informed follow-up.

3. BUSINESS MODEL
------------------------------------------------------
Classio uses a subscription model for tutors at different stages—from independent tutors with a small student base to established operations with larger cohorts and more complex requirements. A free entry point reduces adoption friction; paid plans unlock greater capacity and more advanced management tools.

PLAN                ACTIVE STUDENTS             MONTHLY PRICE
Free                Up to 10                    EGP 0
Starter             11–30                       EGP 99
Growth              31–100                      EGP 299
Pro                 101–250                     EGP 449
Power               251–500                     EGP 799
Enterprise / Custom Custom capacity & needs     By consultation

* Enterprise is quote-based for tutors with very large student populations, multiple branches or teams, integrations, or specific workflows that do not fit a standard package.

4. POSITIONING & GROWTH STRATEGY
------------------------------------------------------
Classio aims to become the everyday management system for private tutors in Egypt. Its positioning is focused: not a general-purpose school system, but a practical platform built around the operating needs of individual tutors and larger tutoring businesses.

The initial go-to-market approach prioritises direct tutor discovery and product-led adoption: speak with tutors, demonstrate the product in their real teaching context, onboard a focused pilot cohort, and use feedback to improve activation, retention and referrals. The free plan helps tutors experience value before upgrading as their student base or operational needs grow.

Early growth is evidence-led. Classio measures which features drive repeated weekly use, conversion from free to paid, willingness to pay, retention and the most effective acquisition channels before scaling marketing spend.

5. TECHNOLOGY & DELIVERY
------------------------------------------------------
Classio is built using Next.js and Supabase, providing a modern web application foundation and managed backend services. The product is accessible across common devices, with an Arabic-first, mobile-first experience suited to the way tutors work. Development focuses on reliability, data protection, usability, reporting and integrations that solve validated customer problems.

6. CURRENT STAGE
------------------------------------------------------
- PRODUCT: Built & ready (Core platform developed)
- COMMERCIAL STAGE: Pre-launch (0 tutors onboarded at stated stage)
- INITIAL MARKET: Egypt (Private tutors)

The next critical task is market validation—recruiting an initial group of tutors, observing real-life usage, and turning that learning into a repeatable onboarding and acquisition process.

7. VISION & THE NEXT CHAPTER
------------------------------------------------------
The long-term ambition is to make Classio the trusted operating platform for private tutoring businesses: first serving individual tutors across Egypt, then expanding to larger tutoring centres and relevant markets across the wider MENA region.

"Turn a ready product into a product tutors use every day."
Classio is entering its most important early phase: proving demand, earning tutor trust and establishing a repeatable path from first use to paid subscription.

CONTACT & INQUIRIES:
Email: partnerships@classio.app
Direct Leadership Contact: Via official WhatsApp concierge`
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Classio-Executive-Summary-Egypt-Nov2026.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 overflow-x-hidden selection:bg-[#0f2c59] selection:text-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <ClassioLogo size="md" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <Globe className="size-3.5 text-[#0f2c59]" />
              <span>{lang === 'en' ? 'العربية' : 'English'}</span>
            </button>

            <Link
              href="/pricing"
              className="hidden sm:inline-flex rounded-xl bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-800 transition cursor-pointer"
            >
              {lang === 'en' ? 'Pricing' : 'خطط الأسعار'}
            </Link>

            <button
              onClick={handleWhatsAppDirect}
              className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <MessageCircle className="size-3.5" />
              <span className="hidden sm:inline">{lang === 'en' ? 'Direct WhatsApp' : 'محادثة فورية'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-blue-50/20 py-12 sm:py-16 border-b border-slate-200/60">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0f2c59]/5 border border-[#0f2c59]/15 px-3.5 py-1.5 text-xs font-bold text-[#0f2c59] mb-4">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>
              {lang === 'en'
                ? 'Official Document • Egypt • November 2026'
                : 'الوثيقة الرسمية • جمهورية مصر العربية • نوفمبر ٢٠٢٦'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight break-words">
            {lang === 'en' ? (
              <>
                The Operating Platform for{' '}
                <span className="text-[#0f2c59] underline decoration-amber-400 decoration-wavy decoration-2">
                  Private Tutors
                </span>
              </>
            ) : (
              <>
                منصة التشغيل الرقمية المتكاملة{' '}
                <span className="text-[#0f2c59] underline decoration-amber-400 decoration-wavy decoration-2">
                  للمعلمين الخصوصيين في مصر
                </span>
              </>
            )}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-base text-slate-600 leading-relaxed font-medium">
            {lang === 'en'
              ? 'A simpler way to run, organise and grow a tutoring business. Review our official Executive Summary, business model, and strategic roadmap below.'
              : 'طريقة أكثر ذكاءً وسلاسة لتنظيم وإدارة وتنمية نشاط الدروس الخصوصية. اطلع على الملخص التنفيذي ونموذج العمل وخارطة الطريق الرسمية أدناه.'}
          </p>

          {/* Quick Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setActiveTab('executive_summary')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black transition cursor-pointer shadow-xs ${
                activeTab === 'executive_summary'
                  ? 'bg-[#0f2c59] text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileText className="size-4" />
              <span>{lang === 'en' ? 'Read Executive Summary' : 'عرض الملخص التنفيذي'}</span>
            </button>

            <button
              onClick={handleDownloadDeck}
              disabled={isDownloading}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
            >
              <Download className="size-4 text-[#0f2c59]" />
              <span>
                {isDownloading
                  ? (lang === 'en' ? 'Downloading...' : 'جارِ التحميل...')
                  : (lang === 'en' ? 'Download Summary (PDF/Text)' : 'تحميل الملخص التنفيذي')}
              </span>
            </button>

            <button
              onClick={handleWhatsAppDirect}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs"
            >
              <MessageCircle className="size-4" />
              <span>{lang === 'en' ? 'Direct Leadership Chat' : 'تواصل مباشر عبر واتساب'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Document Content */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Document Header Header Plate */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg shadow-slate-200/50 mb-10">
          {/* Header strip */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-blue-700">
                THE OPERATING PLATFORM FOR PRIVATE TUTORS
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0f2c59] tracking-tight mt-1">
                Classio
              </h2>
              <p className="text-sm font-semibold text-slate-600 mt-1">
                A simpler way to run, organise and grow a tutoring business.
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                EXECUTIVE SUMMARY • EGYPT • NOVEMBER 2026
              </span>
            </div>
          </div>

          {/* Section 1: The Opportunity */}
          <section className="py-8 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 mb-3">
              <span className="size-2 rounded-full bg-blue-600"></span>
              {lang === 'en' ? 'The Opportunity' : 'الفرصة والاحتياج في السوق المصري'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-3">
              Private tutoring is a major part of Egypt’s education landscape, but running a tutoring operation can be administratively fragmented. Tutors may coordinate students, groups, schedules, attendance, fees, homework, marks and parent updates across notebooks, spreadsheets and messaging apps. As student numbers grow, keeping everything organised becomes increasingly difficult.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Classio is an Arabic-first, mobile-first SaaS platform that brings these essential activities together in one practical workspace. It helps tutors spend less time on administration and more time teaching, supporting students and growing their businesses.
            </p>
          </section>

          {/* Section 2: What Classio Delivers */}
          <section className="py-8 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
              <span className="size-2 rounded-full bg-emerald-600"></span>
              {lang === 'en' ? 'What Classio Delivers' : 'ما تقدمه منصة كلاسيو'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0f2c59] mb-1.5">
                  STUDENT MANAGEMENT
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Student profiles, groups and class information organised in one place.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0f2c59] mb-1.5">
                  DAILY OPERATIONS
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Scheduling, attendance, homework and lesson notes with less manual coordination.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0f2c59] mb-1.5">
                  PAYMENTS & VISIBILITY
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Fee tracking, outstanding balances and reports for better operational visibility.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0f2c59] mb-1.5">
                  LEARNING PROGRESS
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Marks, assessments and progress records to support informed follow-up.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Business Model & Pricing Table */}
          <section className="py-8 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 mb-2">
              <span className="size-2 rounded-full bg-amber-600"></span>
              {lang === 'en' ? 'Business Model' : 'نموذج العمل والاشتراكات'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-5">
              Classio uses a subscription model for tutors at different stages—from independent tutors with a small student base to established operations with larger cohorts and more complex requirements. A free entry point reduces adoption friction; paid plans unlock greater capacity and more advanced management tools.
            </p>

            {/* Official Pricing Table from Document */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="p-3.5 text-start font-black text-slate-800 uppercase tracking-wider min-w-[120px]">
                      PLAN
                    </th>
                    <th className="p-3.5 text-start font-black text-slate-800 uppercase tracking-wider min-w-[160px]">
                      ACTIVE STUDENTS
                    </th>
                    <th className="p-3.5 text-end font-black text-slate-800 uppercase tracking-wider min-w-[130px]">
                      MONTHLY PRICE
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 font-bold text-slate-900">Free</td>
                    <td className="p-3.5 text-slate-600">Up to 10</td>
                    <td className="p-3.5 text-end font-price font-black text-emerald-600 text-sm">EGP 0</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 font-bold text-slate-900">Starter</td>
                    <td className="p-3.5 text-slate-600">11–30</td>
                    <td className="p-3.5 text-end font-price font-black text-[#0f2c59] text-sm">EGP 99</td>
                  </tr>
                  <tr className="bg-blue-50/40 hover:bg-blue-50/70 transition">
                    <td className="p-3.5 font-black text-[#0f2c59] flex items-center gap-1.5">
                      <span>Growth</span>
                      <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">Popular</span>
                    </td>
                    <td className="p-3.5 text-slate-700 font-semibold">31–100</td>
                    <td className="p-3.5 text-end font-price font-black text-blue-700 text-sm">EGP 299</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 font-bold text-slate-900">Pro</td>
                    <td className="p-3.5 text-slate-600">101–250</td>
                    <td className="p-3.5 text-end font-price font-black text-[#0f2c59] text-sm">EGP 449</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 font-bold text-slate-900">Power</td>
                    <td className="p-3.5 text-slate-600">251–500</td>
                    <td className="p-3.5 text-end font-price font-black text-[#0f2c59] text-sm">EGP 799</td>
                  </tr>
                  <tr className="bg-purple-50/40 hover:bg-purple-50/70 transition">
                    <td className="p-3.5 font-black text-purple-900">Enterprise / Custom</td>
                    <td className="p-3.5 text-purple-800">Custom capacity & needs</td>
                    <td className="p-3.5 text-end font-bold text-purple-700 text-xs">By consultation</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-[11px] text-slate-500 italic">
              * Enterprise is quote-based for tutors with very large student populations, multiple branches or teams, integrations, or specific workflows that do not fit a standard package.
            </p>
          </section>

          {/* Section 4: Positioning & Growth Strategy */}
          <section className="py-8 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 mb-3">
              <span className="size-2 rounded-full bg-purple-600"></span>
              {lang === 'en' ? 'Positioning & Growth Strategy' : 'المكانة السوقية واستراتيجية النمو'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-3">
              Classio aims to become the everyday management system for private tutors in Egypt. Its positioning is focused: not a general-purpose school system, but a practical platform built around the operating needs of individual tutors and larger tutoring businesses.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-3">
              The initial go-to-market approach should prioritise direct tutor discovery and product-led adoption: speak with tutors, demonstrate the product in their real teaching context, onboard a focused pilot cohort, and use feedback to improve activation, retention and referrals. The free plan can help tutors experience value before upgrading as their student base or operational needs grow.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Early growth should be evidence-led. Classio should measure which features drive repeated weekly use, conversion from free to paid, willingness to pay, retention and the most effective acquisition channels before scaling marketing spend.
            </p>
          </section>

          {/* Section 5: Technology & Delivery */}
          <section className="py-8 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 mb-3">
              <span className="size-2 rounded-full bg-sky-600"></span>
              {lang === 'en' ? 'Technology & Delivery' : 'البنية التحتية والتطوير التقني'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Classio is built using Next.js and Supabase, providing a modern web application foundation and managed backend services. The product is intended to be accessible across common devices, with an Arabic-first, mobile-first experience suited to the way many tutors work. As adoption grows, development can focus on reliability, data protection, usability, reporting and integrations that solve validated customer problems.
            </p>
          </section>

          {/* Section 6: Current Stage */}
          <section className="py-8 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
              <span className="size-2 rounded-full bg-rose-600"></span>
              {lang === 'en' ? 'Current Stage' : 'المرحلة التشغيلية الحالية'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <span className="text-[10px] font-black uppercase text-slate-400">PRODUCT</span>
                <p className="text-base font-black text-slate-900 mt-1">Built & ready</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Core platform developed</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <span className="text-[10px] font-black uppercase text-slate-400">COMMERCIAL STAGE</span>
                <p className="text-base font-black text-[#0f2c59] mt-1">Pre-launch</p>
                <p className="text-[11px] text-slate-500 mt-0.5">0 tutors onboarded at stated stage</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <span className="text-[10px] font-black uppercase text-slate-400">INITIAL MARKET</span>
                <p className="text-base font-black text-emerald-700 mt-1">Egypt</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Private tutors</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-600 leading-relaxed font-normal">
              The next critical task is market validation—not simply adding more features. The immediate priority is to recruit an initial group of tutors, observe how they use the platform, and turn that learning into a repeatable onboarding and acquisition process.
            </p>
          </section>

          {/* Section 7: Vision & The Next Chapter */}
          <section className="pt-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 mb-3">
              <span className="size-2 rounded-full bg-indigo-600"></span>
              {lang === 'en' ? 'Vision' : 'الرؤية المستقبلية'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-6">
              The long-term ambition is to make Classio the trusted operating platform for private tutoring businesses: first serving individual tutors across Egypt, then expanding to larger tutoring centres and relevant markets across the wider MENA region. Growth should be built on a product tutors rely on every week, clear customer value and sustainable subscription revenue.
            </p>

            {/* The Next Chapter Highlight Box */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/80 p-5 sm:p-6">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-800">
                THE NEXT CHAPTER
              </span>
              <h4 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                Turn a ready product into a product tutors use every day.
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2 font-medium">
                Classio is entering its most important early phase: proving demand, earning tutor trust and establishing a repeatable path from first use to paid subscription.
              </p>
            </div>

            <p className="mt-4 text-[11px] text-slate-400 leading-normal">
              Note: Pricing and growth priorities reflect the current proposed launch strategy. Market size, adoption, revenue and expansion outcomes have not been independently validated and should be tested through customer interviews and early usage.
            </p>
          </section>
        </div>

        {/* Contact & Inquiries Card */}
        <div id="contact-form" className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="max-w-2xl mx-auto text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              {lang === 'en' ? 'Contact & Inquiries' : 'التواصل المباشر والاستفسارات'}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {lang === 'en' ? 'Connect with Classio Leadership' : 'تواصل مع فريق قيادة كلاسيو'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'en'
                ? 'Interested in pilots, investment, or center enterprise deployment? Reach out below.'
                : 'مهتم بالانضمام للدفعة الأولى، الاستثمار، أو تطبيق النظام في سناترك؟ تواصل معنا أدناه.'}
            </p>
          </div>

          {submitted ? (
            <div className="max-w-md mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
              <CheckCircle2 className="size-10 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-black text-slate-900 text-sm">
                {lang === 'en' ? 'Message Received' : 'تم استلام طلبك بنجاح'}
              </h4>
              <p className="text-xs text-slate-600 mt-1 mb-4">
                {lang === 'en'
                  ? 'Our team has received your inquiry and will reach out promptly.'
                  : 'استلم فريقنا طلبك وسيقوم بمراجعته والتواصل معك في أقرب وقت.'}
              </p>
              <button
                onClick={handleWhatsAppDirect}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
              >
                <MessageCircle className="size-4" />
                <span>{lang === 'en' ? 'Open WhatsApp Chat' : 'فتح محادثة واتساب الآن'}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'en' ? 'Full Name' : 'الاسم الكامل'}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'en' ? 'Organization / Center' : 'اسم المؤسسة أو السنتر'}
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="ltr"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'en' ? 'Phone / WhatsApp' : 'رقم الهاتف / واتساب'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    dir="ltr"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Notes or Inquiries' : 'ملاحظات أو استفسار'}
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2c59]"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Button
                  type="submit"
                  className="w-full sm:flex-1 py-3 rounded-xl bg-[#0f2c59] hover:bg-[#1a3d6d] text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  <Send className="size-3.5" />
                  <span>{lang === 'en' ? 'Submit Inquiry' : 'إرسال الاستفسار'}</span>
                </Button>

                <button
                  type="button"
                  onClick={handleWhatsAppDirect}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="size-3.5" />
                  <span>{lang === 'en' ? 'Chat Directly on WhatsApp' : 'محادثة فورية عبر واتساب'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <ClassioLogo size="sm" />
          <p>© {new Date().getFullYear()} Classio. All rights reserved.</p>
          <div className="flex items-center gap-4 font-bold text-[#0f2c59]">
            <Link href="/pricing">{lang === 'en' ? 'Pricing' : 'الأسعار'}</Link>
            <Link href="/partnerships">{lang === 'en' ? 'Executive Summary' : 'الملخص التنفيذي'}</Link>
            <Link href="/login">{lang === 'en' ? 'Sign In' : 'دخول المدرس'}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
