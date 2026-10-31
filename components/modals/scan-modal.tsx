'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  QrCode,
  Search,
  CheckCircle2,
  Wallet,
} from 'lucide-react'
import { Student } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { formatPrice } from '@/lib/localization'

interface ScanModalProps {
  isOpen: boolean
  onClose: () => void
  students: Student[]
  onMarkPresent: (studentId: string) => void
  onOpenPayment: (studentId: string) => void
  notify: (msg: string) => void
}

export function ScanModal({
  isOpen,
  onClose,
  students,
  onMarkPresent,
  onOpenPayment,
  notify,
}: ScanModalProps) {
  const { lang, isRTL } = useLanguage()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const matchedStudent = query.trim()
    ? students.find(
        (s) =>
          s.student_code.toLowerCase() === query.trim().toLowerCase() ||
          s.name.toLowerCase().includes(query.trim().toLowerCase()) ||
          s.student_phone.includes(query.trim())
      )
    : null

  const handleQuickPresent = () => {
    if (!matchedStudent) return
    onMarkPresent(matchedStudent.id)
    notify(lang === 'en' ? `Attendance recorded for ${matchedStudent.name}` : `تم تسجيل حضور الطالب ${matchedStudent.name} بنجاح`)
    setQuery('')
  }

  const handleQuickPay = () => {
    if (!matchedStudent) return
    onClose()
    onOpenPayment(matchedStudent.id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl transition-all max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-[#0f2c59]">
              <QrCode className="size-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {lang === 'en' ? 'Quick Student ID & Barcode Scanner' : 'مسح كود الطالب السريع (سنتر / حضور)'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'en'
                  ? 'Compatible with physical USB barcode scanners and instant ID search'
                  : 'متوافق مع أجهزة قارئ الباركود والبحث المباشر بالكود'}
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

        {/* Barcode/Code Input */}
        <div className="mt-5 space-y-4">
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-3.5 size-5 text-slate-400`} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`w-full rounded-2xl border-2 border-slate-200 bg-slate-50/70 py-3 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm font-bold text-slate-800 outline-none transition focus:border-[#0f2c59] focus:bg-white focus:shadow-md`}
            />
          </div>

          {/* Quick Suggestions / Result */}
          {matchedStudent ? (
            <div className="rounded-2xl border-2 border-blue-100 bg-blue-50/30 p-5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0f2c59] text-base font-bold text-white shadow-sm">
                    {matchedStudent.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{matchedStudent.name}</h3>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="rounded-md bg-white border px-2 py-0.5 font-mono text-xs font-bold text-slate-700">
                        {matchedStudent.student_code}
                      </span>
                      <span className="text-xs text-slate-500">{matchedStudent.group_name}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    matchedStudent.paid_this_month
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {matchedStudent.paid_this_month
                    ? (lang === 'en' ? 'Fees Paid ✓' : 'مسدد الاشتراكات ✓')
                    : (lang === 'en' ? 'Pending Fees ⚠️' : 'متأخر في السداد ⚠️')}
                </span>
              </div>

              {/* Student info details */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs border-t border-blue-100/60 pt-3">
                <div>
                  <span className="text-slate-400">{lang === 'en' ? "Parent's Phone:" : 'هاتف ولي الأمر:'}</span>
                  <p className="font-mono font-bold text-slate-700" dir="ltr">
                    {matchedStudent.parent_phone}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">{lang === 'en' ? 'Monthly Fee:' : 'الاشتراك الشهري:'}</span>
                  <p className="font-bold text-slate-800">{formatPrice(matchedStudent.monthly_fee, lang)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex gap-2.5">
                <Button
                  onClick={handleQuickPresent}
                  className="flex-1 gap-2 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                >
                  <CheckCircle2 className="size-4" />
                  {lang === 'en' ? 'Check-in for Session Now' : 'تسجيل الحضور للحصة فوراً'}
                </Button>

                {!matchedStudent.paid_this_month && (
                  <Button
                    onClick={handleQuickPay}
                    variant="outline"
                    className="gap-2 rounded-xl border-amber-300 bg-amber-50 text-xs font-bold text-amber-900 hover:bg-amber-100 cursor-pointer"
                  >
                    <Wallet className="size-4 text-amber-700" />
                    {lang === 'en' ? 'Collect Fee' : 'تحصيل الآن'}
                  </Button>
                )}
              </div>
            </div>
          ) : query.trim() ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
              {lang === 'en' ? 'No student found matching query: ' : 'لم يتم العثور على طالب يطابق الكود: '}
              <b className="text-slate-700">{query}</b>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
              <QrCode className="mx-auto size-8 text-slate-300" />
              <p className="mt-2 text-xs font-semibold text-slate-600">
                {lang === 'en'
                  ? 'Ready to scan — use USB barcode scanner or type student ID above'
                  : 'جاهز للمسح — استخدم جهاز الباركود أو اكتب كود الطالب'}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                <span className="text-[11px] text-slate-400">
                  {lang === 'en' ? 'Quick examples:' : 'أمثلة سريعة للتجربة:'}
                </span>
                {students.slice(0, 3).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setQuery(s.student_code)}
                    className="rounded-md border bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-slate-600 hover:border-slate-400 cursor-pointer"
                  >
                    {s.student_code}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
