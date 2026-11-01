'use client'

import React from 'react'
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
  Phone,
  RefreshCw,
  LogOut,
  X,
  Radio,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { adminAuth } from '@/lib/admin-auth'
import { GlobalAnnouncement } from '@/lib/admin-types'
import { useRouter } from 'next/navigation'

// 1. Maintenance Mode Shield
export function MaintenanceModeShield({
  message,
  messageAr,
  lang,
}: {
  message?: string
  messageAr?: string
  lang: 'ar' | 'en'
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950 text-white selection:bg-amber-500 selection:text-slate-950">
      <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-8 shadow-2xl shadow-amber-950/60 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 animate-pulse" />

        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400 mb-5 shadow-lg shadow-amber-950/50">
          <Clock className="w-10 h-10 animate-spin" style={{ animationDuration: '6s' }} />
        </div>

        <span className="inline-block text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-700/50 mb-3">
          {lang === 'ar' ? 'أعمال صيانة وتحديث مجدولة' : 'SCHEDULED SYSTEM MAINTENANCE'}
        </span>

        <h2 className="text-xl sm:text-2xl font-black text-slate-100 mb-3">
          {lang === 'ar' ? 'المنصة تخضع للصيانة والترقية الآن' : 'Classio is Undergoing Maintenance'}
        </h2>

        <p className="text-sm text-slate-300 leading-relaxed mb-6 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
          {lang === 'ar'
            ? messageAr || 'يجري حالياً تحديث خوادم المنصة وترقية قواعد بيانات المجموعات والطلاب. سنعود للعمل بكامل طاقتنا في أقرب وقت.'
            : message || 'We are currently enhancing platform performance and updating core databases. Normal access will resume shortly.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إعادة المحاولة والتحديث' : 'Refresh Page'}</span>
          </button>

          <a
            href="https://wa.me/201299930937"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'ar' ? 'تواصل مع الدعم الفني' : 'WhatsApp Support'}</span>
          </a>
        </div>
      </div>
    </div>
  )
}

