'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  LayoutDashboard,
  UsersRound,
  Grid2X2,
  CalendarDays,
  WalletCards,
  CalendarCheck2,
  BarChart3,
  Settings,
  Sparkles,
  Plus,
  Bell,
  Search,
  Menu,
  X,
  Check,
  ChevronDown,
  Database,
  ShieldCheck,
  Receipt,
  UserPlus,
  QrCode,
  BookOpen,
  Award,
  Globe,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { ClassioLogo } from '@/components/ui/classio-logo'
import {
  Student,
  Group,
  PaymentRecord,
  AttendanceRecord,
  TutorProfile,
  DashboardStats,
  LessonPlan,
} from '@/lib/types'
import {
  storage,
  initialProfile,
  initialGroups,
  initialStudents,
  initialPayments,
  initialLessons,
} from '@/lib/storage'
import { isSupabaseConfigured } from '@/lib/supabase'
import {
  localizeStudent,
  localizeGroup,
  localizeTutor,
  localizePayment,
  localizeLesson,
} from '@/lib/localization'

// Views
import { DashboardView } from '@/components/views/dashboard-view'
import { StudentsView } from '@/components/views/students-view'
import { GroupsView } from '@/components/views/groups-view'
import { AttendanceView } from '@/components/views/attendance-view'
import { PaymentsView } from '@/components/views/payments-view'
import { ScheduleView } from '@/components/views/schedule-view'
import { LessonsView } from '@/components/views/lessons-view'
import { ReportsView } from '@/components/views/reports-view'

// Modals
import { StudentModal } from '@/components/modals/student-modal'
import { PaymentModal } from '@/components/modals/payment-modal'
import { ReceiptModal } from '@/components/modals/receipt-modal'
import { GroupModal } from '@/components/modals/group-modal'
import { SettingsModal } from '@/components/modals/settings-modal'
import { ScanModal } from '@/components/modals/scan-modal'
import { StudentSuccessModal } from '@/components/modals/student-success-modal'
import { ImportModal } from '@/components/modals/import-modal'
import { AuthModal } from '@/components/auth/auth-modal'

export type NavTab =
  | 'dashboard' | 'الرئيسية'
  | 'students' | 'الطلاب'
  | 'lessons' | 'الحصص والواجبات'
  | 'groups' | 'المجموعات'
  | 'schedule' | 'جدول الحصص'
  | 'payments' | 'المدفوعات'
  | 'attendance' | 'سجل الحضور'
  | 'reports' | 'التقارير'

