import { Student, PaymentRecord, Group, LessonPlan } from './types'

/**
 * Normalizes an Egyptian phone number to international WhatsApp format (e.g. 2010XXXXXXXX)
 */
export function formatEgyptPhoneForWhatsApp(phone: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('20')) {
    return cleaned
  }
  if (cleaned.startsWith('0')) {
    return `20${cleaned.slice(1)}`
  }
  return `20${cleaned}`
}

/**
 * Formats currency in Egyptian Pounds (ج.م / EGP)
 */
export function formatEGP(amount: number, ar: boolean = true): string {
  const formatted = new Intl.NumberFormat(ar ? 'ar-EG' : 'en-EG').format(amount)
  return ar ? `${formatted} ج.م` : `${formatted} EGP`
}

/**
 * WhatsApp Message: Absentee Alert
 */
export function buildAbsentWhatsAppUrl(student: Student, groupName: string, tutorName: string): string {
  const phone = formatEgyptPhoneForWhatsApp(student.parent_phone || student.student_phone)
  const today = new Intl.DateTimeFormat('ar-EG', { dateStyle: 'full' }).format(new Date())
  
  const text = `السلام عليكم ورحمة الله يا فندم،\n\nنود إحاطة سيادتكم علماً بأن الطالب/ة: *${student.name}* (كود: ${student.student_code})\n*غائب/ة اليوم* عن حصة المادة بمجموعة (*${groupName}*) بتاريخ: ${today}.\n\nنرجو الاطمئنان عليه والتواصل معنا لتعويض ما فاته وحل الواجب.\n\nمع تحيات: *أ/ ${tutorName}*`
  
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}

/**
 * WhatsApp Message: Payment Reminder
 */
export function buildPaymentReminderWhatsAppUrl(
  student: Student,
  tutorName: string,
  monthName: string,
  amount: number,
  instapay?: string,
  vodafoneCash?: string
): string {
  const phone = formatEgyptPhoneForWhatsApp(student.parent_phone || student.student_phone)
  
  let paymentDetails = ''
  if (instapay) {
    paymentDetails += `\n• إنستاباي (InstaPay): *${instapay}*`
  }
  if (vodafoneCash) {
    paymentDetails += `\n• فودافون كاش (Vodafone Cash): *${vodafoneCash}*`
  }
  if (!paymentDetails) {
    paymentDetails = '\n• كاش مع الطالب في السنتر'
  }

  const text = `السلام عليكم ورحمة الله يا فندم،\n\nتذكير ودّي بخصوص سداد اشتراك شهر *${monthName}* للطالب/ة: *${student.name}* (كود: ${student.student_code}).\nالمبلغ المستحق: *${amount} ج.م*.\n\nطرق السداد المتاحة:${paymentDetails}\n\nفي حال تم السداد نرجو إرسال صورة التحويل لتأكيد الإيصال. شكراً جزيلاً لتعاونكم!\n*أ/ ${tutorName}*`
  
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}

/**
 * WhatsApp Message: Digital Payment Receipt
 */
export function buildReceiptWhatsAppUrl(
  payment: PaymentRecord,
  student: Student,
  tutorName: string
): string {
  const phone = formatEgyptPhoneForWhatsApp(student.parent_phone || student.student_phone)
  const methodLabel = payment.method === 'vodafone_cash' ? 'فودافون كاش' : payment.method === 'instapay' ? 'إنستاباي' : 'نقداً (كاش)'
  
  const text = `🧾 *إيصال سداد إلكتروني معتمد*\n----------------------------\n👤 اسم الطالب: *${student.name}*\n🏷 كود الطالب: *${student.student_code}*\n📚 المجموعة: *${payment.group_name}*\n💰 المبلغ المسدد: *${payment.amount} ج.م*\n📅 اشتراك شهر: *${payment.month_year}*\n💳 طريقة الدفع: *${methodLabel}*\n🔖 رقم الإيصال: *#${payment.receipt_number}*\n📆 تاريخ الاستلام: *${payment.payment_date}*\n----------------------------\nتم استلام المبلغ بنجاح، شكراً لثقتكم ومتابعتكم المستمرة.\nمع تحيات: *أ/ ${tutorName}*`
  
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}

export function buildQuizReportWhatsAppUrl(
  student: Student,
  quizTitle: string,
  score: number,
  maxScore: number,
  homeworkStatus: boolean,
  tutorName: string
): string {
  const phone = formatEgyptPhoneForWhatsApp(student.parent_phone || student.student_phone)
  const hw = homeworkStatus ? '✅ تم إنجازه بالكامل' : '⚠️ لم يتم تسليم الواجب'
  const gradePercent = Math.round((score / maxScore) * 100)
  const emoji = gradePercent >= 85 ? '🌟 ممتاز جداً' : gradePercent >= 70 ? '👍 جيد' : '⚠️ يحتاج لمتابعة واجتهاد أكبر'

  const text = `تقرير متابعة الحصة — أ/ *${tutorName}*\n\nعزيزي ولي أمر الطالب/ة: *${student.name}*\n\n📝 *درجة اختبار الحصة (${quizTitle}):* ${score} من ${maxScore} (${gradePercent}%)\n📊 *التقييم العام:* ${emoji}\n📚 *حالة الواجب المنزلي:* ${hw}\n\nنرجو مراجعة الأخطاء مع الطالب وتشجيعه دائماً للأفضل.`

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}

/**
 * WhatsApp Message: Full Monthly Academic Progress Card (Student Success)
 */
