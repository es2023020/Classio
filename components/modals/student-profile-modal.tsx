'use client'

import React from 'react'
import {
  X,
  CreditCard,
  Edit2,
  AlertCircle,
  Award,
} from 'lucide-react'
import { Student, PaymentRecord, AttendanceRecord, TutorProfile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  buildPaymentReminderWhatsAppUrl,
  buildAbsentWhatsAppUrl,
  buildQuizReportWhatsAppUrl,
} from '@/lib/egyptian-helpers'
import { useLanguage } from '@/lib/language-context'
import { formatPrice, getPaymentMethodBadgeText } from '@/lib/localization'

interface StudentProfileModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student | null
  payments: PaymentRecord[]
  attendanceRecords: AttendanceRecord[]
  tutor: TutorProfile
  onEdit: (student: Student) => void
  onRecordPayment: (studentId: string) => void
  onViewReceipt: (payment: PaymentRecord) => void
}

export function StudentProfileModal({
  isOpen,
  onClose,
  student,
  payments,
  attendanceRecords,
  tutor,
  onEdit,
  onRecordPayment,
  onViewReceipt,
}: StudentProfileModalProps) {
  const { lang, isRTL } = useLanguage()

  if (!isOpen || !student) return null

  const studentPayments = payments.filter((p) => p.student_id === student.id)
  const studentAttendance = attendanceRecords.filter((a) => a.student_id === student.id)

  const attendedCount = studentAttendance.filter((a) => a.status === 'present').length
  const totalLessons = studentAttendance.length || 1
  const attendanceRate = Math.round((attendedCount / totalLessons) * 100)

  const handleWhatsAppAction = (type: 'payment' | 'absent' | 'quiz') => {
    let url = ''
    if (type === 'payment') {
      const period = lang === 'en' ? 'May 2024' : 'مايو ٢٠٢٤'
      url = buildPaymentReminderWhatsAppUrl(
        student,
        tutor.name,
        period,
        student.monthly_fee,
        tutor.instapay_handle,
        tutor.vodafone_cash_number
      )
    } else if (type === 'absent') {
      url = buildAbsentWhatsAppUrl(student, student.group_name, tutor.name)
    } else if (type === 'quiz') {
      url = buildQuizReportWhatsAppUrl(
        student,
        tutor.subject,
        19,
        20,
        true,
        tutor.name
      )
    }
    if (url) window.open(url, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl transition-all max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#7047EB] text-xl font-bold text-amber-300 shadow-sm">
              {student.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{student.name}</h2>
                <span className="rounded-md border bg-slate-50 px-2 py-0.5 font-mono text-xs font-bold text-slate-700">
                  {student.student_code}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{student.group_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Quick Highlights Row */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-center">
            <span className="text-[11px] font-bold text-slate-400">
              {lang === 'en' ? 'Payment Status' : 'حالة السداد'}
            </span>
            <p
              className={`mt-1 text-xs font-bold ${
                student.paid_this_month ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {student.paid_this_month
                ? (lang === 'en' ? 'Paid in Full ✓' : 'مسدد بالكامل ✓')
                : (lang === 'en' ? 'Pending ⚠️' : 'غير مسدد ⚠️')}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-center">
            <span className="text-[11px] font-bold text-slate-400">
              {lang === 'en' ? 'Attendance Rate' : 'نسبة الالتزام'}
            </span>
            <p className="mt-1 text-xs font-bold text-blue-700">
              {attendanceRate}% {lang === 'en' ? 'Present' : 'حضور'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-center">
            <span className="text-[11px] font-bold text-slate-400">
              {lang === 'en' ? 'Latest Exam' : 'آخر تقييم'}
            </span>
            <p className="mt-1 text-xs font-bold text-purple-700">
              {student.last_quiz_score || '19/20'}
            </p>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 text-xs">
          <h3 className="font-bold text-slate-800">
            {lang === 'en' ? 'Contact & School Details' : 'بيانات التواصل والمدرسة'}
          </h3>

          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">
              {lang === 'en' ? "Parent's Phone" : 'هاتف ولي الأمر'} ({student.parent_relation}):
            </span>
            <span className="font-mono font-bold text-slate-800" dir="ltr">
              {student.parent_phone}
            </span>
          </div>

          {student.student_phone && (
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">{lang === 'en' ? "Student's Phone" : 'هاتف الطالب'}:</span>
              <span className="font-mono font-bold text-slate-800" dir="ltr">
                {student.student_phone}
              </span>
            </div>
          )}

          {student.school && (
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">{lang === 'en' ? 'School' : 'المدرسة'}:</span>
              <span className="font-semibold text-slate-700">{student.school}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-slate-500">{lang === 'en' ? 'Monthly Fee' : 'الاشتراك الشهري'}:</span>
            <span className="font-bold text-slate-900">{formatPrice(student.monthly_fee, lang)}</span>
          </div>
        </div>

        {/* WhatsApp Actions Hub */}
        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4">
          <h3 className="text-xs font-bold text-emerald-900">
            {lang === 'en' ? 'Direct WhatsApp Actions' : 'إجراءات واتساب المباشرة مع ولي الأمر'}
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              onClick={() => handleWhatsAppAction('payment')}
              className="flex flex-col items-center justify-center rounded-xl bg-white p-2.5 text-center text-[11px] font-bold text-amber-800 shadow-2xs border border-amber-200 hover:bg-amber-50 cursor-pointer"
            >
              <CreditCard className="size-4 mb-1 text-amber-600" />
              {lang === 'en' ? 'Fee Reminder' : 'تذكير المصاريف'}
            </button>
            <button
              onClick={() => handleWhatsAppAction('absent')}
              className="flex flex-col items-center justify-center rounded-xl bg-white p-2.5 text-center text-[11px] font-bold text-rose-800 shadow-2xs border border-rose-200 hover:bg-rose-50 cursor-pointer"
            >
              <AlertCircle className="size-4 mb-1 text-rose-600" />
              {lang === 'en' ? 'Absent Notice' : 'إشعار غياب'}
            </button>
            <button
              onClick={() => handleWhatsAppAction('quiz')}
              className="flex flex-col items-center justify-center rounded-xl bg-white p-2.5 text-center text-[11px] font-bold text-blue-800 shadow-2xs border border-blue-200 hover:bg-blue-50 cursor-pointer"
            >
              <Award className="size-4 mb-1 text-blue-600" />
              {lang === 'en' ? 'Quiz Report' : 'تقرير الدرجات'}
            </button>
          </div>
        </div>

        {/* Payment History */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">
              {lang === 'en' ? 'Payment History & Receipts' : 'سجل الإيصالات والمدفوعات السابقة'}
            </h3>
            {!student.paid_this_month && (
              <Button
                size="sm"
                onClick={() => {
                  onClose()
                  onRecordPayment(student.id)
                }}
                className="rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
              >
                {lang === 'en' ? 'Record Fee Now' : 'تحصيل دفعة الآن'}
              </Button>
            )}
          </div>

          <div className="mt-2 space-y-2">
            {studentPayments.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                {lang === 'en' ? 'No prior payments recorded for this student' : 'لا توجد مدفوعات سابقة مسجلة لهذا الطالب'}
              </p>
            ) : (
              studentPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-700">#{p.receipt_number}</span>
                    <span className="mx-2 text-[10px] text-slate-400">({getPaymentMethodBadgeText(p.method, lang)})</span>
                    <p className="text-[10px] text-slate-400 mt-1">{p.month_year} • {p.payment_date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-700">{formatPrice(p.amount, lang)}</span>
                    <button
                      onClick={() => {
                        onClose()
                        onViewReceipt(p)
                      }}
                      className="rounded-lg border bg-white px-2.5 py-1 text-[11px] font-bold text-[#7047EB] hover:bg-slate-50 cursor-pointer"
                    >
                      {lang === 'en' ? 'View Receipt' : 'عرض الإيصال'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              onClose()
              onEdit(student)
            }}
            className="gap-1.5 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            <Edit2 className="size-3.5" /> {lang === 'en' ? 'Edit Details' : 'تعديل البيانات'}
          </Button>
          <Button onClick={onClose} className="rounded-xl bg-slate-800 px-5 text-xs font-bold text-white cursor-pointer">
            {lang === 'en' ? 'Close' : 'إغلاق'}
          </Button>
        </div>
      </div>
    </div>
  )
}
