import { PlanTier } from './types'
import { PRICING_PLANS } from './plans'

export interface PlanLimitCheckResult {
  allowed: boolean
  currentCount: number
  maxLimit: number
  currentPlan: PlanTier
  requiredPlan?: PlanTier
  message: string
  messageAr: string
}

export const PLAN_LIMITS: Record<string, number> = {
  free: 9,
  starter: 30,
  growth: 75,
  pro: 150,
  power: 300,
  elite: 600,
  academy: 600, // alias for elite
}

export const planGates = {
  // Normalize plan id
  normalizePlan(plan?: string): PlanTier {
    const p = (plan || 'free').toLowerCase()
    if (p === 'academy') return 'elite' as PlanTier
    return (p as PlanTier) || 'free'
  },

  // Get max student limit for plan
  getStudentLimit(plan?: string): number {
    const normalized = this.normalizePlan(plan)
    return PLAN_LIMITS[normalized] || 9
  },

  // 1. Hard Student Limit Check (Cannot add student beyond plan limit)
  checkCanAddStudent(currentStudentCount: number, currentPlan?: string, addingCount = 1): PlanLimitCheckResult {
    const plan = this.normalizePlan(currentPlan)
    const limit = this.getStudentLimit(plan)
    const newTotal = currentStudentCount + addingCount

    if (newTotal > limit) {
      const planObj = PRICING_PLANS.find((p) => p.id === plan) || PRICING_PLANS[0]
      return {
        allowed: false,
        currentCount: currentStudentCount,
        maxLimit: limit,
        currentPlan: plan,
        message: `Your current ${planObj.name} plan is strictly capped at ${limit} active students (You currently have ${currentStudentCount}). Please upgrade to enroll more students.`,
        messageAr: `وصلت للحد الأقصى المسموح به في خطة (${planObj.nameAr}): ${limit} طلاب (لديك حالياً ${currentStudentCount} طالب). يرجى ترقية باقتك لإضافة طلاب جدد.`,
      }
    }

    return {
      allowed: true,
      currentCount: currentStudentCount,
      maxLimit: limit,
      currentPlan: plan,
      message: 'Allowed',
      messageAr: 'مسموح',
    }
  },

  // 2. Schedule & Timetable Gate (Starter 99 EGP and above)
  canAccessSchedule(plan?: string): boolean {
    const p = this.normalizePlan(plan)
    return p !== 'free'
  },

  // 3. Lesson Plans & Homework Notebook (Growth 299 EGP and above)
  canAccessLessons(plan?: string): boolean {
    const p = this.normalizePlan(plan)
    return ['growth', 'pro', 'power', 'elite'].includes(p)
  },

  // 4. Student Success Profiles & Mastery Matrix (Growth 299 EGP and above)
  canAccessSuccessProfile(plan?: string): boolean {
    const p = this.normalizePlan(plan)
    return ['growth', 'pro', 'power', 'elite'].includes(p)
  },

  // 5. Parent Magic Portal Links (Growth 299 EGP and above)
  canAccessParentPortal(plan?: string): boolean {
    const p = this.normalizePlan(plan)
    return ['growth', 'pro', 'power', 'elite'].includes(p)
  },

  // 6. Advanced Financial Reports & Revenue Analytics (Pro 449 EGP and above)
  canAccessReports(plan?: string): boolean {
    const p = this.normalizePlan(plan)
    return ['pro', 'power', 'elite'].includes(p)
  },

  // 7. Bulk Excel Import (Pro 449 EGP and above)
  canAccessExcelBulkImport(plan?: string): boolean {
    const p = this.normalizePlan(plan)
    return ['pro', 'power', 'elite'].includes(p)
  },

  // 8. Batch WhatsApp Dispatch Queue to All Parents (Elite 999 EGP exclusive)
  canAccessBatchWhatsApp(plan?: string): boolean {
    const p = this.normalizePlan(plan)
    return p === 'elite'
  },
}
