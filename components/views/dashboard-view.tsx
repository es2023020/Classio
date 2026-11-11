'use client'

import React, { useState } from 'react'
import {
  UsersRound,
  CalendarDays,
  CalendarCheck,
  CircleDollarSign,
  WalletCards,
  ArrowUpRight,
  Check,
  X,
  MessageCircle,
  Plus,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  QrCode,
  TrendingUp,
  BookOpen,
  Zap,
  Star,
  LayoutDashboard,
} from 'lucide-react'
import { Student, Group, TutorProfile, DashboardStats } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { buildPaymentReminderWhatsAppUrl } from '@/lib/egyptian-helpers'
import { useLanguage } from '@/lib/language-context'
import { formatPrice } from '@/lib/localization'

interface DashboardViewProps {
  stats: DashboardStats
  students: Student[]
  groups: Group[]
  profile: TutorProfile
  onNavigate: (tab: string) => void
  onAddStudent: () => void
  onRecordPayment: (studentId?: string) => void
  onToggleAttendance: (studentId: string) => void
  onOpenScanModal: () => void
  onSelectStudent: (student: Student) => void
  attendanceState: Record<string, boolean>
  notify: (msg: string) => void
}

export function DashboardView({
  stats,
  students,
  groups,
  profile,
  onNavigate,
  onAddStudent,
  onRecordPayment,
  onToggleAttendance,
  onOpenScanModal,
  onSelectStudent,
  attendanceState,
  notify,
}: DashboardViewProps) {
  const { lang, t, isRTL } = useLanguage()

  // Current day calculation
  const now = new Date()
  const dayIndex = now.getDay()
  const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const DAY_NAMES_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const currentDayName = lang === 'en' ? DAY_NAMES_EN[dayIndex] : DAY_NAMES_AR[dayIndex]
  const currentDayEn = DAY_NAMES_EN[dayIndex]
  const currentDayAr = DAY_NAMES_AR[dayIndex]

  // Filter groups scheduled for today
  const groupsToday = groups.filter((g) => {
    return g.schedule_days.some(
      (d) =>
        d.toLowerCase().includes(currentDayEn.toLowerCase()) ||
        d.includes(currentDayAr)
    )
  })

  const [activeGroupId, setActiveGroupId] = useState<string>(
    groupsToday[0]?.id || groups[0]?.id || ''
  )

  const currentAgendaGroup =
    groups.find((g) => g.id === activeGroupId) || groupsToday[0] || groups[0] || null

  const agendaGroupStudents = currentAgendaGroup
    ? students.filter((s) => s.group_id === currentAgendaGroup.id)
    : []

  const agendaPresentCount = agendaGroupStudents.filter(
    (s) => attendanceState[s.id] ?? s.last_attendance === 'present'
  ).length

  const agendaOverdueStudents = agendaGroupStudents.filter((s) => !s.paid_this_month)
  const agendaOverdueAmount = agendaOverdueStudents.reduce((acc, s) => acc + s.monthly_fee, 0)

  const overdueStudents = students.filter((s) => !s.paid_this_month).slice(0, 5)

  const collectionRate = stats.monthlyExpected > 0
    ? Math.round((stats.monthlyCollected / stats.monthlyExpected) * 100)
    : 0

  const handleGroupBroadcastWhatsApp = () => {
    if (!currentAgendaGroup) return
    const text =
      lang === 'en'
        ? `Greetings from ${profile.name}! Reminder: Our session for ${currentAgendaGroup.name} starts at ${currentAgendaGroup.time_slot} at ${currentAgendaGroup.center_name}. Please ensure homework and booklets are ready.`
        : `السلام عليكم ورحمة الله وبركاته، تذكير بموعد حصة ${currentAgendaGroup.name} اليوم في تمام الساعة ${currentAgendaGroup.time_slot} بـ ${currentAgendaGroup.center_name}. برجاء الالتزام بالحضور في الموعد وإحضار كشكول الحصة والواجب. — ${profile.name}`
    navigator.clipboard?.writeText(text)
    const encoded = encodeURIComponent(text)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
    notify(
      lang === 'en'
        ? 'Session announcement copied & WhatsApp opened'
        : 'تم نسخ رسالة التذكير وفتح واتساب لمشاركتها مع أولياء الأمور'
    )
  }

  const handleWhatsAppReminder = (student: Student) => {
    const url = buildPaymentReminderWhatsAppUrl(
      student,
      profile.name,
      lang === 'en' ? 'Current Month' : 'مايو ٢٠٢٤',
      student.monthly_fee,
      profile.instapay_handle,
      profile.vodafone_cash_number
    )
    window.open(url, '_blank')
    notify(
      lang === 'en'
        ? `Opened WhatsApp reminder for ${student.name}`
        : `تم فتح واتساب لإرسال تذكير سداد للطالب ${student.name}`
    )
  }

  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight

  const hourOfDay = now.getHours()
  const greetingTime =
    lang === 'en'
      ? hourOfDay < 12
        ? 'Good morning'
        : hourOfDay < 17
        ? 'Good afternoon'
        : 'Good evening'
      : hourOfDay < 12
      ? 'صباح الخير'
      : hourOfDay < 17
      ? 'مساء الخير'
      : 'مساء الخير'

  return (
    <div className="space-y-6">
      {/* ─── Hero Welcome Banner ─────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e143f] via-[#30245C] to-[#483387] p-6 text-white shadow-xl md:p-8">
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-purple-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-20 size-56 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 size-32 rounded-full bg-emerald-400/8 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-sm mb-3">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-amber-400" />
              </span>
              <Zap className="size-3" />
              {lang === 'en' ? 'Live workspace' : 'المساحة نشطة'}
            </div>

            <h1 className="text-2xl font-black tracking-tight md:text-3xl">
              {greetingTime}, {profile.name} 👋
            </h1>
            <p className="mt-1.5 text-sm text-blue-200 max-w-lg leading-relaxed">
              {lang === 'en'
                ? `You have ${stats.todayLessonsCount} sessions today · ${collectionRate}% fees collected this month`
                : `لديك ${stats.todayLessonsCount} حصص اليوم · ${collectionRate}% من الاشتراكات محصّلة هذا الشهر`}
            </p>
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={onOpenScanModal}
              className="gap-2 rounded-2xl bg-amber-400 px-5 text-xs font-black text-slate-950 shadow-md hover:bg-amber-300 transition cursor-pointer"
            >
              <QrCode className="size-4" />
              {lang === 'en' ? 'Scan Barcode' : 'مسح الكود'}
            </Button>
            <Button
              onClick={() => onRecordPayment()}
              className="gap-2 rounded-2xl bg-white/12 px-4 text-xs font-bold text-white backdrop-blur-md hover:bg-white/20 transition cursor-pointer border border-white/15"
            >
              <Plus className="size-4" />
              {lang === 'en' ? 'Record Payment' : 'تسجيل دفعة'}
            </Button>
            <Button
              onClick={onAddStudent}
              className="gap-2 rounded-2xl bg-white/12 px-4 text-xs font-bold text-white backdrop-blur-md hover:bg-white/20 transition cursor-pointer border border-white/15"
            >
              <UsersRound className="size-4" />
              {lang === 'en' ? 'Add Student' : 'إضافة طالب'}
            </Button>
          </div>
        </div>
      </div>

      {/* ─── 4 KPI Stat Cards ─────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="card-stat group cursor-pointer p-5 hover:border-blue-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#EEE8FF] text-[#7047EB] group-hover:bg-[#F3EEFF] transition">
              <UsersRound className="size-5" />
            </div>
            <ArrowUpRight className="size-4 text-slate-300 group-hover:text-[#7047EB] transition" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-slate-900">{stats.totalStudents}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">{t.dashboard.totalStudents}</p>
          </div>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <span className="text-[11px] text-slate-400">
              {t.dashboard.distributedGroups.replace('{count}', String(stats.activeGroups))}
            </span>
          </div>
        </div>

        {/* Monthly Collection */}
        <div
          onClick={() => onNavigate('payments')}
          className="card-stat group cursor-pointer p-5 hover:border-emerald-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition">
              <CircleDollarSign className="size-5" />
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-black text-emerald-800">
              {collectionRate}%
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-emerald-600">
              {formatPrice(stats.monthlyCollected, lang)}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">{t.dashboard.monthlyCollection}</p>
          </div>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-400">
                {lang === 'en' ? 'of' : 'من'} {formatPrice(stats.monthlyExpected, lang)}
              </span>
            </div>
          </div>
        </div>

        {/* Outstanding / Overdue */}
        <div
          onClick={() => onNavigate('payments')}
          className="card-stat group cursor-pointer p-5 hover:border-amber-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition">
              <WalletCards className="size-5" />
            </div>
            {stats.pendingRemindersCount > 0 && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-black text-white">
                {stats.pendingRemindersCount}
              </span>
            )}
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-amber-600">
              {formatPrice(stats.monthlyOutstanding, lang)}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">{t.dashboard.overdueBalance}</p>
          </div>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700">
              <AlertTriangle className="size-3" />
              {t.dashboard.overdueStudents.replace('{count}', String(stats.pendingRemindersCount))}
            </span>
          </div>
        </div>

        {/* Today's Sessions */}
        <div
          onClick={() => onNavigate('attendance')}
          className="card-stat group cursor-pointer p-5 hover:border-purple-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 group-hover:bg-purple-100 transition">
              <CalendarDays className="size-5" />
            </div>
            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-100">
              {currentDayName}
            </span>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-slate-900">{stats.todayLessonsCount}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">{t.dashboard.todayLessons}</p>
          </div>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <Check className="size-3" />
              {t.dashboard.attendanceRate.replace('{rate}', String(stats.attendanceRateToday))}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Main Content Grid ─────────────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">

        {/* Left Column */}
        <div className="space-y-5">

          {/* ── Today's Agenda ── */}
          <div className="card-glass overflow-hidden">
            {/* Header */}
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </span>
                <h2 className="text-sm font-black text-slate-800">
                  {lang === 'en' ? "Today's Agenda" : 'أجندة اليوم'}
                </h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                  {currentDayName}
                </span>
              </div>

              {/* Group tabs */}
              {groups.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {groups.map((g) => {
                    const isScheduledToday = groupsToday.some((tg) => tg.id === g.id)
                    const isSelected = currentAgendaGroup?.id === g.id
                    return (
                      <button
                        key={g.id}
                        onClick={() => setActiveGroupId(g.id)}
                        className={`relative rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#7047EB] text-white shadow-xs'
                            : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {g.name}
                        {isScheduledToday && (
                          <span className="absolute -top-1 -end-1 size-2 rounded-full bg-emerald-500" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {currentAgendaGroup ? (
              <div className="p-5">
                {/* Group detail row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">{currentAgendaGroup.name}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Clock className="size-3.5 text-[#7047EB]" />
                        {currentAgendaGroup.time_slot}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="flex items-center gap-1.5 font-semibold">
                        <MapPin className="size-3.5 text-rose-500" />
                        {currentAgendaGroup.center_name}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                        {currentAgendaGroup.stage_label}
                      </span>
                    </div>
                  </div>
                  <span className="self-start rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-black text-emerald-800">
                    {formatPrice(currentAgendaGroup.monthly_fee, lang)}
                    <span className="font-semibold text-emerald-600 ml-1">
                      {lang === 'en' ? '/ student' : 'للطالب'}
                    </span>
                  </span>
                </div>

                {/* 3 micro-KPIs */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-purple-100 bg-[#F2EFFA]/60 p-3.5 text-center">
                    <p className="text-xl font-black text-[#7047EB]">
                      {agendaGroupStudents.length}
                      <span className="text-xs font-normal text-slate-400 ml-0.5">
                        / {currentAgendaGroup.max_students}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11px] font-bold text-slate-500">
                      {lang === 'en' ? 'Enrolled' : 'الطلاب'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 text-center">
                    <p className="text-xl font-black text-emerald-700">
                      {agendaPresentCount}
                      <span className="text-xs font-bold text-emerald-500 ml-0.5">
                        ({agendaGroupStudents.length > 0
                          ? Math.round((agendaPresentCount / agendaGroupStudents.length) * 100)
                          : 0}%)
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11px] font-bold text-slate-500">
                      {lang === 'en' ? 'Present' : 'حضروا'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-3.5 text-center">
                    <p className="text-xl font-black text-amber-700">
                      {agendaOverdueStudents.length}
                      <span className="text-[11px] font-normal text-slate-400 ml-0.5">
                        ({formatPrice(agendaOverdueAmount, lang)})
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11px] font-bold text-slate-500">
                      {lang === 'en' ? 'Overdue' : 'متأخرون'}
                    </p>
                  </div>
                </div>

                {/* Quick action buttons */}
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Button
                    onClick={() => onNavigate('attendance')}
                    className="gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white cursor-pointer"
                  >
                    <CalendarCheck className="size-3.5" />
                    {lang === 'en' ? 'Attendance' : 'الحضور'}
                  </Button>
                  <Button
                    onClick={() => onRecordPayment()}
                    className="gap-1.5 rounded-xl bg-[#7047EB] hover:bg-[#5D35D5] text-xs font-bold text-white cursor-pointer"
                  >
                    <CircleDollarSign className="size-3.5 text-emerald-400" />
                    {lang === 'en' ? 'Collect Fees' : 'تحصيل'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onOpenScanModal}
                    className="gap-1.5 rounded-xl border-[#D8CCFF] bg-white hover:bg-[#F3EEFF] text-xs font-bold text-[#7047EB] cursor-pointer"
                  >
                    <QrCode className="size-3.5" />
                    {lang === 'en' ? 'Scan' : 'مسح'}
                  </Button>
                  <Button
                    onClick={handleGroupBroadcastWhatsApp}
                    className="gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-xs font-bold text-white cursor-pointer"
                  >
                    <MessageCircle className="size-3.5" />
                    {lang === 'en' ? 'WhatsApp' : 'واتساب'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <LayoutDashboard className="mx-auto size-10 text-slate-200 mb-3" />
                <p className="text-sm font-bold text-slate-400">
                  {lang === 'en' ? 'No groups configured yet.' : 'لم يتم إنشاء مجموعات بعد.'}
                </p>
                <Button
                  onClick={() => onNavigate('groups')}
                  className="mt-4 rounded-xl bg-[#7047EB] hover:bg-[#5D35D5] text-xs font-bold text-white cursor-pointer"
                >
                  {lang === 'en' ? 'Create First Group' : 'إنشاء أول مجموعة'}
                </Button>
              </div>
            )}
          </div>

          {/* ── Quick Attendance for first group ── */}
          <div className="card-glass p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-bold text-slate-800">{t.dashboard.todaySession}</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('attendance')}
                className="rounded-xl text-xs font-bold text-[#7047EB] hover:bg-[#F3EEFF] border-[#D8CCFF] cursor-pointer"
              >
                {t.dashboard.openAttendance}
                <ArrowIcon className="size-3.5 ml-1" />
              </Button>
            </div>

            {students.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                {lang === 'en' ? 'Add students to see quick attendance here.' : 'أضف طلاباً لعرض سجل الحضور السريع.'}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  {t.dashboard.quickAttendance}
                </p>
                {students.slice(0, 6).map((student) => {
                  const isPresent = attendanceState[student.id] ?? student.last_attendance === 'present'
                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3.5 py-2.5 hover:bg-white hover:shadow-xs border border-transparent hover:border-slate-200 transition"
                    >
                      <div
                        onClick={() => onSelectStudent(student)}
                        className="flex cursor-pointer items-center gap-3"
                      >
                        <div className="flex size-8 items-center justify-center rounded-xl bg-[#EEE8FF] text-xs font-black text-[#7047EB]">
                          {student.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 hover:text-[#7047EB] transition">
                            {student.name}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">{student.student_code}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!student.paid_this_month && (
                          <span className="hidden sm:inline rounded-lg bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
                            {lang === 'en' ? 'Unpaid' : 'غير مسدد'}
                          </span>
                        )}
                        <button
                          onClick={() => onToggleAttendance(student.id)}
                          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                            isPresent
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-500 hover:text-emerald-700'
                          }`}
                        >
                          {isPresent ? (
                            <Check className="size-3.5" />
                          ) : (
                            <X className="size-3.5 text-slate-400" />
                          )}
                          {isPresent ? t.dashboard.present : t.dashboard.markPresent}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
              <span className="text-slate-400">
                {t.dashboard.registered
                  .replace('{shown}', String(Math.min(6, students.length)))
                  .replace('{total}', String(students.length))}
              </span>
              <Button
                onClick={() => onRecordPayment()}
                size="sm"
                className="gap-1.5 rounded-xl bg-[#7047EB] text-xs font-bold text-white hover:bg-[#5D35D5] cursor-pointer shadow-xs"
              >
                <Plus className="size-3.5" />
                {t.dashboard.collectDuring}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">

          {/* ── Overdue Fee Reminders ── */}
          <div className="card-glass flex flex-col p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800">{t.dashboard.overdueReminders}</h2>
                <p className="mt-0.5 text-[11px] text-slate-400">{t.dashboard.whatsappReminders}</p>
              </div>
              {stats.pendingRemindersCount > 0 && (
                <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-black text-white">
                  {stats.pendingRemindersCount}
                </span>
              )}
            </div>

            <div className="flex-1 space-y-2.5">
              {overdueStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 mb-3">
                    <Check className="size-7 text-emerald-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">{t.dashboard.allClear}</p>
                </div>
              ) : (
                overdueStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-2xl border border-amber-200/70 bg-amber-50/40 p-3 hover:bg-amber-50/80 transition"
                  >
                    <div
                      onClick={() => onSelectStudent(student)}
                      className="cursor-pointer min-w-0 flex-1"
                    >
                      <p className="text-xs font-bold text-slate-800 truncate hover:text-amber-900">
                        {student.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="truncate">{student.group_name}</span>
                        <span className="text-slate-300">·</span>
                        <span className="font-black text-amber-800 shrink-0">
                          {formatPrice(student.monthly_fee, lang)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleWhatsAppReminder(student)}
                      className="ml-2 shrink-0 flex items-center gap-1.5 rounded-xl bg-[#25D366] px-2.5 py-1.5 text-[11px] font-bold text-white shadow-xs hover:bg-[#20ba5a] cursor-pointer transition"
                    >
                      <MessageCircle className="size-3" />
                      {lang === 'en' ? 'Remind' : 'تذكير'}
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => onNavigate('payments')}
              className="mt-4 w-full rounded-xl border border-[#EAE8F1] bg-white py-2.5 text-center text-xs font-bold text-[#7047EB] hover:bg-[#F3EEFF] cursor-pointer transition shadow-xs"
            >
              {t.dashboard.viewPayments}
            </button>
          </div>

          {/* ── Quick Stats Summary ── */}
          <div className="card-glass p-5">
            <h2 className="mb-4 text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="size-4 text-[#7047EB]" />
              {lang === 'en' ? 'Quick Insights' : 'إحصائيات سريعة'}
            </h2>

            <div className="space-y-3">
              {/* Homework Rate */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <BookOpen className="size-3.5 text-purple-600" />
                    {lang === 'en' ? 'Avg. Homework Rate' : 'متوسط تسليم الواجب'}
                  </span>
                  <span className="font-black text-slate-800">{stats.averageHomeworkRate}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-purple-500 transition-all duration-700"
                    style={{ width: `${stats.averageHomeworkRate}%` }}
                  />
                </div>
              </div>

              {/* Improving Students */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <Star className="size-3.5 text-amber-500" />
                    {lang === 'en' ? 'Students Improving' : 'طلاب يتحسنون'}
                  </span>
                  <span className="font-black text-slate-800">{stats.studentsImprovingCount}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-700"
                    style={{
                      width: `${stats.totalStudents > 0 ? Math.round(((stats.studentsImprovingCount || 0) / stats.totalStudents) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Attendance Rate */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <CalendarCheck className="size-3.5 text-emerald-600" />
                    {lang === 'en' ? 'Today Attendance Rate' : 'نسبة الحضور اليوم'}
                  </span>
                  <span className="font-black text-slate-800">{stats.attendanceRateToday}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${stats.attendanceRateToday}%` }}
                  />
                </div>
              </div>

              {/* Fee Collection Rate */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <CircleDollarSign className="size-3.5 text-blue-600" />
                    {lang === 'en' ? 'Fee Collection Rate' : 'نسبة التحصيل'}
                  </span>
                  <span className="font-black text-slate-800">{collectionRate}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-700"
                    style={{ width: `${collectionRate}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Navigate buttons row */}
            <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => onNavigate('reports')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#D8CCFF] bg-white py-2 text-xs font-bold text-[#7047EB] hover:bg-[#F3EEFF] cursor-pointer transition shadow-xs"
              >
                <TrendingUp className="size-3.5 text-[#7047EB]" />
                {lang === 'en' ? 'Full Reports' : 'التقارير'}
              </button>
              <button
                onClick={() => onNavigate('students')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#D8CCFF] bg-white py-2 text-xs font-bold text-[#7047EB] hover:bg-[#F3EEFF] cursor-pointer transition shadow-xs"
              >
                <UsersRound className="size-3.5 text-[#7047EB]" />
                {lang === 'en' ? 'All Students' : 'جميع الطلاب'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
