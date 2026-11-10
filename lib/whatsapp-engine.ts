import { Student, TutorProfile, PaymentRecord, Group } from './types'
import { portalTokenManager } from './portal-token'

export interface WhatsAppMessagePayload {
  recipientPhone: string
  recipientName: string
  studentName: string
  messageText: string
  type: 'absence' | 'payment_reminder' | 'receipt' | 'progress_report'
  portalUrl: string
}

export const whatsAppEngine = {
  // Format Egyptian phone to international WhatsApp standard: +2010...
  formatPhoneForWhatsApp(phone: string): string {
    const clean = (phone || '').replace(/\D/g, '')
    if (clean.startsWith('20')) return clean
    if (clean.startsWith('0')) return `2${clean}`
    if (clean.length === 10 && clean.startsWith('1')) return `20${clean}`
    return clean
  },

  // Get base URL for Parent Portal
  getPortalUrl(studentId: string, parentPhone = ''): string {
    const token = portalTokenManager.generateTokenForStudent(studentId, parentPhone)
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/portal/${token}`
    }
    return `https://classio.app/portal/${token}`
  },

  // 1. Compose Absence Notification Message
  composeAbsenceAlert(student: Student, tutor: TutorProfile, group?: Group, date?: string): WhatsAppMessagePayload {
    const today = date || new Date().toISOString().split('T')[0]
    const center = group?.center_name || 'السنتر'
    const portalUrl = this.getPortalUrl(student.id, student.parent_phone)

    const text =
      `السلام عليكم ورحمة الله وبركاته،\n` +
      `تحية طيبة من أستاذ ${tutor.name} (${tutor.subject}).\n\n` +
      `نود إحاطة عنايتكم بتغيب الطالب (${student.name}) عن حصة اليوم بتاريخ ${today} بـ (${center}).\n\n` +
      `حرصاً على مستواه الدراسي ومتابعة المنهج، يرجى التواصل معنا للتنسيق لحضور الحصة البديلة وتدارك ما فاته.\n\n` +
      `📱 لمتابعة سجل الحضور والواجبات الخاص بالطالب:\n${portalUrl}\n\n` +
      `مع تمنياتنا للطالب بدوام التوفيق والتميز.`

    return {
      recipientPhone: this.formatPhoneForWhatsApp(student.parent_phone),
      recipientName: student.parent_name || student.parent_relation || 'ولي الأمر',
      studentName: student.name,
      messageText: text,
      type: 'absence',
      portalUrl,
    }
  },

  // 2. Compose Payment Due / Reminder Message
  composePaymentReminder(student: Student, tutor: TutorProfile, monthYear?: string): WhatsAppMessagePayload {
    const month = monthYear || 'الشهر الحالي'
    const feeAmount = typeof student.monthly_fee === 'number' && student.monthly_fee > 0 
      ? student.monthly_fee 
      : (tutor.default_monthly_fee || 0)
    const amountText = feeAmount > 0 ? `${feeAmount} ج.م` : 'المصروفات المقررة'
    const portalUrl = this.getPortalUrl(student.id, student.parent_phone)

    const paymentMethods: string[] = []
    if (tutor.instapay_handle) {
      paymentMethods.push(`• إنستاباي (InstaPay): ${tutor.instapay_handle}`)
    }
    if (tutor.vodafone_cash_number || tutor.phone) {
      paymentMethods.push(`• محفظة فودافون كاش: ${tutor.vodafone_cash_number || tutor.phone}`)
    }
    paymentMethods.push(`• أو نقداً بسكرتارية السنتر في موعد الحصة القادمة`)

    const text =
      `السلام عليكم ورحمة الله وبركاته،\n` +
      `ولي أمر الطالب العزيز (${student.name})، تحية طيبة من مكتب أستاذ ${tutor.name}.\n\n` +
      `نود تذكيركم بلطف بمصروفات مادة (${tutor.subject || 'المادة الدراسية'}) عن شهر (${month}) وقدرها: ${amountText}.\n\n` +
      `💳 يمكنكم التحويل عبر الوسائل التالية:\n` +
      `${paymentMethods.join('\n')}\n\n` +
      `🔗 رابط تفاصيل حساب الطالب والسداد الإلكتروني:\n${portalUrl}\n\n` +
      `شكراً جزيلاً لتعاونكم ودعمكم المستمر.`

    return {
      recipientPhone: this.formatPhoneForWhatsApp(student.parent_phone),
      recipientName: student.parent_name || 'ولي الأمر',
      studentName: student.name,
      messageText: text,
      type: 'payment_reminder',
      portalUrl,
    }
  },

  // 3. Compose Official Payment Receipt Notification
  composePaymentReceipt(student: Student, tutor: TutorProfile, payment: PaymentRecord): WhatsAppMessagePayload {
    const portalUrl = this.getPortalUrl(student.id, student.parent_phone)

    const text =
      `السلام عليكم ورحمة الله،\n` +
      `تم بحمد الله استلام وتأكيد سداد مبلغ (${payment.amount} ج.م) للطالب (${student.name}) عن (${payment.month_year}).\n\n` +
      `🧾 رقم الإيصال الإلكتروني: ${payment.receipt_number}\n` +
      `📅 تاريخ السداد: ${payment.payment_date}\n` +
      `💳 طريقة الدفع: ${payment.method === 'vodafone_cash' ? 'فودافون كاش' : payment.method === 'instapay' ? 'إنستاباي' : 'نقدي بالسنتر'}\n\n` +
      `📄 يمكنكم استعراض وتحميل الإيصال الرقمي عبر الرابط:\n${portalUrl}\n\n` +
      `شكراً لالتزامكم، مع أطيب تحيات أستاذ ${tutor.name}.`

    return {
      recipientPhone: this.formatPhoneForWhatsApp(student.parent_phone),
      recipientName: student.parent_name || 'ولي الأمر',
      studentName: student.name,
      messageText: text,
      type: 'receipt',
      portalUrl,
    }
  },

  // 4. Compose Comprehensive Academic Report Card
  composeProgressReport(student: Student, tutor: TutorProfile): WhatsAppMessagePayload {
    const portalUrl = this.getPortalUrl(student.id, student.parent_phone)
    const attRateText = typeof student.attendance_rate === 'number' ? `${student.attendance_rate}%` : 'قيد التسجيل'
    const hwRateText = typeof student.homework_rate === 'number' ? `${student.homework_rate}%` : 'قيد التسجيل'
    const quizScoreText = student.last_quiz_score ? student.last_quiz_score : 'سيتم التحديث بعد أقرب تقييم'
    const noteText = student.notes ? `\n💡 ملاحظة الأستاذ: ${student.notes}` : ''

    const text =
      `السلام عليكم ورحمة الله،\n` +
      `تقرير المتابعة الأكاديمية للطالب (${student.name}) في مادة (${tutor.subject || 'المادة الدراسية'}):\n\n` +
      `📈 نسبة الحضور والانتظام: ${attRateText}\n` +
      `📝 نسبة تسليم الواجبات: ${hwRateText}\n` +
      `🎯 آخر تقييم: ${quizScoreText}${noteText}\n\n` +
      `🔍 للاطلاع على التقرير المفصل ومصفوفة إتقان الدروس:\n${portalUrl}\n\n` +
      `خالص تحياتنا، أستاذ ${tutor.name}.`

    return {
      recipientPhone: this.formatPhoneForWhatsApp(student.parent_phone),
      recipientName: student.parent_name || 'ولي الأمر',
      studentName: student.name,
      messageText: text,
      type: 'progress_report',
      portalUrl,
    }
  },

  // Launch WhatsApp directly in browser or app
  sendViaWhatsApp(payload: WhatsAppMessagePayload): void {
    const encoded = encodeURIComponent(payload.messageText)
    const url = `https://wa.me/${payload.recipientPhone}?text=${encoded}`
    if (typeof window !== 'undefined') {
      window.open(url, '_blank')
    }
  },
}
