'use client'

import React, { useState, useEffect } from 'react'
import {
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  UsersRound,
  MessageCircle,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react'
import { Student, Group, AttendanceRecord, TutorProfile, AttendanceStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { buildAbsentWhatsAppUrl, exportToCsv } from '@/lib/egyptian-helpers'
import { useLanguage } from '@/lib/language-context'


function getTodayString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getYesterdayString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface AttendanceViewProps {
  groups: Group[]
  students: Student[]
  attendanceRecords: AttendanceRecord[]
  profile: TutorProfile
  onSaveAttendance: (record: AttendanceRecord) => void
  notify: (msg: string) => void
}

export function AttendanceView({
  groups,
  students,
  attendanceRecords,
  profile,
  onSaveAttendance,
  notify,
}: AttendanceViewProps) {
  const { lang, t, isRTL } = useLanguage()
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || '')
  const [selectedDate, setSelectedDate] = useState(getTodayString())

  const groupStudents = students.filter((s) => s.group_id === selectedGroupId)
  const currentGroup = groups.find((g) => g.id === selectedGroupId)

  // Local state for current sheet
  const [sheet, setSheet] = useState<Record<string, { status: AttendanceStatus; homework: boolean; quiz: string; recorded: boolean }>>({})

  useEffect(() => {
    const initialSheet: Record<string, { status: AttendanceStatus; homework: boolean; quiz: string; recorded: boolean }> = {}
    groupStudents.forEach((s) => {
      const match = attendanceRecords.find(
        (r) => r.student_id === s.id && r.lesson_date === selectedDate
      )
      if (match) {
        initialSheet[s.id] = {
          status: match.status,
          homework: match.homework_done,
          quiz: match.quiz_score !== null && match.quiz_score !== undefined ? String(match.quiz_score) : '',
          recorded: true,
        }
      } else {
        initialSheet[s.id] = {
          status: 'present',
          homework: true,
          quiz: '',
          recorded: false,
        }
      }
    })
    setSheet(initialSheet)
  }, [selectedGroupId, selectedDate, students, attendanceRecords])

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    const student = students.find((s) => s.id === studentId)
    if (!student) return

    const currentEntry = sheet[studentId] || { status: 'present', homework: true, quiz: '', recorded: false }
    const updated = { ...currentEntry, status, recorded: true }
    setSheet((prev) => ({ ...prev, [studentId]: updated }))

    const record: AttendanceRecord = {
      id: `att-${studentId}-${selectedDate}`,
      student_id: studentId,
      student_name: student.name,
      group_id: selectedGroupId,
      lesson_date: selectedDate,
      status: status,
      homework_done: updated.homework,
      quiz_score: updated.quiz ? Number(updated.quiz) : null,
      max_quiz_score: 20,
    }
    onSaveAttendance(record)
  }

  const handleHomeworkToggle = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    if (!student) return

    const currentEntry = sheet[studentId] || { status: 'present', homework: true, quiz: '' }
    const updated = { ...currentEntry, homework: !currentEntry.homework }
    setSheet((prev) => ({ ...prev, [studentId]: updated }))

    const record: AttendanceRecord = {
      id: `att-${studentId}-${selectedDate}`,
      student_id: studentId,
      student_name: student.name,
      group_id: selectedGroupId,
      lesson_date: selectedDate,
      status: currentEntry.status,
      homework_done: updated.homework,
      quiz_score: currentEntry.quiz ? Number(currentEntry.quiz) : null,
      max_quiz_score: 20,
    }
    onSaveAttendance(record)
  }

  const handleQuizChange = (studentId: string, scoreStr: string) => {
    const student = students.find((s) => s.id === studentId)
    if (!student) return

    const currentEntry = sheet[studentId] || { status: 'present', homework: true, quiz: '' }
    const updated = { ...currentEntry, quiz: scoreStr }
    setSheet((prev) => ({ ...prev, [studentId]: updated }))

    const record: AttendanceRecord = {
      id: `att-${studentId}-${selectedDate}`,
      student_id: studentId,
      student_name: student.name,
      group_id: selectedGroupId,
      lesson_date: selectedDate,
      status: currentEntry.status,
      homework_done: currentEntry.homework,
      quiz_score: scoreStr ? Number(scoreStr) : null,
      max_quiz_score: 20,
    }
    onSaveAttendance(record)
  }

  const markAllPresent = () => {
    groupStudents.forEach((s) => {
      handleStatusChange(s.id, 'present')
    })
    notify(lang === 'en' ? 'All group students marked as present' : 'تم تسجيل جميع طلاب المجموعة كـ (حاضر)')
  }

  const sendAbsentWhatsApp = (student: Student) => {
    const url = buildAbsentWhatsAppUrl(student, currentGroup?.name || '', profile.name)
    window.open(url, '_blank')
  }

  const handleExport = () => {
    const rows = groupStudents.map((s) => {
      const entry = sheet[s.id] || { status: 'present', homework: true, quiz: '' }
      if (lang === 'en') {
        return {
          'Date': selectedDate,
          'Group': currentGroup?.name || '',
          'Student Code': s.student_code,
          'Student Name': s.name,
          'Parent Phone': s.parent_phone,
          'Attendance': entry.status === 'present' ? 'Present' : entry.status === 'absent' ? 'Absent' : 'Excused',
          'Homework Done': entry.homework ? 'Yes' : 'No',
          'Quiz Score': entry.quiz || '-',
        }
      }
      return {
        'التاريخ': selectedDate,
        'المجموعة': currentGroup?.name || '',
        'كود الطالب': s.student_code,
        'اسم الطالب': s.name,
        'هاتف ولي الأمر': s.parent_phone,
        'حالة الحضور': entry.status === 'present' ? 'حاضر' : entry.status === 'absent' ? 'غائب' : 'بعذر',
        'حل الواجب': entry.homework ? 'نعم' : 'لا',
        'درجة الاختبار': entry.quiz || '-',
      }
    })
    exportToCsv(lang === 'en' ? `attendance_${currentGroup?.name || 'group'}_${selectedDate}` : `سجل_حضور_${currentGroup?.name || 'مجموعة'}_${selectedDate}`, rows)
    notify(lang === 'en' ? 'Attendance sheet exported successfully to Excel/CSV' : 'تم تصدير كشف الحضور بنجاح إلى ملف إكسيل/CSV')
  }

  // Day-by-day calculations
  const recordedRecordsForDate = attendanceRecords.filter(
    (r) => r.group_id === selectedGroupId && r.lesson_date === selectedDate
  )
  const isRecordedForDate = recordedRecordsForDate.length > 0 || Object.values(sheet).some((v) => v.recorded)

  const formatFriendlyDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-')
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      const isToday = dateStr === getTodayString()
      const isYesterday = dateStr === getYesterdayString()
      const dayNamesAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
      const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const dayName = lang === 'en' ? dayNamesEn[d.getDay()] : dayNamesAr[d.getDay()]

      if (isToday) return lang === 'en' ? `Today (${dayName}, ${dateStr})` : `اليوم (${dayName}، ${dateStr})`
      if (isYesterday) return lang === 'en' ? `Yesterday (${dayName}, ${dateStr})` : `أمس (${dayName}، ${dateStr})`
      return `${dayName} — ${dateStr}`
    } catch {
      return dateStr
    }
  }

  // Summary counts - strictly based on recorded attendance
  const presentCount = Object.values(sheet).filter((v) => v.recorded && v.status === 'present').length
  const absentCount = Object.values(sheet).filter((v) => v.recorded && v.status === 'absent').length
  const excusedCount = Object.values(sheet).filter((v) => v.recorded && v.status === 'excused').length

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t.attendance.title}</h2>
          <p className="text-xs text-slate-500">
            {t.attendance.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleExport}
            className="rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <Download className="size-4" />
            {t.attendance.exportSheet}
          </Button>

          <Button
            onClick={markAllPresent}
            className="rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
          >
            <CheckCircle2 className="size-4" />
            {lang === 'en' ? 'Mark All Present' : 'تحديد الكل حاضر'}
          </Button>
        </div>
      </div>

      {/* Group & Date Selectors */}
      <div className="card-glass flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400">{t.attendance.selectGroup}:</span>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="block rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.center_name})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400">{t.attendance.selectDate}:</span>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="block rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setSelectedDate(getTodayString())}
                className={`px-2.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedDate === getTodayString()
                    ? 'bg-[#0f2c59] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lang === 'en' ? 'Today' : 'اليوم'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(getYesterdayString())}
                className={`px-2.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedDate === getYesterdayString()
                    ? 'bg-[#0f2c59] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lang === 'en' ? 'Yesterday' : 'أمس'}
              </button>
            </div>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 px-3.5 py-1.5 text-center">
            <span className="text-[10px] font-bold text-emerald-600">{t.attendance.present}</span>
            <p className="text-sm font-extrabold text-emerald-800">{presentCount}</p>
          </div>
          <div className="rounded-xl bg-rose-50 px-3.5 py-1.5 text-center">
            <span className="text-[10px] font-bold text-rose-600">{t.attendance.absent}</span>
            <p className="text-sm font-extrabold text-rose-800">{absentCount}</p>
          </div>
          <div className="rounded-xl bg-amber-50 px-3.5 py-1.5 text-center">
            <span className="text-[10px] font-bold text-amber-600">{t.attendance.excused}</span>
            <p className="text-sm font-extrabold text-amber-800">{excusedCount}</p>
          </div>
        </div>
      </div>

      {/* Session Day Status Banner */}
      <div className={`p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
        isRecordedForDate
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          : 'bg-amber-50/70 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className={`size-2.5 rounded-full ${isRecordedForDate ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
          <span className="font-black text-sm">
            {formatFriendlyDate(selectedDate)}
          </span>
          <span className="text-slate-400">|</span>
          <span className="font-semibold text-xs">
            {isRecordedForDate
              ? (lang === 'en' ? 'Attendance recorded and saved in history' : 'تم تسجيل حضور هذه الحصة ومحفوظة في السجل التراكمي')
              : (lang === 'en' ? 'Not recorded yet — mark students to record session' : 'لم يُسجل بعد — حدد حالة الطلاب لحفظ حضور اليوم')}
          </span>
        </div>

        {!isRecordedForDate && groupStudents.length > 0 && (
          <Button
            size="sm"
            onClick={markAllPresent}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <CheckCircle2 className="size-3.5 me-1" />
            {lang === 'en' ? 'Record Attendance Now' : 'تسجيل حضور الحصة الآن'}
          </Button>
        )}
      </div>

      {/* Attendance Sheet Table */}
      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto pb-2">
          <table className="w-full min-w-[620px] text-start text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500">
                <th className="p-3.5 text-start font-bold">{t.students.name} / {t.students.studentCode}</th>
                <th className="p-3.5 text-center font-bold">{t.attendance.present} / {t.attendance.absent}</th>
                <th className="p-3.5 text-center font-bold">{t.attendance.homeworkDone}</th>
                <th className="p-3.5 text-center font-bold">{t.attendance.quizScore}</th>
                <th className="p-3.5 text-end font-bold">{lang === 'en' ? 'Quick Alert' : 'تواصل فوري'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groupStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    {t.attendance.noStudents}
                  </td>
                </tr>
              ) : (
                groupStudents.map((s) => {
                  const entry = sheet[s.id] || { status: 'present', homework: true, quiz: '' }

                  return (
                    <tr key={s.id} className="transition hover:bg-slate-50/60">
                      {/* Student info */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-bold text-[#0f2c59]">
                            {s.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{s.name}</p>
                            <span className="font-mono text-[10px] text-slate-400">
                              {lang === 'en' ? 'ID' : 'كود'}: {s.student_code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle Buttons */}
                      <td className="p-3.5 text-center">
                        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50/60 p-1 gap-1">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'present')}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                              entry.status === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {t.attendance.present}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'absent')}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                              entry.status === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {t.attendance.absent}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'excused')}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                              entry.status === 'excused'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {t.attendance.excused}
                          </button>
                        </div>
                      </td>

                      {/* Homework Checkbox */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleHomeworkToggle(s.id)}
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                            entry.homework
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                              : 'border-slate-200 bg-slate-50 text-slate-400'
                          }`}
                        >
                          <Check className={`size-3.5 ${entry.homework ? 'text-emerald-600' : 'text-transparent'}`} />
                          {entry.homework
                            ? (lang === 'en' ? 'Submitted ✓' : 'تم التسليم ✓')
                            : (lang === 'en' ? 'Missing' : 'لم يسلّم')}
                        </button>
                      </td>

                      {/* Quiz Score Input */}
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={entry.quiz}
                            onChange={(e) => handleQuizChange(s.id, e.target.value)}
                            aria-label={t.attendance.quizScore}
                            className="w-16 rounded-xl border border-slate-200 bg-white px-2 py-1 text-center font-bold text-slate-800 outline-none focus:border-[#0f2c59]"
                          />
                        </div>
                      </td>

                      {/* WhatsApp Absent Action */}
                      <td className="p-3.5 text-end">
                        {entry.status === 'absent' ? (
                          <button
                            type="button"
                            onClick={() => sendAbsentWhatsApp(s)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                          >
                            <MessageCircle className="size-3.5" />
                            {t.attendance.whatsappAbsent}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
