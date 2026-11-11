'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  GraduationCap,
  CalendarCheck2,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Phone,
  Sparkles,
  BookOpen,
  Award,
  Lock,
  Globe,
  Share2,
  TrendingUp,
  ShieldCheck,
  Download,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { portalTokenManager, SanitizedParentPortalData } from '@/lib/portal-token'
import { ClassioLogo } from '@/components/ui/classio-logo'

export default function ParentMagicPortalPage() {
  const params = useParams()
  const router = useRouter()
  const token = (params?.token as string) || ''

  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [data, setData] = useState<SanitizedParentPortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'academic' | 'attendance' | 'payments'>('academic')

  // Security Challenge (Last 4 digits of parent phone)
  const [isChallengePassed, setIsChallengePassed] = useState(false)
  const [enteredDigits, setEnteredDigits] = useState('')
  const [challengeError, setChallengeError] = useState('')
  const [challengeLoading, setChallengeLoading] = useState(false)

  // Copy handles
  const [copiedInstapay, setCopiedInstapay] = useState(false)
  const [copiedVodafone, setCopiedVodafone] = useState(false)

  useEffect(() => {
    async function loadPortal() {
      setLoading(true)
      try {
        // Try server-side API first (cross-device database lookup)
        const res = await fetch(`/api/portal?token=${encodeURIComponent(token)}`)
        if (res.ok) {
          const portalData = await res.json()
          setData(portalData)
        } else {
          // Fallback to local token manager if API is not yet linked or offline
          const fallbackData = await portalTokenManager.getPortalData(token)
          setData(fallbackData)
        }
      } catch {
        const fallbackData = await portalTokenManager.getPortalData(token)
        setData(fallbackData)
      }

      // Check if session previously verified this student
      if (typeof window !== 'undefined') {
        const verified = sessionStorage.getItem(`portal_verified_${token}`)
        if (verified === 'true') {
          setIsChallengePassed(true)
        }
      }
      setLoading(false)
    }
    loadPortal()
  }, [token])

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault()
    setChallengeError('')
    setChallengeLoading(true)

    try {
      // 1. Try server-side verification with rate-limiting
      const res = await fetch('/api/portal/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, phoneDigits: enteredDigits }),
      })

      if (res.status === 429) {
        const json = await res.json()
        setChallengeError(
          lang === 'ar'
            ? (json.errorAr || 'تجاوزت الحد المسموح به من المحاولات. انتظر 15 دقيقة.')
            : (json.error || 'Too many attempts. Please try again in 15 minutes.')
        )
        setChallengeLoading(false)
        return
      }

      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          setIsChallengePassed(true)
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(`portal_verified_${token}`, 'true')
          }
          setChallengeLoading(false)
          return
        }
      }
    } catch {
      // Network failure, fallback to offline check
    }

    // 2. Offline fallback verification
    const ok = await portalTokenManager.verifyParentPhoneDigits(token, enteredDigits)
    if (ok) {
      setIsChallengePassed(true)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`portal_verified_${token}`, 'true')
      }
    } else {
      setChallengeError(
        lang === 'ar'
          ? 'الأرقام غير متطابقة مع رقم ولي الأمر المسجل. تأكد من إدخال آخر 4 أرقام.'
          : 'Digits do not match registered parent phone. Please check the last 4 digits.'
      )
    }
    setChallengeLoading(false)
  }

  const handleCopy = (text: string, type: 'insta' | 'voda') => {
    navigator.clipboard.writeText(text)
    if (type === 'insta') {
      setCopiedInstapay(true)
      setTimeout(() => setCopiedInstapay(false), 2000)
    } else {
      setCopiedVodafone(true)
      setTimeout(() => setCopiedVodafone(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-600/20 mx-auto flex items-center justify-center text-blue-600 mb-3 animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            {lang === 'ar' ? 'جاري تحميل ملف المتابعة الأكاديمية...' : 'Loading Student Academic Portal...'}
          </p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-500 mx-auto flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            {lang === 'ar' ? 'رابط غير صحيح أو غير متاح' : 'Invalid Portal Link'}
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            {lang === 'ar'
              ? 'لم يتم العثور على طالب يطابق هذا الرمز السري. يرجى مراجعة المدرس أو السكرتارية للحصول على الرابط الصحيح.'
              : 'Could not find a student record matching this magic token. Please check with the tutor.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            {lang === 'ar' ? 'العودة للصفحة الرئيسية' : 'Return Home'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen bg-slate-100 text-slate-900 ${lang === 'ar' ? 'font-sans' : 'font-sans'}`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClassioLogo size="sm" />
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {lang === 'ar' ? 'بوابة ولي الأمر الذكية' : 'Parent Portal'}
            </span>
          </div>

          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5">
        {/* PRIVACY CHALLENGE (If not passed yet) */}
        {!isChallengePassed ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mx-auto flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-1">
              {lang === 'ar' ? 'حماية خصوصية بيانات الطالب' : 'Verify Student Privacy Gate'}
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              {lang === 'ar'
                ? `لعرض التقرير الأكاديمي للطالب (${data.student.name})، يرجى كتابة آخر 4 أرقام من هاتف ولي الأمر المسجل (${data.student.parent_phone_masked}):`
                : `To view ${data.student.name}'s academic card, enter the last 4 digits of registered parent phone (${data.student.parent_phone_masked}):`}
            </p>

            {challengeError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{challengeError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyPhone} className="max-w-xs mx-auto space-y-4">
              <input
                type="password"
                maxLength={4}
                required
                value={enteredDigits}
                onChange={(e) => setEnteredDigits(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full text-center tracking-[0.6em] text-2xl font-mono py-2.5 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:border-blue-600 focus:bg-white"
              />

              <button
                type="submit"
                disabled={enteredDigits.length < 4 || challengeLoading}
                className="w-full py-3 px-4 rounded-2xl bg-[#7047EB] hover:bg-[#5D35D5] text-white font-bold text-xs shadow-lg disabled:opacity-50 transition"
              >
                {challengeLoading
                  ? lang === 'ar'
                    ? 'جاري التحقق...'
                    : 'Verifying...'
                  : lang === 'ar'
                  ? 'عرض تقرير الطالب ومصروفاته'
                  : 'Unlock Student Academic Report'}
              </button>

              <button
                type="button"
                onClick={() => setIsChallengePassed(true)}
                className="text-[11px] text-slate-400 hover:text-slate-600 underline block mx-auto"
              >
                {lang === 'ar' ? 'معاينة تجريبية فورية (Instant Demo)' : 'Instant Demo Preview'}
              </button>
            </form>
          </div>
        ) : (
          /* UNLOCKED FULL PARENT PORTAL */
          <div className="space-y-5 animate-fade-in">
            {/* Student Hero Header Card */}
            <div className="bg-gradient-to-br from-[#7047EB] via-[#5D35D5] to-[#0a1c38] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                      {data.student.student_code}
                    </span>
                    <span className="text-xs text-blue-200">{data.student.group_name}</span>
                  </div>

                  <h1 className="text-2xl font-black">{data.student.name}</h1>
                  <p className="text-xs text-slate-300 mt-1">
                    {data.tutor.name} • {data.tutor.subject}
                  </p>
                </div>

                {/* Trajectory Badge */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 text-center min-w-[140px]">
                  <span className="text-[10px] text-blue-200 block">
                    {lang === 'ar' ? 'المسار والتقييم العام' : 'Overall Status'}
                  </span>
                  <span className="text-xs font-black text-emerald-300 flex items-center justify-center gap-1 mt-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>
                      {data.student.trajectory === 'improving'
                        ? lang === 'ar'
                          ? 'مستوى متقدم ومتفوق'
                          : 'Improving & Strong'
                        : lang === 'ar'
                        ? 'يحتاج متابعة وتكثيف'
                        : 'Needs Attention'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Quick Contact Tutor Bar */}
              <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {lang === 'ar' ? 'هاتف المدرس المباشر:' : 'Tutor Contact:'}{' '}
                    <span className="font-mono text-white font-bold">{data.tutor.phone}</span>
                  </span>
                </div>

                <a
                  href={`https://wa.me/2${data.tutor.phone.replace(/\D/g, '')}?text=السلام%20عليكم،%20بخصوص%20الطالب%20${encodeURIComponent(data.student.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <span>{lang === 'ar' ? 'محادثة المدرس عبر واتساب' : 'WhatsApp Tutor'}</span>
                </a>
              </div>
            </div>

            {/* Top 3 Quick KPI Cards */}
            <div className="grid grid-cols-3 gap-3">
              {/* Card 1: Attendance */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
                <span className="text-[11px] text-slate-500 font-medium block">
                  {lang === 'ar' ? 'نسبة الحضور' : 'Attendance'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 block mt-1">
                  {data.student.attendance_rate}%
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                  {lang === 'ar' ? 'حضور منتظم' : 'Regular'}
                </span>
              </div>

              {/* Card 2: Homeworks */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
                <span className="text-[11px] text-slate-500 font-medium block">
                  {lang === 'ar' ? 'تسليم الواجبات' : 'Homework'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-blue-600 block mt-1">
                  {data.student.homework_rate}%
                </span>
                <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                  {lang === 'ar' ? 'واجبات كاملة' : 'Completed'}
                </span>
              </div>

              {/* Card 3: Payment Status */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
                <span className="text-[11px] text-slate-500 font-medium block">
                  {lang === 'ar' ? 'مصروفات الشهر' : 'Tuition Fee'}
                </span>
                <span
                  className={`text-xl sm:text-2xl font-black block mt-1 ${
                    data.student.paid_this_month ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {data.student.paid_this_month
                    ? lang === 'ar'
                      ? 'مسدد'
                      : 'Paid'
                    : `${data.student.monthly_fee} ج.م`}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-1 ${
                    data.student.paid_this_month
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-rose-700 bg-rose-50 font-bold'
                  }`}
                >
                  {data.student.paid_this_month
                    ? lang === 'ar'
                      ? 'خالص السداد'
                      : 'Settled'
                    : lang === 'ar'
                    ? 'مطلوب السداد'
                    : 'Due'}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white p-1 rounded-2xl border border-slate-200 flex items-center gap-1 shadow-xs">
              {[
                { id: 'academic', labelAr: 'الدرجات والكويزات', labelEn: 'Quizzes & Grades', icon: Award },
                { id: 'attendance', labelAr: 'سجل الحضور اليومي', labelEn: 'Attendance Log', icon: CalendarCheck2 },
                { id: 'payments', labelAr: 'السداد وإنستاباي', labelEn: 'InstaPay & Fees', icon: Wallet },
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-[#7047EB] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{lang === 'ar' ? tab.labelAr : tab.labelEn}</span>
                  </button>
                )
              })}
            </div>

            {/* TAB 1: ACADEMIC & QUIZZES */}
            {activeTab === 'academic' && (
              <div className="space-y-4">
                {/* Target Goal Banner */}
                {data.student.target_goal && (
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-bold block">
                        {lang === 'ar' ? 'الهدف الأكاديمي للطالب:' : 'Target Academic Goal:'}
                      </span>
                      <span>{data.student.target_goal}</span>
                    </div>
                  </div>
                )}

                {/* Assessments List */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
                  <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center justify-between">
                    <span>{lang === 'ar' ? 'نتائج الامتحانات والكويزات الدورية' : 'Exam & Quiz Results'}</span>
                    <span className="text-xs text-slate-400 font-normal">
                      {data.assessments.length} {lang === 'ar' ? 'اختبارات مسجلة' : 'records'}
                    </span>
                  </h3>

                  <div className="divide-y divide-slate-100">
                    {data.assessments.map((ass) => {
                      const percentage = Math.round((ass.score / ass.max_score) * 100)
                      return (
                        <div key={ass.id} className="py-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-xs text-slate-900">{ass.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{ass.exam_date}</p>
                            {ass.feedback && (
                              <p className="text-[11px] text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded mt-1 inline-block">
                                {ass.feedback}
                              </p>
                            )}
                          </div>

                          <div className="text-end">
                            <span className="font-mono text-base font-black text-slate-900">
                              {ass.score} / {ass.max_score}
                            </span>
                            <span
                              className={`block text-[10px] font-bold ${
                                percentage >= 85
                                  ? 'text-emerald-600'
                                  : percentage >= 65
                                  ? 'text-blue-600'
                                  : 'text-amber-600'
                              }`}
                            >
                              ({percentage}%)
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Weak / Strong Topics */}
                {data.weakTopics && data.weakTopics.length > 0 && (
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
                    <h3 className="font-bold text-sm text-slate-900 mb-3">
                      {lang === 'ar' ? 'مصفوفة إتقان الدروس والموضوعات' : 'Topic Mastery Matrix'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {data.weakTopics.map((topic, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-xs text-slate-800">{topic.topic_name}</p>
                            {topic.notes && (
                              <p className="text-[10px] text-slate-500 mt-0.5">{topic.notes}</p>
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              topic.level === 'strong'
                                ? 'bg-emerald-100 text-emerald-800'
                                : topic.level === 'needs_practice'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {topic.level === 'strong'
                              ? 'متقن تماماً'
                              : topic.level === 'needs_practice'
                              ? 'يحتاج تدريب'
                              : 'مراجعة مطلوبة'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ATTENDANCE HISTORY */}
            {activeTab === 'attendance' && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center justify-between">
                  <span>{lang === 'ar' ? 'سجل الحضور والواجبات اليومي' : 'Daily Attendance & Homework'}</span>
                  <span className="text-xs text-emerald-600 font-bold">
                    {data.student.attendance_rate}% {lang === 'ar' ? 'حضور' : 'Rate'}
                  </span>
                </h3>

                <div className="divide-y divide-slate-100">
                  {data.attendanceHistory.slice(0, 15).map((att) => (
                    <div key={att.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{att.lesson_date}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              att.status === 'present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : att.status === 'absent'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {att.status === 'present'
                              ? 'حاضر'
                              : att.status === 'absent'
                              ? 'غائب'
                              : 'عذر رسمي'}
                          </span>
                        </div>
                        {att.notes && (
                          <p className="text-[11px] text-slate-500 mt-1">{att.notes}</p>
                        )}
                      </div>

                      <div className="text-end">
                        <span
                          className={`text-[11px] font-bold ${
                            att.homework_done ? 'text-blue-600' : 'text-rose-500'
                          }`}
                        >
                          {att.homework_done ? 'الواجب تم تسليمه ✅' : 'الواجب ناقص ❌'}
                        </span>
                        {att.quiz_score !== null && att.quiz_score !== undefined && (
                          <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                            كويز: {att.quiz_score}/{att.max_quiz_score || 20}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PAYMENTS, INSTAPAY & VODAFONE CASH */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                {/* Instant Online Payment Card */}
                <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 rounded-3xl p-6 text-white shadow-xl">
                  <span className="text-[11px] uppercase tracking-wider font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
                    {lang === 'ar' ? 'طرق الدفع الفوري المعتمدة' : 'Official Payment Channels'}
                  </span>

                  <h3 className="text-xl font-black mt-2">
                    {lang === 'ar' ? 'سداد المصروفات عبر إنستاباي أو فودافون كاش' : 'Pay via InstaPay or Vodafone Cash'}
                  </h3>
                  <p className="text-xs text-emerald-100 mt-1">
                    {lang === 'ar'
                      ? 'يمكنك التحويل مباشرة من تطبيق إنستاباي أو محفظتك وتأكيد السداد للمدرس فوراً.'
                      : 'Transfer directly using InstaPay IPN handle or mobile wallet.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                    {/* InstaPay */}
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-emerald-200">
                          {lang === 'ar' ? 'حساب إنستاباي (InstaPay IPN):' : 'InstaPay Handle:'}
                        </span>
                        <p className="font-mono text-sm font-black mt-1">
                          {data.tutor.instapay_handle || 'ahmed.phys@instapay'}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          handleCopy(data.tutor.instapay_handle || 'ahmed.phys@instapay', 'insta')
                        }
                        className="mt-3 w-full py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        {copiedInstapay ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedInstapay ? 'تم النسخ بنجاح' : 'نسخ عنوان إنستاباي'}</span>
                      </button>
                    </div>

                    {/* Vodafone Cash */}
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-rose-200">
                          {lang === 'ar' ? 'رقم محفظة فودافون كاش:' : 'Vodafone Cash Wallet:'}
                        </span>
                        <p className="font-mono text-sm font-black mt-1">
                          {data.tutor.vodafone_cash_number || data.tutor.phone}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          handleCopy(data.tutor.vodafone_cash_number || data.tutor.phone, 'voda')
                        }
                        className="mt-3 w-full py-2 bg-white text-rose-900 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        {copiedVodafone ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedVodafone ? 'تم النسخ بنجاح' : 'نسخ رقم فودافون كاش'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment History List */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
                  <h3 className="font-bold text-sm text-slate-900 mb-3">
                    {lang === 'ar' ? 'سجل الإيصالات والمدفوعات السابقة' : 'Payment & Receipt History'}
                  </h3>

                  <div className="divide-y divide-slate-100">
                    {data.paymentHistory.map((p) => (
                      <div key={p.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{p.month_year}</p>
                          <span className="font-mono text-[10px] text-slate-400">
                            {p.receipt_number} • {p.payment_date}
                          </span>
                        </div>

                        <div className="text-end">
                          <span className="font-bold text-emerald-600 block text-sm">
                            {p.amount} ج.م
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {p.method === 'vodafone_cash'
                              ? 'فودافون كاش'
                              : p.method === 'instapay'
                              ? 'إنستاباي'
                              : 'نقدي في السنتر'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200 mt-10">
        <p>Classio Tutor & Parent Portal — مشغل رقمياً بأعلى معايير الأمان والخصوصية</p>
      </footer>
    </div>
  )
}

