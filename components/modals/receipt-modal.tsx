'use client'

import React from 'react'
import { X, Printer, Share2, CheckCircle2, ShieldCheck } from 'lucide-react'
import { PaymentRecord, Student, TutorProfile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { buildReceiptWhatsAppUrl } from '@/lib/egyptian-helpers'
import { useLanguage } from '@/lib/language-context'
import { formatPrice, getPaymentMethodBadgeText } from '@/lib/localization'

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  payment: PaymentRecord | null
  student?: Student | null
  tutor: TutorProfile
}

export function ReceiptModal({ isOpen, onClose, payment, student, tutor }: ReceiptModalProps) {
  const { lang, isRTL } = useLanguage()

  // Accessibility: Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !payment) return null

  const handlePrint = () => {
    window.print()
  }

  const handleShareWhatsApp = () => {
    if (!student) return
    const url = buildReceiptWhatsAppUrl(payment, student, tutor.name)
    window.open(url, '_blank')
  }

  const methodLabel = getPaymentMethodBadgeText(payment.method, lang)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl transition-all max-h-[92vh] overflow-y-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-3">
          <span id="receipt-modal-title" className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="size-3.5" /> {lang === 'en' ? 'Official Certified Receipt' : 'إيصال سداد معتمد'}
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Printable Voucher Area */}
        <div id="printable-receipt" className="relative my-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-start">
            <div>
              <h3 className="font-bold text-[#0f2c59]">{tutor.name}</h3>
              <p className="text-[11px] text-slate-500">{tutor.subject}</p>
            </div>
            <div className="text-end">
              <span className="rounded-md bg-slate-200/80 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700">
                #{payment.receipt_number}
              </span>
              <p className="mt-1 text-[10px] text-slate-400">{payment.payment_date}</p>
            </div>
          </div>

          {/* Amount Showcase */}
          <div className="my-4 rounded-xl bg-white p-4 text-center shadow-xs">
            <p className="text-xs text-slate-500">{lang === 'en' ? 'Amount Received' : 'المبلغ المستلم'}</p>
            <p className="mt-1 text-3xl font-extrabold text-[#0f2c59]">{formatPrice(payment.amount, lang)}</p>
            <p className="mt-1 text-xs font-semibold text-emerald-600">
              {payment.status === 'paid'
                ? (lang === 'en' ? 'Paid in Full ✓' : 'تم السداد بالكامل ✓')
                : (lang === 'en' ? 'Partial Payment' : 'دفعة جزئية')}
            </p>
          </div>

          {/* Details Table */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-500">{lang === 'en' ? 'Student Name:' : 'اسم الطالب:'}</span>
              <span className="font-bold text-slate-800">{payment.student_name}</span>
            </div>
            {student?.student_code && (
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-500">{lang === 'en' ? 'Student ID:' : 'كود الطالب:'}</span>
                <span className="font-mono font-bold text-slate-700">{student.student_code}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-500">{lang === 'en' ? 'Group:' : 'المجموعة:'}</span>
              <span className="font-semibold text-slate-700">{payment.group_name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-500">{lang === 'en' ? 'Billing Month:' : 'عن اشتراك شهر:'}</span>
              <span className="font-bold text-slate-800">{payment.month_year}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-500">{lang === 'en' ? 'Payment Method:' : 'طريقة الدفع:'}</span>
              <span className="font-bold text-slate-800">{methodLabel}</span>
            </div>
            {payment.notes && (
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">{lang === 'en' ? 'Notes:' : 'ملاحظات:'}</span>
                <span className="text-slate-700">{payment.notes}</span>
              </div>
            )}
          </div>

          {/* Watermark Stamp */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-1">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>{lang === 'en' ? 'Electronic receipt certified by Classio' : 'إيصال إلكتروني معتمد صادر عن منصة Classio'}</span>
            </div>
            <span className="font-mono text-[10px]">VERIFIED</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <Button
            onClick={handleShareWhatsApp}
            className="flex-1 gap-2 rounded-xl bg-[#25D366] text-xs font-bold text-white hover:bg-[#20ba5a] cursor-pointer"
          >
            <Share2 className="size-4" />
            {lang === 'en' ? 'Share with Parent on WhatsApp' : 'إرسال لولي الأمر عبر واتساب'}
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Printer className="size-4" />
            {lang === 'en' ? 'Print' : 'طباعة'}
          </Button>
        </div>
      </div>
    </div>
  )
}
