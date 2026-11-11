'use client'

import React, { useState } from 'react'
import { X, Wallet } from 'lucide-react'
import { Student, PaymentRecord, PaymentMethod } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payment: PaymentRecord, openReceipt: boolean) => void
  students: Student[]
  defaultStudentId?: string
}

export function PaymentModal({
  isOpen,
  onClose,
  onSave,
  students,
  defaultStudentId,
}: PaymentModalProps) {
  const { lang, t, isRTL } = useLanguage()
  const [studentId, setStudentId] = useState(defaultStudentId || (students[0]?.id ?? ''))
  const selectedStudent = students.find((s) => s.id === studentId) || students[0]

  // Dynamically generate current academic calendar months
  const months = React.useMemo(() => {
    const list: string[] = []
    const now = new Date()
    for (let i = -2; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      list.push(
        new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-EG', {
          month: 'long',
          year: 'numeric',
        }).format(d)
      )
    }
    return list
  }, [lang])

  const [monthYear, setMonthYear] = useState('')

  React.useEffect(() => {
    if (months.length > 0 && !monthYear) {
      setMonthYear(months[2] || months[0])
    }
  }, [months, monthYear])

  const [amount, setAmount] = useState<number>(selectedStudent?.monthly_fee || 500)
  const [method, setMethod] = useState<PaymentMethod>('vodafone_cash')
  const [status, setStatus] = useState<'paid' | 'partial'>('paid')
  const [notes, setNotes] = useState('')
  const [showReceiptAfter, setShowReceiptAfter] = useState(true)

  // Accessibility: Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleStudentSelect = (id: string) => {
    setStudentId(id)
    const s = students.find((item) => item.id === id)
    if (s) {
      setAmount(s.monthly_fee || 500)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    const receiptNum = `REC-${new Date().getFullYear().toString().slice(2)}${String(
      new Date().getMonth() + 1
    ).padStart(2, '0')}${Math.floor(1000 + Math.random() * 9000)}`

    const payment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      student_id: selectedStudent.id,
      student_name: selectedStudent.name,
      group_id: selectedStudent.group_id,
      group_name: selectedStudent.group_name,
      month_year: monthYear,
      amount: Number(amount),
      payment_date: new Date().toISOString().split('T')[0],
      method: method,
      status: status,
      receipt_number: receiptNum,
      notes: notes.trim(),
    }

    onSave(payment, showReceiptAfter)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl transition-all max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Wallet className="size-5" />
            </div>
            <div>
              <h2 id="payment-modal-title" className="text-lg font-bold text-slate-800">{t.paymentModal.title}</h2>
              <p className="text-xs text-slate-500">
                {lang === 'en'
                  ? 'Record monthly fee collection and issue digital receipt'
                  : 'تحصيل اشتراك شهري وإصدار إيصال إلكتروني'}
              </p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">{t.paymentModal.student} *</label>
            <select
              value={studentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:bg-white"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.group_name}) {s.paid_this_month ? (lang === 'en' ? '✓ Paid' : '✓ مسدد') : (lang === 'en' ? '⚠️ Pending' : '⚠️ متأخر')}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">{t.paymentModal.month} *</label>
              <select
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:bg-white"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">{t.paymentModal.amount} *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-bold text-slate-800 outline-none transition focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">{t.paymentModal.method} *</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-xs font-bold transition cursor-pointer ${
                  method === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                💵 {t.paymentModal.cash}
              </button>
              <button
                type="button"
                onClick={() => setMethod('instapay')}
                className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-xs font-bold transition cursor-pointer ${
                  method === 'instapay'
                    ? 'border-purple-600 bg-purple-50 text-purple-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ⚡ {t.paymentModal.instapay}
              </button>
              <button
                type="button"
                onClick={() => setMethod('vodafone_cash')}
                className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-xs font-bold transition cursor-pointer ${
                  method === 'vodafone_cash'
                    ? 'border-rose-600 bg-rose-50 text-rose-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                📱 {t.paymentModal.vodafoneCash}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">{lang === 'en' ? 'Payment Status' : 'حالة السداد'}</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={status === 'paid'}
                  onChange={() => setStatus('paid')}
                  className="accent-emerald-600"
                />
                {lang === 'en' ? 'Paid in Full' : 'مسدد بالكامل'}
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={status === 'partial'}
                  onChange={() => setStatus('partial')}
                  className="accent-emerald-600"
                />
                {lang === 'en' ? 'Partial Payment' : 'دفعة جزئية'}
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">{t.paymentModal.notes}</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={showReceiptAfter}
              onChange={(e) => setShowReceiptAfter(e.target.checked)}
              className="size-4 rounded accent-[#7047EB]"
            />
            {t.paymentModal.printReceipt}
          </label>

          {/* Action buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-5 text-sm cursor-pointer">
              {t.paymentModal.cancel}
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white hover:bg-emerald-700 cursor-pointer"
            >
              {t.paymentModal.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
