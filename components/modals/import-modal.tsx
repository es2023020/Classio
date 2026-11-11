'use client'

import React, { useState } from 'react'
import {
  X,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Student, Group } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { formatPrice } from '@/lib/localization'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  groups: Group[]
  onImportStudents: (newStudents: Student[]) => void
  notify: (msg: string) => void
}

const SAMPLE_CSV_AR = `كود الطالب,اسم الطالب,المجموعة,هاتف ولي الأمر,هاتف الطالب,صلة القرابة,المدرسة,الاشتراك الشهري
PHY-108,أحمد مصطفى كامل,فيزياء ٣ ث — سنتر الأوائل,01099887766,01011223344,الأب,مدرسة السعيدية الثانوية,850
PHY-109,مروان حسام الدين,فيزياء ٣ ث — سنتر الأوائل,01122334455,01199887766,ولي الأمر,مدرسة جمال عبد الناصر,850
PHY-205,يارا شريف رضوان,فيزياء ٣ ث — سنتر النخبة,01233445566,01211223344,الأم,مدرسة نوتردام لغات,900`

const SAMPLE_CSV_EN = `Student Code,Student Name,Group,Parent Phone,Student Phone,Relation,School,Monthly Fee
PHY-108,Ahmed Mostafa Kamel,Physics Senior 3 — Al-Awael,01099887766,01011223344,Father,El Saaidiya High School,850
PHY-109,Marwan Hossam El-Din,Physics Senior 3 — Al-Awael,01122334455,01199887766,Guardian,Gamal Abdel Nasser School,850
PHY-205,Yara Sherif Radwan,Physics Senior 3 — Al-Nokhba,01233445566,01211223344,Mother,Notre Dame Language School,900`

