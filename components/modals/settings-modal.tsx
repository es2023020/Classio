'use client'

import React, { useState } from 'react'
import { X, Settings, Database, Check, Copy, RefreshCw } from 'lucide-react'
import { TutorProfile } from '@/lib/types'
import { isSupabaseConfigured } from '@/lib/supabase'
import { storage } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  profile: TutorProfile
  onSaveProfile: (profile: TutorProfile) => void
  onResetData: () => void
}

export function SettingsModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onResetData,
}: SettingsModalProps) {
  const { lang, t, isRTL } = useLanguage()
  const [name, setName] = useState(profile.name)
  const [subject, setSubject] = useState(profile.subject)
  const [phone, setPhone] = useState(profile.phone)
  const [instapay, setInstapay] = useState(profile.instapay_handle || '')
  const [vodafoneCash, setVodafoneCash] = useState(profile.vodafone_cash_number || '')
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

  const isConnected = isSupabaseConfigured()

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveProfile({
      ...profile,
      name,
      subject,
      phone,
      instapay_handle: instapay,
      vodafone_cash_number: vodafoneCash,
    })
    onClose()
  }

  const copySqlPath = () => {
    navigator.clipboard.writeText('supabase/schema.sql')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Settings className="size-5" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-lg font-bold text-slate-800">{t.settings.title}</h2>
              <p className="text-xs text-slate-500">
                {lang === 'en'
                  ? 'Customize tutor credentials, Egyptian payment channels, and Supabase cloud sync'
                  : 'تخصيص بيانات المدرس، طرق الدفع، وربط Supabase'}
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

        {/* Supabase Status Banner */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              <Database className="size-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-800">
                  {t.settings.supabaseStatus}:
                </p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    isConnected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isConnected ? t.settings.connected : t.settings.offline}
                </span>
              </div>
              <p className="mt-1 text-slate-600 leading-relaxed">
                {isConnected
                  ? (lang === 'en' ? 'Classio is actively synced with your cloud Supabase PostgreSQL database.' : 'النظام متزامن حالياً مع مشروع Supabase السحابي الخاص بك.')
                  : (lang === 'en'
                      ? 'Classio runs offline-first with local persistence. Add credentials in .env.local to enable real-time cloud sync.'
                      : 'يعمل النظام حالياً بكفاءة تامة دون إنترنت (Offline-First). عند رغبتك بالربط مع Supabase، فقط أضف المفاتيح في ملف .env.local وقم بتنفيذ ملف supabase/schema.sql.')}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <code className="rounded-md bg-white px-2 py-1 text-[11px] font-mono text-slate-700 border">
                  supabase/schema.sql
                </code>
                <button
                  type="button"
                  onClick={copySqlPath}
                  className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 border hover:bg-slate-50 cursor-pointer"
                >
                  {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                  {copied ? (lang === 'en' ? 'Copied' : 'تم النسخ') : (lang === 'en' ? 'Copy Path' : 'نسخ المسار')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Settings Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {lang === 'en' ? 'Tutor Credentials & Payment Channels' : 'بيانات المدرس والتحصيل'}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">{t.settings.tutorName}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 outline-none transition focus:border-[#0f2c59] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">{t.settings.subject}</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 outline-none transition focus:border-[#0f2c59] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">{t.settings.phone}</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-end text-sm text-slate-800 outline-none transition focus:border-[#0f2c59] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-purple-900">{t.settings.instapay}</label>
              <input
                value={instapay}
                onChange={(e) => setInstapay(e.target.value)}
                dir="ltr"
                className="w-full rounded-xl border border-purple-200 bg-purple-50/30 px-3.5 py-2 text-sm text-slate-800 outline-none transition focus:border-purple-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-rose-900">{t.settings.vodafoneCash}</label>
              <input
                value={vodafoneCash}
                onChange={(e) => setVodafoneCash(e.target.value)}
                dir="ltr"
                className="w-full rounded-xl border border-rose-200 bg-rose-50/30 px-3.5 py-2 text-sm text-slate-800 outline-none transition focus:border-rose-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Backup & Data Safety Box */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800">
              {lang === 'en' ? 'Data Backup & Offline Safety' : 'النسخ الاحتياطي وأمان البيانات (Offline Safety)'}
            </h4>
            <p className="text-[11px] text-slate-500">
              {lang === 'en'
                ? 'Download a complete JSON export of all your students, groups, lessons, and receipts or restore an existing backup file anytime.'
                : 'يمكنك تحميل نسخة احتياطية كاملة من بيانات طلابك، حصصك، وإيصالاتك على جهازك، أو استرجاعها في أي وقت.'}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  storage.exportBackup()
                }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0f2c59] hover:bg-slate-50 cursor-pointer"
              >
                <Copy className="size-3.5" />
                {t.settings.backup}
              </button>

              <label className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">
                <span>{t.settings.restore}</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      const content = event.target?.result as string
                      const success = storage.restoreBackup(content)
                      if (success) {
                        alert(lang === 'en' ? 'Backup restored successfully! Refreshing view.' : 'تم استرجاع النسخة الاحتياطية بنجاح! سيتم تحديث الصفحة.')
                        window.location.reload()
                      } else {
                        alert(lang === 'en' ? 'Invalid backup file.' : 'خطأ: ملف النسخة الاحتياطية غير صالح.')
                      }
                    }
                    reader.readAsText(file)
                  }}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onResetData}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              {t.settings.resetData}
            </button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-4 text-xs cursor-pointer">
                {t.common.cancel}
              </Button>
              <Button type="submit" className="rounded-xl bg-[#0f2c59] px-5 text-xs font-bold text-white hover:bg-[#1e3a8a] cursor-pointer">
                {t.settings.save}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
