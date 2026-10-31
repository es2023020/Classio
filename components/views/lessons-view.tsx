'use client'

import React, { useState } from 'react'
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  Share2,
  FileText,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Edit2,
  Trash2,
  Layers,
  ChevronDown,
  X,
} from 'lucide-react'
import { LessonPlan, Group, TutorProfile, Student } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { buildLessonRecapWhatsAppUrl } from '@/lib/egyptian-helpers'
import { useLanguage } from '@/lib/language-context'

interface LessonsViewProps {
  lessons: LessonPlan[]
  groups: Group[]
  students: Student[]
  profile: TutorProfile
  onSaveLesson: (lesson: LessonPlan) => void
  onDeleteLesson: (lessonId: string) => void
  notify: (msg: string) => void
}

export function LessonsView({
  lessons,
  groups,
  students,
  profile,
  onSaveLesson,
  onDeleteLesson,
  notify,
}: LessonsViewProps) {
  const { lang, t } = useLanguage()
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<LessonPlan | null>(null)

  // Form State
  const [groupId, setGroupId] = useState(groups[0]?.id || '')
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().split('T')[0])
  const [unitName, setUnitName] = useState(lang === 'en' ? 'Chapter 3: Electromagnetic Induction' : 'الفصل الثالث: الحث الكهرومغناطيسي')
  const [topicTitle, setTopicTitle] = useState('')
  const [lessonSummary, setLessonSummary] = useState('')
  const [homeworkTitle, setHomeworkTitle] = useState('')
  const [homeworkPages, setHomeworkPages] = useState('')
  const [homeworkDueDate, setHomeworkDueDate] = useState('')

  const filteredLessons = lessons.filter(
    (l) => selectedGroupId === 'all' || l.group_id === selectedGroupId
  )

  const openCreateModal = () => {
    setEditingLesson(null)
    setGroupId(groups[0]?.id || '')
    setLessonDate(new Date().toISOString().split('T')[0])
    setUnitName(lang === 'en' ? 'Chapter 3: Electromagnetic Induction' : 'الفصل الثالث: الحث الكهرومغناطيسي')
    setTopicTitle('')
    setLessonSummary('')
    setHomeworkTitle(lang === 'en' ? 'Problem set & exercise booklet' : 'واجب مذكرة التدريبات والأسئلة المقالية')
    setHomeworkPages(lang === 'en' ? 'pp. 45-52' : 'ص ٤٥ إلى ص ٥٢')
    setHomeworkDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0])
    setIsModalOpen(true)
  }

  const openEditModal = (lesson: LessonPlan) => {
    setEditingLesson(lesson)
    setGroupId(lesson.group_id)
    setLessonDate(lesson.lesson_date)
    setUnitName(lesson.unit_name)
    setTopicTitle(lesson.topic_title)
    setLessonSummary(lesson.lesson_summary)
    setHomeworkTitle(lesson.homework_title)
    setHomeworkPages(lesson.homework_pages || '')
    setHomeworkDueDate(lesson.homework_due_date)
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topicTitle.trim()) return

    const selectedGroup = groups.find((g) => g.id === groupId)

    const lesson: LessonPlan = {
      id: editingLesson?.id || `les-${Date.now()}`,
      group_id: groupId,
      group_name: selectedGroup?.name || (lang === 'en' ? 'Teaching Group' : 'مجموعة دراسية'),
      lesson_date: lessonDate,
      unit_name: unitName.trim(),
      topic_title: topicTitle.trim(),
      lesson_summary: lessonSummary.trim(),
      homework_title: homeworkTitle.trim(),
      homework_pages: homeworkPages.trim(),
      homework_due_date: homeworkDueDate,
      created_at: editingLesson?.created_at || new Date().toISOString(),
    }

    onSaveLesson(lesson)
    setIsModalOpen(false)
    notify(
      editingLesson
        ? (lang === 'en' ? 'Lesson plan updated successfully' : 'تم تعديل تحضير الحصة بنجاح')
        : (lang === 'en' ? 'Lesson plan and homework saved successfully' : 'تم تسجيل موضوع الحصة والواجب بنجاح')
    )
  }

  const handleBroadcastWhatsApp = (lesson: LessonPlan) => {
    const url = buildLessonRecapWhatsAppUrl(lesson, lesson.group_name, profile.name)
    window.open(url, '_blank')
    notify(lang === 'en' ? 'Opened WhatsApp to broadcast lesson recap' : 'تم فتح واتساب لنشر ملخص الحصة والواجب للطلاب')
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t.lessons.title}</h2>
          <p className="text-xs text-slate-500">
            {t.lessons.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={openCreateModal}
            className="rounded-xl bg-[#0f2c59] px-4 text-xs font-bold text-white hover:bg-[#1a3d6d] cursor-pointer"
          >
            <Plus className="size-4" />
            {t.lessons.addLesson}
          </Button>
        </div>
      </div>

      {/* Group Selector & Curriculum Stats Bar */}
      <div className="card-glass flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">
            {lang === 'en' ? 'Filter by Group:' : 'تصفية حسب المجموعة:'}
          </span>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="all">{lang === 'en' ? 'All Groups & Centers' : 'جميع المجموعات والسناتر'}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <BookOpen className="size-4 text-[#0f2c59]" />
            <span>
              {lang === 'en'
                ? `Total Recorded Lessons: ${filteredLessons.length}`
                : `إجمالي الحصص المسجلة: ${filteredLessons.length}`}
            </span>
          </div>
        </div>
      </div>

      {/* Lesson Plans List */}
      <div className="space-y-4">
        {filteredLessons.length === 0 ? (
          <div className="card-glass p-12 text-center text-xs text-slate-400">
            <BookOpen className="mx-auto size-10 text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">{t.lessons.noLessons}</p>
          </div>
        ) : (
          filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="card-glass relative flex flex-col justify-between overflow-hidden p-6 transition hover:shadow-md"
            >
              <div>
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-[#0f2c59]">
                      {lesson.unit_name}
                    </span>
                    <span className="font-semibold text-xs text-slate-600">
                      {lesson.group_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono text-xs font-bold text-slate-500">
                      <Calendar className="size-3.5 text-slate-400" />
                      {lesson.lesson_date}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(lesson)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                        title={t.lessons.editLesson}
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteLesson(lesson.id)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                        title={t.lessons.deleteLesson}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lesson Title & Notes */}
                <h3 className="mt-3.5 text-base font-bold text-slate-900">{lesson.topic_title}</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50/70 rounded-xl p-3 border border-slate-100">
                  {lesson.lesson_summary}
                </p>

                {/* Homework Box */}
                <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex size-2 rounded-full bg-emerald-600" />
                      <span className="text-xs font-bold text-emerald-950">
                        {t.lessons.homework}: {lesson.homework_title}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800">
                      {t.lessons.dueDate}: {lesson.homework_due_date}
                    </span>
                  </div>

                  {lesson.homework_pages && (
                    <p className="mt-1 text-xs text-emerald-800 font-medium pr-4">
                      {t.lessons.pages}: {lesson.homework_pages}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="text-slate-400">
                  {lang === 'en' ? 'Ready to broadcast to students and parents' : 'جاهز للإرسال للطلاب وأولياء الأمور'}
                </span>

                <Button
                  onClick={() => handleBroadcastWhatsApp(lesson)}
                  size="sm"
                  className="gap-1.5 rounded-xl bg-[#25D366] text-xs font-bold text-white shadow-xs hover:bg-[#20ba5a] cursor-pointer"
                >
                  <MessageCircle className="size-3.5" />
                  {t.lessons.whatsappRecap}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lesson Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl transition-all max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#0f2c59]">
                  <BookOpen className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    {editingLesson
                      ? (lang === 'en' ? 'Edit Lesson Plan & Homework' : 'تعديل تحضير الحصة والواجب')
                      : (lang === 'en' ? 'Prepare Lesson & Assign Homework' : 'تسجيل محتوى الحصة والواجب المطلوب')}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {lang === 'en' ? 'Record curriculum topic and homework assignment' : 'توثيق موضوع الشرح وتكليف الواجب للطلاب'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    {t.lessons.group} *
                  </label>
                  <select
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-slate-800 font-bold outline-none cursor-pointer"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    {t.lessons.date} *
                  </label>
                  <input
                    type="date"
                    required
                    value={lessonDate}
                    onChange={(e) => setLessonDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-slate-800 font-bold outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  {t.lessons.unit} *
                </label>
                <input
                  required
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  {t.lessons.topic} *
                </label>
                <input
                  required
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-slate-800 outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  {t.lessons.summary}
                </label>
                <textarea
                  rows={3}
                  value={lessonSummary}
                  onChange={(e) => setLessonSummary(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-slate-800 outline-none"
                />
              </div>

              {/* Homework Section */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-3.5 space-y-3">
                <h4 className="font-bold text-emerald-950">
                  {lang === 'en' ? 'Homework Assignment Details' : 'بيانات الواجب المطلوب'}
                </h4>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    {t.lessons.homework}
                  </label>
                  <input
                    value={homeworkTitle}
                    onChange={(e) => setHomeworkTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-slate-800 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">
                      {t.lessons.pages}
                    </label>
                    <input
                      value={homeworkPages}
                      onChange={(e) => setHomeworkPages(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 text-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">
                      {t.lessons.dueDate}
                    </label>
                    <input
                      type="date"
                      value={homeworkDueDate}
                      onChange={(e) => setHomeworkDueDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 text-slate-800 outline-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl px-4 cursor-pointer">
                  {lang === 'en' ? 'Cancel' : 'إلغاء'}
                </Button>
                <Button type="submit" className="rounded-xl bg-[#0f2c59] px-6 font-bold text-white cursor-pointer hover:bg-[#1a3d6d]">
                  {editingLesson ? (lang === 'en' ? 'Save Changes' : 'حفظ التعديلات') : (lang === 'en' ? 'Save & Assign' : 'تسجيل ونشر الحصة')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
