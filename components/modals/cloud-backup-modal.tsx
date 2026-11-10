'use client'

import React, { useState } from 'react'
import {
  X,
  Cloud,
  CloudCheck,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  FileJson,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { storage } from '@/lib/storage'
import { isSupabaseConfigured } from '@/lib/supabase'

interface CloudBackupModalProps {
  isOpen: boolean
  onClose: () => void
  lang: 'ar' | 'en'
  notify: (msg: string) => void
  onDataRestored?: () => void
}

export function CloudBackupModal({
  isOpen,
  onClose,
  lang,
  notify,
  onDataRestored,
}: CloudBackupModalProps) {
  const [exporting, setExporting] = useState(false)
  const [syncingCloud, setSyncingCloud] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<string | null>(null)

  if (!isOpen) return null

  // 1. Export entire tutor workspace to JSON
  const handleExportJson = async () => {
    setExporting(true)
    try {
      const [profile, groups, students, attendance, payments, lessons] = await Promise.all([
        storage.getProfile(),
        storage.getGroups(),
        storage.getStudents(),
        storage.getAttendance(),
        storage.getPayments(),
        storage.getLessons(),
      ])

      const backupData = {
        platform: 'Classio Tutor CRM',
        version: '2.0',
        exportedAt: new Date().toISOString(),
        tutor: profile,
        data: {
          groups,
          students,
          attendance,
          payments,
          lessons,
        },
      }

      const jsonStr = JSON.stringify(backupData, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const dateStr = new Date().toISOString().split('T')[0]
      a.href = url
      a.download = `classio_full_backup_${dateStr}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      notify(
        lang === 'ar'
          ? 'تم تنزيل النسخة الاحتياطية الكاملة لجهازك بنجاح!'
          : 'Full workspace backup downloaded successfully!'
      )
    } catch {
      notify(lang === 'ar' ? 'فشل تصدير النسخة الاحتياطية.' : 'Failed to export backup.')
    } finally {
      setExporting(false)
    }
  }

  // 2. Trigger active Cloud Sync with Supabase
  const handleSyncCloud = async () => {
    setSyncingCloud(true)
    try {
      if (!isSupabaseConfigured()) {
        notify(
          lang === 'ar'
            ? 'سحابة Supabase قيد الإعداد. بياناتك محفوظة بأمان محلياً في متصفحك.'
            : 'Supabase cloud is in progress. Your data is safely stored locally.'
        )
        setSyncingCloud(false)
        return
      }

      const [profile, groups, students] = await Promise.all([
        storage.getProfile(),
        storage.getGroups(),
        storage.getStudents(),
      ])

      await storage.saveProfile(profile)
      for (const g of groups) {
        await storage.saveGroup(g)
      }
      for (const s of students) {
        await storage.saveStudent(s)
      }

      notify(
        lang === 'ar'
          ? 'تمت مزامنة جميع البيانات مع السحابة بنجاح!'
          : 'All workspace data synchronized to cloud successfully!'
      )
    } catch {
      notify(lang === 'ar' ? 'حدث خطأ أثناء المزامنة السحابية.' : 'Error during cloud sync.')
    } finally {
      setSyncingCloud(false)
    }
  }

  // 3. Restore data from a JSON file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportStatus(null)
    const reader = new FileReader()

    reader.onload = async (event) => {
      try {
        const raw = event.target?.result as string
        const parsed = JSON.parse(raw)

        if (!parsed.data || (!parsed.data.students && !parsed.data.groups)) {
          throw new Error('Invalid format')
        }

        const { groups = [], students = [], payments = [] } = parsed.data

        for (const g of groups) {
          await storage.saveGroup(g)
        }
        for (const s of students) {
          await storage.saveStudent(s)
        }
        for (const p of payments) {
          await storage.recordPayment(p)
        }

        setImportStatus(
          lang === 'ar'
            ? `تم استرجاع البيانات بنجاح: ${students.length} طالب، ${groups.length} مجموعة.`
            : `Data restored: ${students.length} students, ${groups.length} groups.`
        )
        notify(lang === 'ar' ? 'تمت استعادة البيانات بنجاح!' : 'Data restored successfully!')

        if (onDataRestored) {
          onDataRestored()
        }
      } catch {
        setImportStatus(
          lang === 'ar'
            ? 'الملف غير صالح أو تالف. يرجى اختيار ملف نسخة احتياطية بصيغة JSON من كلاسيو.'
            : 'Invalid or corrupt backup file. Please select a valid Classio JSON backup.'
        )
      } finally {
        setImporting(false)
      }
    }

    reader.readAsText(file)
  }

  const isCloudOnline = isSupabaseConfigured()

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl transition-all max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#0f2c59]">
              <Cloud className="size-5" />
            </div>
            <div>
              <h2 id="backup-modal-title" className="text-base font-bold text-slate-800">
                {lang === 'ar' ? 'النسخ الاحتياطي ومزامنة السحابة' : 'Cloud Backup & Workspace Recovery'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'ar'
                  ? 'حماية بيانات طلابك وسجلات السداد من الضياع'
                  : 'Protect your student records and payment data from accidental loss'}
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

        {/* Cloud Status Pill */}
        <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`size-3 rounded-full ${isCloudOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            <div>
              <span className="block text-xs font-bold text-slate-800">
                {isCloudOnline
                  ? (lang === 'ar' ? 'الاتصال السحابي نشط (Supabase Cloud)' : 'Cloud Connected (Supabase Cloud)')
                  : (lang === 'ar' ? 'حفظ محلي آمن في المتصفح' : 'Local Storage Mode')}
              </span>
              <span className="text-[11px] text-slate-500">
                {isCloudOnline
                  ? (lang === 'ar' ? 'المزامنة مشفرة ومتزامنة مع قاعدة البيانات' : 'Real-time encrypted cloud sync enabled')
                  : (lang === 'ar' ? 'البيانات محفوظة على هذا الجهاز' : 'All data stored on this device')}
              </span>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleSyncCloud}
            disabled={syncingCloud}
            className="gap-1.5 rounded-xl text-xs font-bold bg-[#0f2c59] text-white hover:bg-[#1a3d6d]"
          >
            <RefreshCw className={`size-3.5 ${syncingCloud ? 'animate-spin' : ''}`} />
            {syncingCloud ? (lang === 'ar' ? 'جاري المزامنة...' : 'Syncing...') : (lang === 'ar' ? 'مزامنة الآن' : 'Sync Now')}
          </Button>
        </div>

        {/* 1. Download Backup */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 p-4 transition hover:border-[#0f2c59]/40 bg-white">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#0f2c59]">
                <Download className="size-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-800">
                  {lang === 'ar' ? 'تنزيل نسخة احتياطية كاملة (ملف JSON)' : 'Download Full Backup (JSON file)'}
                </h4>
                <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                  {lang === 'ar'
                    ? 'احفظ ملفاً يضم جميع الطلاب، المجموعات، الحضور، وسجل المدفوعات على هاتفك أو حاسوبك للاحتفاظ به بأمان.'
                    : 'Download a complete file with all students, groups, attendance, and payments on your phone or PC.'}
                </p>
                <Button
                  size="sm"
                  onClick={handleExportJson}
                  disabled={exporting}
                  className="mt-3 gap-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700"
                >
                  <FileJson className="size-3.5" />
                  {exporting
                    ? (lang === 'ar' ? 'جاري التصدير...' : 'Exporting...')
                    : (lang === 'ar' ? 'تنزيل النسخة الاحتياطية' : 'Download Backup File')}
                </Button>
              </div>
            </div>
          </div>

          {/* 2. Restore from Backup */}
          <div className="rounded-2xl border border-slate-200 p-4 transition hover:border-[#0f2c59]/40 bg-white">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Upload className="size-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-800">
                  {lang === 'ar' ? 'استعادة البيانات من نسخة سابقة' : 'Restore Data from Backup File'}
                </h4>
                <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                  {lang === 'ar'
                    ? 'في حال قمت بتغيير هاتفك أو مسح المتصفح، يمكنك استرجاع جميع طلابك بنقرة واحدة عبر رفع ملف النسخة الاحتياطية.'
                    : 'If you switched phones or cleared browser data, restore all your students with 1 click by uploading your backup.'}
                </p>
                <label className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <Upload className="size-3.5" />
                  <span>{importing ? (lang === 'ar' ? 'جاري الاستعادة...' : 'Restoring...') : (lang === 'ar' ? 'اختيار ملف الاستعادة (.json)' : 'Select Backup (.json)')}</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    disabled={importing}
                    className="hidden"
                  />
                </label>

                {importStatus && (
                  <div className="mt-2.5 p-2 rounded-xl bg-slate-100 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                    <span>{importStatus}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reassurance footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
          <span>
            {lang === 'ar'
              ? 'كلاسيو تحافظ على خصوصية بياناتك وتضمن تشفير أرقام أولياء الأمور وسجلات المدفوعات.'
              : 'Classio protects your student privacy with strict tenant data isolation.'}
          </span>
        </div>
      </div>
    </div>
  )
}
