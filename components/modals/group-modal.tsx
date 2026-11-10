'use client'

import React, { useState } from 'react'
import { X, Grid2X2 } from 'lucide-react'
import { Group } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'

interface GroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (group: Group) => void
  editingGroup?: Group | null
}

const DAYS_DATA = [
  { ar: 'السبت', en: 'Saturday' },
  { ar: 'الأحد', en: 'Sunday' },
  { ar: 'الإثنين', en: 'Monday' },
  { ar: 'الثلاثاء', en: 'Tuesday' },
  { ar: 'الأربعاء', en: 'Wednesday' },
  { ar: 'الخميس', en: 'Thursday' },
  { ar: 'الجمعة', en: 'Friday' },
]

export function GroupModal({ isOpen, onClose, onSave, editingGroup }: GroupModalProps) {
  const { lang, t, isRTL } = useLanguage()

  const [name, setName] = useState(editingGroup?.name || '')
  const [stage, setStage] = useState(editingGroup?.stage || 'الثالث_الثانوي')
  const [stageLabel, setStageLabel] = useState(
    editingGroup?.stage_label || (lang === 'en' ? 'Senior 3 (Thanaweya Amma)' : 'الصف الثالث الثانوي')
  )
  const [subject, setSubject] = useState(editingGroup?.subject || (lang === 'en' ? 'Physics' : 'فيزياء'))
  const [centerName, setCenterName] = useState(editingGroup?.center_name || (lang === 'en' ? 'Al-Awael Center — Nasr City' : 'سنتر الأوائل — مدينة نصر'))
  const [scheduleDays, setScheduleDays] = useState<string[]>(
    editingGroup?.schedule_days || (lang === 'en' ? ['Saturday', 'Tuesday'] : ['السبت', 'الثلاثاء'])
  )
  const [timeSlot, setTimeSlot] = useState(editingGroup?.time_slot || (lang === 'en' ? '04:00 PM - 06:30 PM' : '04:00 م - 06:30 م'))
  const [monthlyFee, setMonthlyFee] = useState(editingGroup?.monthly_fee || 500)
  const [sessionFee, setSessionFee] = useState(editingGroup?.session_fee || 150)
  const [maxStudents, setMaxStudents] = useState(editingGroup?.max_students || 35)

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

  const toggleDay = (dayKey: string) => {
    if (scheduleDays.includes(dayKey)) {
      setScheduleDays(scheduleDays.filter((d) => d !== dayKey))
    } else {
      setScheduleDays([...scheduleDays, dayKey])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const newGroup: Group = {
      id: editingGroup?.id || `grp-${Date.now()}`,
      name: name.trim(),
      stage,
      stage_label: stageLabel,
      subject: subject.trim(),
      center_name: centerName.trim(),
      schedule_days: scheduleDays.length ? scheduleDays : [lang === 'en' ? 'Saturday' : 'السبت'],
      time_slot: timeSlot.trim(),
      monthly_fee: Number(monthlyFee),
      session_fee: Number(sessionFee),
      max_students: Number(maxStudents),
      student_count: editingGroup?.student_count || 0,
      color_tone: editingGroup?.color_tone || 'blue',
      active: true,
      created_at: editingGroup?.created_at || new Date().toISOString(),
    }

    onSave(newGroup)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl transition-all max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              <Grid2X2 className="size-5" />
            </div>
            <div>
              <h2 id="group-modal-title" className="text-lg font-bold text-slate-800">
                {editingGroup ? t.groupModal.editTitle : t.groupModal.addTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'en'
                  ? 'Define teaching center, schedule times, and monthly subscription fees'
                  : 'تحديد السنتر، المواعيد الأسبوعية، والاشتراك الشهري'}
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">{t.groupModal.name} *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">{t.groupModal.stage}</label>
              <select
                value={stage}
                onChange={(e) => {
                  setStage(e.target.value)
                  const label = e.target.options[e.target.selectedIndex].text
                  setStageLabel(label)
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-600 focus:bg-white"
              >
                <option value="الثالث_الثانوي">{lang === 'en' ? 'Senior 3 (Thanaweya Amma)' : 'الصف الثالث الثانوي'}</option>
                <option value="الثاني_الثانوي">{lang === 'en' ? 'Senior 2' : 'الصف الثاني الثانوي'}</option>
                <option value="الأول_الثانوي">{lang === 'en' ? 'Senior 1' : 'الصف الأول الثانوي'}</option>
                <option value="الثالث_الإعدادي">{lang === 'en' ? 'Prep 3' : 'الشهادة الإعدادية'}</option>
                <option value="لغات">{lang === 'en' ? 'Languages Curriculum' : 'ثانوية عامة (لغات)'}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">{t.groupModal.subject}</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">{t.groupModal.center} *</label>
              <input
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-600 focus:bg-white"
              />
            </div>

            {/* Days picker */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">{t.groupModal.days} *</label>
              <div className="flex flex-wrap gap-2">
                {DAYS_DATA.map((d) => {
                  const dayName = lang === 'en' ? d.en : d.ar
                  const isSelected = scheduleDays.includes(d.ar) || scheduleDays.includes(d.en)
                  return (
                    <button
                      type="button"
                      key={d.en}
                      onClick={() => toggleDay(dayName)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {dayName}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">{t.groupModal.timeSlot}</label>
              <input
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">{t.groupModal.maxStudents}</label>
              <input
                type="number"
                value={maxStudents}
                onChange={(e) => setMaxStudents(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">{t.groupModal.monthlyFee}</label>
              <input
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">{t.groupModal.sessionFee}</label>
              <input
                type="number"
                value={sessionFee}
                onChange={(e) => setSessionFee(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-5 text-sm cursor-pointer">
              {t.groupModal.cancel}
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-purple-700 px-6 text-sm font-bold text-white hover:bg-purple-800 cursor-pointer"
            >
              {t.groupModal.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
