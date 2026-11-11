'use client'

import React, { useState } from 'react'
import {
  WalletCards,
  Plus,
  Download,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageCircle,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
} from 'lucide-react'
import { PaymentRecord, Student, Group, TutorProfile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { exportToCsv, buildPaymentReminderWhatsAppUrl } from '@/lib/egyptian-helpers'
import { useLanguage } from '@/lib/language-context'
import { formatPrice, getPaymentMethodBadgeText } from '@/lib/localization'

interface PaymentsViewProps {
  payments: PaymentRecord[]
  students: Student[]
  groups: Group[]
  profile: TutorProfile
  onRecordPayment: (studentId?: string) => void
  onViewReceipt: (payment: PaymentRecord) => void
  notify: (msg: string) => void
}

export function PaymentsView({
  payments,
  students,
  groups,
  profile,
  onRecordPayment,
  onViewReceipt,
  notify,
}: PaymentsViewProps) {
  const { lang, t, isRTL } = useLanguage()
  const [tab, setTab] = useState<'records' | 'overdue'>('records')

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)
  const cashCollected = payments.filter((p) => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0)
  const instapayCollected = payments.filter((p) => p.method === 'instapay').reduce((sum, p) => sum + p.amount, 0)
  const vodafoneCollected = payments.filter((p) => p.method === 'vodafone_cash').reduce((sum, p) => sum + p.amount, 0)

  const unpaidStudents = students.filter((s) => !s.paid_this_month)

  const handleExport = () => {
    const rows = payments.map((p) => {
      if (lang === 'en') {
        return {
          'Receipt #': p.receipt_number,
          'Student Name': p.student_name,
          'Group': p.group_name,
          'Month': p.month_year,
          'Amount (EGP)': p.amount,
          'Payment Date': p.payment_date,
          'Payment Method': getPaymentMethodBadgeText(p.method, lang),
          'Status': p.status === 'paid' ? 'Paid' : 'Partial',
          'Notes': p.notes || '',
        }
      }
      return {
        'رقم الإيصال': p.receipt_number,
        'اسم الطالب': p.student_name,
        'المجموعة': p.group_name,
        'عن شهر': p.month_year,
        'المبلغ (ج.م)': p.amount,
        'تاريخ السداد': p.payment_date,
        'طريقة الدفع': getPaymentMethodBadgeText(p.method, lang),
        'حالة السداد': p.status === 'paid' ? 'مسدد' : 'جزئي',
        'ملاحظات': p.notes || '',
      }
    })
    exportToCsv(lang === 'en' ? `payments_ledger_${new Date().toISOString().split('T')[0]}` : `سجل_مدفوعات_${new Date().toISOString().split('T')[0]}`, rows)
    notify(lang === 'en' ? 'Payment ledger exported successfully to Excel/CSV' : 'تم تصدير كشف المدفوعات بنجاح إلى ملف إكسيل/CSV')
  }

  const handleSendReminder = (student: Student) => {
    const url = buildPaymentReminderWhatsAppUrl(
      student,
      profile.name,
      lang === 'en' ? 'Current Month' : 'مايو ٢٠٢٤',
      student.monthly_fee,
      profile.instapay_handle,
      profile.vodafone_cash_number
    )
    window.open(url, '_blank')
    notify(lang === 'en' ? `Opened WhatsApp reminder for ${student.name}` : `تم فتح واتساب لتذكير ${student.name}`)
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t.payments.title}</h2>
          <p className="text-xs text-slate-500">
            {t.payments.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleExport}
            className="rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <Download className="size-4" />
            {t.payments.export}
          </Button>

          <Button
            onClick={() => onRecordPayment()}
            className="rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
          >
            <Plus className="size-4" />
            {t.payments.recordPayment}
          </Button>
        </div>
      </div>

      {/* Payment Channel Breakdown Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-glass p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>{t.payments.totalCollected}</span>
            <WalletCards className="size-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatPrice(totalCollected, lang)}</p>
          <p className="mt-1 text-[11px] text-slate-400">
            {lang === 'en' ? `Total ${payments.length} transactions` : `إجمالي ${payments.length} عملية دفع`}
          </p>
        </div>

        <div className="card-glass p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>{t.payments.cash}</span>
            <Banknote className="size-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-700">{formatPrice(cashCollected, lang)}</p>
          <p className="mt-1 text-[11px] text-slate-400">
            {Math.round((cashCollected / (totalCollected || 1)) * 100)}% {lang === 'en' ? 'of total' : 'من الإجمالي'}
          </p>
        </div>

        <div className="card-glass p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>{t.payments.instapay}</span>
            <CreditCard className="size-4 text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-purple-700">{formatPrice(instapayCollected, lang)}</p>
          <p className="mt-1 text-[11px] text-slate-400">
            {Math.round((instapayCollected / (totalCollected || 1)) * 100)}% {lang === 'en' ? 'of total' : 'من الإجمالي'}
          </p>
        </div>

        <div className="card-glass p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>{t.payments.vodafoneCash}</span>
            <Smartphone className="size-4 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-rose-700">{formatPrice(vodafoneCollected, lang)}</p>
          <p className="mt-1 text-[11px] text-slate-400">
            {Math.round((vodafoneCollected / (totalCollected || 1)) * 100)}% {lang === 'en' ? 'of total' : 'من الإجمالي'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab('records')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            tab === 'records'
              ? 'bg-[#7047EB] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="size-3.5" />
          {t.payments.allPayments} ({payments.length})
        </button>

        <button
          onClick={() => setTab('overdue')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            tab === 'overdue'
              ? 'bg-amber-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="size-3.5" />
          {t.payments.overdue} ({unpaidStudents.length})
        </button>
      </div>

      {/* Table Content */}
      {tab === 'records' ? (
        <div className="card-glass overflow-hidden">
          <div className="overflow-x-auto pb-2">
            <table className="w-full min-w-[680px] text-start text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500">
                  <th className="p-3.5 text-start font-bold">{t.payments.receipt}</th>
                  <th className="p-3.5 text-start font-bold">{t.payments.student} & {lang === 'en' ? 'Group' : 'المجموعة'}</th>
                  <th className="p-3.5 text-start font-bold">{t.payments.month}</th>
                  <th className="p-3.5 text-start font-bold">{t.payments.amount}</th>
                  <th className="p-3.5 text-start font-bold">{t.payments.method}</th>
                  <th className="p-3.5 text-start font-bold">{t.payments.date}</th>
                  <th className="p-3.5 text-end font-bold">{t.payments.receipt}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      {t.payments.noPayments}
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => {
                    const methodLabel = getPaymentMethodBadgeText(p.method, lang)
                    const methodColor =
                      p.method === 'vodafone_cash'
                        ? 'bg-rose-50 text-rose-700'
                        : p.method === 'instapay'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-emerald-50 text-emerald-700'

                    return (
                      <tr key={p.id} className="transition hover:bg-slate-50/60">
                        <td className="p-3.5 font-mono font-bold text-slate-700">
                          #{p.receipt_number}
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-800">{p.student_name}</p>
                          <p className="text-[10px] text-slate-400">{p.group_name}</p>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700">{p.month_year}</td>
                        <td className="p-3.5 font-bold text-emerald-600">{formatPrice(p.amount, lang)}</td>
                        <td className="p-3.5">
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${methodColor}`}>
                            {methodLabel}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">{p.payment_date}</td>
                        <td className="p-3.5 text-end">
                          <button
                            onClick={() => onViewReceipt(p)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-[#7047EB] hover:bg-slate-50 cursor-pointer"
                          >
                            <Receipt className="size-3.5" />
                            {t.payments.viewReceipt}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Overdue tab */
        <div className="card-glass overflow-hidden">
          <div className="overflow-x-auto pb-2">
            <table className="w-full min-w-[620px] text-start text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500">
                  <th className="p-3.5 text-start font-bold">{t.students.name} / {t.students.studentCode}</th>
                  <th className="p-3.5 text-start font-bold">{t.students.group}</th>
                  <th className="p-3.5 text-start font-bold">{t.students.parentPhone}</th>
                  <th className="p-3.5 text-start font-bold">{t.payments.amount}</th>
                  <th className="p-3.5 text-end font-bold">{t.students.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unpaidStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      {t.payments.noOverdue}
                    </td>
                  </tr>
                ) : (
                  unpaidStudents.map((s) => (
                    <tr key={s.id} className="transition hover:bg-slate-50/60">
                      <td className="p-3.5 font-bold text-slate-800">
                        {s.name} <span className="font-mono text-slate-400">({s.student_code})</span>
                      </td>
                      <td className="p-3.5 text-slate-600">{s.group_name}</td>
                      <td className="p-3.5 font-mono text-slate-600" dir="ltr">
                        {s.parent_phone}
                      </td>
                      <td className="p-3.5 font-bold text-amber-700">{formatPrice(s.monthly_fee, lang)}</td>
                      <td className="p-3.5 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSendReminder(s)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#20ba5a] cursor-pointer"
                          >
                            <MessageCircle className="size-3.5" />
                            {t.payments.sendReminder}
                          </button>
                          <button
                            onClick={() => onRecordPayment(s.id)}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                          >
                            <Plus className="size-3.5" />
                            {lang === 'en' ? 'Pay' : 'سداد'}
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
      )}
    </div>
  )
}
