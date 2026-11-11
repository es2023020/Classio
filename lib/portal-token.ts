import { Student, AttendanceRecord, PaymentRecord, AssessmentRecord, TutorProfile } from './types'
import { storage } from './storage'

export interface SanitizedParentPortalData {
  student: {
    id: string
    name: string
    name_ar?: string
    name_en?: string
    student_code: string
    school?: string
    grade?: string
    group_name: string
    monthly_fee: number
    paid_this_month: boolean
    paid_amount?: number
    attendance_rate?: number
    homework_rate?: number
    trajectory?: string
    target_goal?: string
    parent_relation?: string
    parent_phone_masked: string
    parent_note?: string
    parent_note_updated_at?: string
  }
  tutor: {
    name: string
    title: string
    subject: string
    phone: string
    instapay_handle?: string
    vodafone_cash_number?: string
  }
  attendanceHistory: {
    id: string
    lesson_date: string
    status: string
    homework_done: boolean
    homework_quality?: string
    quiz_score?: number | null
    max_quiz_score?: number | null
    notes?: string
  }[]
  paymentHistory: {
    id: string
    month_year: string
    amount: number
    payment_date: string
    method: string
    status: string
    receipt_number: string
  }[]
  assessments: {
    id: string
    title: string
    exam_date: string
    score: number
    max_score: number
    feedback?: string
  }[]
  weakTopics?: {
    topic_name: string
    level: string
    notes?: string
  }[]
}

// Simple deterministic hash for demo token generation
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

export const portalTokenManager = {
  // Generate secure magic token for student link
  generateTokenForStudent(studentId: string, parentPhone = ''): string {
    const salt = 'classio_magic_salt_2026'
    const cleanId = studentId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    const signature = hashString(`${cleanId}_${parentPhone.slice(-4)}_${salt}`)
    return `${cleanId}-${signature}`
  },

  // Parse token to extract student ID
  extractStudentIdFromToken(token: string): string {
    if (!token) return ''
    const parts = token.split('-')
    if (parts.length >= 2) {
      // Reconstruct student id prefix
      return parts[0]
    }
    return token
  },

  // Get full sanitized data for parent portal
  async getPortalData(tokenOrId: string): Promise<SanitizedParentPortalData | null> {
    const students = await storage.getStudents()
    const targetId = this.extractStudentIdFromToken(tokenOrId).toLowerCase()

    // Find student matching token or id or student_code
    const student = students.find((s) => {
      const sId = s.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
      const sCode = s.student_code.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
      return (
        s.id.toLowerCase() === tokenOrId.toLowerCase() ||
        s.student_code.toLowerCase() === tokenOrId.toLowerCase() ||
        sId === targetId ||
        sCode === targetId ||
        tokenOrId.toLowerCase().startsWith(sId)
      )
    })

    if (!student) return null

    // Fetch tutor and histories
    const [tutor, allAttendance, allPayments, allAssessments] = await Promise.all([
      storage.getProfile(),
      storage.getAttendance(student.id),
      storage.getPayments(student.id),
      storage.getAssessments(student.id),
    ])

    // Mask phone e.g. 010****5678
    const rawPhone = student.parent_phone || '01000000000'
    const maskedPhone =
      rawPhone.length > 6
        ? `${rawPhone.substring(0, 3)}****${rawPhone.substring(rawPhone.length - 4)}`
        : '010****0000'

    return {
      student: {
        id: student.id,
        name: student.name,
        name_ar: student.name_ar,
        name_en: student.name_en,
        student_code: student.student_code,
        school: student.school,
        grade: student.grade,
        group_name: student.group_name,
        monthly_fee: student.monthly_fee || 850,
        paid_this_month: student.paid_this_month,
        paid_amount: student.paid_amount || 0,
        attendance_rate: student.attendance_rate || 94,
        homework_rate: student.homework_rate || 90,
        trajectory: student.trajectory || 'improving',
        target_goal: student.target_goal || 'التفوق في الثانوية العامة',
        parent_relation: student.parent_relation || 'ولي الأمر',
        parent_phone_masked: maskedPhone,
        parent_note: student.parent_note || '',
        parent_note_updated_at: student.parent_note_updated_at,
      },
      tutor: {
        name: tutor.name,
        title: tutor.title,
        subject: tutor.subject,
        phone: tutor.phone,
        instapay_handle: tutor.instapay_handle || 'tutor@instapay',
        vodafone_cash_number: tutor.vodafone_cash_number || tutor.phone,
      },
      attendanceHistory: allAttendance.map((a) => ({
        id: a.id,
        lesson_date: a.lesson_date,
        status: a.status,
        homework_done: a.homework_done,
        homework_quality: a.homework_quality,
        quiz_score: a.quiz_score,
        max_quiz_score: a.max_quiz_score,
        notes: a.notes,
      })),
      paymentHistory: allPayments.map((p) => ({
        id: p.id,
        month_year: p.month_year,
        amount: p.amount,
        payment_date: p.payment_date,
        method: p.method,
        status: p.status,
        receipt_number: p.receipt_number,
      })),
      assessments: allAssessments.map((ass) => ({
        id: ass.id,
        title: ass.title,
        exam_date: ass.exam_date,
        score: ass.score,
        max_score: ass.max_score,
        feedback: ass.feedback,
      })),
      weakTopics: student.weak_topics?.map((w) => ({
        topic_name: w.topic_name,
        level: w.level,
        notes: w.notes,
      })),
    }
  },

  // Verify parent phone challenge (last 4 digits)
  async verifyParentPhoneDigits(tokenOrId: string, enteredDigits: string): Promise<boolean> {
    const students = await storage.getStudents()
    const targetId = this.extractStudentIdFromToken(tokenOrId).toLowerCase()

    const student = students.find((s) => {
      const sId = s.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
      return s.id.toLowerCase() === tokenOrId.toLowerCase() || sId === targetId
    })

    if (!student) return false
    const cleanEntered = (enteredDigits || '').trim().replace(/\D/g, '')
    const phone = (student.parent_phone || '').replace(/\D/g, '')
    if (phone.length < 4) return true // fallback if no phone registered
    return phone.endsWith(cleanEntered)
  },
}
