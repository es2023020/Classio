'use client'

import React, { useState } from 'react'
import {
  X,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertCircle,
  Minus,
  BookOpen,
  Edit2,
  Plus,
  Trash2,
  Receipt,
  Target,
  Share2,
} from 'lucide-react'
import {
  Student,
  PaymentRecord,
  AttendanceRecord,
  TutorProfile,
  TopicMastery,
  LearningTrajectory,
} from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  buildMonthlyProgressCardWhatsAppUrl,
} from '@/lib/egyptian-helpers'
import { useLanguage } from '@/lib/language-context'
import {
  formatPrice,
  getTrajectoryBadgeText,
  getTopicLevelBadge,
  getPaymentMethodBadgeText,
} from '@/lib/localization'

interface StudentSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student | null
  payments: PaymentRecord[]
  attendanceRecords: AttendanceRecord[]
  tutor: TutorProfile
  onSavePedagogy: (studentId: string, updates: Partial<Student>) => void
  onRecordPayment: (studentId: string) => void
  onViewReceipt: (payment: PaymentRecord) => void
  notify: (msg: string) => void
}

export function StudentSuccessModal({
  isOpen,
  onClose,
  student,
  payments,
  attendanceRecords,
  tutor,
  onSavePedagogy,
  onRecordPayment,
  onViewReceipt,
  notify,
}: StudentSuccessModalProps) {
  const { lang, t, isRTL } = useLanguage()
  const [activeTab, setActiveTab] = useState<'success' | 'financial'>('success')
  const [isEditingTopics, setIsEditingTopics] = useState(false)

  // Local editable fields
  const [targetGoal, setTargetGoal] = useState(student?.target_goal || '')
  const [targetScore, setTargetScore] = useState(student?.target_score_percent || 90)
  const [trajectory, setTrajectory] = useState<LearningTrajectory>(student?.trajectory || 'improving')
  const [nextAction, setNextAction] = useState(student?.next_recommended_action || '')
  const [topics, setTopics] = useState<TopicMastery[]>(student?.weak_topics || [])
  const [newTopicName, setNewTopicName] = useState('')
  const [newTopicLevel, setNewTopicLevel] = useState<'strong' | 'needs_practice' | 'review_required'>('needs_practice')

  if (!isOpen || !student) return null

  const studentPayments = payments.filter((p) => p.student_id === student.id)
  const studentAttendance = attendanceRecords.filter((a) => a.student_id === student.id)

  const attendedCount = studentAttendance.filter((a) => a.status === 'present').length
  const totalLessons = studentAttendance.length
  const attendanceRate = totalLessons > 0 ? Math.round((attendedCount / totalLessons) * 100) : (student.attendance_rate ?? 0)
  const homeworkRate = student.homework_rate ?? 0
  const latestExam = student.last_quiz_score || '—'

  const handleSavePedagogyChanges = () => {
    onSavePedagogy(student.id, {
      target_goal: targetGoal,
      target_score_percent: Number(targetScore),
      trajectory: trajectory,
      next_recommended_action: nextAction,
      weak_topics: topics,
    })
    setIsEditingTopics(false)
    notify(lang === 'en' ? 'Student pedagogical success profile saved successfully' : 'تم حفظ تحديثات الملف الأكاديمي والهدف للطالب بنجاح')
  }

  const handleAddTopic = () => {
    if (!newTopicName.trim()) return
    setTopics([...topics, { topic_name: newTopicName.trim(), level: newTopicLevel }])
    setNewTopicName('')
  }

  const handleRemoveTopic = (idx: number) => {
    setTopics(topics.filter((_, i) => i !== idx))
  }

  const handleSendProgressWhatsApp = () => {
    const period = lang === 'en' ? 'May 2024' : 'مايو ٢٠٢٤'
    const url = buildMonthlyProgressCardWhatsAppUrl(student, tutor.name, tutor.subject, period)
    window.open(url, '_blank')
    notify(lang === 'en' ? `Opened WhatsApp progress report for ${student.name}` : `تم فتح واتساب لإرسال تقرير المستوى لولي أمر الطالب ${student.name}`)
  }

  const trajectoryBadge =
    student.trajectory === 'improving'
      ? { label: getTrajectoryBadgeText('improving', lang), color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: TrendingUp }
      : student.trajectory === 'needs_attention'
      ? { label: getTrajectoryBadgeText('needs_attention', lang), color: 'bg-rose-100 text-rose-800 border-rose-200', icon: AlertCircle }
      : { label: getTrajectoryBadgeText('steady', lang), color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Minus }

  const TrajectoryIcon = trajectoryBadge.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl transition-all max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#0f2c59] text-xl font-black text-amber-300 shadow-md">
              {student.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
                <span className="rounded-md border bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-700">
                  {student.student_code}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${trajectoryBadge.color}`}
                >
                  <TrajectoryIcon className="size-3.5" />
                  {trajectoryBadge.label}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 font-medium">
                {student.group_name} • {lang === 'en' ? "Parent's Phone" : 'هاتف ولي الأمر'}: <span className="font-mono" dir="ltr">{student.parent_phone}</span> ({student.parent_relation})
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

        {/* Tab Switcher: Student Success vs Financial Ledger */}
        <div className="mt-4 flex gap-2 border-b border-slate-100 pb-2">
          <button
            onClick={() => setActiveTab('success')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === 'success'
                ? 'bg-[#0f2c59] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="size-4" />
            {t.successModal.successTab}
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === 'financial'
                ? 'bg-[#0f2c59] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="size-4" />
            {t.successModal.financialTab} ({studentPayments.length})
          </button>
        </div>

        {activeTab === 'success' ? (
          <div className="mt-5 space-y-6">
            {/* 4 Core Success KPIs */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 text-center">
                <span className="text-[11px] font-bold text-slate-400">{t.successModal.attendanceRate}</span>
                <p className="mt-1 text-2xl font-black text-slate-900">{attendanceRate}%</p>
                <span className="text-[10px] text-emerald-600 font-bold">
                  {lang === 'en' ? 'Schedule Adherence' : 'ملتزم بالجدول'}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 text-center">
                <span className="text-[11px] font-bold text-slate-400">{t.successModal.lastExam}</span>
                <p className="mt-1 text-2xl font-black text-blue-700">{latestExam}</p>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {lang === 'en' ? 'Out of 100' : 'من ١٠٠ درجة'}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 text-center">
                <span className="text-[11px] font-bold text-slate-400">{t.successModal.homeworkRate}</span>
                <p className="mt-1 text-2xl font-black text-emerald-700">{homeworkRate}%</p>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {lang === 'en' ? 'Completion rate' : 'معدل الإنجاز'}
                </span>
              </div>

              <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-4 text-center">
                <span className="text-[11px] font-bold text-purple-700">{t.successModal.targetGoal}</span>
                <p className="mt-1 text-2xl font-black text-purple-900">
                  {student.target_score_percent || 90}%
                </p>
                <span className="text-[10px] text-purple-600 font-semibold">
                  {lang === 'en' ? 'Targeted score' : 'المستهدف النهائي'}
                </span>
              </div>
            </div>

            {/* Target Goal Description */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
                <Target className="size-4 text-purple-600" />
                <span>{t.successModal.targetGoal}:</span>
              </div>
              <p className="text-xs text-slate-800 font-semibold">
                {student.target_goal || (lang === 'en' ? 'Excellence in national curriculum exams and securing full marks' : 'التفوق في امتحانات الثانوية العامة والوصول للدرجة النهائية')}
              </p>
            </div>

            {/* Topics Mastery Matrix */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-[#0f2c59]" />
                  <h3 className="text-sm font-bold text-slate-800">{t.successModal.topicMastery}</h3>
                </div>

                <button
                  onClick={() => setIsEditingTopics(!isEditingTopics)}
                  className="flex items-center gap-1 text-xs font-bold text-[#0f2c59] hover:underline cursor-pointer"
                >
                  <Edit2 className="size-3" />
                  {isEditingTopics ? t.common.cancel : t.successModal.editTopics}
                </button>
              </div>

              <div className="mt-3.5 space-y-2">
                {topics.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">{t.common.noData}</p>
                ) : (
                  topics.map((tItem, idx) => {
                    const badge = getTopicLevelBadge(tItem.level, lang)

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3.5 py-2.5 text-xs border border-slate-100"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{tItem.topic_name}</span>
                          {tItem.notes && <p className="text-[10px] text-slate-400 mt-0.5">{tItem.notes}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${badge.color}`}>
                            {badge.text}
                          </span>
                          {isEditingTopics && (
                            <button
                              onClick={() => handleRemoveTopic(idx)}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}

                {/* Add Topic In Edit Mode */}
                {isEditingTopics && (
                  <div className="mt-3 rounded-xl border border-dashed border-slate-300 p-3 bg-slate-50/60">
                    <p className="text-[11px] font-bold text-slate-700 mb-2">{t.successModal.addTopic}:</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none"
                      />
                      <select
                        value={newTopicLevel}
                        onChange={(e) => setNewTopicLevel(e.target.value as any)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        <option value="needs_practice">{t.successModal.needsPractice}</option>
                        <option value="strong">{t.successModal.strong}</option>
                        <option value="review_required">{t.successModal.reviewRequired}</option>
                      </select>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddTopic}
                        className="rounded-xl bg-[#0f2c59] text-xs font-bold text-white px-4 cursor-pointer"
                      >
                        <Plus className="size-3.5" /> {t.common.add}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Next Recommended Action */}
            <div className="rounded-2xl border-2 border-emerald-200/80 bg-emerald-50/40 p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <CheckCircle2 className="size-4 text-emerald-700" />
                  {t.successModal.nextAction}:
                </span>
              </div>

              {isEditingTopics ? (
                <textarea
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-emerald-300 bg-white p-2.5 text-xs text-slate-800 outline-none"
                />
              ) : (
                <p className="text-xs font-bold text-emerald-950 leading-relaxed">
                  {student.next_recommended_action || (lang === 'en' ? 'Assign 15 practice questions on recent chapters and review mistakes in next session.' : 'تكليف الطالب بـ ١٥ مسألة تدريبية ومراجعة الأخطاء في الحصة القادمة.')}
                </p>
              )}
            </div>

            {/* Edit Mode Save Button */}
            {isEditingTopics && (
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  onClick={handleSavePedagogyChanges}
                  className="rounded-xl bg-[#0f2c59] text-xs font-bold text-white px-5 cursor-pointer"
                >
                  {t.successModal.saveChanges}
                </Button>
              </div>
            )}

            {/* Action Bar: WhatsApp Progress Card Button */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {lang === 'en' ? 'Certified Monthly Progress Card' : 'مشاركة كارت التقرير الشهري المعتمد'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {lang === 'en'
                    ? 'Send a concise summary including attendance, homework, test grades, and teacher recommendations via WhatsApp'
                    : 'إرسال بطاقة ملخصة تشمل الحضور، الواجبات، درجات الامتحان، وتوصيات المدرس مباشرة لولي الأمر'}
                </p>
              </div>

              <Button
                onClick={handleSendProgressWhatsApp}
                className="gap-2 rounded-xl bg-[#25D366] text-xs font-bold text-white shadow-xs hover:bg-[#20ba5a] shrink-0 cursor-pointer"
              >
                <Share2 className="size-4" />
                {t.successModal.whatsappReport}
              </Button>
            </div>
          </div>
        ) : (
          /* Financial Ledger Tab */
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800">{t.successModal.paymentHistory}</h3>
                <p className="text-[11px] text-slate-500">
                  {lang === 'en' ? 'Monthly Fee' : 'الاشتراك الشهري'}: {formatPrice(student.monthly_fee, lang)}
                </p>
              </div>

              {!student.paid_this_month && (
                <Button
                  size="sm"
                  onClick={() => {
                    onClose()
                    onRecordPayment(student.id)
                  }}
                  className="rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  {t.successModal.recordPayment}
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {studentPayments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                  {t.successModal.noPayments}
                </div>
              ) : (
                studentPayments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs transition hover:bg-white hover:shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-700">#{p.receipt_number}</span>
                        <span className="rounded bg-slate-200/70 px-1.5 py-0.2 font-bold text-[10px] text-slate-700">
                          {getPaymentMethodBadgeText(p.method, lang)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{p.month_year} • {p.payment_date}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-emerald-700">{formatPrice(p.amount, lang)}</span>
                      <button
                        onClick={() => {
                          onClose()
                          onViewReceipt(p)
                        }}
                        className="rounded-lg border bg-white px-2.5 py-1 text-[11px] font-bold text-[#0f2c59] hover:bg-slate-50 cursor-pointer"
                      >
                        {lang === 'en' ? 'View Receipt' : 'عرض الإيصال'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 flex items-center justify-end border-t border-slate-100 pt-4">
          <Button onClick={onClose} className="rounded-xl bg-slate-800 px-6 text-xs font-bold text-white cursor-pointer">
            {t.common.close}
          </Button>
        </div>
      </div>
    </div>
  )
}