export function buildMonthlyProgressCardWhatsAppUrl(
  student: Student,
  tutorName: string,
  subject: string,
  monthName: string = 'مايو ٢٠٢٤'
): string {
  const phone = formatEgyptPhoneForWhatsApp(student.parent_phone || student.student_phone)
  
  const trajectoryEmoji =
    student.trajectory === 'improving'
      ? '🟢 في تحسن ملحوظ ومستمر (Improving)'
      : student.trajectory === 'needs_attention'
      ? '⚠️ يحتاج لمزيد من التركيز والمتابعة (Needs Attention)'
      : '🟡 أداء منتظم ومستقر (Steady)'

  const attendance = typeof student.attendance_rate === 'number' ? `${student.attendance_rate}%` : 'قيد التسجيل'
  const homework = typeof student.homework_rate === 'number' ? `${student.homework_rate}%` : 'قيد التسجيل'
  const examScore = student.last_quiz_score || 'لا يوجد اختبار مسجل حتى الآن'
  const targetGoal = student.target_goal || 'التفوق والتميز الدراسي'

  // Topics breakdown
  let strongTopics = ''
  let weakTopics = ''
  if (student.weak_topics && student.weak_topics.length > 0) {
    const strongs = student.weak_topics.filter((t) => t.level === 'strong').map((t) => t.topic_name)
    const weaks = student.weak_topics.filter((t) => t.level !== 'strong').map((t) => t.topic_name)
    if (strongs.length > 0) strongTopics = `\n✅ *نقاط القوة والموضوعات المتقنة:* ${strongs.join('، ')}`
    if (weaks.length > 0) weakTopics = `\n📌 *موضوعات سنركز على تعزيزها:* ${weaks.join('، ')}`
  }

  const nextAction = student.next_recommended_action
    ? `\n🎯 *الخطة والتوصية القادمة:* ${student.next_recommended_action}`
    : ''

  const text = `📊 *تقرير المتابعة والتقدم الأكاديمي الشهري*
----------------------------------------
👤 *الطالب/ة:* ${student.name} (كود: ${student.student_code})
📚 *المادة:* ${subject} — ${student.group_name}
📅 *تقرير شهر:* ${monthName}

📈 *تقييم المسار التعليمي العام:*
${trajectoryEmoji}

⭐ *المؤشرات التعليمية الأساسية:*
• نسبة حضور الحصص: *${attendance}*
• نسبة إنجاز الواجبات: *${homework}*
• آخر درجة امتحان شامل: *${examScore}*
• الهدف التعليمي للطالب: *${targetGoal}*${strongTopics}${weakTopics}${nextAction}
----------------------------------------
نحن فخورون بجهد الطالب ومستمرون في دعمه للوصول للدرجة النهائية بإذن الله.
تحياتي لكم،
*أ/ ${tutorName}*`

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}

/**
 * WhatsApp Message: Lesson Recap & Homework Broadcast
 */
export function buildLessonRecapWhatsAppUrl(
  lesson: LessonPlan,
  groupName: string,
  tutorName: string,
  targetPhone?: string
): string {
  const phone = targetPhone ? formatEgyptPhoneForWhatsApp(targetPhone) : ''

  const text = `📝 *ملخص حصة اليوم وتكليف الواجب*
-----------------------------------
📚 *المجموعة:* ${groupName}
📅 *تاريخ الحصة:* ${lesson.lesson_date}
📖 *الوحدة/الفصل:* ${lesson.unit_name}
🔍 *موضوع الشرح اليوم:* ${lesson.topic_title}

📌 *ملخص ما تم تناوله في الحصة:*
${lesson.lesson_summary}

✏️ *الواجب المنزلي المطلوب:*
• ${lesson.homework_title}
${lesson.homework_pages ? `• الصفحات المطلوبة: ${lesson.homework_pages}\n` : ''}• موعد التسليم: ${lesson.homework_due_date}
-----------------------------------
نرجو من جميع الطلاب الالتزام بحل الواجب كاملاً قبل الحصة القادمة.
بالتوفيق دائماً،
*أ/ ${tutorName}*`

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}

/**
 * Export data to clean CSV for Excel
 */
export function exportToCsv(filename: string, rows: Record<string, any>[]): void {
  if (!rows || !rows.length) return
  
  const headers = Object.keys(rows[0])
  const csvContent = [
    '\uFEFF' + headers.join(','),
    ...rows.map((row) =>
      headers
        .map((fieldName) => {
          const val = row[fieldName] ?? ''
          const stringVal = String(val).replace(/"/g, '""')
          return `"${stringVal}"`
        })
        .join(',')
    ),
  ].join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Generates collision-proof, sequentially clean student code
 * Format: STD-YY-XXXX (e.g. STD-26-0101) backed by sequence check
 */
export function generateUniqueStudentCode(existingCodes: string[] = [], prefix: string = 'STD'): string {
  const yearSuffix = new Date().getFullYear().toString().slice(-2)
  const existingSet = new Set(existingCodes.map((c) => (c || '').toUpperCase().trim()))

  let maxSeq = 100
  for (const code of existingSet) {
    const match = code.match(new RegExp(`^${prefix}-${yearSuffix}-(\\d+)$`))
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > maxSeq) maxSeq = num
    }
  }

  let nextSeq = maxSeq + 1
  let candidate = `${prefix}-${yearSuffix}-${String(nextSeq).padStart(4, '0')}`

  while (existingSet.has(candidate)) {
    nextSeq++
    candidate = `${prefix}-${yearSuffix}-${String(nextSeq).padStart(4, '0')}`
  }

  return candidate
}
