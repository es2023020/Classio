'use client'

import React, { useState } from 'react'
import { X, User } from 'lucide-react'
import { Student, Group } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'

interface StudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (student: Student) => void
  groups: Group[]
  editingStudent?: Student | null
}

export function StudentModal({ isOpen, onClose, onSave, groups, editingStudent }: StudentModalProps) {
  const { lang, t, isRTL } = useLanguage()
  const [name, setName] = useState(editingStudent?.name || '')
  const [studentPhone, setStudentPhone] = useState(editingStudent?.student_phone || '')
  const [parentPhone, setParentPhone] = useState(editingStudent?.parent_phone || '')
  const [parentRelation, setParentRelation] = useState<'الأب' | 'الأم' | 'ولي الأمر' | string>(
    editingStudent?.parent_relation || 'ولي الأمر'
  )
  const [groupId, setGroupId] = useState(editingStudent?.group_id || (groups[0]?.id ?? ''))
  const [studentCode, setStudentCode] = useState(
    editingStudent?.student_code || `STD-${Math.floor(100 + Math.random() * 900)}`
  )
  const [school, setSchool] = useState(editingStudent?.school || '')
  const [monthlyFee, setMonthlyFee] = useState<number>(
    editingStudent?.monthly_fee || groups.find((g) => g.id === groupId)?.monthly_fee || 850
  )
  const [notes, setNotes] = useState(editingStudent?.notes || '')

  if (!isOpen) return null

  const handleGroupChange = (newGroupId: string) => {
    setGroupId(newGroupId)
    const matched = groups.find((g) => g.id === newGroupId)
    if (matched && !editingStudent) {
      setMonthlyFee(matched.monthly_fee)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const selectedGroup = groups.find((g) => g.id === groupId)

    const studentData: Student = {
      id: editingStudent?.id || `std-${Date.now()}`,
      name: name.trim(),
      student_phone: studentPhone.trim(),
      parent_phone: parentPhone.trim() || studentPhone.trim(),
      parent_relation: parentRelation,
      group_id: groupId,
      group_name: selectedGroup?.name || (lang === 'en' ? 'General Group' : 'مجموعة عامة'),
      student_code: studentCode.trim() || `STD-${Math.floor(100 + Math.random() * 900)}`,
      school: school.trim(),
      status: editingStudent?.status || 'active',
      monthly_fee: Number(monthlyFee) || 850,
      paid_this_month: editingStudent?.paid_this_month || false,
      paid_amount: editingStudent?.paid_amount || 0,
      notes: notes.trim(),
      initials: name.trim()[0] || 'S',
      created_at: editingStudent?.created_at || new Date().toISOString(),
    }

    onSave(studentData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl transition-all max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#0f2c59]">
              <User className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {editingStudent ? t.studentModal.editTitle : t.studentModal.addTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'en'
                  ? 'Enter student and parent information for records, WhatsApp follow-ups, and fee tracking'
                  : 'أدخل بيانات الطالب للتواصل وإدارة الحصص والاشتراكات'}
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">{t.studentModal.name} *</label>
              <div className="relative">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0f2c59] focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {lang === 'en' ? 'Student ID / Center Code' : 'كود الطالب في السنتر'}
              </label>
              <div className="relative">
                <input
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0f2c59] focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">{t.studentModal.group} *</label>
              <select
                value={groupId}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0f2c59] focus:bg-white"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">{t.studentModal.studentPhone}</label>
              <input
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                dir="ltr"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-end text-sm text-slate-800 outline-none transition focus:border-[#0f2c59] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">{t.studentModal.parentPhone} *</label>
                <select
                  value={parentRelation}
                  onChange={(e) => setParentRelation(e.target.value as any)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600"
                >
                  <option value="ولي الأمر">{lang === 'en' ? 'Guardian' : 'ولي الأمر'}</option>
                  <option value="الأب">{lang === 'en' ? 'Father' : 'الأب'}</option>
                  <option value="الأم">{lang === 'en' ? 'Mother' : 'الأم'}</option>
                </select>
              </div>
              <input
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                dir="ltr"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-end text-sm text-slate-800 outline-none transition focus:border-[#0f2c59] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {lang === 'en' ? 'School / System' : 'المدرسة'}
              </label>
              <input
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0f2c59] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">{t.studentModal.monthlyFee}</label>
              <input
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0f2c59] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">{t.studentModal.notes}</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0f2c59] focus:bg-white"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-5 text-sm cursor-pointer">
              {t.studentModal.cancel}
            </Button>
            <Button type="submit" className="rounded-xl bg-[#0f2c59] px-6 text-sm font-bold text-white hover:bg-[#1e3a8a] cursor-pointer">
              {t.studentModal.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