// 2. Suspended / Banned Tutor Shield ("bend")
export function TutorSuspendedShield({
  tutorName,
  reason,
  lang,
}: {
  tutorName: string
  reason?: string
  lang: 'ar' | 'en'
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950 text-white selection:bg-red-500 selection:text-white">
      <div className="w-full max-w-lg bg-slate-900 border border-red-500/40 rounded-3xl p-8 shadow-2xl shadow-red-950/80 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 to-rose-600" />

        <div className="w-20 h-20 rounded-3xl bg-red-600/10 border border-red-500/40 mx-auto flex items-center justify-center text-red-400 mb-5 shadow-lg shadow-red-950/50">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </div>

        <span className="inline-block text-[11px] font-black uppercase tracking-widest text-red-400 bg-red-950/80 px-3 py-1 rounded-full border border-red-700/50 mb-3">
          {lang === 'ar' ? 'تم تجميد وإيقاف الحساب' : 'ACCOUNT SUSPENDED BY SUPER-ADMIN'}
        </span>

        <h2 className="text-xl sm:text-2xl font-black text-slate-100 mb-2">
          {lang === 'ar' ? `نأسف، تم إيقاف حساب (${tutorName})` : `Account Suspended: ${tutorName}`}
        </h2>

        <div className="text-start bg-red-950/40 border border-red-800/50 rounded-2xl p-4 my-5 text-xs text-red-200">
          <p className="font-bold text-red-300 mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{lang === 'ar' ? 'السبب المسجل من إدارة المنصة:' : 'Administrative Suspension Reason:'}</span>
          </p>
          <p className="text-slate-300 text-xs leading-relaxed ps-5">
            {reason || (lang === 'ar' ? 'تم إيقاف الحساب بقرار إداري للمراجعة والتدقيق.' : 'Account suspended per administrative policy.')}
          </p>
        </div>

        <p className="text-xs text-slate-400 mb-6">
          {lang === 'ar'
            ? 'لإعادة تفعيل الحساب أو تسوية الاشتراك، يرجى التواصل مباشرة مع الإدارة العامة للمنصة.'
            : 'To reinstate your account or resolve subscription inquiries, please contact administration directly.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://wa.me/201299930937?text=استفسار%20عن%20تجميد%20حساب%20المدرس"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Phone className="w-4 h-4" />
            <span>{lang === 'ar' ? 'التواصل المباشر عبر واتساب' : 'Contact Support'}</span>
          </a>

          <button
            onClick={() => {
              localStorage.removeItem('classio_auth_user')
              window.location.href = '/'
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تسجيل الخروج والعودة' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// 3. Pending Admission / Review Shield
export function TutorPendingApprovalShield({
  tutorName,
  lang,
}: {
  tutorName: string
  lang: 'ar' | 'en'
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950 text-white">
      <div className="w-full max-w-lg bg-slate-900 border border-blue-500/40 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/30 mx-auto flex items-center justify-center text-blue-400 mb-5 shadow-lg shadow-blue-950">
          <Clock className="w-10 h-10 animate-pulse" />
        </div>

        <span className="inline-block text-[11px] font-black uppercase tracking-widest text-blue-400 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-700/50 mb-3">
          {lang === 'ar' ? 'الحساب قيد المراجعة والاعتماد' : 'ACCOUNT UNDER REVIEW'}
        </span>

        <h2 className="text-xl sm:text-2xl font-black text-slate-100 mb-2">
          {lang === 'ar' ? `أهلاً بك، أستاذ ${tutorName}` : `Welcome, ${tutorName}`}
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed my-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          {lang === 'ar'
            ? 'تم تسجيل حسابك بنجاح وهو الآن بانتظار موافقة واعتماد السوبر أدمن (إدارة المنصة). فور قبولك، سيتم تفعيل لوحة التحكم ومجموعاتك فوراً.'
            : 'Your registration was received and is awaiting master super-admin admission approval. Once admitted, your workspace will activate immediately.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{lang === 'ar' ? 'فحص حالة الاعتماد الآن' : 'Check Admission Status'}</span>
          </button>

          <button
            onClick={() => {
              localStorage.removeItem('classio_auth_user')
              window.location.href = '/'
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
          >
            {lang === 'ar' ? 'الخروج للصفحة الرئيسية' : 'Return Home'}
          </button>
        </div>
      </div>
    </div>
  )
}

// 4. Global Announcement Top Bar for Tutor Dashboard
export function GlobalAnnouncementBar({
  announcement,
  lang,
}: {
  announcement: GlobalAnnouncement
  lang: 'ar' | 'en'
}) {
  const [dismissed, setDismissed] = React.useState(false)

  if (!announcement.active || dismissed) return null

  const typeStyles = {
    urgent: 'bg-red-600 text-white shadow-lg shadow-red-900/30',
    warning: 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-900/30',
    success: 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30',
    info: 'bg-[#0f2c59] text-white shadow-lg shadow-blue-950/30',
  }

  return (
    <div className={`w-full py-2 px-4 transition-all relative z-40 ${typeStyles[announcement.type]}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <Radio className="w-4 h-4 shrink-0 animate-pulse" />
          <span className="font-bold truncate">
            {lang === 'ar' ? announcement.message_ar || announcement.message : announcement.message}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {announcement.action_text && (
            <a
              href={announcement.action_url || '#'}
              className="text-[11px] font-black underline hover:opacity-80"
            >
              {lang === 'ar' ? announcement.action_text_ar || announcement.action_text : announcement.action_text}
            </a>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded hover:bg-black/20 text-current"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// 5. Admin Impersonation Sticky Bar
export function AdminImpersonationBar({
  tutorName,
  lang,
}: {
  tutorName: string
  lang: 'ar' | 'en'
}) {
  const router = useRouter()

  const handleReturn = () => {
    adminAuth.setImpersonatedTutor(null)
    router.push('/admin')
  }

  return (
    <div className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white py-2 px-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span className="font-black tracking-wide">
            {lang === 'ar'
              ? `👑 نمط المعاينة الإدارية: أنت تتصفح لوحة تحكم (${tutorName}) بصلاحيات السوبر أدمن`
              : `👑 Admin Impersonation Active: Inspecting dashboard for ${tutorName}`}
          </span>
        </div>

        <button
          onClick={handleReturn}
          className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-900 font-black text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition"
        >
          <span>{lang === 'ar' ? 'العودة لغرفة العمليات المركزية' : 'Return to Super-Admin'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
