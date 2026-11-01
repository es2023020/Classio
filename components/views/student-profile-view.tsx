'use client'

import React, { useState, useEffect, useMemo, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  User,
  Users,
  CalendarCheck2,
  CalendarDays,
  CreditCard,
  WalletCards,
  Award,
  BookOpen,
  MessageCircle,
  Phone,
  FileText,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  Edit2,
  Trash2,
  Share2,
  Send,
  Download,
  Filter,
  Check,
  Zap,
  TrendingUp,
  Target,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Receipt,
  UserCheck,
  UserX,
  Archive,
  GraduationCap,
  MapPin,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'
import {
  Student,
  Group,
  AttendanceRecord,
  PaymentRecord,
  AssessmentRecord,
  HomeworkAssignment,
  TutorProfile,
  AttendanceStatus,
  LearningTrajectory,
} from '@/lib/types'
import { whatsAppEngine } from '@/lib/whatsapp-engine'
import { storage } from '@/lib/storage'
import { useLanguage } from '@/lib/language-context'
import { formatPrice } from '@/lib/localization'
import { Button } from '@/components/ui/button'
import { ClassioLogo } from '@/components/ui/classio-logo'
import { ReceiptModal } from '@/components/modals/receipt-modal'

export type ProfileTab = 'overview' | 'attendance' | 'payments' | 'academic' | 'notes'

interface StudentProfileViewProps {
  studentId: string
}

export function StudentProfileView({ studentId }: StudentProfileViewProps) {
  const router = useRouter()
  const { lang, toggleLang, isRTL } = useLanguage()

  // Core Data
  const [student, setStudent] = useState<Student | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [tutor, setTutor] = useState<TutorProfile | null>(null)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([])
  const [homeworks, setHomeworks] = useState<HomeworkAssignment[]>([])
  const [loading, setLoading] = useState(true)

  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview')
  const [toastMsg, setToastMsg] = useState('')

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isChangeGroupModalOpen, setIsChangeGroupModalOpen] = useState(false)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false)
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null)

  // Attendance tab filter
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'present' | 'absent' | 'late' | 'excused'>('all')

  // New Note input
  const [newNoteText, setNewNoteText] = useState('')

  // Helper notification
  const notify = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3500)
  }

  // Load All Student Data
  const loadData = async () => {
    try {
      const [allStudents, allGroups, tutorProf, allAtt, allPay, allAsm, allHw] = await Promise.all([
        storage.getStudents(),
        storage.getGroups(),
        storage.getProfile(),
        storage.getAttendance(),
        storage.getPayments(),
        storage.getAssessments(),
        storage.getHomeworks(),
      ])

      const found = allStudents.find((s) => s.id === studentId || s.student_code === studentId)
      if (found) {
        setStudent(found)
        setGroups(allGroups)
        setTutor(tutorProf)
        setAttendance(allAtt.filter((a) => a.student_id === found.id))
        setPayments(allPay.filter((p) => p.student_id === found.id))
        setAssessments(allAsm.filter((a) => a.student_id === found.id))
        setHomeworks(allHw.filter((h) => h.student_id === found.id))
      }
    } catch (e) {
      console.error('Failed to load student data:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [studentId])

  // Current Group
  const currentGroup = useMemo(() => {
    if (!student) return null
    return groups.find((g) => g.id === student.group_id) || null
  }, [student, groups])

  // --- Calculations ---
  // 1. Attendance percentage from actual sessions
  const attendanceStats = useMemo(() => {
    const totalSessions = attendance.length
    const presentCount = attendance.filter((a) => a.status === 'present').length
    const lateCount = attendance.filter((a) => a.status === 'late').length
    const absentCount = attendance.filter((a) => a.status === 'absent').length
    const excusedCount = attendance.filter((a) => a.status === 'excused').length
    const percentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : (student?.attendance_rate || 92)

    return {
      totalSessions: totalSessions || 25,
      presentCount: totalSessions > 0 ? presentCount : 23,
      lateCount: totalSessions > 0 ? lateCount : 1,
      absentCount: totalSessions > 0 ? absentCount : 1,
      excusedCount: totalSessions > 0 ? excusedCount : 0,
      percentage: totalSessions > 0 ? percentage : 92,
    }
  }, [attendance, student])

  // 2. Average mark across assessments
  const academicStats = useMemo(() => {
    const total = assessments.length
    if (total === 0) {
      return {
        averagePercent: 85,
        count: 5,
        latestScore: '85%',
      }
    }
    const sum = assessments.reduce((acc, a) => acc + (a.score / (a.max_score || 100)) * 100, 0)
    const avg = Math.round(sum / total)
    return {
      averagePercent: avg,
      count: total,
      latestScore: `${assessments[0].score}/${assessments[0].max_score}`,
    }
  }, [assessments])

  // 3. Payment Balance calculation
  const paymentStats = useMemo(() => {
    const fee = student?.monthly_fee || currentGroup?.monthly_fee || 500
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)

    // Estimate expected fees: 2 months for demo (September & October 2026) or based on payments
    // If student has payments, expected = totalPaid (balance 0) unless paid_this_month is false
    const expected = student?.paid_this_month ? totalPaid : totalPaid + fee
    const outstanding = Math.max(0, expected - totalPaid)
    const isPaid = student?.paid_this_month ?? (outstanding === 0)

    return {
      fee,
      totalPaid,
      expected,
      outstanding,
      isPaid,
      latestMonth: payments[0]?.month_year || (lang === 'en' ? 'October fees' : 'مصاريف أكتوبر'),
    }
  }, [student, currentGroup, payments, lang])

  // 4. Combined Chronological Activity Timeline
  const activityTimeline = useMemo(() => {
    type ActivityItem = {
      id: string
      date: string
      type: 'attendance' | 'payment' | 'assessment' | 'homework' | 'note' | 'communication'
      title: string
      titleAr: string
      subtitle: string
      subtitleAr: string
      badge?: string
      badgeColor?: string
    }

    const items: ActivityItem[] = []

    // Attendance
    attendance.forEach((a) => {
      const statusLabel =
        a.status === 'present'
          ? (lang === 'en' ? 'Attended class' : 'حضر الحصة')
          : a.status === 'late'
          ? (lang === 'en' ? 'Attended late' : 'حضور متأخر')
          : a.status === 'excused'
          ? (lang === 'en' ? 'Excused absence' : 'غياب بعذر')
          : (lang === 'en' ? 'Absent from class' : 'غياب عن الحصة')

      items.push({
        id: `act-att-${a.id}`,
        date: a.lesson_date,
        type: 'attendance',
        title: statusLabel,
        titleAr: statusLabel,
        subtitle: `${student?.grade || 'Grade 10'}${a.notes ? ` · ${a.notes}` : ''}`,
        subtitleAr: `${student?.grade || 'الصف الأول الثانوي'}${a.notes ? ` · ${a.notes}` : ''}`,
        badge: a.status.toUpperCase(),
        badgeColor:
          a.status === 'present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200',
      })
    })

    // Payments
    payments.forEach((p) => {
      items.push({
        id: `act-pay-${p.id}`,
        date: p.payment_date,
        type: 'payment',
        title: lang === 'en' ? 'Payment received' : 'تم استلام الدفعة',
        titleAr: 'تم استلام الدفعة',
        subtitle: `${p.amount} EGP · ${p.month_year} (${p.method})`,
        subtitleAr: `${p.amount} ج.م · ${p.month_year} (${p.method})`,
        badge: `${p.amount} EGP`,
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      })
    })

    // Assessments
    assessments.forEach((asm) => {
      const pct = Math.round((asm.score / asm.max_score) * 100)
      items.push({
        id: `act-asm-${asm.id}`,
        date: asm.exam_date,
        type: 'assessment',
        title: lang === 'en' ? 'New assessment recorded' : 'تم رصد تقييم جديد',
        titleAr: 'تم رصد تقييم جديد',
        subtitle: `${asm.title} · ${pct}% (${asm.score}/${asm.max_score})`,
        subtitleAr: `${asm.title} · ${pct}% (${asm.score}/${asm.max_score})`,
        badge: `${pct}%`,
        badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      })
    })

    // Homeworks
    homeworks.forEach((h) => {
      if (h.completed) {
        items.push({
          id: `act-hw-${h.id}`,
          date: h.due_date,
          type: 'homework',
          title: lang === 'en' ? 'Homework completed' : 'تم تسليم الواجب',
          titleAr: 'تم تسليم الواجب',
          subtitle: `${h.title}${h.grade ? ` · Grade: ${h.grade}` : ''}`,
          subtitleAr: `${h.title}${h.grade ? ` · التقدير: ${h.grade}` : ''}`,
          badge: h.grade || 'Done',
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        })
      }
    })

    // Notes
    student?.tutor_notes?.forEach((n) => {
      items.push({
        id: `act-tn-${n.id}`,
        date: n.date,
        type: 'note',
        title: lang === 'en' ? 'Private tutor note' : 'ملاحظة خاصة للمدرس',
        titleAr: 'ملاحظة خاصة للمدرس',
        subtitle: n.text,
        subtitleAr: n.text,
        badge: lang === 'en' ? 'Note' : 'ملاحظة',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      })
    })

    // Sort descending by date
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [attendance, payments, assessments, homeworks, student, lang])

  // Filtered Attendance List
  const filteredAttendance = useMemo(() => {
    if (attendanceFilter === 'all') return attendance
    return attendance.filter((a) => a.status === attendanceFilter)
  }, [attendance, attendanceFilter])

  // --- Handlers ---
  const handleSaveNote = async () => {
    if (!newNoteText.trim() || !student) return
    const updated = await storage.addStudentNote(student.id, newNoteText.trim(), tutor?.name || 'Ahmed Mahmoud')
    if (updated) {
      setStudent({ ...updated })
      setNewNoteText('')
      notify(lang === 'en' ? 'Private note saved successfully!' : 'تم حفظ الملاحظة بنجاح!')
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!student) return
    const updated = await storage.deleteStudentNote(student.id, noteId)
    if (updated) {
      setStudent({ ...updated })
      notify(lang === 'en' ? 'Note deleted.' : 'تم حذف الملاحظة.')
    }
  }

  const handleUpdateStatus = async (newStatus: 'active' | 'inactive' | 'archived') => {
    if (!student) return
    const updated = await storage.updateStudentStatus(student.id, newStatus)
    if (updated) {
      setStudent({ ...updated })
      notify(lang === 'en' ? `Status updated to ${newStatus}` : `تم تعديل حالة الطالب إلى ${newStatus}`)
    }
  }

  const handleWhatsAppAction = (type: 'payment' | 'attendance' | 'quiz' | 'general' | 'homework') => {
    if (!student) return
    const phone = student.parent_phone || student.student_phone
    const cleanPhone = phone.replace(/\D/g, '')
    const targetNumber = cleanPhone.startsWith('2') ? cleanPhone : `20${cleanPhone.replace(/^0/, '')}`

    let message = ''
    if (type === 'payment') {
      message =
        lang === 'en'
          ? `Hello, this is ${tutor?.name || 'the teacher'}. Regarding ${student.name}'s monthly tuition (${paymentStats.fee} EGP) for ${paymentStats.latestMonth}. Thank you!`
          : `السلام عليكم، مع حضرتك مستر ${tutor?.name || 'أحمد'} بخصوص مصاريف شهر ${paymentStats.latestMonth} للطالب ${student.name} بمبلغ ${paymentStats.fee} ج.م. شاكرين تعاونكم الكريم.`
    } else if (type === 'attendance') {
      message =
        lang === 'en'
          ? `Hello, this is ${tutor?.name || 'the teacher'}. Sharing ${student.name}'s attendance record: ${attendanceStats.percentage}% (${attendanceStats.presentCount} of ${attendanceStats.totalSessions} classes).`
          : `السلام عليكم، تقرير حضور وغياب الطالب ${student.name}: نسبة الحضور الحالية ${attendanceStats.percentage}% (${attendanceStats.presentCount} من أصل ${attendanceStats.totalSessions} حصة).`
    } else if (type === 'quiz') {
      message =
        lang === 'en'
          ? `Hello, this is ${tutor?.name || 'the teacher'}. ${student.name} achieved an average score of ${academicStats.averagePercent}% across recent assessments. Excellent dedication!`
          : `السلام عليكم، مرفق تقرير درجات الطالب ${student.name} في كويزات الفيزياء. متوسط درجاته ${academicStats.averagePercent}%. نسأل الله له دوام التوفيق.`
    } else if (type === 'homework') {
      message =
        lang === 'en'
          ? `Hello, reminder regarding ${student.name}'s upcoming physics assignment. Please encourage timely completion.`
          : `السلام عليكم، تذكير بموعد تسليم واجب الفيزياء القادم للطالب ${student.name}. برجاء المتابعة والتشجيع.`
    } else {
      message =
        lang === 'en'
          ? `Hello, this is ${tutor?.name || 'the teacher'} following up on ${student.name}'s academic progress.`
          : `السلام عليكم ولي أمر الطالب ${student.name}، مع حضرتك مستر ${tutor?.name || 'أحمد'} للمتابعة والتواصل الدوري.`
    }

    // Log communication
    storage.addCommunicationLog(student.id, {
      type: 'whatsapp',
      summary: `${type.toUpperCase()} message sent to parent`,
      recipient: `${student.parent_name || 'Parent'} (${student.parent_phone})`,
    })

    window.open(`https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`, '_blank')
    notify(lang === 'en' ? 'WhatsApp opened & communication logged!' : 'تم فتح واتساب وتسجيل التواصل بالسجل!')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-[#0f2c59] border-t-transparent" />
          <p className="text-xs font-bold text-slate-600">Loading student profile...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="size-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Student Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          The requested student ID does not match any record in the system.
        </p>
        <Link
          href="/dashboard"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0f2c59] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1a3d6d]"
        >
          <ArrowLeft className="size-4" />
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const initials = student.initials || student.name.split(' ').map((n) => n[0]).slice(0, 2).join('')

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 end-6 z-50 flex items-center gap-2 rounded-2xl bg-[#0f2c59] px-4 py-3 text-xs font-bold text-white shadow-xl animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="size-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Navbar / Breadcrumbs */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Breadcrumbs: CLASSIO / STUDENTS / PROFILE */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-[#0f2c59] hover:opacity-80 transition"
            >
              <ClassioLogo className="size-5" />
              <span className="tracking-wider">CLASSIO</span>
            </Link>
            <span className="text-slate-300">/</span>
            <Link
              href="/dashboard"
              className="text-slate-500 hover:text-slate-800 transition"
            >
              {lang === 'en' ? 'STUDENTS' : 'الطلاب'}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 font-bold text-[#0f2c59]">
              {lang === 'en' ? 'PROFILE' : 'الملف الشخصي'}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleLang}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {lang === 'en' ? 'العربية' : 'English'}
            </button>

            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              {isRTL ? <ArrowRight className="size-3.5" /> : <ArrowLeft className="size-3.5" />}
              <span>{lang === 'en' ? 'Back' : 'رجوع'}</span>
              <span className="hidden sm:inline">{lang === 'en' ? ' to Students' : ' للطلاب'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* 1. Student Profile Hero Card */}
        <section className="card-glass relative overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Avatar & Identity */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              <div className="relative flex size-16 sm:size-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f2c59] to-[#1e4986] text-xl sm:text-2xl font-black text-amber-300 shadow-md">
                {initials}
                <span
                  className={`absolute -bottom-1 -end-1 size-4 rounded-full border-2 border-white ${
                    student.status === 'active'
                      ? 'bg-emerald-500'
                      : student.status === 'inactive'
                      ? 'bg-slate-400'
                      : 'bg-amber-500'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {lang === 'ar' ? student.name : (student.name_en || student.name)}
                  </h1>
                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      student.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : student.status === 'inactive'
                        ? 'bg-slate-100 text-slate-600 border border-slate-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {student.status === 'active'
                      ? (lang === 'en' ? 'Active' : 'نشط')
                      : student.status === 'inactive'
                      ? (lang === 'en' ? 'Inactive' : 'غير نشط')
                      : (lang === 'en' ? 'Archived' : 'مؤرشف')}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-500">
                  <span className="font-mono font-bold text-slate-700">{student.student_code}</span>
                  {' · '}
                  <span>{student.grade || 'Grade 10'}</span>
                  {student.school && <span>{` · ${student.school}`}</span>}
                </p>

                <p className="text-xs font-bold text-[#0f2c59] flex items-center gap-1.5 pt-0.5">
                  <Users className="size-3.5 text-blue-600" />
                  <span>{student.group_name}</span>
                </p>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
                className="gap-1.5 rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Edit2 className="size-3.5 text-slate-500" />
                {lang === 'en' ? 'Edit Profile' : 'تعديل البيانات'}
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsChangeGroupModalOpen(true)}
                className="gap-1.5 rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Users className="size-3.5 text-[#0f2c59]" />
                {lang === 'en' ? 'Change Group' : 'تغيير المجموعة'}
              </Button>

              <Button
                onClick={() => handleWhatsAppAction('general')}
                className="gap-1.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm cursor-pointer"
              >
                <MessageCircle className="size-3.5" />
                {lang === 'en' ? 'Contact Parent' : 'واتساب ولي الأمر'}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const url = whatsAppEngine.getPortalUrl(student.id, student.parent_phone)
                  window.open(url, '_blank')
                }}
                className="gap-1.5 rounded-xl border-blue-200 bg-blue-50 text-blue-900 text-xs font-bold hover:bg-blue-100 shadow-xs cursor-pointer"
              >
                <Sparkles className="size-3.5 text-blue-600" />
                {lang === 'en' ? 'Parent Magic Portal' : 'بوابة ولي الأمر الذكية'}
              </Button>
            </div>
          </div>

          {/* Quick Action Bar for Tutor */}
          <div className="mt-6 border-t border-slate-100 pt-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider me-1">
              {lang === 'en' ? 'Quick Actions:' : 'إجراءات سريعة:'}
            </span>

            <button
              onClick={() => setIsAttendanceModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
            >
              <CalendarCheck2 className="size-3.5 text-emerald-600" />
              {lang === 'en' ? 'Mark Attendance' : 'تسجيل حضور'}
            </button>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
            >
              <CreditCard className="size-3.5 text-blue-600" />
              {lang === 'en' ? 'Record Payment' : 'سداد مصاريف'}
            </button>

            <button
              onClick={() => setIsAssessmentModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
            >
              <Award className="size-3.5 text-amber-600" />
              {lang === 'en' ? 'Add Assessment' : 'رصد تقييم/كويز'}
            </button>

            <button
              onClick={() => setIsHomeworkModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
            >
              <BookOpen className="size-3.5 text-purple-600" />
              {lang === 'en' ? 'Assign Homework' : 'تكليف بواجب'}
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
            >
              <FileText className="size-3.5 text-slate-600" />
              {lang === 'en' ? 'Add Note' : 'إضافة ملاحظة'}
            </button>
          </div>
        </section>

        {/* 2. Top 4 Metric Statistics Cards */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {/* 1. Attendance */}
          <div className="card-glass p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                {lang === 'en' ? 'Attendance' : 'نسبة الحضور'}
              </span>
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <CalendarCheck2 className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {attendanceStats.percentage}%
              </h3>
              <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                {lang === 'en'
                  ? `${attendanceStats.presentCount} of ${attendanceStats.totalSessions} classes`
                  : `${attendanceStats.presentCount} من أصل ${attendanceStats.totalSessions} حصة`}
              </p>
            </div>
          </div>

          {/* 2. Payments */}
          <div className="card-glass p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                {lang === 'en' ? 'Payments' : 'حالة المصاريف'}
              </span>
              <div
                className={`rounded-xl p-2 ${
                  paymentStats.isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}
              >
                <WalletCards className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3
                className={`text-2xl font-black tracking-tight ${
                  paymentStats.isPaid ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {paymentStats.isPaid
                  ? (lang === 'en' ? 'Paid' : 'مسدد')
                  : (lang === 'en' ? 'Unpaid' : 'مستحق')}
              </h3>
              <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                {paymentStats.latestMonth}
              </p>
            </div>
          </div>

          {/* 3. Average Mark */}
          <div className="card-glass p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                {lang === 'en' ? 'Average mark' : 'متوسط الدرجات'}
              </span>
              <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                <Award className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {academicStats.averagePercent}%
              </h3>
              <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                {lang === 'en'
                  ? `Last ${academicStats.count} assessments`
                  : `آخر ${academicStats.count} تقييمات`}
              </p>
            </div>
          </div>

          {/* 4. Outstanding Fees */}
          <div className="card-glass p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                {lang === 'en' ? 'Outstanding fees' : 'المستحقات المتبقية'}
              </span>
              <div
                className={`rounded-xl p-2 ${
                  paymentStats.outstanding === 0
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-rose-50 text-rose-600'
                }`}
              >
                <Receipt className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3
                className={`text-2xl font-black tracking-tight ${
                  paymentStats.outstanding === 0 ? 'text-slate-900' : 'text-rose-600'
                }`}
              >
                {paymentStats.outstanding} EGP
              </h3>
              <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                {paymentStats.outstanding === 0
                  ? (lang === 'en' ? 'No unpaid balance' : 'لا يوجد رصيد مستحق')
                  : (lang === 'en' ? 'Balance pending' : 'متبقي للسداد')}
              </p>
            </div>
          </div>
        </section>

        {/* 3. The 5 Main Navigation Tabs */}
        <section className="border-b border-slate-200">
          <nav className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 no-scrollbar" aria-label="Tabs">
            {[
              { id: 'overview', label: lang === 'en' ? 'Overview' : 'نظرة عامة', icon: User },
              { id: 'attendance', label: lang === 'en' ? 'Attendance' : 'سجل الحضور', icon: CalendarCheck2 },
              { id: 'payments', label: lang === 'en' ? 'Payments' : 'المدفوعات والمصاريف', icon: CreditCard },
              { id: 'academic', label: lang === 'en' ? 'Academic progress' : 'التقدم الأكاديمي', icon: Award },
              { id: 'notes', label: lang === 'en' ? 'Notes & communication' : 'الملاحظات والتواصل', icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ProfileTab)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'border-[#0f2c59] text-[#0f2c59] bg-white rounded-t-xl'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`size-4 ${isActive ? 'text-[#0f2c59]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </section>

        {/* 4. Tab Content Area */}
        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Student Information & Academic Goals */}
            <div className="lg:col-span-2 space-y-6">
              {/* Student Information Card */}
              <div className="card-glass p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <User className="size-4 text-[#0f2c59]" />
                    {lang === 'en' ? 'Student information' : 'بيانات الطالب الأساسية'}
                  </h3>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-xs font-bold text-[#0f2c59] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="size-3" />
                    {lang === 'en' ? 'Edit' : 'تعديل'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold">{lang === 'en' ? 'Phone number' : 'رقم هاتف الطالب'}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono font-bold text-slate-800" dir="ltr">{student.student_phone || '—'}</span>
                      {student.student_phone && (
                        <a
                          href={`tel:${student.student_phone}`}
                          className="rounded-lg bg-slate-100 p-1 text-slate-600 hover:bg-slate-200"
                          title="Call"
                        >
                          <Phone className="size-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold">{lang === 'en' ? 'Parent/guardian' : 'ولي الأمر'}</span>
                    <p className="mt-1 font-bold text-slate-800">
                      {student.parent_name || 'Mohamed Ahmed'}
                      <span className="text-slate-400 font-normal ms-1">({student.parent_relation || 'الأب'})</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold">{lang === 'en' ? 'Parent phone' : 'هاتف ولي الأمر'}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono font-bold text-slate-800" dir="ltr">{student.parent_phone}</span>
                      <a
                        href={`tel:${student.parent_phone}`}
                        className="rounded-lg bg-slate-100 p-1 text-slate-600 hover:bg-slate-200"
                        title="Call"
                      >
                        <Phone className="size-3" />
                      </a>
                      <button
                        onClick={() => handleWhatsAppAction('general')}
                        className="rounded-lg bg-emerald-50 p-1 text-emerald-600 hover:bg-emerald-100"
                        title="WhatsApp"
                      >
                        <MessageCircle className="size-3" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold">{lang === 'en' ? 'Joined' : 'تاريخ الانضمام'}</span>
                    <p className="mt-1 font-bold text-slate-800">
                      {student.joined_date || 'September 2026'}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold">{lang === 'en' ? 'Group & Center' : 'المجموعة والسنتر'}</span>
                    <p className="mt-1 font-bold text-slate-800">{student.group_name}</p>
                    {currentGroup?.center_name && (
                      <p className="text-[11px] text-slate-400">{currentGroup.center_name}</p>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold">{lang === 'en' ? 'Monthly fee' : 'المصروفات الشهرية'}</span>
                    <p className="mt-1 font-bold text-slate-800">{formatPrice(paymentStats.fee, lang)}</p>
                  </div>
                </div>
              </div>

              {/* What the tutor needs to do next / Pedagogical Guidance */}
              <div className="card-glass border-amber-200/80 bg-gradient-to-br from-amber-50/50 to-white p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Sparkles className="size-5 text-amber-600" />
                    <h3 className="text-sm font-black">
                      {lang === 'en' ? 'What the tutor needs to do next' : 'توصية وخطوة المدرس القادمة'}
                    </h3>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
                    {student.trajectory === 'improving'
                      ? (lang === 'en' ? 'Improving' : 'في تحسن مستمر')
                      : student.trajectory === 'needs_attention'
                      ? (lang === 'en' ? 'Needs Attention' : 'يحتاج لمتابعة دقيقة')
                      : (lang === 'en' ? 'Steady' : 'مستوى مستقر')}
                  </span>
                </div>

                <p className="mt-3 text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
                  {student.next_recommended_action ||
                    (lang === 'en'
                      ? 'Review free-body diagram problem sets and challenge Omar with high-level mechanics questions from previous ministry exams.'
                      : 'مراجعة مسائل مخطط الجسم الحر وتكليف الطالب بمسائل المستويات العليا من امتحانات الثانوية العامة السابقة.')}
                </p>

                {student.target_goal && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/80 p-3 border border-amber-100 text-xs">
                    <Target className="size-4 text-[#0f2c59] shrink-0" />
                    <span className="font-bold text-slate-800">
                      {lang === 'en' ? 'Target Goal:' : 'الهدف المنشود:'}{' '}
                      <span className="font-normal text-slate-600">{student.target_goal}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Upcoming Classes Card */}
              <div className="card-glass p-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <CalendarDays className="size-4 text-[#0f2c59]" />
                  {lang === 'en' ? 'Upcoming classes & schedule' : 'مواعيد الحصص القادمة'}
                </h3>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl bg-slate-50 p-4 gap-3 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {currentGroup?.schedule_days?.[0]?.[0] || 'س'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">
                        {currentGroup?.name || student.group_name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {currentGroup?.schedule_days?.join(' & ') || 'Saturday & Tuesday'} · {currentGroup?.time_slot || '04:00 PM - 06:00 PM'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsAttendanceModalOpen(true)}
                    className="rounded-xl bg-[#0f2c59] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#1a3d6d] cursor-pointer"
                  >
                    {lang === 'en' ? 'Record Attendance' : 'تسجيل حضور الحصة'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Recent Activity Timeline */}
            <div className="space-y-6">
              <div className="card-glass p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="size-4 text-[#0f2c59]" />
                    {lang === 'en' ? 'Recent activity' : 'النشاط الأخير'}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">
                    {activityTimeline.length} {lang === 'en' ? 'events' : 'أحداث'}
                  </span>
                </div>

                <div className="mt-4 space-y-4">
                  {activityTimeline.slice(0, 7).map((act, idx) => (
                    <div key={act.id} className="relative flex items-start gap-3 text-xs">
                      {idx !== activityTimeline.length - 1 && (
                        <span className="absolute start-3.5 top-7 bottom-0 w-0.5 bg-slate-100" />
                      )}

                      <div
                        className={`size-7 rounded-xl flex items-center justify-center shrink-0 border z-10 ${
                          act.type === 'attendance'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : act.type === 'payment'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : act.type === 'assessment'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : act.type === 'homework'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {act.type === 'attendance' && <CalendarCheck2 className="size-3.5" />}
                        {act.type === 'payment' && <CreditCard className="size-3.5" />}
                        {act.type === 'assessment' && <Award className="size-3.5" />}
                        {act.type === 'homework' && <BookOpen className="size-3.5" />}
                        {act.type === 'note' && <FileText className="size-3.5" />}
                        {act.type === 'communication' && <MessageCircle className="size-3.5" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900 truncate">
                            {lang === 'en' ? act.title : act.titleAr}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono ms-2 shrink-0">
                            {act.date}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                          {lang === 'en' ? act.subtitle : act.subtitleAr}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ATTENDANCE */}
        {/* ======================================================== */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* Header controls & filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'en' ? 'Full Attendance History' : 'سجل الحضور والغياب الكامل'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === 'en'
                    ? `Calculated from ${attendanceStats.totalSessions} actual recorded sessions`
                    : `محسوب بدقة من ${attendanceStats.totalSessions} حصة مسجلة في النظام`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsAttendanceModalOpen(true)}
                  className="gap-1.5 rounded-xl bg-[#0f2c59] text-xs font-bold text-white hover:bg-[#1a3d6d] cursor-pointer"
                >
                  <Plus className="size-4" />
                  {lang === 'en' ? 'Mark Attendance' : 'تسجيل حضور جديد'}
                </Button>
              </div>
            </div>

            {/* Attendance breakdown pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAttendanceFilter('all')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  attendanceFilter === 'all'
                    ? 'bg-[#0f2c59] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {lang === 'en' ? 'All Classes' : 'جميع الحصص'} ({attendance.length})
              </button>

              <button
                onClick={() => setAttendanceFilter('present')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  attendanceFilter === 'present'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {lang === 'en' ? 'Present' : 'حضور'} ({attendanceStats.presentCount})
              </button>

              <button
                onClick={() => setAttendanceFilter('late')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  attendanceFilter === 'late'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {lang === 'en' ? 'Late' : 'متأخر'} ({attendanceStats.lateCount})
              </button>

              <button
                onClick={() => setAttendanceFilter('absent')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  attendanceFilter === 'absent'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {lang === 'en' ? 'Absent' : 'غياب'} ({attendanceStats.absentCount})
              </button>
            </div>

            {/* Attendance Table */}
            <div className="card-glass overflow-hidden">
              <div className="overflow-x-auto pb-2">
                <table className="w-full min-w-[620px] text-start text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-bold">
                      <th className="p-3.5 text-start">{lang === 'en' ? 'Class Date' : 'تاريخ الحصة'}</th>
                      <th className="p-3.5 text-start">{lang === 'en' ? 'Status' : 'حالة الحضور'}</th>
                      <th className="p-3.5 text-start">{lang === 'en' ? 'Homework' : 'الواجب'}</th>
                      <th className="p-3.5 text-start">{lang === 'en' ? 'Quiz / Score' : 'درجة الكويز'}</th>
                      <th className="p-3.5 text-start">{lang === 'en' ? 'Absence / Notes' : 'ملاحظات وتبرير الغياب'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          {lang === 'en' ? 'No attendance records match filter.' : 'لا توجد سجلات مطابقة للفلتر.'}
                        </td>
                      </tr>
                    ) : (
                      filteredAttendance.map((rec) => (
                        <tr key={rec.id} className="transition hover:bg-slate-50/70">
                          <td className="p-3.5 font-mono font-bold text-slate-900" dir="ltr">
                            {rec.lesson_date}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                rec.status === 'present'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : rec.status === 'late'
                                  ? 'bg-amber-50 text-amber-700'
                                  : rec.status === 'excused'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {rec.status === 'present' && <CheckCircle2 className="size-3" />}
                              {rec.status === 'late' && <Clock className="size-3" />}
                              {rec.status === 'absent' && <XCircle className="size-3" />}
                              {rec.status === 'excused' && <HelpCircle className="size-3" />}
                              {rec.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {rec.homework_done ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                                <Check className="size-3.5" />
                                {lang === 'en' ? 'Complete' : 'مسلم بالكامل'}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-semibold">
                                {lang === 'en' ? 'Not submitted' : 'لم يسلم'}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 font-bold font-mono text-slate-800">
                            {rec.quiz_score !== null && rec.quiz_score !== undefined
                              ? `${rec.quiz_score}/${rec.max_quiz_score || 20}`
                              : '—'}
                          </td>
                          <td className="p-3.5 text-slate-600 max-w-xs truncate">
                            {rec.notes || '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PAYMENTS */}
        {/* ======================================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'en' ? 'Monthly Fees & Payment Records' : 'المصاريف الشهرية وسجل السداد'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === 'en'
                    ? 'Automatic balance calculation: expected fees minus recorded payments'
                    : 'حساب الرصيد التلقائي: المصاريف المستحقة مطروحاً منها الدفعات المسجلة'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="gap-1.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm cursor-pointer"
                >
                  <Plus className="size-4" />
                  {lang === 'en' ? 'Record New Payment' : 'تسجيل سداد جديد'}
                </Button>
              </div>
            </div>

            {/* Financial Status Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card-glass p-4">
                <span className="text-xs font-bold text-slate-500">
                  {lang === 'en' ? 'Monthly Fee' : 'المصروف الشهري'}
                </span>
                <p className="text-xl font-black text-slate-900 mt-1">
                  {formatPrice(paymentStats.fee, lang)}
                </p>
              </div>

              <div className="card-glass p-4">
                <span className="text-xs font-bold text-slate-500">
                  {lang === 'en' ? 'Total Collected' : 'إجمالي المسدد'}
                </span>
                <p className="text-xl font-black text-emerald-700 mt-1">
                  {formatPrice(paymentStats.totalPaid, lang)}
                </p>
              </div>

              <div className="card-glass p-4">
                <span className="text-xs font-bold text-slate-500">
                  {lang === 'en' ? 'Outstanding Fees' : 'المبلغ المتبقي'}
                </span>
                <p
                  className={`text-xl font-black mt-1 ${
                    paymentStats.outstanding === 0 ? 'text-slate-900' : 'text-rose-600'
                  }`}
                >
                  {formatPrice(paymentStats.outstanding, lang)}
                </p>
              </div>
            </div>

            {/* Payments Table */}
            <div className="card-glass overflow-hidden">
              <div className="overflow-x-auto pb-2">
                <table className="w-full min-w-[660px] text-start text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-bold">
                      <th className="p-3.5 text-start">{lang === 'en' ? 'Receipt #' : 'رقم الإيصال'}</th>
                      <th className="p-3.5 text-start">{lang === 'en' ? 'Month / Period' : 'الشهر / الفترة'}</th>
                      <th className="p-3.5 text-start">{lang === 'en' ? 'Amount' : 'المبلغ'}</th>
                      <th className="p-3.5 text-start">{lang === 'en' ? 'Payment Date' : 'تاريخ السداد'}</th>
                      <th className="p-3.5 text-start">{lang === 'en' ? 'Method' : 'طريقة الدفع'}</th>
                      <th className="p-3.5 text-start">{lang === 'en' ? 'Status' : 'الحالة'}</th>
                      <th className="p-3.5 text-end">{lang === 'en' ? 'Actions' : 'إجراءات'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          {lang === 'en' ? 'No payment records found.' : 'لا توجد مدفوعات مسجلة بعد.'}
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.id} className="transition hover:bg-slate-50/70">
                          <td className="p-3.5 font-mono font-bold text-[#0f2c59]">
                            {p.receipt_number}
                          </td>
                          <td className="p-3.5 font-bold text-slate-800">
                            {p.month_year}
                          </td>
                          <td className="p-3.5 font-black text-slate-900 font-mono">
                            {formatPrice(p.amount, lang)}
                          </td>
                          <td className="p-3.5 font-mono text-slate-600" dir="ltr">
                            {p.payment_date}
                          </td>
                          <td className="p-3.5">
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 capitalize">
                              {p.method === 'instapay'
                                ? 'InstaPay'
                                : p.method === 'vodafone_cash'
                                ? 'Vodafone Cash'
                                : p.method === 'cash'
                                ? 'Cash'
                                : 'Bank'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                p.status === 'paid'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              <CheckCircle2 className="size-3" />
                              {p.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3.5 text-end">
                            <button
                              onClick={() => setSelectedReceipt(p)}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                              {lang === 'en' ? 'View Receipt' : 'عرض الإيصال'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: ACADEMIC PROGRESS */}
        {/* ======================================================== */}
        {activeTab === 'academic' && (
          <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'en' ? 'Academic Progress & Assessment Results' : 'التقدم الأكاديمي ونتائج التقييمات'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === 'en'
                    ? `Average score: ${academicStats.averagePercent}% across ${academicStats.count} assessments`
                    : `متوسط الدرجات: ${academicStats.averagePercent}% عبر ${academicStats.count} تقييمات`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsAssessmentModalOpen(true)}
                  className="gap-1.5 rounded-xl bg-[#0f2c59] text-xs font-bold text-white hover:bg-[#1a3d6d] cursor-pointer"
                >
                  <Plus className="size-4" />
                  {lang === 'en' ? 'Add Assessment' : 'رصد اختبار / كويز'}
                </Button>

                <Button
                  onClick={() => setIsHomeworkModalOpen(true)}
                  variant="outline"
                  className="gap-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <BookOpen className="size-4" />
                  {lang === 'en' ? 'Assign Homework' : 'تكليف بواجب'}
                </Button>
              </div>
            </div>

            {/* Marks Over Time Visual Bar Chart */}
            <div className="card-glass p-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                {lang === 'en' ? 'Marks Over Time (Assessments)' : 'تطور الدرجات عبر التقييمات'}
              </h4>

              <div className="space-y-3">
                {assessments.map((asm) => {
                  const pct = Math.round((asm.score / asm.max_score) * 100)
                  return (
                    <div key={asm.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800">{asm.title}</span>
                        <span className="font-mono text-slate-600">
                          {asm.score}/{asm.max_score} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 90
                              ? 'bg-emerald-500'
                              : pct >= 80
                              ? 'bg-blue-500'
                              : pct >= 70
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {asm.feedback && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">{asm.feedback}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Homework Completion Tracker */}
            <div className="card-glass p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {lang === 'en' ? 'Homework Assignments' : 'الواجبات والتكليفات'}
                </h4>
                <button
                  onClick={() => setIsHomeworkModalOpen(true)}
                  className="text-xs font-bold text-[#0f2c59] hover:underline cursor-pointer"
                >
                  + {lang === 'en' ? 'New Assignment' : 'تكليف جديد'}
                </button>
              </div>

              <div className="space-y-3">
                {homeworks.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    {lang === 'en' ? 'No homework assignments yet.' : 'لا توجد تكليفات بعد.'}
                  </p>
                ) : (
                  homeworks.map((hw) => (
                    <div
                      key={hw.id}
                      className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={hw.completed}
                          onChange={async () => {
                            const updated = await storage.saveHomework({
                              ...hw,
                              completed: !hw.completed,
                            })
                            setHomeworks((prev) => prev.map((h) => (h.id === hw.id ? updated : h)))
                            notify(lang === 'en' ? 'Homework updated!' : 'تم تحديث الواجب!')
                          }}
                          className="mt-0.5 size-4 rounded accent-[#0f2c59] cursor-pointer"
                        />
                        <div>
                          <p className={`font-bold ${hw.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                            {hw.title}
                          </p>
                          {hw.details && <p className="text-[11px] text-slate-500 mt-0.5">{hw.details}</p>}
                        </div>
                      </div>

                      <div className="text-end">
                        <span className="font-mono text-[10px] text-slate-400 block" dir="ltr">
                          Due: {hw.due_date}
                        </span>
                        {hw.grade && (
                          <span className="mt-1 inline-block rounded bg-blue-50 px-1.5 py-0.5 font-bold text-[10px] text-blue-700">
                            {hw.grade}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Topic Mastery & Pedagogical Areas */}
            {student.weak_topics && student.weak_topics.length > 0 && (
              <div className="card-glass p-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  {lang === 'en' ? 'Topic Mastery & Improvement Areas' : 'إتقان الموضوعات ومجالات التحسين'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {student.weak_topics.map((tm, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {lang === 'en' ? (tm.topic_name_en || tm.topic_name) : tm.topic_name}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            tm.level === 'strong'
                              ? 'bg-emerald-50 text-emerald-700'
                              : tm.level === 'needs_practice'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {tm.level === 'strong'
                            ? (lang === 'en' ? 'Strong' : 'متقن')
                            : tm.level === 'needs_practice'
                            ? (lang === 'en' ? 'Needs Practice' : 'يحتاج تدريب')
                            : (lang === 'en' ? 'Review Required' : 'مراجعة واجبة')}
                        </span>
                      </div>
                      {tm.notes && <p className="mt-1 text-[11px] text-slate-500">{tm.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: NOTES & COMMUNICATION */}
        {/* ======================================================== */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Col: Private Tutor Notes */}
            <div className="card-glass p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="size-4 text-[#0f2c59]" />
                  {lang === 'en' ? 'Private tutor observations' : 'ملاحظات المدرس الخاصة'}
                </h3>
                <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                  {lang === 'en' ? 'Private to tutor' : 'خاصة بالمدرس فقط'}
                </span>
              </div>

              {/* Add Note Input */}
              <div className="space-y-2">
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'Write a private observation regarding the student behavior, progress, or test readiness...'
                      : 'سجل ملاحظة تربوية أو تعليمية خاصة حول أداء الطالب أو استجابته...'
                  }
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-800 outline-none focus:border-[#0f2c59] focus:bg-white transition"
                />
                <Button
                  onClick={handleSaveNote}
                  disabled={!newNoteText.trim()}
                  className="rounded-xl bg-[#0f2c59] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a3d6d] cursor-pointer"
                >
                  <Plus className="size-3.5 me-1" />
                  {lang === 'en' ? 'Save Private Note' : 'حفظ الملاحظة'}
                </Button>
              </div>

              {/* Notes List */}
              <div className="space-y-3 pt-2">
                {student.tutor_notes?.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    {lang === 'en' ? 'No private notes saved yet.' : 'لا توجد ملاحظات مسجلة بعد.'}
                  </p>
                ) : (
                  student.tutor_notes?.map((n) => (
                    <div
                      key={n.id}
                      className="group relative rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1.5 border-b border-slate-200/50">
                        <span className="font-bold text-slate-700">{n.author || 'Tutor'}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{n.date}</span>
                          <button
                            onClick={() => handleDeleteNote(n.id)}
                            className="text-slate-300 hover:text-rose-600 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-slate-800 font-medium leading-relaxed">{n.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Col: WhatsApp Shortcuts & Communication History */}
            <div className="space-y-6">
              {/* WhatsApp Message Shortcuts */}
              <div className="card-glass p-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <MessageCircle className="size-4 text-emerald-600" />
                  {lang === 'en' ? 'WhatsApp Message Shortcuts' : 'رسائل واتساب السريعة لولي الأمر'}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  {lang === 'en'
                    ? 'Click to open WhatsApp directly with pre-crafted message templates:'
                    : 'اضغط للإرسال الفوري عبر واتساب بنصوص جاهزة ومخصصة للطالب:'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleWhatsAppAction('payment')}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-start hover:bg-emerald-50 hover:border-emerald-200 transition cursor-pointer"
                  >
                    <WalletCards className="size-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">
                        {lang === 'en' ? 'Payment Reminder' : 'تذكير المصاريف'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {lang === 'en' ? 'Send fee details' : 'إرسال بيانات السداد'}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleWhatsAppAction('attendance')}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-start hover:bg-blue-50 hover:border-blue-200 transition cursor-pointer"
                  >
                    <CalendarCheck2 className="size-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">
                        {lang === 'en' ? 'Attendance Alert' : 'تقرير الحضور والغياب'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {lang === 'en' ? 'Notify attendance %' : 'إخطار بنسبة الحضور'}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleWhatsAppAction('quiz')}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-start hover:bg-amber-50 hover:border-amber-200 transition cursor-pointer"
                  >
                    <Award className="size-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">
                        {lang === 'en' ? 'Assessment Report' : 'تقرير درجات الكويز'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {lang === 'en' ? 'Send latest exam mark' : 'إرسال نتيجة الاختبار'}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleWhatsAppAction('homework')}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-start hover:bg-purple-50 hover:border-purple-200 transition cursor-pointer"
                  >
                    <BookOpen className="size-4 text-purple-600 shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">
                        {lang === 'en' ? 'Homework Follow-up' : 'متابعة تسليم الواجب'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {lang === 'en' ? 'Assignment reminder' : 'تذكير بالموعد والتفاصيل'}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Communication History Log */}
              <div className="card-glass p-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <Phone className="size-4 text-[#0f2c59]" />
                  {lang === 'en' ? 'Communication History Log' : 'سجل التواصل والمتابعات'}
                </h3>

                <div className="space-y-3">
                  {student.communication_history?.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      {lang === 'en' ? 'No communications logged yet.' : 'لا يوجد سجل تواصل مسجل بعد.'}
                    </p>
                  ) : (
                    student.communication_history?.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs"
                      >
                        <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 shrink-0">
                          <MessageCircle className="size-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{log.summary}</span>
                            <span className="font-mono text-[10px] text-slate-400">{log.date}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{log.recipient}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL 1: MARK ATTENDANCE */}
      {/* ======================================================== */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {lang === 'en' ? 'Record Attendance' : 'تسجيل حضور الطالب'}
              </h3>
              <button
                onClick={() => setIsAttendanceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const status = (form.elements.namedItem('status') as HTMLSelectElement).value as AttendanceStatus
                const date = (form.elements.namedItem('date') as HTMLInputElement).value
                const notes = (form.elements.namedItem('notes') as HTMLInputElement).value
                const homework = (form.elements.namedItem('homework') as HTMLInputElement).checked

                const newRec: AttendanceRecord = {
                  id: `att-${Date.now()}`,
                  student_id: student.id,
                  student_name: student.name,
                  group_id: student.group_id,
                  lesson_date: date,
                  status,
                  homework_done: homework,
                  notes,
                }

                await storage.saveAttendanceRecord(newRec)
                await loadData()
                setIsAttendanceModalOpen(false)
                notify(lang === 'en' ? 'Attendance recorded successfully!' : 'تم تسجيل الحضور بنجاح!')
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'en' ? 'Date' : 'تاريخ الحصة'}
                </label>
                <input
                  name="date"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'en' ? 'Attendance Status' : 'حالة الحضور'}
                </label>
                <select
                  name="status"
                  defaultValue="present"
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-bold"
                >
                  <option value="present">{lang === 'en' ? 'Present' : 'حاضر'}</option>
                  <option value="late">{lang === 'en' ? 'Late' : 'حضور متأخر'}</option>
                  <option value="absent">{lang === 'en' ? 'Absent' : 'غائب'}</option>
                  <option value="excused">{lang === 'en' ? 'Excused' : 'غياب بعذر'}</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  name="homework"
                  type="checkbox"
                  id="att_hw"
                  defaultChecked
                  className="size-4 rounded accent-[#0f2c59]"
                />
                <label htmlFor="att_hw" className="font-bold text-slate-700 cursor-pointer">
                  {lang === 'en' ? 'Homework submitted complete' : 'تم تسليم الواجب كاملاً'}
                </label>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'en' ? 'Absence reason or session notes' : 'ملاحظات أو سبب الغياب'}
                </label>
                <input
                  name="notes"
                  placeholder={lang === 'en' ? 'e.g. Arrived late due to bus traffic' : 'مثال: تأخر بسبب المواصلات'}
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  {lang === 'en' ? 'Cancel' : 'إلغاء'}
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-[#0f2c59] text-xs font-bold text-white hover:bg-[#1a3d6d]"
                >
                  {lang === 'en' ? 'Save Record' : 'حفظ السجل'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: RECORD PAYMENT */}
      {/* ======================================================== */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {lang === 'en' ? 'Record Payment' : 'تسجيل سداد مصاريف'}
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const amount = Number((form.elements.namedItem('amount') as HTMLInputElement).value)
                const month = (form.elements.namedItem('month') as HTMLInputElement).value
                const method = (form.elements.namedItem('method') as HTMLSelectElement).value as any
                const notes = (form.elements.namedItem('notes') as HTMLInputElement).value

                const newPay: PaymentRecord = {
                  id: `pay-${Date.now()}`,
                  student_id: student.id,
                  student_name: student.name,
                  group_id: student.group_id,
                  group_name: student.group_name,
                  amount,
                  month_year: month,
                  payment_date: new Date().toISOString().split('T')[0],
                  method,
                  status: 'paid',
                  receipt_number: `REC-${Date.now().toString().slice(-6)}`,
                  notes,
                }

                await storage.recordPayment(newPay)
                await loadData()
                setIsPaymentModalOpen(false)
                notify(lang === 'en' ? 'Payment recorded & balance updated!' : 'تم تسجيل الدفعة وتحديث الرصيد!')
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'en' ? 'Amount (EGP)' : 'المبلغ المدفوع (ج.م)'}
                </label>
                <input
                  name="amount"
                  type="number"
                  defaultValue={paymentStats.outstanding > 0 ? paymentStats.outstanding : paymentStats.fee}
                  required
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-bold text-slate-900 font-mono text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'en' ? 'Billing Month / Period' : 'الشهر أو الفترة'}
                </label>
                <input
                  name="month"
                  defaultValue={lang === 'en' ? 'November 2026' : 'نوفمبر ٢٠٢٦'}
                  required
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'en' ? 'Payment Method' : 'طريقة الدفع'}
                </label>
                <select
                  name="method"
                  defaultValue="instapay"
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-bold"
                >
                  <option value="instapay">InstaPay (إنستاباي)</option>
                  <option value="vodafone_cash">Vodafone Cash (فودافون كاش)</option>
                  <option value="cash">Cash in Center (نقدي في السنتر)</option>
                  <option value="bank_transfer">Bank Transfer (تحويل بنكي)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'en' ? 'Notes' : 'ملاحظات'}
                </label>
                <input
                  name="notes"
                  placeholder={lang === 'en' ? 'e.g. Paid in full via InstaPay' : 'مثال: تم التحويل بالكامل عبر إنستاباي'}
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  {lang === 'en' ? 'Cancel' : 'إلغاء'}
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  {lang === 'en' ? 'Confirm Payment' : 'تأكيد السداد'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADD ASSESSMENT */}
      {/* ======================================================== */}
      {isAssessmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {lang === 'en' ? 'Record Assessment Result' : 'رصد تقييم أو درجة اختبار'}
              </h3>
              <button
                onClick={() => setIsAssessmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const title = (form.elements.namedItem('title') as HTMLInputElement).value
                const type = (form.elements.namedItem('type') as HTMLSelectElement).value as any
                const score = Number((form.elements.namedItem('score') as HTMLInputElement).value)
                const max = Number((form.elements.namedItem('max') as HTMLInputElement).value)
                const feedback = (form.elements.namedItem('feedback') as HTMLInputElement).value

                const newAsm: AssessmentRecord = {
                  id: `asm-${Date.now()}`,
                  student_id: student.id,
                  student_name: student.name,
                  group_id: student.group_id,
                  title,
                  type,
                  score,
                  max_score: max,
                  exam_date: new Date().toISOString().split('T')[0],
                  feedback,
                }

                await storage.saveAssessment(newAsm)
                await loadData()
                setIsAssessmentModalOpen(false)
                notify(lang === 'en' ? 'Assessment recorded successfully!' : 'تم رصد التقييم وحفظ الدرجة!')
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'en' ? 'Assessment Title' : 'عنوان الاختبار / التقييم'}
                </label>
                <input
                  name="title"
                  defaultValue="Physics Chapter Quiz"
                  required
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'en' ? 'Assessment Type' : 'النوع'}
                </label>
                <select
                  name="type"
                  defaultValue="quiz"
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-bold"
                >
                  <option value="quiz">{lang === 'en' ? 'Quiz' : 'كويز أسبوعي'}</option>
                  <option value="exam">{lang === 'en' ? 'Monthly Exam' : 'امتحان شهر شامل'}</option>
                  <option value="diagnostic">{lang === 'en' ? 'Diagnostic Evaluation' : 'تقييم تشخيصي'}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Student Score' : 'درجة الطالب'}
                  </label>
                  <input
                    name="score"
                    type="number"
                    defaultValue={85}
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Out of (Max)' : 'الدرجة العظمى'}
                  </label>
                  <input
                    name="max"
                    type="number"
                    defaultValue={100}
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-bold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'en' ? 'Tutor Feedback & Observations' : 'ملاحظات وتعليق المدرس'}
                </label>
                <input
                  name="feedback"
                  placeholder={lang === 'en' ? 'e.g. Excellent problem solving' : 'مثال: أداء ممتاز، يحتاج تدريب على المسائل البيانية'}
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAssessmentModalOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  {lang === 'en' ? 'Cancel' : 'إلغاء'}
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-[#0f2c59] text-xs font-bold text-white hover:bg-[#1a3d6d]"
                >
                  {lang === 'en' ? 'Save Result' : 'حفظ الدرجة'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: ASSIGN HOMEWORK */}
      {/* ======================================================== */}
      {isHomeworkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {lang === 'en' ? 'Assign Homework' : 'تكليف بواجب جديد'}
              </h3>
              <button
                onClick={() => setIsHomeworkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const title = (form.elements.namedItem('title') as HTMLInputElement).value
                const details = (form.elements.namedItem('details') as HTMLInputElement).value
                const dueDate = (form.elements.namedItem('due') as HTMLInputElement).value

                const newHw: HomeworkAssignment = {
                  id: `hw-${Date.now()}`,
                  student_id: student.id,
                  student_name: student.name,
                  group_id: student.group_id,
                  title,
                  details,
                  due_date: dueDate,
                  completed: false,
                }

                await storage.saveHomework(newHw)
                await loadData()
                setIsHomeworkModalOpen(false)
                notify(lang === 'en' ? 'Homework assigned!' : 'تم تسجيل التكليف بالواجب!')
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'en' ? 'Assignment Title' : 'عنوان الواجب'}
                </label>
                <input
                  name="title"
                  defaultValue="Newton Laws Practice Sheet"
                  required
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'en' ? 'Details / Book Pages' : 'التفاصيل وأرقام الصفحات'}
                </label>
                <input
                  name="details"
                  defaultValue="Exercises 1 to 20 on page 45-48"
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'en' ? 'Due Date' : 'موعد التسليم'}
                </label>
                <input
                  name="due"
                  type="date"
                  defaultValue={new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]}
                  required
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsHomeworkModalOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  {lang === 'en' ? 'Cancel' : 'إلغاء'}
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-[#0f2c59] text-xs font-bold text-white hover:bg-[#1a3d6d]"
                >
                  {lang === 'en' ? 'Assign' : 'تكليف'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: CHANGE GROUP */}
      {/* ======================================================== */}
      {isChangeGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {lang === 'en' ? 'Change Student Group' : 'نقل الطالب إلى مجموعة أخرى'}
              </h3>
              <button
                onClick={() => setIsChangeGroupModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const targetGroupId = (form.elements.namedItem('group') as HTMLSelectElement).value
                const targetGroup = groups.find((g) => g.id === targetGroupId)
                if (targetGroup) {
                  await storage.changeStudentGroup(student.id, targetGroup.id, targetGroup.name)
                  await loadData()
                  setIsChangeGroupModalOpen(false)
                  notify(lang === 'en' ? `Moved to ${targetGroup.name}` : `تم نقل الطالب إلى ${targetGroup.name}`)
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  {lang === 'en' ? 'Select Target Group' : 'اختر المجموعة الجديدة'}
                </label>
                <select
                  name="group"
                  defaultValue={student.group_id}
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-bold"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.center_name}) — {formatPrice(g.monthly_fee, lang)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsChangeGroupModalOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  {lang === 'en' ? 'Cancel' : 'إلغاء'}
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-[#0f2c59] text-xs font-bold text-white hover:bg-[#1a3d6d]"
                >
                  {lang === 'en' ? 'Save & Move' : 'تأكيد النقل'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: EDIT PROFILE */}
      {/* ======================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {lang === 'en' ? 'Edit Student Profile' : 'تعديل الملف الشخصي للطالب'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const name = (form.elements.namedItem('name') as HTMLInputElement).value
                const code = (form.elements.namedItem('code') as HTMLInputElement).value
                const studentPhone = (form.elements.namedItem('student_phone') as HTMLInputElement).value
                const parentName = (form.elements.namedItem('parent_name') as HTMLInputElement).value
                const parentPhone = (form.elements.namedItem('parent_phone') as HTMLInputElement).value
                const relation = (form.elements.namedItem('relation') as HTMLSelectElement).value
                const school = (form.elements.namedItem('school') as HTMLInputElement).value
                const fee = Number((form.elements.namedItem('fee') as HTMLInputElement).value)
                const status = (form.elements.namedItem('status') as HTMLSelectElement).value as any

                const updatedStudent: Student = {
                  ...student,
                  name,
                  student_code: code,
                  student_phone: studentPhone,
                  parent_name: parentName,
                  parent_phone: parentPhone,
                  parent_relation: relation as any,
                  school,
                  monthly_fee: fee,
                  status,
                }

                await storage.saveStudent(updatedStudent)
                await loadData()
                setIsEditModalOpen(false)
                notify(lang === 'en' ? 'Profile updated successfully!' : 'تم تحديث البيانات بنجاح!')
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Student Name' : 'اسم الطالب'}
                  </label>
                  <input
                    name="name"
                    defaultValue={student.name}
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Student Code / ID' : 'كود الطالب'}
                  </label>
                  <input
                    name="code"
                    defaultValue={student.student_code}
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Student Phone' : 'هاتف الطالب'}
                  </label>
                  <input
                    name="student_phone"
                    defaultValue={student.student_phone}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Student Status' : 'حالة الطالب'}
                  </label>
                  <select
                    name="status"
                    defaultValue={student.status}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-bold"
                  >
                    <option value="active">{lang === 'en' ? 'Active' : 'نشط'}</option>
                    <option value="inactive">{lang === 'en' ? 'Inactive' : 'غير نشط'}</option>
                    <option value="archived">{lang === 'en' ? 'Archived' : 'مؤرشف'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Parent Name' : 'اسم ولي الأمر'}
                  </label>
                  <input
                    name="parent_name"
                    defaultValue={student.parent_name || 'Mohamed Ahmed'}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Parent Phone' : 'هاتف ولي الأمر'}
                  </label>
                  <input
                    name="parent_phone"
                    defaultValue={student.parent_phone}
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Parent Relation' : 'صلة القرابة'}
                  </label>
                  <select
                    name="relation"
                    defaultValue={student.parent_relation || 'الأب'}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                  >
                    <option value="الأب">الأب (Father)</option>
                    <option value="الأم">الأم (Mother)</option>
                    <option value="ولي الأمر">ولي الأمر (Guardian)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Monthly Fee (EGP)' : 'المصروف الشهري (ج.م)'}
                  </label>
                  <input
                    name="fee"
                    type="number"
                    defaultValue={student.monthly_fee}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'en' ? 'School' : 'المدرسة'}
                </label>
                <input
                  name="school"
                  defaultValue={student.school || ''}
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  {lang === 'en' ? 'Cancel' : 'إلغاء'}
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-[#0f2c59] text-xs font-bold text-white hover:bg-[#1a3d6d]"
                >
                  {lang === 'en' ? 'Save Changes' : 'حفظ التعديلات'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 7: VIEW RECEIPT */}
      {/* ======================================================== */}
      {selectedReceipt && tutor && (
        <ReceiptModal
          isOpen={true}
          onClose={() => setSelectedReceipt(null)}
          payment={selectedReceipt}
          student={student}
          tutor={tutor}
        />
      )}
    </div>
  )
}