export function ImportModal({
  isOpen,
  onClose,
  groups,
  onImportStudents,
  notify,
}: ImportModalProps) {
  const { lang, isRTL } = useLanguage()
  const [csvContent, setCsvContent] = useState('')
  const [parsedRows, setParsedRows] = useState<Partial<Student>[]>([])
  const [parseError, setParseError] = useState('')

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

  const handleDownloadSample = () => {
    const csvData = lang === 'en' ? SAMPLE_CSV_EN : SAMPLE_CSV_AR
    const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = lang === 'en' ? 'classio_students_import_template.csv' : 'نموذج_استيراد_الطلاب_كلاسيو.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setCsvContent(text)
      parseCsv(text)
    }
    reader.readAsText(file)
  }

  const parseCsv = (text: string) => {
    setParseError('')
    try {
      const cleanText = text.replace(/^\uFEFF/, '').trim()
      const lines = cleanText.split(/\r?\n/).filter((line) => line.trim().length > 0)

      if (lines.length < 2) {
        setParseError(
          lang === 'en'
            ? 'The file must contain a header row and at least one student record row.'
            : 'الملف يجب أن يحتوي على صف العناوين وصف واحد على الأقل من بيانات الطلاب.'
        )
        setParsedRows([])
        return
      }

      // Check delimiter (comma or semicolon or tab)
      const firstLine = lines[0]
      const delimiter = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ','

      const headers = firstLine.split(delimiter).map((h) => h.replace(/^["']|["']$/g, '').trim())

      const students: Partial<Student>[] = []

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(delimiter).map((col) => col.replace(/^["']|["']$/g, '').trim())
        if (row.length < 2) continue

        const rowObj: Record<string, string> = {}
        headers.forEach((header, index) => {
          rowObj[header] = row[index] || ''
        })

        // Match common column names (Arabic or English)
        const name =
          rowObj['Student Name'] ||
          rowObj['اسم الطالب'] ||
          rowObj['الاسم'] ||
          rowObj['name'] ||
          row[1] ||
          ''
        if (!name) continue

        const code =
          rowObj['Student Code'] ||
          rowObj['كود الطالب'] ||
          rowObj['الكود'] ||
          rowObj['code'] ||
          `STD-${Date.now().toString().slice(-4)}-${i}`
        const groupName =
          rowObj['Group'] ||
          rowObj['المجموعة'] ||
          rowObj['السنتر'] ||
          rowObj['group'] ||
          groups[0]?.name ||
          (lang === 'en' ? 'General Group' : 'مجموعة عامة')
        const parentPhone =
          rowObj['Parent Phone'] ||
          rowObj['هاتف ولي الأمر'] ||
          rowObj['تليفون ولي الامر'] ||
          rowObj['parent_phone'] ||
          row[3] ||
          '01000000000'
        const studentPhone =
          rowObj['Student Phone'] ||
          rowObj['هاتف الطالب'] ||
          rowObj['تليفون الطالب'] ||
          rowObj['student_phone'] ||
          ''
        const relation = (rowObj['Relation'] || rowObj['صلة القرابة'] || 'ولي الأمر') as any
        const school = rowObj['School'] || rowObj['المدرسة'] || ''
        const fee = Number(
          rowObj['Monthly Fee'] || rowObj['الاشتراك الشهري'] || rowObj['الاشتراك'] || rowObj['fee'] || 0
        )

        // Find or fallback to group
        const matchedGroup =
          groups.find((g) => g.name.toLowerCase().includes(groupName.toLowerCase())) || groups[0]

        students.push({
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `std-${Date.now()}-${i}`,
          name: name.trim(),
          student_code: code.trim(),
          group_id: matchedGroup?.id || 'grp-1',
          group_name: matchedGroup?.name || groupName,
          parent_phone: parentPhone.trim(),
          student_phone: studentPhone.trim() || parentPhone.trim(),
          parent_relation: relation,
          school: school.trim(),
          monthly_fee: fee || matchedGroup?.monthly_fee || 500,
          status: 'active',
          paid_this_month: false,
          paid_amount: 0,
          trajectory: 'improving',
          target_score_percent: 90,
          target_goal: lang === 'en' ? 'Full score in the final exam' : 'الدرجة النهائية في المادة',
          attendance_rate: 100,
          homework_rate: 90,
          next_recommended_action:
            lang === 'en'
              ? 'Assess student baseline performance in the first quiz'
              : 'متابعة أول حصة وتقييم المستوى في كويز البداية',
          weak_topics: [],
        })
      }

      if (students.length === 0) {
        setParseError(
          lang === 'en'
            ? 'Could not extract student records from the text. Verify header columns match the template.'
            : 'لم نتمكن من استخراج بيانات الطلاب من النص. تأكد من مطابقة صف العناوين للنموذج.'
        )
      }

      setParsedRows(students)
    } catch (err: any) {
      setParseError(
        lang === 'en'
          ? `Error reading data: ${err.message}`
          : `خطأ أثناء قراءة البيانات: ${err.message}`
      )
      setParsedRows([])
    }
  }

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return
    onImportStudents(parsedRows as Student[])
    notify(
      lang === 'en'
        ? `Successfully imported ${parsedRows.length} students to Classio!`
        : `تم استيراد ${parsedRows.length} طالب بنجاح وإضافتهم لقائمة طلابك!`
    )
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl transition-all max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <FileSpreadsheet className="size-6" />
            </div>
            <div>
              <h2 id="import-modal-title" className="text-base font-bold text-slate-900">
                {lang === 'en' ? 'Import Students via Excel / CSV' : 'استيراد كشف الطلاب من ملف Excel / CSV'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'en'
                  ? 'Add dozens or hundreds of students in bulk in seconds'
                  : 'إضافة عشرات أو مئات الطلاب دفعة واحدة بضغطة زر'}
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

        {/* Action Bar: Download Sample */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
          <div className="text-xs text-slate-700">
            <span className="font-bold text-[#7047EB] block">
              {lang === 'en' ? 'Need a ready-made template file?' : 'هل تحتاج لنموذج جاهز لتعبئة بياناتك؟'}
            </span>
            <span>
              {lang === 'en'
                ? 'Download the formatted template, paste your students, and re-upload here.'
                : 'قم بتحميل ملف النموذج، أضف أسماء وأرقام طلابك، ثم ارفعه هنا.'}
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadSample}
            className="gap-1.5 rounded-xl border-blue-200 bg-white text-xs font-bold text-[#7047EB] hover:bg-blue-50 shrink-0 cursor-pointer"
          >
            <Download className="size-3.5" />
            {lang === 'en' ? 'Download Excel Template (.csv)' : 'تحميل نموذج الإكسيل (.csv)'}
          </Button>
        </div>

        {/* Upload Zone */}
        <div className="mt-4 space-y-3">
          <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-center cursor-pointer hover:border-[#7047EB] hover:bg-white transition">
            <Upload className="size-8 text-slate-400 mb-2" />
            <span className="text-xs font-bold text-slate-700">
              {lang === 'en'
                ? 'Click or drag your CSV/Excel spreadsheet here'
                : 'انقر لاختيار ملف الإكسيل أو الـ CSV من جهازك'}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'en' ? 'Supports .csv and UTF-8 text files' : 'يدعم ملفات .csv و .txt'}
            </span>
            <input
              type="file"
              accept=".csv,text/plain"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">
              {lang === 'en' ? 'Or paste raw CSV table lines here:' : 'أو الصق محتوى الجدول هنا مباشرة:'}
            </label>
            <textarea
              rows={3}
              value={csvContent}
              onChange={(e) => {
                setCsvContent(e.target.value)
                parseCsv(e.target.value)
              }}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono text-slate-800 outline-none"
            />
          </div>
        </div>

        {/* Parse Error */}
        {parseError && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
            <AlertCircle className="size-4 shrink-0 text-rose-600" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Parsed Preview Table */}
        {parsedRows.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                {lang === 'en'
                  ? `Detected ${parsedRows.length} students ready to import:`
                  : `تم التعرّف على ${parsedRows.length} طالب وجاهزون للاستيراد:`}
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-start text-[11px]">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 sticky top-0">
                  <tr>
                    <th className="p-2 text-start font-bold">{lang === 'en' ? 'ID' : 'الكود'}</th>
                    <th className="p-2 text-start font-bold">{lang === 'en' ? 'Name' : 'الاسم'}</th>
                    <th className="p-2 text-start font-bold">{lang === 'en' ? 'Group' : 'المجموعة'}</th>
                    <th className="p-2 text-start font-bold">{lang === 'en' ? 'Parent Phone' : 'هاتف ولي الأمر'}</th>
                    <th className="p-2 text-start font-bold">{lang === 'en' ? 'Fee' : 'الاشتراك'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 font-mono text-slate-600">{s.student_code}</td>
                      <td className="p-2 font-bold text-slate-800">{s.name}</td>
                      <td className="p-2 text-slate-600">{s.group_name}</td>
                      <td className="p-2 font-mono" dir="ltr">{s.parent_phone}</td>
                      <td className="p-2 font-bold text-slate-800">{formatPrice(s.monthly_fee || 850, lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={onClose} className="rounded-xl px-5 text-xs font-semibold cursor-pointer">
            {lang === 'en' ? 'Cancel' : 'إلغاء'}
          </Button>

          <Button
            onClick={handleConfirmImport}
            disabled={parsedRows.length === 0}
            className="rounded-xl bg-emerald-600 px-6 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
          >
            {lang === 'en' ? `Confirm Import (${parsedRows.length} Students)` : `تأكيد استيراد (${parsedRows.length}) طالب`}
          </Button>
        </div>
      </div>
    </div>
  )
}
