'use client'

import React from 'react'
import {
  BarChart3,
  Download,
  TrendingUp,
  UsersRound,
  CircleDollarSign,
  CalendarCheck,
  FileSpreadsheet,
  CheckCircle2,
  PieChart,
  Award,
  BookOpen,
} from 'lucide-react'
import { Student, Group, PaymentRecord, AttendanceRecord, DashboardStats } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { exportToCsv } from '@/lib/egyptian-helpers'
import { useLanguage } from '@/lib/language-context'
import { formatPrice, getTrajectoryBadgeText, getPaymentMethodBadgeText } from '@/lib/localization'

interface ReportsViewProps {
  stats: DashboardStats
  students: Student[]
  groups: Group[]
  payments: PaymentRecord[]
  attendanceRecords: AttendanceRecord[]
  notify: (msg: string) => void
}

export function ReportsView({
  stats,
  students,
  groups,
  payments,
  attendanceRecords,
  notify,
}: ReportsViewProps) {
  const { lang, t, isRTL } = useLanguage()
  const improvingStudents = students.filter((s) => s.trajectory === 'improving').length
  const steadyStudents = students.filter((s) => s.trajectory === 'steady').length
  const attentionStudents = students.filter((s) => s.trajectory === 'needs_attention').length

  const avgHomeworkRate = Math.round(
    students.reduce((sum, s) => sum + (s.homework_rate || 85), 0) / (students.length || 1)
  )

  const exportStudents = () => {
    const data = students.map((s) => {
      if (lang === 'en') {
        return {
          'Student Code': s.student_code,
          'Name': s.name,
          'Group': s.group_name,
          'Student Phone': s.student_phone,
          'Parent Phone': s.parent_phone,
          'Fee': s.monthly_fee,
          'Payment Status': s.paid_this_month ? 'Paid' : 'Unpaid',
          'Trajectory': getTrajectoryBadgeText(s.trajectory, 'en'),
          'Attendance Rate': `${s.attendance_rate || 95}%`,
          'Homework Rate': `${s.homework_rate || 85}%`,
          'Last Exam': s.last_quiz_score || '85/100',
          'Target Goal': s.target_goal || '',
          'Recommended Action': s.next_recommended_action || '',
        }
      }
      return {
        'كود الطالب': s.student_code,
        'الاسم': s.name,
        'المجموعة': s.group_name,
        'هاتف الطالب': s.student_phone,
        'هاتف ولي الأمر': s.parent_phone,
        'الاشتراك': s.monthly_fee,
        'الحالة المالية': s.paid_this_month ? 'مسدد' : 'متأخر',
        'المسار الأكاديمي': getTrajectoryBadgeText(s.trajectory, 'ar'),
        'نسبة الحضور': `${s.attendance_rate || 95}%`,
        'نسبة تسليم الواجب': `${s.homework_rate || 85}%`,
        'آخر امتحان': s.last_quiz_score || '85/100',
        'الهدف الأكاديمي': s.target_goal || '',
        'الإجراء الموصى به': s.next_recommended_action || '',
      }
    })
    exportToCsv(lang === 'en' ? `students_academic_report_${new Date().toISOString().split('T')[0]}` : `كشف_الطلاب_والتقدم_الأكاديمي_${new Date().toISOString().split('T')[0]}`, data)
    notify(lang === 'en' ? 'Students & Academic Success report exported successfully' : 'تم تصدير كشف الطلاب والتقدم الأكاديمي بنجاح')
  }

  const exportPayments = () => {
    const data = payments.map((p) => {
      if (lang === 'en') {
        return {
          'Receipt #': p.receipt_number,
          'Student Name': p.student_name,
          'Group': p.group_name,
          'Month': p.month_year,
          'Amount (EGP)': p.amount,
          'Date': p.payment_date,
          'Method': getPaymentMethodBadgeText(p.method, 'en'),
        }
      }
      return {
        'رقم الإيصال': p.receipt_number,
        'اسم الطالب': p.student_name,
        'المجموعة': p.group_name,
        'عن شهر': p.month_year,
        'المبلغ': p.amount,
        'تاريخ السداد': p.payment_date,
        'طريقة الدفع': getPaymentMethodBadgeText(p.method, 'ar'),
      }
    })
    exportToCsv(lang === 'en' ? `collection_report_${new Date().toISOString().split('T')[0]}` : `تقرير_التحصيل_${new Date().toISOString().split('T')[0]}`, data)
    notify(lang === 'en' ? 'Revenue collection report exported successfully' : 'تم تصدير تقرير التحصيل بنجاح')
  }

  const exportOverdue = () => {
    const data = students
      .filter((s) => !s.paid_this_month)
      .map((s) => {
        if (lang === 'en') {
          return {
            'Student Code': s.student_code,
            'Student Name': s.name,
            'Group': s.group_name,
            'Parent Phone': s.parent_phone,
            'Outstanding (EGP)': s.monthly_fee,
            'Relationship': s.parent_relation,
          }
        }
        return {
          'كود الطالب': s.student_code,
          'اسم الطالب': s.name,
          'المجموعة': s.group_name,
          'هاتف ولي الأمر': s.parent_phone,
          'المبلغ المستحق': s.monthly_fee,
          'صلة القرابة': s.parent_relation,
        }
      })
    exportToCsv(lang === 'en' ? `overdue_report_${new Date().toISOString().split('T')[0]}` : `كشف_المتأخرات_للمتابعة_${new Date().toISOString().split('T')[0]}`, data)
    notify(lang === 'en' ? 'Overdue balances report exported successfully' : 'تم تصدير كشف المتأخرات بنجاح')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t.reports.title}</h2>
          <p className="text-xs text-slate-500">
            {t.reports.subtitle}
          </p>
        </div>
      </div>

      {/* Summary KPI Cards: Dual Business & Pedagogical */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-glass p-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>{t.reports.rate}</span>
            <CircleDollarSign className="size-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {Math.round((stats.monthlyCollected / (stats.monthlyExpected || 1)) * 100)}%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {t.reports.collected}: {formatPrice(stats.monthlyCollected, lang)}
          </div>
        </div>

        <div className="card-glass p-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>{lang === 'en' ? 'Average Attendance' : 'متوسط نسبة الحضور'}</span>
            <CalendarCheck className="size-4 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-600">
              {stats.attendanceRateToday}%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {lang === 'en' ? 'Daily center attendance rate' : 'معدل الحضور العام بالسناتر'}
          </div>
        </div>

        <div className="card-glass p-5 border-emerald-100">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>{t.reports.homeworkRate}</span>
            <BookOpen className="size-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700">
              {avgHomeworkRate}%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {lang === 'en' ? 'Weekly assignment compliance' : 'نسبة الالتزام بالواجب الأسبوعي'}
          </div>
        </div>

        <div className="card-glass p-5 border-blue-100">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>{t.reports.improving}</span>
            <TrendingUp className="size-4 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-700">
              {improvingStudents}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {lang === 'en' ? `of ${students.length} students` : `من ${students.length} طالب`}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {steadyStudents} {lang === 'en' ? 'steady' : 'مستقر'} • {attentionStudents} {lang === 'en' ? 'need attention' : 'يحتاج متابعة'}
          </div>
        </div>
      </div>

      {/* Academic Success Breakdown Card */}
      <div className="card-glass p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{t.reports.academicBreakdown}</h3>
            <p className="text-xs text-slate-500">
              {lang === 'en' ? 'Student distribution by academic trajectory and recommended pedagogical actions' : 'توزيع الطلاب حسب مؤشر التقدم وتوصيات الدعم الدراسي'}
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0f2c59]">
            {lang === 'en' ? 'Continuous Assessment' : 'تقييم واقعي مستمر'}
          </span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">{t.reports.improving}</span>
              <span className="rounded-full bg-emerald-200/70 px-2 py-0.5 text-xs font-black text-emerald-900">
                {improvingStudents}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-emerald-800 leading-relaxed">
              {lang === 'en'
                ? 'Students with rising scores and high homework completion, ready for advanced problem solving.'
                : 'طلاب ترتفع درجاتهم والتزامهم بالواجبات؛ جاهزون لحل أسئلة المستويات العليا وبنك الوزارة.'}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">{t.reports.steady}</span>
              <span className="rounded-full bg-amber-200/70 px-2 py-0.5 text-xs font-black text-amber-900">
                {steadyStudents}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-amber-800 leading-relaxed">
              {lang === 'en'
                ? 'Consistent performers with solid mid-range grades, needing motivation to reach top percentiles.'
                : 'أداء منتظم بدرجات متوسطة إلى جيدة؛ يحتاجون تشجيعاً إضافياً للوصول للدرجة النهائية.'}
            </p>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900">{t.reports.needsAttention}</span>
              <span className="rounded-full bg-rose-200/70 px-2 py-0.5 text-xs font-black text-rose-900">
                {attentionStudents}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-rose-800 leading-relaxed">
              {lang === 'en'
                ? 'Students experiencing recurring absences or low quiz scores; targeted review session recommended.'
                : 'طلاب لديهم غياب متكرر أو درجات منخفضة في أجزاء معينة؛ موصى بحصة مراجعة تعويضية.'}
            </p>
          </div>
        </div>
      </div>

      {/* One-click Export Center */}
      <div className="card-glass p-6">
        <h3 className="text-sm font-bold text-slate-800">
          {lang === 'en' ? 'Report Export Center (Excel / CSV)' : 'مركز تصدير التقارير (Excel / CSV)'}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          {lang === 'en'
            ? 'Download structured spreadsheets ready for center administration, parents, or records'
            : 'تنزيل ملفات إكسيل جاهزة بكافة التفاصيل للتسليم لإدارة السنتر، أولياء الأمور، أو الأرشفة'}
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-white hover:shadow-xs">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-[#0f2c59]">
              <FileSpreadsheet className="size-5" />
            </div>
            <h4 className="mt-3 text-xs font-bold text-slate-800">{t.reports.exportStudents}</h4>
            <p className="mt-1 text-[11px] text-slate-500">
              {lang === 'en'
                ? 'Includes IDs, attendance rate, homework rate, and recent scores'
                : 'يتضمن الأكواد، نسبة الحضور، معدل تسليم الواجب، وآخر الدرجات'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={exportStudents}
              className="mt-4 w-full gap-2 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
            >
              <Download className="size-3.5" /> {lang === 'en' ? 'Download Excel' : 'تحميل Excel'}
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-white hover:shadow-xs">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CircleDollarSign className="size-5" />
            </div>
            <h4 className="mt-3 text-xs font-bold text-slate-800">{t.reports.exportPayments}</h4>
            <p className="mt-1 text-[11px] text-slate-500">
              {lang === 'en'
                ? 'Complete log with receipt numbers, Cash, InstaPay, and Vodafone Cash'
                : 'بيان كامل بأرقام الإيصالات، مبالغ كاش، إنستاباي، وفودافون كاش'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={exportPayments}
              className="mt-4 w-full gap-2 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
            >
              <Download className="size-3.5" /> {lang === 'en' ? 'Download Excel' : 'تحميل Excel'}
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-white hover:shadow-xs">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <UsersRound className="size-5" />
            </div>
            <h4 className="mt-3 text-xs font-bold text-slate-800">{t.reports.exportOverdue}</h4>
            <p className="mt-1 text-[11px] text-slate-500">
              {lang === 'en'
                ? 'Unpaid student list with parent contact phones for immediate follow up'
                : 'قائمة بالطلاب غير المسددين وأرقام أولياء الأمور للاتصال'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={exportOverdue}
              className="mt-4 w-full gap-2 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
            >
              <Download className="size-3.5" /> {lang === 'en' ? 'Download Excel' : 'تحميل Excel'}
            </Button>
          </div>
        </div>
      </div>

      {/* Group Performance Table */}
      <div className="card-glass overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">{t.reports.revenueByGroup}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500">
                <th className="p-3.5 text-start font-bold">{t.reports.groupName}</th>
                <th className="p-3.5 text-start font-bold">{lang === 'en' ? 'Center' : 'السنتر'}</th>
                <th className="p-3.5 text-center font-bold">{t.reports.studentsCount}</th>
                <th className="p-3.5 text-center font-bold">{lang === 'en' ? 'Monthly Fee' : 'الاشتراك الشهري'}</th>
                <th className="p-3.5 text-end font-bold">{t.reports.expected}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groups.map((g) => {
                const count = students.filter((s) => s.group_id === g.id).length
                const total = count * g.monthly_fee
                return (
                  <tr key={g.id} className="transition hover:bg-slate-50/60">
                    <td className="p-3.5 font-bold text-slate-800">{g.name}</td>
                    <td className="p-3.5 text-slate-600">{g.center_name}</td>
                    <td className="p-3.5 text-center font-semibold text-slate-700">
                      {count} {lang === 'en' ? 'students' : 'طالب'}
                    </td>
                    <td className="p-3.5 text-center font-semibold text-slate-700">{formatPrice(g.monthly_fee, lang)}</td>
                    <td className="p-3.5 text-end font-extrabold text-emerald-700">{formatPrice(total, lang)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
