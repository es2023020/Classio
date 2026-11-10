'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldAlert,
  UsersRound,
  GraduationCap,
  Wallet,
  Settings,
  History,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Zap,
  ExternalLink,
  Plus,
  Search,
  Download,
  Upload,
  RefreshCw,
  BellRing,
  Lock,
  Phone,
  Building,
  Eye,
  Trash2,
  Filter,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Radio,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react'
import { adminAuth } from '@/lib/admin-auth'
import { adminStorage } from '@/lib/admin-storage'
import {
  ManagedTutor,
  PlatformSystemSettings,
  AuditLogEntry,
  GlobalAnnouncement,
  TutorAccountStatus,
  SubscriptionRequest,
} from '@/lib/admin-types'
import { Student, PaymentRecord, PlanTier, BillingCycle } from '@/lib/types'
import { AdminHeader } from '@/components/admin/admin-header'
import { PinUnlockModal } from '@/components/admin/pin-unlock-modal'
import {
  SuspendTutorModal,
  UpgradePlanModal,
  AddTutorModal,
} from '@/components/admin/tutor-action-modals'

type AdminTab = 'overview' | 'tutors' | 'students' | 'financials' | 'settings' | 'audit'

export default function SuperAdminDashboardPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLocked, setIsLocked] = useState(false)

  // Data States
  const [tutors, setTutors] = useState<ManagedTutor[]>([])
  const [settings, setSettings] = useState<PlatformSystemSettings>(adminStorage.getSettings())
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [subRequests, setSubRequests] = useState<SubscriptionRequest[]>([])
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [toastMessage, setToastMessage] = useState('')

  // Tutors Filter & Search
  const [tutorSearch, setTutorSearch] = useState('')
  const [tutorStatusFilter, setTutorStatusFilter] = useState<'all' | TutorAccountStatus>('all')
  const [tutorSubjectFilter, setTutorSubjectFilter] = useState<string>('all')

  // Global Students
  const [students, setStudents] = useState<Student[]>([])
  const [studentSearch, setStudentSearch] = useState('')
  const [studentPaymentFilter, setStudentPaymentFilter] = useState<'all' | 'paid' | 'late'>('all')

  // Modals
  const [suspendModalOpen, setSuspendModalOpen] = useState(false)
  const [selectedTutorForSuspend, setSelectedTutorForSuspend] = useState<ManagedTutor | null>(null)

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [selectedTutorForUpgrade, setSelectedTutorForUpgrade] = useState<ManagedTutor | null>(null)

  const [addTutorModalOpen, setAddTutorModalOpen] = useState(false)

  // Global Announcement form states inside settings
  const [annMessage, setAnnMessage] = useState(settings.global_announcement.message)
  const [annMessageAr, setAnnMessageAr] = useState(settings.global_announcement.message_ar)
  const [annType, setAnnType] = useState(settings.global_announcement.type)
  const [annActive, setAnnActive] = useState(settings.global_announcement.active)

  // Maintenance Message form state
  const [maintMessage, setMaintMessage] = useState(settings.maintenance_message)
  const [maintMessageAr, setMaintMessageAr] = useState(settings.maintenance_message_ar)

  const notify = (msg: string) => {
    setToastMessage(msg)
    window.setTimeout(() => setToastMessage(''), 3500)
  }

  // Refresh all system data from cloud database or local storage
  const reloadData = useCallback(async () => {
    const freshTutors = await adminStorage.getTutorsAsync()
    setTutors(freshTutors)
    setSettings(adminStorage.getSettings())
    setAuditLogs(adminStorage.getAuditLogs())
    setSubRequests(adminStorage.getSubscriptionRequests())
    setStudents(adminStorage.readLocal('muallemi_students', []))
  }, [])

  const handleApproveSubRequest = (requestId: string) => {
    const res = adminStorage.approveSubscriptionRequest(requestId)
    if (res.success) {
      reloadData()
      notify(
        lang === 'ar'
          ? `✅ تم اعتماد وتفعيل اشتراك (${res.request?.tutor_name}) رسمياً وتوسيع سعة الطلاب!`
          : `✅ Approved subscription for ${res.request?.tutor_name}!`
      )
    }
  }

  const handleRejectSubRequest = (requestId: string) => {
    const reason = window.prompt(
      lang === 'ar'
        ? 'سبب رفض العملية المالية (سيتم تسجيله):'
        : 'Reason for payment rejection:'
    )
    if (reason !== null) {
      adminStorage.rejectSubscriptionRequest(requestId, reason)
      reloadData()
      notify(lang === 'ar' ? 'تم رفض المعاملة وتسجيل السبب' : 'Subscription request rejected')
    }
  }

  // Initial Auth Check
  useEffect(() => {
    const session = adminAuth.getSession()
    if (!session) {
      router.push('/admin/gateway')
      return
    }

    if (session.is_locked) {
      setIsLocked(true)
    }
    setIsAuthenticated(true)
    reloadData()
  }, [router, reloadData])

  // Periodic heartbeat & touch activity
  useEffect(() => {
    if (!isAuthenticated) return
    const interval = setInterval(() => {
      adminAuth.touchActivity()
    }, 60000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  // --- Tutor Operations ---
  const handleAdmitTutor = (tutorId: string) => {
    const res = adminStorage.admitTutor(tutorId)
    if (res) {
      reloadData()
      notify(
        lang === 'ar'
          ? `✅ تم قبول واعتماد حساب المدرس (${res.name}) بنجاح!`
          : `✅ Tutor ${res.name} admitted successfully!`
      )
    }
  }

  const handleOpenSuspendModal = (tutor: ManagedTutor) => {
    setSelectedTutorForSuspend(tutor)
    setSuspendModalOpen(true)
  }

  const handleConfirmSuspend = (reason: string) => {
    if (!selectedTutorForSuspend) return
    const res = adminStorage.suspendTutor(selectedTutorForSuspend.id, reason)
    setSuspendModalOpen(false)
    setSelectedTutorForSuspend(null)
    if (res) {
      reloadData()
      notify(
        lang === 'ar'
          ? `⚠️ تم تجميد وإيقاف حساب المدرس (${res.name}) وتطبيق الحظر فوراً.`
          : `⚠️ Tutor ${res.name} suspended immediately.`
      )
    }
  }

  const handleReinstateTutor = (tutorId: string) => {
    const res = adminStorage.reinstateTutor(tutorId)
    if (res) {
      reloadData()
      notify(
        lang === 'ar'
          ? `✅ تم رفع الإيقاف وإعادة تفعيل حساب المدرس (${res.name})!`
          : `✅ Tutor ${res.name} reinstated successfully!`
      )
    }
  }

  const handleOpenUpgradeModal = (tutor: ManagedTutor) => {
    setSelectedTutorForUpgrade(tutor)
    setUpgradeModalOpen(true)
  }

  const handleConfirmUpgrade = (
    plan: PlanTier,
    cycle: BillingCycle,
    maxLimit: number,
    extensionMonths: number
  ) => {
    if (!selectedTutorForUpgrade) return
    const res = adminStorage.updateTutorPlan(
      selectedTutorForUpgrade.id,
      plan,
      cycle,
      maxLimit,
      extensionMonths
    )
    setUpgradeModalOpen(false)
    setSelectedTutorForUpgrade(null)
    if (res) {
      reloadData()
      notify(
        lang === 'ar'
          ? `⭐ تم ترقية باقة (${res.name}) إلى [${plan.toUpperCase()}] بسعة ${maxLimit} طالب!`
          : `⭐ Upgraded ${res.name} to ${plan.toUpperCase()} with limit ${maxLimit}!`
      )
    }
  }

  const handleDeleteTutor = (tutor: ManagedTutor) => {
    const confirmed = window.confirm(
      lang === 'ar'
        ? `تحذير: هل أنت متأكد من حذف حساب المدرس (${tutor.name}) نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.`
        : `Warning: Permanently delete tutor ${tutor.name}? This action is irreversible.`
    )
    if (confirmed) {
      adminStorage.deleteTutor(tutor.id)
      reloadData()
      notify(lang === 'ar' ? 'تم حذف الحساب نهائياً' : 'Tutor deleted permanently')
    }
  }

  const handleImpersonate = (tutor: ManagedTutor) => {
    adminAuth.setImpersonatedTutor(tutor.id)
    notify(
      lang === 'ar'
        ? `جاري فتح لوحة تحكم المدرس (${tutor.name}) للمعاينة...`
        : `Opening dashboard as ${tutor.name}...`
    )
    setTimeout(() => {
      router.push('/dashboard')
    }, 500)
  }

  const handleAddTutor = (tutorData: {
    name: string
    email: string
    phone: string
    subject: string
    title: string
    plan: PlanTier
    centers: string[]
  }) => {
    const newT = adminStorage.registerTutor({
      ...tutorData,
      status: 'active',
      subscription_plan: tutorData.plan,
    })
    setAddTutorModalOpen(false)
    reloadData()
    notify(
      lang === 'ar'
        ? `تم إضافة واعتماد المدرس (${newT.name}) بنجاح!`
        : `Tutor ${newT.name} enrolled successfully!`
    )
  }

  // --- System Settings & Flags Toggles ---
  const handleToggleMaintenance = () => {
    const nextState = !settings.maintenance_mode
    const updated = adminStorage.setMaintenanceMode(nextState, maintMessage, maintMessageAr)
    setSettings(updated)
    reloadData()
    notify(
      nextState
        ? lang === 'ar'
          ? '⚠️ تم تفعيل وضع الصيانة العام للمنصة!'
          : '⚠️ Platform Maintenance Mode Activated!'
        : lang === 'ar'
        ? '✅ تم إيقاف وضع الصيانة وإتاحة المنصة للمدرسين'
        : '✅ Maintenance Mode Deactivated'
    )
  }

  const handleToggleFlag = (key: keyof PlatformSystemSettings) => {
    const currentVal = settings[key] as boolean
    const updated = adminStorage.updateSettings({ [key]: !currentVal })
    setSettings(updated)
    reloadData()
    notify(lang === 'ar' ? 'تم تحديث إعدادات النظام' : 'System setting updated')
  }

  const handleSaveBroadcast = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedAnnouncement: GlobalAnnouncement = {
      id: `ann-${Date.now()}`,
      active: annActive,
      message: annMessage,
      message_ar: annMessageAr,
      type: annType,
      created_at: new Date().toISOString(),
    }
    const updated = adminStorage.setGlobalAnnouncement(updatedAnnouncement)
    setSettings(updated)
    reloadData()
    notify(
      lang === 'ar'
        ? '📢 تم نشر وتحديث شريط الإعلانات العام في لوحات المدرسين بنجاح!'
        : '📢 Global broadcast banner updated for all tutors!'
    )
  }

  // --- Backup & Restore ---
  const handleDownloadBackup = () => {
    const jsonStr = adminStorage.exportFullBackup()
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `classio-full-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    notify(lang === 'ar' ? 'تم تنزيل النسخة الاحتياطية بنجاح' : 'Backup downloaded successfully')
  }

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        const ok = adminStorage.restoreBackup(content)
        if (ok) {
          reloadData()
          notify(lang === 'ar' ? 'تم استرجاع النسخة الاحتياطية بنجاح!' : 'Backup restored successfully!')
        } else {
          notify(lang === 'ar' ? 'فشل استرجاع الملف، تأكد من الصيغة' : 'Failed to restore backup file')
        }
      }
    }
    reader.readAsText(file)
  }

  // --- Telemetry Calculations ---
  const telemetry = useMemo(() => adminStorage.getPlatformTelemetry(), [tutors, students])

  // Filtered Tutors List
  const filteredTutors = useMemo(() => {
    return tutors.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(tutorSearch.toLowerCase()) ||
        t.email.toLowerCase().includes(tutorSearch.toLowerCase()) ||
        t.phone.includes(tutorSearch) ||
        t.subject.toLowerCase().includes(tutorSearch.toLowerCase())

      const matchesStatus =
        tutorStatusFilter === 'all' ? true : t.status === tutorStatusFilter

      const matchesSubject =
        tutorSubjectFilter === 'all'
          ? true
          : t.subject.toLowerCase().includes(tutorSubjectFilter.toLowerCase())

      return matchesSearch && matchesStatus && matchesSubject
    })
  }, [tutors, tutorSearch, tutorStatusFilter, tutorSubjectFilter])

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.student_code.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.parent_phone.includes(studentSearch) ||
        (s.school && s.school.toLowerCase().includes(studentSearch.toLowerCase()))

      const matchesPayment =
        studentPaymentFilter === 'all'
          ? true
          : studentPaymentFilter === 'paid'
          ? s.paid_this_month
          : !s.paid_this_month

      return matchesSearch && matchesPayment
    })
  }, [students, studentSearch, studentPaymentFilter])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400 font-mono text-sm">
        INITIALIZING SECURE ENCLAVE...
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${
        lang === 'ar' ? 'font-sans' : 'font-sans'
      }`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Pin Unlock Modal when locked */}
      <PinUnlockModal
        isOpen={isLocked}
        onUnlocked={() => setIsLocked(false)}
        lang={lang}
      />

      {/* Cyber Security Master Header */}
      <AdminHeader
        lang={lang}
        toggleLang={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        onLockSession={() => {
          adminAuth.lockSession()
          setIsLocked(true)
        }}
        settings={settings}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-red-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl shadow-red-950/80 flex items-center gap-3 animate-slide-up">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Command Surface */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-slate-900/80 border border-slate-800 p-1.5 rounded-2xl backdrop-blur flex items-center gap-1 overflow-x-auto scrollbar-none">
          {[
            {
              id: 'overview',
              labelAr: 'نظرة عامة والنبض الحي',
              labelEn: 'Live Pulse',
              icon: Activity,
            },
            {
              id: 'tutors',
              labelAr: `المدرسين والاعتمادات (${telemetry.tutors.total})`,
              labelEn: `Tutors (${telemetry.tutors.total})`,
              icon: UsersRound,
              badge: telemetry.tutors.pending > 0 ? telemetry.tutors.pending : undefined,
            },
            {
              id: 'students',
              labelAr: `طلاب المنصة (${telemetry.students.total})`,
              labelEn: `Global Students (${telemetry.students.total})`,
              icon: GraduationCap,
            },
            {
              id: 'financials',
              labelAr: 'الماليات والاشتراكات',
              labelEn: 'GMV & SaaS Ledger',
              icon: Wallet,
              badge: subRequests.filter((r) => r.status === 'pending').length || undefined,
            },
            {
              id: 'settings',
              labelAr: 'مفاتيح التشغيل والإعلانات',
              labelEn: 'Killswitches & Broadcasts',
              icon: Settings,
            },
            {
              id: 'audit',
              labelAr: 'سجل العمليات والنسخ الاحتياطي',
              labelEn: 'Audit & Backup',
              icon: History,
            },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{lang === 'ar' ? tab.labelAr : tab.labelEn}</span>
                {tab.badge && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center animate-bounce">
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* =========================================================================
            TAB 1: OVERVIEW & LIVE PULSE
        ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Platform Gross Tuition Volume (GMV) */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {lang === 'ar' ? 'حجم المصروفات المحصلة (GMV)' : 'Total Tuition Processed'}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  {telemetry.financials.totalGMV.toLocaleString('ar-EG')}{' '}
                  <span className="text-xs font-normal text-emerald-400">ج.م</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">
                    {telemetry.financials.vodafoneCashGMV.toLocaleString('ar-EG')} ج.م
                  </span>{' '}
                  عبر فودافون كاش
                </p>
              </div>

              {/* Card 2: SaaS MRR */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {lang === 'ar' ? 'إيراد الاشتراكات الشهري (MRR)' : 'Classio SaaS MRR'}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  {telemetry.financials.platformMRR.toLocaleString('ar-EG')}{' '}
                  <span className="text-xs font-normal text-blue-400">ج.م / شهر</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  {lang === 'ar' ? 'العائد السنوي المتوقع (ARR):' : 'Projected ARR:'}{' '}
                  <span className="text-blue-300 font-bold">
                    {telemetry.financials.platformARR.toLocaleString('ar-EG')} ج.م
                  </span>
                </p>
              </div>

              {/* Card 3: Total Tutors */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {lang === 'ar' ? 'المدرسين والسناتر المسجلة' : 'Registered Tutors'}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <UsersRound className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  {telemetry.tutors.total}{' '}
                  <span className="text-xs font-normal text-slate-400">مدرس</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[11px]">
                  <span className="text-emerald-400 font-bold">{telemetry.tutors.active} نشط</span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">
                    {telemetry.tutors.pending} قيد الاعتماد
                  </span>
                  <span>•</span>
                  <span className="text-red-400 font-bold">{telemetry.tutors.suspended} موقوف</span>
                </div>
              </div>

              {/* Card 4: Global Students */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {lang === 'ar' ? 'إجمالي الطلاب في مصر' : 'Total Enrolled Students'}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  {telemetry.students.total}{' '}
                  <span className="text-xs font-normal text-slate-400">طالب</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[11px]">
                  <span className="text-emerald-400 font-bold">{telemetry.students.paid} مسدد</span>
                  <span>•</span>
                  <span className="text-rose-400 font-bold">
                    {telemetry.students.late} متأخر في السداد
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Killswitches Row */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                <span>
                  {lang === 'ar'
                    ? 'مفاتيح التحكم الفوري للتحكم في كافة أرجاء المنصة'
                    : 'Immediate Master Killswitches'}
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Switch 1: Platform Maintenance Mode */}
                <div
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    settings.maintenance_mode
                      ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs">
                      {lang === 'ar' ? 'وضع الصيانة العام' : 'Maintenance Mode'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        settings.maintenance_mode
                          ? 'bg-amber-500 text-slate-950 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {settings.maintenance_mode ? 'مفعل نشط' : 'معطل'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    {lang === 'ar'
                      ? 'يحجب دخول كافة المدرسين ويظهر شاشة الصيانة'
                      : 'Locks out tutors and displays maintenance shield'}
                  </p>
                  <button
                    onClick={handleToggleMaintenance}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      settings.maintenance_mode
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {settings.maintenance_mode ? 'إيقاف الصيانة فوراً' : 'تفعيل وضع الصيانة'}
                  </button>
                </div>

                {/* Switch 2: Require Admin Approval for Tutors */}
                <div
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    settings.require_admin_approval
                      ? 'bg-blue-950/40 border-blue-500/60 ring-1 ring-blue-500'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs">
                      {lang === 'ar' ? 'اشتراط اعتماد المدرسين' : 'Require Admin Approval'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        settings.require_admin_approval
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {settings.require_admin_approval ? 'مشترط' : 'تلقائي'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    {lang === 'ar'
                      ? 'المدرس الجديد ينتظر قبولك الصريح قبل الدخول'
                      : 'New tutors must be admitted by you before access'}
                  </p>
                  <button
                    onClick={() => handleToggleFlag('require_admin_approval')}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      settings.require_admin_approval
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {settings.require_admin_approval ? 'تعطيل الاشتراط' : 'تفعيل شرط الاعتماد'}
                  </button>
                </div>

                {/* Switch 3: Allow Public Tutor Registration */}
                <div
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    settings.allow_tutor_registration
                      ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs">
                      {lang === 'ar' ? 'التسجيل العام للمدرسين' : 'Public Registration'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        settings.allow_tutor_registration
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-red-950 text-red-300'
                      }`}
                    >
                      {settings.allow_tutor_registration ? 'مفتوح' : 'مغلق'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    {lang === 'ar'
                      ? 'السماح لمدرسين جدد بإنشاء حسابات من صفحة الدخول'
                      : 'Allow new tutors to create accounts publicly'}
                  </p>
                  <button
                    onClick={() => handleToggleFlag('allow_tutor_registration')}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      settings.allow_tutor_registration
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {settings.allow_tutor_registration ? 'إغلاق التسجيل' : 'فتح التسجيل العام'}
                  </button>
                </div>

                {/* Switch 4: WhatsApp Gateway */}
                <div
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    settings.whatsapp_gateway_active
                      ? 'bg-purple-950/40 border-purple-500/60 ring-1 ring-purple-500'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs">
                      {lang === 'ar' ? 'بوابة رسائل الواتساب' : 'WhatsApp Gateway'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        settings.whatsapp_gateway_active
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {settings.whatsapp_gateway_active ? 'نشط' : 'متوقف'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    {lang === 'ar'
                      ? 'إرسال الإشعارات والتقارير لأولياء الأمور عبر واتساب'
                      : 'Send attendance and fee notices via WhatsApp'}
                  </p>
                  <button
                    onClick={() => handleToggleFlag('whatsapp_gateway_active')}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      settings.whatsapp_gateway_active
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {settings.whatsapp_gateway_active ? 'إيقاف الواتساب' : 'تشغيل الواتساب'}
                  </button>
                </div>
              </div>
            </div>

            {/* Egypt Live Governorates Pulse */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
                <span>{lang === 'ar' ? 'خريطة انتشار وتفاعل المحافظات (مصر)' : 'Egypt Governorates Activity'}</span>
                <span className="text-[11px] text-slate-400 font-normal">محدث لحظياً</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { gov: 'القاهرة (مدينة نصر، المعادي، التجمع)', tutors: 3, students: 120, rate: '96%' },
                  { gov: 'الجيزة (الدقي، المهندسين، الهرم)', tutors: 2, students: 48, rate: '92%' },
                  { gov: 'الإسكندرية (سموحة، لوران)', tutors: 1, students: 25, rate: '94%' },
                  { gov: 'أونلاين (عموم محافظات مصر)', tutors: 2, students: 36, rate: '98%' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <p className="text-xs font-bold text-slate-300">{item.gov}</p>
                    <div className="flex items-center justify-between mt-2 text-[11px]">
                      <span className="text-slate-400">{item.students} طالب</span>
                      <span className="text-emerald-400 font-bold">{item.rate} حضور</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: TUTORS & ADMISSIONS COMMAND (ADMIT, BEND/SUSPEND, UPGRADE, DELETE)
        ========================================================================= */}
        {activeTab === 'tutors' && (
          <div className="space-y-4">
            {/* Action Bar & Filters */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute inset-y-0 start-3 my-auto text-slate-500" />
                  <input
                    type="text"
                    value={tutorSearch}
                    onChange={(e) => setTutorSearch(e.target.value)}
                    placeholder={
                      lang === 'ar'
                        ? 'ابحث باسم المدرس، البريد، الهاتف، أو المادة...'
                        : 'Search tutor name, email, phone, subject...'
                    }
                    className="w-full text-xs ps-9 pe-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={tutorStatusFilter}
                  onChange={(e) => setTutorStatusFilter(e.target.value as any)}
                  className="text-xs py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-red-500"
                >
                  <option value="all">كل الحالات (All)</option>
                  <option value="active">النشطين فقط (Active)</option>
                  <option value="pending_approval">في انتظار الاعتماد (Pending)</option>
                  <option value="suspended">الموقوفين (Suspended)</option>
                </select>
              </div>

              {/* Add Tutor Button */}
              <button
                onClick={() => setAddTutorModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إضافة مدرس جديد' : 'Enroll New Tutor'}</span>
              </button>
            </div>

            {/* Pending Admission Notice Banner if any */}
            {telemetry.tutors.pending > 0 && (
              <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-600/50 text-amber-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold">
                      {lang === 'ar'
                        ? `يوجد (${telemetry.tutors.pending}) مدرس بانتظار موافقتك واعتماد عضويتهم!`
                        : `${telemetry.tutors.pending} tutor(s) awaiting your super-admin admission approval!`}
                    </h4>
                    <p className="text-[11px] text-amber-300/80">
                      {lang === 'ar'
                        ? 'انقر على زر "قبول واعتماد" لفتح صلاحيات المنصة لهم فوراً.'
                        : 'Click "Admit & Approve" to immediately grant them platform access.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTutorStatusFilter('pending_approval')}
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400"
                >
                  {lang === 'ar' ? 'عرض طلبات الاعتماد' : 'Review Pending'}
                </button>
              </div>
            )}

            {/* Tutors Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3 text-start">{lang === 'ar' ? 'المدرس والمادة' : 'Tutor & Subject'}</th>
                      <th className="p-3 text-start">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="p-3 text-start">{lang === 'ar' ? 'الباقة والسعة' : 'Tier & Limit'}</th>
                      <th className="p-3 text-start">{lang === 'ar' ? 'تواريخ الاشتراك' : 'Subscription Dates'}</th>
                      <th className="p-3 text-start">{lang === 'ar' ? 'السناتر التابعة' : 'Centers'}</th>
                      <th className="p-3 text-start">{lang === 'ar' ? 'الاتصال والدفع' : 'Contact / Pay'}</th>
                      <th className="p-3 text-center">{lang === 'ar' ? 'التحكم الإداري الكامل' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTutors.map((tutor) => (
                      <tr key={tutor.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Tutor Name & Subject */}
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
                              {tutor.name.substring(0, 2)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-200">{tutor.name}</p>
                              <p className="text-[11px] text-slate-400">{tutor.subject}</p>
                            </div>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="p-3">
                          {tutor.status === 'active' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{lang === 'ar' ? 'نشط ومعتمد' : 'Active'}</span>
                            </span>
                          )}
                          {tutor.status === 'pending_approval' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-700/50 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{lang === 'ar' ? 'بانتظار الاعتماد' : 'Pending Approval'}</span>
                            </span>
                          )}
                          {tutor.status === 'suspended' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-950 text-red-300 border border-red-700/50">
                              <XCircle className="w-3 h-3" />
                              <span>{lang === 'ar' ? 'موقوف ومجمد' : 'Suspended'}</span>
                            </span>
                          )}
                        </td>

                        {/* Plan & Capacity */}
                        <td className="p-3">
                          <div>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                tutor.subscription_plan === 'enterprise' || tutor.subscription_plan === 'academy' || tutor.subscription_plan === 'elite'
                                  ? 'bg-purple-950 text-purple-300 border border-purple-600/50'
                                  : tutor.subscription_plan === 'power'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-600/50'
                                  : tutor.subscription_plan === 'pro'
                                  ? 'bg-blue-950 text-blue-300 border border-blue-600/50'
                                  : tutor.subscription_plan === 'growth'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                                  : tutor.subscription_plan === 'starter'
                                  ? 'bg-sky-950 text-sky-300 border border-sky-600/50'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {tutor.subscription_plan}
                            </span>
                            <p className="text-[11px] text-slate-400 mt-1">
                              {lang === 'ar'
                                ? `السعة: حتى ${tutor.max_students_limit} طالب`
                                : `Limit: ${tutor.max_students_limit} students`}
                            </p>
                          </div>
                        </td>

                        {/* Centers */}
                        <td className="p-3">
                          <p className="text-[11px] text-slate-300 max-w-[180px] truncate">
                            {tutor.centers.join('، ')}
                          </p>
                        </td>

                        {/* Contact & Wallet */}
                        <td className="p-3">
                          <p className="font-mono text-slate-300 text-[11px]">{tutor.phone}</p>
                          <p className="text-slate-500 text-[10px] truncate">{tutor.email}</p>
                          {tutor.instapay_handle && (
                            <p className="text-emerald-400 text-[10px] font-mono">
                              {tutor.instapay_handle}
                            </p>
                          )}
                          {/* Subscription dates mini-display */}
                          <div className="mt-1 space-y-0.5 text-[10px]">
                            {tutor.payment_submitted_at && (
                              <div className="text-slate-400">💳 {new Date(tutor.payment_submitted_at).toLocaleDateString('en-GB')}</div>
                            )}
                            {tutor.subscription_starts_at && (
                              <div className="text-emerald-400">🟢 {new Date(tutor.subscription_starts_at).toLocaleDateString('en-GB')}</div>
                            )}
                            {tutor.subscription_expires_at && (
                              <div className={new Date(tutor.subscription_expires_at) < new Date() ? 'text-red-400 font-bold' : 'text-amber-300'}>
                                📅 {new Date(tutor.subscription_expires_at).toLocaleDateString('en-GB')}
                              </div>
                            )}
                            {tutor.subscription_status && (
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                tutor.subscription_status === 'active' ? 'bg-emerald-900 text-emerald-300' :
                                tutor.subscription_status === 'pending' ? 'bg-amber-900 text-amber-300' :
                                tutor.subscription_status === 'expired' ? 'bg-red-900 text-red-300' :
                                tutor.subscription_status === 'expiring_soon' ? 'bg-orange-900 text-orange-300' :
                                'bg-slate-800 text-slate-400'
                              }`}>
                                {tutor.subscription_status}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Complete Administrative Controls */}
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {/* 1. Admit / Approve Button (for pending tutors) */}
                            {tutor.status === 'pending_approval' && (
                              <button
                                onClick={() => handleAdmitTutor(tutor.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow"
                                title="Admit & Approve Tutor"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>{lang === 'ar' ? 'قبول واعتماد' : 'Admit'}</span>
                              </button>
                            )}

                            {/* 2. Bend / Suspend Button (for active tutors) */}
                            {tutor.status === 'active' && (
                              <button
                                onClick={() => handleOpenSuspendModal(tutor)}
                                className="px-2 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 border border-amber-700/50 font-bold text-[11px] flex items-center gap-1"
                                title="Bend / Suspend Tutor"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>{lang === 'ar' ? 'إيقاف وتجميد' : 'Bend/Suspend'}</span>
                              </button>
                            )}

                            {/* 3. Reinstate Button (for suspended tutors) */}
                            {tutor.status === 'suspended' && (
                              <button
                                onClick={() => handleReinstateTutor(tutor.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-700/50 font-bold text-[11px] flex items-center gap-1"
                                title="Reinstate Tutor"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{lang === 'ar' ? 'رفع الإيقاف' : 'Reinstate'}</span>
                              </button>
                            )}

                            {/* 4. Edit Plan & Capacity */}
                            <button
                              onClick={() => handleOpenUpgradeModal(tutor)}
                              className="px-2 py-1 rounded-lg bg-blue-950/70 hover:bg-blue-900/80 text-blue-300 border border-blue-700/50 font-bold text-[11px] flex items-center gap-1"
                              title="Modify Plan & Limits"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>{lang === 'ar' ? 'تعديل الباقة' : 'Plan'}</span>
                            </button>

                            {/* 5. Impersonate / Inspect Live */}
                            <button
                              onClick={() => handleImpersonate(tutor)}
                              className="px-2 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900/80 text-purple-300 border border-purple-700/50 font-bold text-[11px] flex items-center gap-1"
                              title="Impersonate & View Tutor Dashboard"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{lang === 'ar' ? 'معاينة حسابه' : 'View As'}</span>
                            </button>

                            {/* 6. Delete Tutor */}
                            <button
                              onClick={() => handleDeleteTutor(tutor)}
                              className="p-1 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/50"
                              title="Delete Tutor"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredTutors.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                          {lang === 'ar'
                            ? 'لا يوجد مدرسين يطابقون معايير البحث المحددة.'
                            : 'No tutors found matching the criteria.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: GLOBAL STUDENTS DIRECTORY
        ========================================================================= */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute inset-y-0 start-3 my-auto text-slate-500" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder={
                      lang === 'ar'
                        ? 'ابحث باسم الطالب، الكود، هاتف ولي الأمر، أو المدرسة...'
                        : 'Search student name, code, parent phone, school...'
                    }
                    className="w-full text-xs ps-9 pe-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <select
                  value={studentPaymentFilter}
                  onChange={(e) => setStudentPaymentFilter(e.target.value as any)}
                  className="text-xs py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-red-500"
                >
                  <option value="all">كل حالات السداد</option>
                  <option value="paid">مسدد الشهر</option>
                  <option value="late">متأخر عن السداد</option>
                </select>
              </div>

              <div className="text-xs text-slate-400">
                {lang === 'ar'
                  ? `إجمالي المعروض: ${filteredStudents.length} طالب`
                  : `Total: ${filteredStudents.length} students`}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                    <tr>
                      <th className="p-3 text-start">الطالب والكود</th>
                      <th className="p-3 text-start">المجموعة والسنتر</th>
                      <th className="p-3 text-start">ولي الأمر والهاتف</th>
                      <th className="p-3 text-start">المدرسة</th>
                      <th className="p-3 text-start">حالة السداد</th>
                      <th className="p-3 text-start">المسار التربوي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3">
                          <p className="font-bold text-slate-200">{student.name}</p>
                          <span className="font-mono text-[10px] text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                            {student.student_code}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="text-slate-300 font-medium">{student.group_name}</p>
                        </td>
                        <td className="p-3">
                          <p className="text-slate-300 text-[11px]">{student.parent_phone}</p>
                          <p className="text-[10px] text-slate-500">{student.parent_relation}</p>
                        </td>
                        <td className="p-3">
                          <p className="text-slate-400 text-[11px]">{student.school || '—'}</p>
                        </td>
                        <td className="p-3">
                          {student.paid_this_month ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>مسدد ({student.monthly_fee} ج.م)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800/50">
                              <AlertCircle className="w-3 h-3" />
                              <span>متأخر ({student.monthly_fee} ج.م)</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              student.trajectory === 'improving'
                                ? 'bg-emerald-950 text-emerald-300'
                                : student.trajectory === 'needs_attention'
                                ? 'bg-amber-950 text-amber-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {student.trajectory === 'improving'
                              ? 'متفوق ومتقدم 📈'
                              : student.trajectory === 'needs_attention'
                              ? 'يحتاج متابعة ⚠️'
                              : 'مستوى ثابت ⚖️'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: FINANCIALS & SAAS LEDGER
        ========================================================================= */}
        {activeTab === 'financials' && (
          <div className="space-y-6">

            {/* ── PENDING PAYMENT VERIFICATION QUEUE ─────────────────────────────── */}
            {(() => {
              const pending = subRequests.filter((r) => r.status === 'pending')
              const methodIcon: Record<string, string> = {
                instapay: '🏦',
                vodafone_cash: '📱',
                fawry: '🧾',
                card: '💳',
              }
              const planColors: Record<string, string> = {
                free: 'text-slate-400',
                starter: 'text-blue-400',
                growth: 'text-emerald-400',
                pro: 'text-violet-400',
                power: 'text-amber-400',
                enterprise: 'text-purple-400',
                elite: 'text-purple-400',
                academy: 'text-purple-400',
              }
              return (
                <div className="bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-600/40 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-100">
                          {lang === 'ar'
                            ? 'طوابير التحقق من المدفوعات المعلقة'
                            : 'Pending Payment Verification Queue'}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          {lang === 'ar'
                            ? 'كل طلبات اشتراك المدرسين تنتظر مراجعتك وموافقتك قبل التفعيل'
                            : 'All subscription upgrade requests await your manual review & approval'}
                        </p>
                      </div>
                    </div>
                    {pending.length > 0 && (
                      <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-black animate-pulse">
                        {pending.length} {lang === 'ar' ? 'معلق' : 'pending'}
                      </span>
                    )}
                  </div>

                  {pending.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                      <p className="text-sm font-bold">{lang === 'ar' ? 'لا توجد طلبات معلقة حالياً' : 'No pending requests'}</p>
                      <p className="text-xs mt-1">{lang === 'ar' ? 'جميع المدفوعات تمت مراجعتها' : 'All payments have been reviewed'}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pending.map((req) => (
                        <div
                          key={req.id}
                          className="bg-slate-950/80 border border-slate-700/60 rounded-xl p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-black text-slate-100">{req.tutor_name}</span>
                                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 ${planColors[req.plan_id] || 'text-slate-300'}`}>
                                  {req.plan_id}
                                </span>
                                <span className="text-xs text-slate-400">{req.billing_cycle}</span>
                              </div>
                              <p className="text-[11px] text-slate-400">{req.tutor_email}</p>

                              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                                <span className="text-xs font-bold text-emerald-400">
                                  💰 {req.amount.toLocaleString('ar-EG')} ج.م
                                </span>
                                <span className="text-xs text-slate-300">
                                  {methodIcon[req.payment_method] || '💳'} {req.payment_method.replace('_', ' ')}
                                </span>
                                {req.transaction_ref && (
                                  <span className="text-xs font-mono text-blue-300 bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-800/40">
                                    REF: {req.transaction_ref}
                                  </span>
                                )}
                                {req.sender_phone && (
                                  <span className="text-xs text-slate-400">📞 {req.sender_phone}</span>
                                )}
                              </div>

                              {req.admin_notes && (
                                <p className="text-[11px] text-amber-300/80 italic mt-1">📝 {req.admin_notes}</p>
                              )}

                              <p className="text-[10px] text-slate-500 mt-1">
                                {lang === 'ar' ? 'طُلب في: ' : 'Submitted: '}
                                {new Date(req.requested_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                              </p>
                            </div>

                            <div className="flex flex-col gap-2 shrink-0">
                              <button
                                onClick={() => handleApproveSubRequest(req.id)}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition shadow-lg shadow-emerald-950/50"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                {lang === 'ar' ? 'اعتماد وتفعيل' : 'Approve & Activate'}
                              </button>
                              <button
                                onClick={() => handleRejectSubRequest(req.id)}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/80 border border-slate-700 hover:border-rose-600 text-slate-300 hover:text-rose-300 text-xs font-black transition"
                              >
                                <XCircle className="w-4 h-4" />
                                {lang === 'ar' ? 'رفض المعاملة' : 'Reject'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recently resolved requests */}
                  {subRequests.filter((r) => r.status !== 'pending').length > 0 && (
                    <details className="mt-4">
                      <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-200 py-2">
                        {lang === 'ar'
                          ? `▸ عرض ${subRequests.filter((r) => r.status !== 'pending').length} طلب سبق مراجعته`
                          : `▸ Show ${subRequests.filter((r) => r.status !== 'pending').length} resolved requests`}
                      </summary>
                      <div className="mt-2 space-y-2">
                        {subRequests.filter((r) => r.status !== 'pending').map((req) => (
                          <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
                            <div>
                              <p className="text-xs font-bold text-slate-300">{req.tutor_name}</p>
                              <p className="text-[11px] text-slate-500">{req.plan_id} · {req.amount} ج.م · {req.payment_method}</p>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              req.status === 'approved'
                                ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-700'
                                : 'bg-rose-900/60 text-rose-400 border border-rose-700'
                            }`}>
                              {req.status === 'approved' ? '✓ ' : '✗ '}
                              {req.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )
            })()}

            {/* GMV breakdown cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Vodafone Cash */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-rose-400 font-bold">فودافون كاش (Vodafone Cash)</span>
                <p className="text-2xl font-black text-white mt-1">
                  {telemetry.financials.vodafoneCashGMV.toLocaleString('ar-EG')}{' '}
                  <span className="text-xs font-normal text-slate-400">ج.م</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-2">
                  تحويلات فورية عبر محفظة فودافون كاش للمدرسين
                </p>
              </div>

              {/* InstaPay */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-emerald-400 font-bold">إنستاباي (InstaPay IPN)</span>
                <p className="text-2xl font-black text-white mt-1">
                  {telemetry.financials.instapayGMV.toLocaleString('ar-EG')}{' '}
                  <span className="text-xs font-normal text-slate-400">ج.م</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-2">
                  تحويلات شبكة المدفوعات اللحظية المصرية
                </p>
              </div>

              {/* Cash */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-amber-400 font-bold">الدفع النقدي في السناتر</span>
                <p className="text-2xl font-black text-white mt-1">
                  {telemetry.financials.cashGMV.toLocaleString('ar-EG')}{' '}
                  <span className="text-xs font-normal text-slate-400">ج.م</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-2">
                  استلام مباشر بإيصالات مطبوعة وباركود
                </p>
              </div>
            </div>

            {/* Subscriptions Ledger */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-3">
                {lang === 'ar' ? 'سجل اشتراكات المدرسين في باقات كلاسيو' : 'Tutor SaaS Subscriptions Ledger'}
              </h3>
              <div className="divide-y divide-slate-800/60">
                {tutors.map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-xs text-slate-200">{t.name}</p>
                      <p className="text-[11px] text-slate-400">
                        الباقة: <span className="font-bold text-blue-300 uppercase">{t.subscription_plan}</span> ({t.subscription_cycle})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        {t.subscription_plan === 'enterprise' || t.subscription_plan === 'academy' || t.subscription_plan === 'elite'
                          ? 'مخصص (+500)'
                          : t.subscription_plan === 'power'
                          ? '799 ج.م'
                          : t.subscription_plan === 'pro'
                          ? '449 ج.م'
                          : t.subscription_plan === 'growth'
                          ? '299 ج.م'
                          : t.subscription_plan === 'starter'
                          ? '99 ج.م'
                          : 'مجاني'}
                      </span>
                      <button
                        onClick={() => handleOpenUpgradeModal(t)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                      >
                        منح ترقية مجانية
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: SETTINGS, KILLSWITCHES & GLOBAL BROADCASTS
        ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* 1. Global Broadcast Announcement Composer */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    <BellRing className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">
                      {lang === 'ar' ? 'بث إشعار عام لكافة المدرسين' : 'Global Broadcast Announcement'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {lang === 'ar'
                        ? 'يظهر هذا الشريط فوراً في أعلى لوحة تحكم كل المدرسين والسناتر في مصر'
                        : 'Displays live across all active tutor dashboards'}
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={annActive}
                    onChange={(e) => setAnnActive(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-950 border-slate-700"
                  />
                  <span className="text-xs font-bold text-slate-300">
                    {annActive ? 'الإشعار نشط الآن' : 'الإشعار معطل'}
                  </span>
                </label>
              </div>

              <form onSubmit={handleSaveBroadcast} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      نص الإعلان بالعربية:
                    </label>
                    <textarea
                      rows={2}
                      value={annMessageAr}
                      onChange={(e) => setAnnMessageAr(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      English Announcement Text:
                    </label>
                    <textarea
                      rows={2}
                      value={annMessage}
                      onChange={(e) => setAnnMessage(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">نوع التنبيه:</span>
                    {(['info', 'warning', 'urgent', 'success'] as const).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setAnnType(type)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-bold capitalize ${
                          annType === type
                            ? 'bg-red-600 text-white border-red-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950 hover:from-red-500 hover:to-rose-500"
                  >
                    حفظ وبث الإشعار فوراً
                  </button>
                </div>
              </form>

              {/* Live Preview of Announcement */}
              {annActive && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-[11px] text-slate-400 mb-2">معاينة حية لشكل الشريط لدى المدرسين:</p>
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      annType === 'urgent'
                        ? 'bg-red-950/80 border-red-600 text-red-200'
                        : annType === 'warning'
                        ? 'bg-amber-950/80 border-amber-600 text-amber-200'
                        : annType === 'success'
                        ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                        : 'bg-blue-950/80 border-blue-600 text-blue-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>{lang === 'ar' ? annMessageAr : annMessage}</span>
                    </div>
                    <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded font-mono">
                      CLASS BROADCAST
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Maintenance Message Customizer */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-bold text-sm text-slate-100 mb-2">
                تخصيص رسالة وضع الصيانة العامة
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                هذه الرسالة تظهر للمدرسين عند تفعيل وضع الصيانة العام لمنع الدخول.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={maintMessageAr}
                  onChange={(e) => setMaintMessageAr(e.target.value)}
                  placeholder="رسالة الصيانة بالعربية"
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                />
                <input
                  type="text"
                  value={maintMessage}
                  onChange={(e) => setMaintMessage(e.target.value)}
                  placeholder="Maintenance message in English"
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <button
                onClick={() => {
                  adminStorage.updateSettings({
                    maintenance_message: maintMessage,
                    maintenance_message_ar: maintMessageAr,
                  })
                  notify('تم حفظ رسالة الصيانة')
                }}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-slate-200"
              >
                حفظ نص رسالة الصيانة
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: AUDIT TRAIL & BACKUP / FACTORY RESET
        ========================================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Backup & Restore Controls */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-bold text-sm text-slate-100 mb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>حفظ النسخ الاحتياطية واسترجاع البيانات (Full Backup & Restore)</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                تنزيل لقطة كاملة لقاعدة بيانات كلاسيو تشمل كافة المدرسين، الطلاب، المدفوعات، وسجل الأمان.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDownloadBackup}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل نسخة احتياطية كاملة (.json)</span>
                </button>

                <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>استرجاع قاعدة بيانات من ملف (.json)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreBackup}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => {
                    if (window.confirm('تحذير شديد: هل تريد إعادة ضبط جميع البيانات للإعدادات المصنعية الأولية؟')) {
                      adminStorage.resetToFactory()
                      reloadData()
                      notify('تمت إعادة ضبط المنصة بالكامل')
                    }
                  }}
                  className="px-4 py-2 bg-red-950 hover:bg-red-900 text-red-300 font-bold text-xs rounded-xl border border-red-800/60 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>إعادة ضبط المصنع (Factory Reset)</span>
                </button>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-100">
                  سجل الأمان والعمليات الإدارية المركزية ({auditLogs.length})
                </h3>
                <button
                  onClick={() => {
                    if (window.confirm('هل تريد مسح سجل العمليات الحالي؟')) {
                      adminStorage.clearAuditLogs()
                      reloadData()
                      notify('تم مسح السجل')
                    }
                  }}
                  className="text-xs text-slate-500 hover:text-red-400"
                >
                  مسح السجل
                </button>
              </div>

              <div className="divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            log.severity === 'critical'
                              ? 'bg-red-950 text-red-300 border border-red-700'
                              : log.severity === 'high'
                              ? 'bg-amber-950 text-amber-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {log.severity.toUpperCase()}
                        </span>
                        <span className="font-bold text-slate-200">
                          {lang === 'ar' ? log.action_ar || log.action : log.action}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {lang === 'ar' ? log.details_ar || log.details : log.details}
                      </p>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Action Modals */}
      <SuspendTutorModal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        tutor={selectedTutorForSuspend}
        onConfirm={handleConfirmSuspend}
        lang={lang}
      />

      <UpgradePlanModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        tutor={selectedTutorForUpgrade}
        onSave={handleConfirmUpgrade}
        lang={lang}
      />

      <AddTutorModal
        isOpen={addTutorModalOpen}
        onClose={() => setAddTutorModalOpen(false)}
        onAdd={handleAddTutor}
        lang={lang}
      />
    </div>
  )
}
