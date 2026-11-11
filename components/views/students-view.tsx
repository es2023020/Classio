'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  UserPlus,
  Download,
  Phone,
  MessageCircle,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  CreditCard,
  UserCheck,
  QrCode,
  Eye,
  FileSpreadsheet,
} from 'lucide-react'
import { Student, Group, TutorProfile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  buildAbsentWhatsAppUrl,
  buildPaymentReminderWhatsAppUrl,
  buildQuizReportWhatsAppUrl,
  exportToCsv,
} from '@/lib/egyptian-helpers'
import { whatsAppEngine } from '@/lib/whatsapp-engine'
import { useLanguage } from '@/lib/language-context'
import { formatPrice } from '@/lib/localization'

interface StudentsViewProps {
  students: Student[]
  groups: Group[]
  profile: TutorProfile
  onAddStudent: () => void
  onEditStudent: (student: Student) => void
  onDeleteStudent: (studentId: string) => void
  onRecordPayment: (studentId: string) => void
  onSelectStudent: (student: Student) => void
  onOpenScanModal: () => void
  onOpenImportModal: () => void
  notify: (msg: string) => void
}

export function StudentsView({
  students,
  groups,
  profile,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onRecordPayment,
  onSelectStudent,
  onOpenScanModal,
  onOpenImportModal,
  notify,
}: StudentsViewProps) {
  const { lang, t, isRTL } = useLanguage()
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all')
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.student_code.toLowerCase().includes(search.toLowerCase()) ||
        s.student_phone.includes(search) ||
        s.parent_phone.includes(search)

      const matchGroup = selectedGroup === 'all' || s.group_id === selectedGroup

      const matchPayment =
        paymentFilter === 'all' ||
        (paymentFilter === 'paid' && s.paid_this_month) ||
        (paymentFilter === 'unpaid' && !s.paid_this_month)

      return matchSearch && matchGroup && matchPayment
    })
  }, [students, search, selectedGroup, paymentFilter])

  const paidCount = students.filter((s) => s.paid_this_month).length
  const unpaidCount = students.filter((s) => !s.paid_this_month).length

  const handleExport = () => {
    const data = filteredStudents.map((s) => {
      if (lang === 'en') {
        return {
          'Student Code': s.student_code,
          'Name': s.name,
          'Group': s.group_name,
          'Student Phone': s.student_phone,
          'Parent Phone': s.parent_phone,
          'Relationship': s.parent_relation,
          'School': s.school || '',
          'Monthly Fee': s.monthly_fee,
          'Payment Status': s.paid_this_month ? 'Paid' : 'Unpaid',
          'Notes': s.notes || '',
        }
      }
      return {
        'كود الطالب': s.student_code,
        'الاسم': s.name,
        'المجموعة': s.group_name,
        'هاتف الطالب': s.student_phone,
        'هاتف ولي الأمر': s.parent_phone,
        'صلة القرابة': s.parent_relation,
        'المدرسة': s.school || '',
        'الاشتراك الشهري': s.monthly_fee,
        'حالة السداد': s.paid_this_month ? 'مسدد' : 'متأخر',
        'ملاحظات': s.notes || '',
      }
    })
    exportToCsv(lang === 'en' ? `students_export_${new Date().toISOString().split('T')[0]}` : `كشف_طلاب_${new Date().toISOString().split('T')[0]}`, data)
    notify(lang === 'en' ? 'Students sheet exported successfully to Excel/CSV' : 'تم تصدير كشف الطلاب بنجاح إلى ملف إكسيل/CSV')
  }

  const handleWhatsAppAction = (student: Student, type: 'payment' | 'absent' | 'quiz') => {
    setActiveMenuId(null)
    let url = ''
    if (type === 'payment') {
      url = buildPaymentReminderWhatsAppUrl(
        student,
        profile.name,
        lang === 'en' ? 'Current Month' : 'مايو ٢٠٢٤',
        student.monthly_fee,
        profile.instapay_handle,
        profile.vodafone_cash_number
      )
    } else if (type === 'absent') {
      url = buildAbsentWhatsAppUrl(student, student.group_name, profile.name)
    } else if (type === 'quiz') {
      url = buildQuizReportWhatsAppUrl(
        student,
        lang === 'en' ? 'Electrical Physics Quiz' : 'الفيزياء الكهربية',
        18,
        20,
        true,
        profile.name
      )
    }
    if (url) {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t.students.title}</h2>
          <p className="text-xs text-slate-500">
            {lang === 'en'
              ? `Total ${filteredStudents.length} students • ${paidCount} paid • ${unpaidCount} overdue`
              : `إجمالي ${filteredStudents.length} طالب • ${paidCount} مسددين • ${unpaidCount} متأخرين`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={onOpenScanModal}
            className="gap-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <QrCode className="size-4 text-[#7047EB]" />
            {lang === 'en' ? 'Scan Code / Barcode' : 'مسح كود / باركود'}
          </Button>

          <Button
            variant="outline"
            onClick={onOpenImportModal}
            className="gap-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 cursor-pointer"
          >
            <FileSpreadsheet className="size-4 text-emerald-600" />
            {t.students.importExcel}
          </Button>

          <Button
            variant="outline"
            onClick={handleExport}
            className="rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <Download className="size-4" />
            {t.students.exportData}
          </Button>

          <Button
            onClick={onAddStudent}
            className="rounded-xl bg-[#7047EB] px-4 text-xs font-bold text-white hover:bg-[#5D35D5] cursor-pointer shadow-xs"
          >
            <UserPlus className="size-4" />
            {t.students.addStudent}
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-glass flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 transition focus-within:border-[#7047EB] focus-within:bg-white">
          <Search className="size-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t.students.search}
            className="w-full bg-transparent text-xs text-slate-800 outline-none font-semibold"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
              {lang === 'en' ? 'Clear' : 'مسح'}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">{lang === 'en' ? 'All Groups & Centers' : 'جميع المجموعات والسناتر'}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <div className="flex rounded-xl border border-slate-200 bg-slate-50/70 p-1 gap-1">
            <button
              onClick={() => setPaymentFilter('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                paymentFilter === 'all' ? 'bg-white shadow-2xs text-[#7047EB]' : 'text-slate-500'
              }`}
            >
              {t.students.allStudents} ({students.length})
            </button>
            <button
              onClick={() => setPaymentFilter('paid')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                paymentFilter === 'paid' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500'
              }`}
            >
              {t.students.paid} ({paidCount})
            </button>
            <button
              onClick={() => setPaymentFilter('unpaid')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                paymentFilter === 'unpaid' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-500'
              }`}
            >
              {t.students.unpaid} ({unpaidCount})
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto pb-2">
          <table className="w-full min-w-[720px] text-start text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500">
                <th className="p-3.5 text-start font-bold">{t.students.name} / {t.students.studentCode}</th>
                <th className="p-3.5 text-start font-bold">{t.students.group}</th>
                <th className="p-3.5 text-start font-bold">{t.students.contact}</th>
                <th className="p-3.5 text-start font-bold">{t.students.monthlyFee}</th>
                <th className="p-3.5 text-start font-bold">{t.students.status}</th>
                <th className="p-3.5 text-center font-bold">WhatsApp</th>
                <th className="p-3.5 text-end font-bold">{t.students.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    {t.students.noStudents}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="transition hover:bg-slate-50/70">
                    {/* Student Info */}
                    <td className="p-3.5">
                      <Link
                        href={`/students/${s.id}`}
                        className="flex cursor-pointer items-center gap-3 group"
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EEE8FF] font-bold text-[#7047EB] group-hover:bg-[#7047EB] group-hover:text-white transition">
                          {s.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-[#7047EB] transition">
                            {s.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                              {s.student_code}
                            </span>
                            {s.school && (
                              <span className="text-[10px] text-slate-400">{s.school}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </td>

                    {/* Group */}
                    <td className="p-3.5 font-semibold text-slate-700">
                      {s.group_name}
                    </td>

                    {/* Phones */}
                    <td className="p-3.5 font-mono text-[11px] text-slate-600" dir="ltr">
                      <div className={isRTL ? 'text-end' : 'text-start'}>
                        <span className="font-bold">{s.parent_phone}</span>{' '}
                        <span className="text-[10px] text-slate-400">({s.parent_relation})</span>
                      </div>
                      {s.student_phone && s.student_phone !== s.parent_phone && (
                        <div className={`mt-0.5 ${isRTL ? 'text-end' : 'text-start'} text-slate-400`}>
                          {s.student_phone} ({lang === 'en' ? 'Student' : 'طالب'})
                        </div>
                      )}
                    </td>

                    {/* Fee */}
                    <td className="p-3.5 font-bold text-slate-800">
                      {formatPrice(s.monthly_fee, lang)}
                    </td>

                    {/* Payment Status */}
                    <td className="p-3.5">
                      {s.paid_this_month ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="size-3" /> {t.students.paidBadge}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                            <AlertCircle className="size-3" /> {t.students.unpaidBadge}
                          </span>
                          <button
                            onClick={() => onRecordPayment(s.id)}
                            className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                          >
                            {lang === 'en' ? 'Pay' : 'سداد'}
                          </button>
                        </div>
                      )}
                    </td>

                    {/* WhatsApp Quick Actions */}
                    <td className="p-3.5 text-center">
                      <div className="relative inline-block text-start">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === s.id ? null : s.id)}
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                        >
                          <MessageCircle className="size-3.5" />
                          WhatsApp
                        </button>

                        {activeMenuId === s.id && (
                          <div className={`absolute ${isRTL ? 'end-0' : 'start-0'} top-8 z-30 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl`}>
                            <button
                              onClick={() => handleWhatsAppAction(s, 'payment')}
                              className="flex w-full items-center gap-2 rounded-xl p-2 text-start text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                              <CreditCard className="size-3.5 text-amber-600" />
                              {t.students.whatsappReminder}
                            </button>
                            <button
                              onClick={() => handleWhatsAppAction(s, 'absent')}
                              className="flex w-full items-center gap-2 rounded-xl p-2 text-start text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                              <AlertCircle className="size-3.5 text-rose-600" />
                              {t.students.whatsappAbsent}
                            </button>
                            <button
                              onClick={() => handleWhatsAppAction(s, 'quiz')}
                              className="flex w-full items-center gap-2 rounded-xl p-2 text-start text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                              <ShieldCheck className="size-3.5 text-blue-600" />
                              {t.students.whatsappQuiz}
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null)
                                const payload = whatsAppEngine.composeProgressReport(s, profile)
                                whatsAppEngine.sendViaWhatsApp(payload)
                              }}
                              className="flex w-full items-center gap-2 rounded-xl p-2 text-start text-xs font-bold text-emerald-700 hover:bg-emerald-50 cursor-pointer border-t border-slate-100"
                            >
                              <MessageCircle className="size-3.5 text-emerald-600" />
                              <span>{lang === 'en' ? 'Send Parent Magic Portal Link' : 'إرسال رابط بوابة ولي الأمر'}</span>
                            </button>
                            <a
                              href={whatsAppEngine.getPortalUrl(s.id, s.parent_phone)}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => setActiveMenuId(null)}
                              className="flex w-full items-center gap-2 rounded-xl p-2 text-start text-xs text-blue-700 hover:bg-blue-50 cursor-pointer"
                            >
                              <Eye className="size-3.5 text-blue-600" />
                              <span>{lang === 'en' ? 'Preview Parent Portal' : 'معاينة كارت ولي الأمر'}</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Edit & Delete */}
                    <td className="p-3.5 text-end">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/students/${s.id}`}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-700 cursor-pointer inline-flex items-center justify-center"
                          title={t.students.viewProfile}
                        >
                          <Eye className="size-3.5" />
                        </Link>
                        <button
                          onClick={() => onEditStudent(s)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
                          title={t.students.editStudent}
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(s.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                          title={t.students.deleteStudent}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