export function TutorDashboard() {
  const router = useRouter()
  const { lang, t, toggleLang, isRTL, dir } = useLanguage()

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // App Data States
  const [profile, setProfile] = useState<TutorProfile>(initialProfile)
  const [groups, setGroups] = useState<Group[]>(initialGroups)
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [payments, setPayments] = useState<PaymentRecord[]>(initialPayments)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [lessons, setLessons] = useState<LessonPlan[]>(initialLessons)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeGroups: 0,
    todayLessonsCount: 0,
    monthlyExpected: 0,
    monthlyCollected: 0,
    monthlyOutstanding: 0,
    attendanceRateToday: 94,
    pendingRemindersCount: 0,
    studentsImprovingCount: 0,
    averageHomeworkRate: 88,
  })

  // Modal States
  const [studentModalOpen, setStudentModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentDefaultStudentId, setPaymentDefaultStudentId] = useState<string | undefined>()

  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<PaymentRecord | null>(null)

  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)

  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [scanModalOpen, setScanModalOpen] = useState(false)
  const [selectedSuccessStudent, setSelectedSuccessStudent] = useState<Student | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('ahmed.mahmoud@example.com')

  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [todayAttendanceState, setTodayAttendanceState] = useState<Record<string, boolean>>({})

  // Localized data representations based on current language
  const localizedStudents = useMemo(() => students.map((s) => localizeStudent(s, lang)), [students, lang])
  const localizedGroups = useMemo(() => groups.map((g) => localizeGroup(g, lang)), [groups, lang])
  const localizedProfile = useMemo(() => localizeTutor(profile, lang), [profile, lang])
  const localizedPayments = useMemo(() => payments.map((p) => localizePayment(p, lang)), [payments, lang])
  const localizedLessons = useMemo(() => lessons.map((l) => localizeLesson(l, lang)), [lessons, lang])

  // Notifications
  const notify = useCallback((msg: string) => {
    setToastMessage(msg)
    window.setTimeout(() => setToastMessage(''), 3000)
  }, [])

  // Bulk Import Handler
  const handleBulkImportStudents = async (newStudents: Student[]) => {
    for (const s of newStudents) {
      await storage.saveStudent(s)
    }
    await refreshAllData()
    notify(`✅ تم استيراد ${newStudents.length} طالب بنجاح!`)
  }

  // Load Data on Mount
  const refreshAllData = useCallback(async () => {
    try {
      const [p, g, s, pay, att, les, stats] = await Promise.all([
        storage.getProfile(),
        storage.getGroups(),
        storage.getStudents(),
        storage.getPayments(),
        storage.getAttendance(),
        storage.getLessons(),
        storage.getDashboardStats(),
      ])
      setProfile(p)
      setGroups(g)
      setStudents(s)
      setPayments(pay)
      setAttendanceRecords(att)
      setLessons(les)
      setDashboardStats(stats)
    } catch (err) {
      console.error('Error loading data:', err)
    }
  }, [])

  useEffect(() => {
    refreshAllData()
  }, [refreshAllData])

  // Global Keyboard Shortcuts (⌘K or Ctrl+K for Barcode Scan)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setScanModalOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // --- Student Handlers ---
  const handleSaveStudent = async (student: Student) => {
    await storage.saveStudent(student)
    await refreshAllData()
    notify(editingStudent ? 'تم تعديل بيانات الطالب بنجاح' : 'تمت إضافة الطالب الجديد بنجاح')
    setEditingStudent(null)
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك بحذف هذا الطالب وسجلاته؟')) {
      await storage.deleteStudent(studentId)
      await refreshAllData()
      notify('تم حذف الطالب بنجاح')
    }
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setStudentModalOpen(true)
  }

  const handleSavePedagogy = async (studentId: string, updates: Partial<Student>) => {
    await storage.updateStudentPedagogy(studentId, updates)
    await refreshAllData()
    if (selectedSuccessStudent?.id === studentId) {
      setSelectedSuccessStudent((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  // --- Payment Handlers ---
  const handleOpenPaymentModal = (studentId?: string) => {
    setPaymentDefaultStudentId(studentId)
    setPaymentModalOpen(true)
  }

  const handleSavePayment = async (payment: PaymentRecord, openReceipt: boolean) => {
    await storage.recordPayment(payment)
    await refreshAllData()
    notify(`تم تسجيل تحصيل مبلغ ${payment.amount} ج.م للطالب ${payment.student_name}`)

    if (openReceipt) {
      setActiveReceiptPayment(payment)
      setReceiptModalOpen(true)
    }
  }

  const handleViewReceipt = (payment: PaymentRecord) => {
    setActiveReceiptPayment(payment)
    setReceiptModalOpen(true)
  }

  // --- Group Handlers ---
  const handleSaveGroup = async (group: Group) => {
    await storage.saveGroup(group)
    await refreshAllData()
    notify(editingGroup ? 'تم تعديل بيانات المجموعة بنجاح' : 'تم إنشاء المجموعة الجديدة بنجاح')
    setEditingGroup(null)
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المجموعة؟')) {
      await storage.deleteGroup(groupId)
      await refreshAllData()
      notify('تم حذف المجموعة')
    }
  }

  // --- Lessons & Homework Handlers ---
  const handleSaveLesson = async (lesson: LessonPlan) => {
    await storage.saveLesson(lesson)
    await refreshAllData()
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (window.confirm('هل تريد حذف هذه الحصة ومحتوى واجبها؟')) {
      await storage.deleteLesson(lessonId)
      await refreshAllData()
      notify('تم حذف الحصة')
    }
  }

  // --- Attendance Handlers ---
  const handleSaveAttendance = async (record: AttendanceRecord) => {
    await storage.saveAttendanceRecord(record)
    setTodayAttendanceState((prev) => ({
      ...prev,
      [record.student_id]: record.status === 'present',
    }))
    const stats = await storage.getDashboardStats()
    setDashboardStats(stats)
  }

  const handleToggleAttendance = (studentId: string) => {
    const isCurrentlyPresent = Boolean(todayAttendanceState[studentId])
    const newStatus = isCurrentlyPresent ? 'absent' : 'present'
    setTodayAttendanceState((prev) => ({ ...prev, [studentId]: !isCurrentlyPresent }))

    const student = students.find((s) => s.id === studentId)
    if (student) {
      const record: AttendanceRecord = {
        id: `att-${studentId}-${new Date().toISOString().split('T')[0]}`,
        student_id: studentId,
        student_name: student.name,
        group_id: student.group_id,
        lesson_date: new Date().toISOString().split('T')[0],
        status: newStatus,
        homework_done: true,
      }
      handleSaveAttendance(record)
      notify(newStatus === 'present' ? `تم تسجيل حضور ${student.name}` : `تم تسجيل غياب ${student.name}`)
    }
  }

  // --- Profile / Settings Handlers ---
  const handleSaveProfile = async (newProfile: TutorProfile) => {
    await storage.saveProfile(newProfile)
    setProfile(newProfile)
    notify('تم حفظ الإعدادات بنجاح')
  }

  const handleResetData = () => {
    if (window.confirm('هل تريد استعادة البيانات التجريبية الافتراضية؟')) {
      storage.resetAll()
      refreshAllData()
      setSettingsModalOpen(false)
      notify('تمت استعادة البيانات الافتراضية بنجاح')
    }
  }

  const isSupabaseReady = isSupabaseConfigured()

  const isDashboard = activeTab === 'dashboard' || activeTab === 'الرئيسية'
  const isStudents = activeTab === 'students' || activeTab === 'الطلاب'
  const isLessons = activeTab === 'lessons' || activeTab === 'الحصص والواجبات'
  const isGroups = activeTab === 'groups' || activeTab === 'المجموعات'
  const isSchedule = activeTab === 'schedule' || activeTab === 'جدول الحصص'
  const isPayments = activeTab === 'payments' || activeTab === 'المدفوعات'
  const isAttendance = activeTab === 'attendance' || activeTab === 'سجل الحضور'
  const isReports = activeTab === 'reports' || activeTab === 'التقارير'

  const navItems = [
    { key: 'dashboard' as NavTab, label: t.nav.dashboard, icon: LayoutDashboard, isActive: isDashboard },
    { key: 'students' as NavTab, label: t.nav.students, count: students.length, icon: UsersRound, isActive: isStudents },
    { key: 'lessons' as NavTab, label: t.nav.lessons, count: lessons.length, icon: BookOpen, isActive: isLessons },
    { key: 'groups' as NavTab, label: t.nav.groups, count: groups.length, icon: Grid2X2, isActive: isGroups },
    { key: 'schedule' as NavTab, label: t.nav.schedule, icon: CalendarDays, isActive: isSchedule },
    {
      key: 'payments' as NavTab,
      label: t.nav.payments,
      badge: dashboardStats.pendingRemindersCount > 0 ? String(dashboardStats.pendingRemindersCount) : undefined,
      icon: WalletCards,
      isActive: isPayments,
    },
    { key: 'attendance' as NavTab, label: t.nav.attendance, icon: CalendarCheck2, isActive: isAttendance },
    { key: 'reports' as NavTab, label: t.nav.reports, icon: BarChart3, isActive: isReports },
  ]

  const currentPlanLimit = profile.max_students_limit || 75
  const currentPlanName = profile.subscription_plan ? profile.subscription_plan.toUpperCase() : 'GROWTH'

  return (
    <div dir={dir} className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-xs transition-opacity lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} z-40 flex w-[272px] flex-col border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 py-5 shadow-xs transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen
            ? 'translate-x-0'
            : isRTL
            ? 'translate-x-full'
            : '-translate-x-full'
        }`}
      >
        {/* Logo and Brand */}
        <div className="mb-6 flex items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-2 group">
            <ClassioLogo size="md" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Database Connection Pill */}
        <div className="mb-5 px-1">
          <div
            onClick={() => setSettingsModalOpen(true)}
            className={`flex cursor-pointer items-center justify-between rounded-2xl border p-2.5 transition ${
              isSupabaseReady
                ? 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 text-xs">
              <div
                className={`flex size-6 items-center justify-center rounded-lg ${
                  isSupabaseReady ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                <Database className="size-3.5" />
              </div>
              <span className="font-bold text-slate-700">
                {isSupabaseReady ? t.sidebar.supabaseDB : t.sidebar.offlineMode}
              </span>
            </div>
            <span
              className={`size-2 rounded-full ${
                isSupabaseReady ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Navigation Section */}
        <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
          {t.sidebar.mainMenu}
        </p>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.isActive

            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key)
                  setMobileMenuOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-start text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#0f2c59] text-white shadow-xs font-black'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`size-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge ? (
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white">
                    {item.badge}
                  </span>
                ) : item.count !== undefined ? (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.count}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>

        {/* Current Plan Card */}
        <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Classio Plan</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
              {currentPlanName}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {t.sidebar.studentsOf
              .replace('{count}', String(students.length))
              .replace('{limit}', String(currentPlanLimit))}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${Math.min(100, Math.round((students.length / currentPlanLimit) * 100))}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="text-[11px] font-bold text-[#0f2c59] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Settings className="size-3.5" />
              <span>{t.header.settings}</span>
            </button>
            <Link
              href="/checkout"
              className="text-[10px] font-black bg-[#0f2c59] text-white px-2 py-0.5 rounded-lg hover:bg-[#1a3d6d]"
            >
              {t.sidebar.upgradePlan}
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`${isRTL ? 'lg:mr-[272px]' : 'lg:ml-[272px]'} flex min-h-screen flex-col`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden hover:bg-slate-50 cursor-pointer"
            >
              <Menu className="size-5" />
            </button>

            {/* Quick Barcode Scanner Search Bar */}
            <div
              onClick={() => setScanModalOpen(true)}
              className="hidden md:flex cursor-pointer items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs text-slate-400 hover:border-slate-300 transition hover:bg-white"
            >
              <QrCode className="size-4 text-[#0f2c59]" />
              <span className="w-56 text-start font-semibold text-slate-600">
                {t.header.scanBarcode}
              </span>
              <kbd className="rounded-md border bg-white px-2 py-0.5 text-[10px] font-mono text-slate-500 shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-2.5">
            {/* Quick Add Dropdown */}
            <div className="relative">
              <Button
                onClick={() => setQuickAddOpen(!quickAddOpen)}
                className="gap-1.5 rounded-2xl bg-[#0f2c59] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#1a3d6d] cursor-pointer"
              >
                <Plus className="size-4" />
                <span className="hidden sm:inline">{t.header.quickAdd}</span>
                <ChevronDown className="size-3.5" />
              </Button>

              {quickAddOpen && (
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-12 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in`}>
                  <button
                    onClick={() => {
                      setQuickAddOpen(false)
                      setEditingStudent(null)
                      setStudentModalOpen(true)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-start text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <UserPlus className="size-4 text-blue-600" />
                    {t.header.addStudent}
                  </button>
                  <button
                    onClick={() => {
                      setQuickAddOpen(false)
                      setActiveTab('lessons')
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-start text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <BookOpen className="size-4 text-purple-600" />
                    {t.header.addLesson}
                  </button>
                  <button
                    onClick={() => {
                      setQuickAddOpen(false)
                      handleOpenPaymentModal()
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-start text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <WalletCards className="size-4 text-emerald-600" />
                    {t.header.recordPayment}
                  </button>
                  <button
                    onClick={() => {
                      setQuickAddOpen(false)
                      setEditingGroup(null)
                      setGroupModalOpen(true)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-start text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Grid2X2 className="size-4 text-amber-600" />
                    {t.header.addGroup}
                  </button>
                </div>
              )}
            </div>

            {/* Language Toggle Button */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              title={lang === 'en' ? 'التحويل إلى العربية' : 'Switch to English'}
            >
              <Globe className="size-4 text-[#0f2c59]" />
              <span className="hidden sm:inline">{lang === 'en' ? 'عربي' : 'English'}</span>
            </button>

            {/* External Landing Page Link */}
            <Link
              href="/"
              className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#0f2c59] px-2 py-2"
              title={lang === 'en' ? 'Public Landing Page' : 'صفحة الهبوط'}
            >
              <ExternalLink className="size-3.5" />
            </Link>

            {/* Tutor Profile Avatar */}
            <div
              onClick={() => setSettingsModalOpen(true)}
              className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 hover:bg-slate-50"
            >
              <div className="flex size-8 items-center justify-center rounded-xl bg-[#0f2c59] text-xs font-black text-amber-300 font-mono">
                {profile.avatar_initials}
              </div>
              <div className="hidden text-start sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">{localizedProfile.name}</p>
                <p className="text-[10px] text-slate-400 font-semibold">{localizedProfile.subject}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                localStorage.removeItem('classio_auth_user')
                router.push('/login')
              }}
              className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-2 sm:px-3 sm:py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title={lang === 'en' ? 'Sign Out' : 'تسجيل الخروج'}
            >
              <LogOut className="size-3.5" />
              <span className="hidden md:inline">{lang === 'en' ? 'Sign Out' : 'خروج'}</span>
            </button>
          </div>
        </header>

        {/* View Content Body */}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-[1400px] w-full mx-auto">
          {isDashboard && (
            <DashboardView
              stats={dashboardStats}
              students={localizedStudents}
              groups={localizedGroups}
              profile={localizedProfile}
              onNavigate={(tab) => setActiveTab(tab as NavTab)}
              onAddStudent={() => {
                setEditingStudent(null)
                setStudentModalOpen(true)
              }}
              onRecordPayment={handleOpenPaymentModal}
              onToggleAttendance={handleToggleAttendance}
              onOpenScanModal={() => setScanModalOpen(true)}
              onSelectStudent={(s) => router.push(`/students/${s.id}`)}
              attendanceState={todayAttendanceState}
              notify={notify}
            />
          )}

          {isStudents && (
            <StudentsView
              students={localizedStudents}
              groups={localizedGroups}
              profile={localizedProfile}
              onAddStudent={() => {
                setEditingStudent(null)
                setStudentModalOpen(true)
              }}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
              onRecordPayment={handleOpenPaymentModal}
              onSelectStudent={(s) => router.push(`/students/${s.id}`)}
              onOpenScanModal={() => setScanModalOpen(true)}
              onOpenImportModal={() => setImportModalOpen(true)}
              notify={notify}
            />
          )}

          {isLessons && (
            <LessonsView
              lessons={localizedLessons}
              groups={localizedGroups}
              students={localizedStudents}
              profile={localizedProfile}
              onSaveLesson={handleSaveLesson}
              onDeleteLesson={handleDeleteLesson}
              notify={notify}
            />
          )}

          {isGroups && (
            <GroupsView
              groups={localizedGroups}
              students={localizedStudents}
              onAddGroup={() => {
                setEditingGroup(null)
                setGroupModalOpen(true)
              }}
              onEditGroup={(g) => {
                setEditingGroup(g)
                setGroupModalOpen(true)
              }}
              onDeleteGroup={handleDeleteGroup}
              onSelectGroupStudents={() => {
                setActiveTab('students')
              }}
            />
          )}

          {isSchedule && (
            <ScheduleView
              groups={localizedGroups}
              onSelectGroup={() => setActiveTab('attendance')}
              onAddGroup={() => {
                setEditingGroup(null)
                setGroupModalOpen(true)
              }}
            />
          )}

          {isPayments && (
            <PaymentsView
              payments={localizedPayments}
              students={localizedStudents}
              groups={localizedGroups}
              profile={localizedProfile}
              onRecordPayment={handleOpenPaymentModal}
              onViewReceipt={handleViewReceipt}
              notify={notify}
            />
          )}

          {isAttendance && (
            <AttendanceView
              groups={localizedGroups}
              students={localizedStudents}
              attendanceRecords={attendanceRecords}
              profile={localizedProfile}
              onSaveAttendance={handleSaveAttendance}
              notify={notify}
            />
          )}

          {isReports && (
            <ReportsView
              stats={dashboardStats}
              students={localizedStudents}
              groups={localizedGroups}
              payments={localizedPayments}
              attendanceRecords={attendanceRecords}
              notify={notify}
            />
          )}
        </main>
      </div>

      {/* Floating Toast Message */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 start-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#0f2c59] px-4 py-3 text-xs font-bold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-3"
        >
          <Check className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <StudentModal
        isOpen={studentModalOpen}
        onClose={() => {
          setStudentModalOpen(false)
          setEditingStudent(null)
        }}
        onSave={handleSaveStudent}
        groups={groups}
        editingStudent={editingStudent}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSave={handleSavePayment}
        students={students}
        defaultStudentId={paymentDefaultStudentId}
      />

      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false)
          setActiveReceiptPayment(null)
        }}
        payment={activeReceiptPayment}
        student={students.find((s) => s.id === activeReceiptPayment?.student_id)}
        tutor={profile}
      />

      <GroupModal
        isOpen={groupModalOpen}
        onClose={() => {
          setGroupModalOpen(false)
          setEditingGroup(null)
        }}
        onSave={handleSaveGroup}
        editingGroup={editingGroup}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        onResetData={handleResetData}
      />

      <ScanModal
        isOpen={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        students={students}
        onMarkPresent={handleToggleAttendance}
        onOpenPayment={handleOpenPaymentModal}
        notify={notify}
      />

      {/* Student Success Profile Modal */}
      <StudentSuccessModal
        isOpen={Boolean(selectedSuccessStudent)}
        onClose={() => setSelectedSuccessStudent(null)}
        student={selectedSuccessStudent}
        payments={payments}
        attendanceRecords={attendanceRecords}
        tutor={profile}
        onSavePedagogy={handleSavePedagogy}
        onRecordPayment={(id) => {
          setSelectedSuccessStudent(null)
          handleOpenPaymentModal(id)
        }}
        onViewReceipt={(p) => {
          setSelectedSuccessStudent(null)
          handleViewReceipt(p)
        }}
        notify={notify}
      />

      {/* Bulk Excel Import Modal */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        groups={groups}
        onImportStudents={handleBulkImportStudents}
        notify={notify}
      />

      {/* Authentication & User Isolation Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUserEmail={currentUserEmail}
        onAuthSuccess={(email) => {
          setCurrentUserEmail(email)
          setProfile((prev) => ({ ...prev, email: email }))
        }}
        onSignOut={() => {
          setCurrentUserEmail('')
          notify('تم تسجيل الخروج')
          setAuthModalOpen(false)
        }}
        notify={notify}
      />
    </div>
  )
}
