'use client'

import React, { useState } from 'react'
import {
  X,
  ShieldAlert,
  Sparkles,
  UserPlus,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import { ManagedTutor } from '@/lib/admin-types'
import { PlanTier, BillingCycle } from '@/lib/types'

// 1. Suspend / Bend Tutor Modal
interface SuspendModalProps {
  isOpen: boolean
  onClose: () => void
  tutor: ManagedTutor | null
  onConfirm: (reason: string) => void
  lang: 'ar' | 'en'
}

export function SuspendTutorModal({
  isOpen,
  onClose,
  tutor,
  onConfirm,
  lang,
}: SuspendModalProps) {
  const [reason, setReason] = useState('')

  if (!isOpen || !tutor) return null

  const commonReasons = [
    lang === 'ar' ? 'تأخر سداد الاشتراك الشهري للمنصة' : 'Delinquency in SaaS subscription fee',
    lang === 'ar' ? 'مخالفة معايير الاستخدام والسياسة التعليمية' : 'Violation of platform terms and safety',
    lang === 'ar' ? 'تكرار شكاوى أولياء الأمور والطلاب' : 'Repeated guardian/student complaints',
    lang === 'ar' ? 'تجميد إداري مؤقت بناء على طلب المدرس' : 'Temporary administrative hold requested by tutor',
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(reason || (lang === 'ar' ? 'تم إيقاف الحساب بقرار إداري' : 'Suspended by super-admin'))
    setReason('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-amber-200">
              {lang === 'ar' ? 'إيقاف وتجميد حساب المدرس' : 'Suspend / Freeze Tutor Account'}
            </h3>
            <p className="text-xs text-slate-400">{tutor.name} ({tutor.email})</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 bg-amber-950/40 p-3 rounded-xl border border-amber-800/40">
          {lang === 'ar'
            ? '⚠️ سيتم حجب دخول المدرس فوراً إلى لوحة التحكم الخاصة به، وسيظهر له سبب الإيقاف وزر التواصل مع الإدارة.'
            : '⚠️ The tutor will immediately be locked out of their dashboard, viewing this suspension reason and contact admin instructions.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {lang === 'ar' ? 'سبب الإيقاف (سيظهر للمدرس):' : 'Suspension Reason (visible to tutor):'}
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={lang === 'ar' ? 'اكتب سبب الإيقاف والتجميد هنا...' : 'Enter explicit reason for suspension...'}
              required
              className="w-full text-xs p-3 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-200"
            />
          </div>

          <div>
            <p className="text-[11px] text-slate-400 mb-2">
              {lang === 'ar' ? 'أسباب شائعة للاختيار السريع:' : 'Quick Common Reasons:'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {commonReasons.map((r, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setReason(r)}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 text-right"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950 flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تأكيد إيقاف الحساب' : 'Confirm Suspension'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 2. Upgrade / Edit Tutor Plan Modal
interface UpgradePlanModalProps {
  isOpen: boolean
  onClose: () => void
  tutor: ManagedTutor | null
  onSave: (plan: PlanTier, cycle: BillingCycle, maxLimit: number, extensionMonths: number) => void
  lang: 'ar' | 'en'
}

export function UpgradePlanModal({
  isOpen,
  onClose,
  tutor,
  onSave,
  lang,
}: UpgradePlanModalProps) {
  const [plan, setPlan] = useState<PlanTier>(tutor?.subscription_plan || 'pro')
  const [cycle, setCycle] = useState<BillingCycle>(tutor?.subscription_cycle || 'monthly')
  const [maxLimit, setMaxLimit] = useState<number>(tutor?.max_students_limit || 250)
  const [extensionMonths, setExtensionMonths] = useState<number>(1)

  if (!isOpen || !tutor) return null

  const plansList: { id: PlanTier; name: string; nameAr: string; defaultLimit: number }[] = [
    { id: 'free', name: 'Free', nameAr: 'مجاني', defaultLimit: 10 },
    { id: 'starter', name: 'Starter', nameAr: 'بداية', defaultLimit: 30 },
    { id: 'growth', name: 'Growth', nameAr: 'نمو', defaultLimit: 99 },
    { id: 'pro', name: 'Pro Professional', nameAr: 'احترافي Pro', defaultLimit: 250 },
    { id: 'power', name: 'Power', nameAr: 'قوة Power', defaultLimit: 500 },
    { id: 'enterprise', name: 'Enterprise', nameAr: 'مؤسسات Enterprise', defaultLimit: 1000 },
  ]

  const handlePlanSelect = (selectedPlan: PlanTier) => {
    setPlan(selectedPlan)
    const match = plansList.find((p) => p.id === selectedPlan)
    if (match) setMaxLimit(match.defaultLimit)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(plan, cycle, maxLimit, extensionMonths)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-emerald-200">
              {lang === 'ar' ? 'تعديل باقة وسعة حساب المدرس' : 'Modify Tutor Plan & Student Limit'}
            </h3>
            <p className="text-xs text-slate-400">{tutor.name} ({tutor.email})</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Plan Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              {lang === 'ar' ? 'اختر باقة الاشتراك:' : 'Select Subscription Tier:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {plansList.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handlePlanSelect(p.id)}
                  className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    plan === p.id
                      ? 'bg-emerald-950/60 border-emerald-500 text-white ring-1 ring-emerald-500'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{lang === 'ar' ? p.nameAr : p.name}</span>
                    {plan === p.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {lang === 'ar' ? `حتى ${p.defaultLimit} طالب` : `Up to ${p.defaultLimit} students`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Student Limit Override */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {lang === 'ar' ? 'الحد الأقصى للطلاب:' : 'Max Students Capacity:'}
              </label>
              <input
                type="number"
                min={1}
                max={5000}
                value={maxLimit}
                onChange={(e) => setMaxLimit(parseInt(e.target.value, 10) || 1)}
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {lang === 'ar' ? 'دورة الفوترة:' : 'Billing Cycle:'}
              </label>
              <select
                value={cycle}
                onChange={(e) => setCycle(e.target.value as BillingCycle)}
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="monthly">{lang === 'ar' ? 'شهري (Monthly)' : 'Monthly'}</option>
                <option value="annual">{lang === 'ar' ? 'سنوي (Annual)' : 'Annual'}</option>
              </select>
            </div>
          </div>

          {/* Extension Months */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {lang === 'ar' ? 'منح صلاحية إضافية (أشهر):' : 'Grant Subscription Validity (Months):'}
            </label>
            <div className="flex items-center gap-2">
              {[1, 3, 6, 12].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setExtensionMonths(m)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                    extensionMonths === m
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  +{m} {lang === 'ar' ? (m === 1 ? 'شهر' : 'أشهر') : 'Mo'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{lang === 'ar' ? 'حفظ وتطبيق فوراً' : 'Save & Apply Instantly'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 3. Add Tutor Modal
interface AddTutorModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (tutorData: {
    name: string
    email: string
    phone: string
    subject: string
    title: string
    plan: PlanTier
    centers: string[]
  }) => void
  lang: 'ar' | 'en'
}

export function AddTutorModal({ isOpen, onClose, onAdd, lang }: AddTutorModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [title, setTitle] = useState('مدرس أول')
  const [plan, setPlan] = useState<PlanTier>('pro')
  const [centers, setCenters] = useState('سنتر الأوائل — مدينة نصر, سنتر النخبة — التجمع')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      name,
      email,
      phone,
      subject,
      title,
      plan,
      centers: centers.split(',').map((c) => c.trim()).filter(Boolean),
    })
    setName('')
    setEmail('')
    setPhone('')
    setSubject('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-blue-500/40 rounded-2xl p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-blue-200">
              {lang === 'ar' ? 'إضافة واعتماد مدرس جديد' : 'Register & Admit New Tutor'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ar' ? 'تسجيل مباشر من الإدارة مع صلاحيات كاملة' : 'Direct administrative enrollment'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {lang === 'ar' ? 'اسم المدرس الكامل:' : 'Full Name:'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أ. محمود عبد الرحمن"
              className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'ar' ? 'البريد الإلكتروني:' : 'Email Address:'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tutor@example.com"
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'ar' ? 'رقم الهاتف / فودافون كاش:' : 'Phone Number:'}
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01012345678"
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'ar' ? 'المادة الدراسية:' : 'Subject:'}
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="الفيزياء للثانوية العامة"
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'ar' ? 'اللقب المهني:' : 'Title:'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مدرس أول فيزياء"
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {lang === 'ar' ? 'السناتر أو المقرات (مفصولة بفواصل):' : 'Centers (comma-separated):'}
            </label>
            <input
              type="text"
              value={centers}
              onChange={(e) => setCenters(e.target.value)}
              placeholder="سنتر الأوائل, سنتر النخبة"
              className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {lang === 'ar' ? 'باقة الاشتراك المبدئية:' : 'Initial Subscription Tier:'}
            </label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as PlanTier)}
              className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="free">مجاني (Free) — 10 طلاب</option>
              <option value="starter">بداية (Starter) — 30 طالباً</option>
              <option value="growth">نمو (Growth) — 99 طالباً</option>
              <option value="pro">احترافي (Pro) — 250 طالباً</option>
              <option value="power">قوة (Power) — 500 طالب</option>
              <option value="enterprise">مؤسسات (Enterprise) — مخصص (+500)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-950 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>{lang === 'ar' ? 'اعتماد وإضافة الحساب' : 'Enroll Tutor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
