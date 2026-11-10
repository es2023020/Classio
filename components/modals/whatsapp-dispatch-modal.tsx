'use client'

import React, { useState } from 'react'
import {
  X,
  MessageCircle,
  Send,
  Copy,
  Check,
  Sparkles,
  Phone,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Users,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import { Student, TutorProfile, Group, PaymentRecord } from '@/lib/types'
import { whatsAppEngine, WhatsAppMessagePayload } from '@/lib/whatsapp-engine'

interface WhatsAppDispatchModalProps {
  isOpen: boolean
  onClose: () => void
  tutor: TutorProfile
  students: Student[]
  selectedStudent?: Student | null
  initialType?: 'absence' | 'payment_reminder' | 'receipt' | 'progress_report'
  paymentRecord?: PaymentRecord | null
  groups?: Group[]
  notify: (msg: string) => void
  lang: 'ar' | 'en'
}

export function WhatsAppDispatchModal({
  isOpen,
  onClose,
  tutor,
  students,
  selectedStudent,
  initialType = 'progress_report',
  paymentRecord,
  groups = [],
  notify,
  lang,
}: WhatsAppDispatchModalProps) {
  const [mode, setMode] = useState<'single' | 'batch'>(selectedStudent ? 'single' : 'batch')
  const [msgType, setMsgType] = useState<WhatsAppMessagePayload['type']>(initialType)

  // Single mode state
  const [targetStudent, setTargetStudent] = useState<Student | null>(
    selectedStudent || (students.length > 0 ? students[0] : null)
  )

  // Batch queue state
  const [batchCategory, setBatchCategory] = useState<'late_payments' | 'absent_today' | 'all'>('late_payments')
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0)
  const [copied, setCopied] = useState(false)

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

  // Calculate Batch List
  const queueStudents = students.filter((s) => {
    if (batchCategory === 'late_payments') return !s.paid_this_month
    if (batchCategory === 'absent_today') return s.last_attendance === 'absent'
    return true
  })

  const activeStudent = mode === 'single' ? targetStudent : queueStudents[currentQueueIndex] || null

  // Generate payload
  let payload: WhatsAppMessagePayload | null = null
  if (activeStudent) {
    const studentGroup = groups.find((g) => g.id === activeStudent.group_id)
    if (msgType === 'absence') {
      payload = whatsAppEngine.composeAbsenceAlert(activeStudent, tutor, studentGroup)
    } else if (msgType === 'payment_reminder') {
      payload = whatsAppEngine.composePaymentReminder(activeStudent, tutor)
    } else if (msgType === 'receipt' && paymentRecord) {
      payload = whatsAppEngine.composePaymentReceipt(activeStudent, tutor, paymentRecord)
    } else {
      payload = whatsAppEngine.composeProgressReport(activeStudent, tutor)
    }
  }

  const handleSendCurrent = () => {
    if (!payload) return
    whatsAppEngine.sendViaWhatsApp(payload)
    notify(
      lang === 'ar'
        ? `تم فتح واتساب لإرسال الرسالة إلى (${payload.recipientName})`
        : `Opened WhatsApp for ${payload.recipientName}`
    )

    // Advance queue in batch mode
    if (mode === 'batch' && currentQueueIndex < queueStudents.length - 1) {
      setCurrentQueueIndex((prev) => prev + 1)
    }
  }

  const handleCopyText = () => {
    if (!payload) return
    navigator.clipboard.writeText(payload.messageText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    notify(lang === 'ar' ? 'تم نسخ نص الرسالة' : 'Message copied to clipboard')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-modal-title"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 text-slate-900 shadow-2xl relative">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 end-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 id="whatsapp-modal-title" className="font-black text-base text-slate-900">
              {lang === 'ar' ? 'محرك مراسلة أولياء الأمور عبر واتساب' : 'WhatsApp Turbo Dispatch Engine'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'ar'
                ? 'إرسال إشعارات الغياب، التذكير بالمصروفات، وتقارير المتابعة برابط خاص'
                : 'Send absence alerts, tuition reminders, and magic portal reports'}
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 mb-4 bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
              mode === 'single' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            {lang === 'ar' ? 'إرسال لطالب محدد' : 'Single Student'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('batch')
              setCurrentQueueIndex(0)
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
              mode === 'batch' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            {lang === 'ar' ? 'إرسال جماعي متتابع (Batch)' : 'Batch Queue'}
          </button>
        </div>

        {/* Message Type Selector */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { id: 'progress_report', labelAr: 'تقرير أكاديمي شامل', labelEn: 'Report Card' },
            { id: 'absence', labelAr: 'إشعار غياب اليوم', labelEn: 'Absence Notice' },
            { id: 'payment_reminder', labelAr: 'تذكير بالمصروفات', labelEn: 'Fee Reminder' },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setMsgType(type.id as any)}
              className={`p-2 rounded-xl text-[11px] font-bold border transition text-center ${
                msgType === type.id
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {lang === 'ar' ? type.labelAr : type.labelEn}
            </button>
          ))}
        </div>

        {/* Batch Queue Controls if Batch Mode */}
        {mode === 'batch' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-900">
                طابور الإرسال: {currentQueueIndex + 1} من {queueStudents.length}
              </span>
              <span className="text-[11px] text-blue-700">({activeStudent?.name})</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentQueueIndex === 0}
                onClick={() => setCurrentQueueIndex((prev) => Math.max(0, prev - 1))}
                className="p-1 rounded-lg bg-white border border-blue-200 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                disabled={currentQueueIndex >= queueStudents.length - 1}
                onClick={() => setCurrentQueueIndex((prev) => Math.min(queueStudents.length - 1, prev + 1))}
                className="p-1 rounded-lg bg-white border border-blue-200 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Message Preview Box */}
        {payload ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>إلى: {payload.recipientName} ({payload.recipientPhone})</span>
              </span>
              <span className="text-[11px] font-mono text-blue-600">
                كود الطالب: {activeStudent?.student_code}
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line max-h-48 overflow-y-auto">
              {payload.messageText}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3">
              <button
                type="button"
                onClick={handleCopyText}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
              </button>

              <button
                type="button"
                onClick={handleSendCurrent}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition"
              >
                <Send className="w-4 h-4" />
                <span>
                  {mode === 'batch'
                    ? `إرسال عبر واتساب والانتقال للتالي (${currentQueueIndex + 1}/${queueStudents.length})`
                    : 'فتح واتساب والإرسال الآن'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            لا يوجد طلاب في قائمة الإرسال المحددة حالياً.
          </div>
        )}
      </div>
    </div>
  )
}
