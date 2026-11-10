import { describe, it, expect } from 'vitest'
import {
  generateUniqueStudentCode,
  formatEgyptPhoneForWhatsApp,
  formatEGP,
} from '../egyptian-helpers'
import { whatsAppEngine } from '../whatsapp-engine'

describe('Egyptian Helpers & Student Code Generator', () => {
  it('formats Egyptian mobile numbers correctly for WhatsApp', () => {
    expect(formatEgyptPhoneForWhatsApp('01012345678')).toBe('201012345678')
    expect(formatEgyptPhoneForWhatsApp('201123456789')).toBe('201123456789')
    expect(formatEgyptPhoneForWhatsApp('+20 12 3456 7890')).toBe('201234567890')
    expect(formatEgyptPhoneForWhatsApp('')).toBe('')
  })

  it('formats Egyptian Pounds accurately', () => {
    expect(formatEGP(500, true)).toContain('٥٠٠')
    expect(formatEGP(500, false)).toContain('500 EGP')
  })

  it('generates collision-proof sequential student codes', () => {
    const yearSuffix = new Date().getFullYear().toString().slice(-2)
    const existing = [`STD-${yearSuffix}-0101`, `STD-${yearSuffix}-0102`]

    const code1 = generateUniqueStudentCode(existing)
    expect(code1).toBe(`STD-${yearSuffix}-0103`)

    // Handles gaps and ensures uniqueness
    const code2 = generateUniqueStudentCode([`STD-${yearSuffix}-0105`])
    expect(code2).toBe(`STD-${yearSuffix}-0106`)
  })
})

describe('WhatsApp Notification Engine', () => {
  it('formats reminder without fabricating fallback prices', () => {
    const student: any = {
      id: 'std-1',
      name: 'عمر مصطفى',
      student_code: 'STD-26-0101',
      parent_phone: '01012345678',
      monthly_fee: 600,
    }
    const tutor: any = {
      name: 'أحمد محمود',
      subject: 'فيزياء',
      phone: '01099887766',
      instapay_handle: 'ahmed@instapay',
    }

    const payload = whatsAppEngine.composePaymentReminder(student, tutor, 'أكتوبر ٢٠٢٦')
    expect(payload.recipientPhone).toBe('201012345678')
    expect(payload.messageText).toContain('600 ج.م')
    expect(payload.messageText).toContain('ahmed@instapay')
    // Must NOT contain old hardcoded mock handle
    expect(payload.messageText).not.toContain('sayed017@instapay')
  })
})
