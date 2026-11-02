import {
  ManagedTutor,
  PlatformSystemSettings,
  AuditLogEntry,
  GlobalAnnouncement,
  SubscriptionRequest,
} from './admin-types'
import { PlanTier, BillingCycle, Student, Group, PaymentRecord } from './types'
import { initialProfile, initialStudents, initialGroups, initialPayments } from './storage'
import { PLAN_LIMITS } from './plan-gates'
import { getSupabase, isSupabaseConfigured } from './supabase'

const ADMIN_STORAGE_KEYS = {
  TUTORS: 'classio_admin_tutors_list_v1',
  SETTINGS: 'classio_admin_system_settings_v1',
  AUDIT_LOGS: 'classio_admin_audit_logs_v1',
  SUBSCRIPTION_REQUESTS: 'classio_admin_sub_requests_v1',
}

// Zero-template clean initial arrays — only real data
export const initialSubscriptionRequests: SubscriptionRequest[] = []

export const initialManagedTutors: ManagedTutor[] = []

export const initialSystemSettings: PlatformSystemSettings = {
  maintenance_mode: false,
  maintenance_message: 'Classio platform is undergoing routine server maintenance. We will be back online shortly.',
  maintenance_message_ar: 'منصة كلاسيو تخضع لأعمال ترقية وصيانة مجدولة. سنعود للعمل بكامل الكفاءة خلال دقائق.',
  require_admin_approval: true,
  allow_tutor_registration: true,
  whatsapp_gateway_active: true,
  instapay_reconciliation_active: true,
  ai_diagnostics_active: true,
  export_features_active: true,
  global_announcement: {
    id: 'ann-1',
    active: true,
    message: 'Welcome to the new Classio Academic Season 2026/2027! New student progress tracking features are now live.',
    message_ar: 'أهلاً بكم في الموسم الدراسي الجديد! تم إطلاق ميزة المتابعة التربوية للطلاب وتحليلات الأداء بنجاح.',
    type: 'info',
    action_text: 'View Updates',
    action_text_ar: 'تفاصيل التحديث',
    action_url: '#',
    created_at: new Date().toISOString(),
  },
}

export const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    actor: 'Super Admin (Master Root)',
    action: 'Platform Bootstrapped',
    action_ar: 'تهيئة المنصة وإطلاق الخوادم',
    target_type: 'system',
    details: 'Master security fortress initialized with encrypted zero-trust gatekeeping.',
    details_ar: 'تم تشغيل حواجز الأمان المشفرة وغرفة العمليات المركزية.',
    severity: 'low',
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    actor: 'Super Admin (Master Root)',
    action: 'Tutor Subscription Upgraded',
    action_ar: 'ترقية باقة مدرس إلى أكاديمي',
    target_type: 'tutor',
    target_id: 'tutor-2',
    details: 'Upgraded Dr. Sara Nabil to Annual Academy tier (Limit: 500 students).',
    details_ar: 'تم ترقية حساب د. سارة نبيل إلى باقة الأكاديمية السنوية (سعة 500 طالب).',
    severity: 'medium',
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    actor: 'Super Admin (Master Root)',
    action: 'Tutor Account Suspended',
    action_ar: 'إيقاف وتجميد حساب مدرس',
    target_type: 'tutor',
    target_id: 'tutor-4',
    details: 'Suspended Tarek El-Sayed due to payment delinquency.',
    details_ar: 'تم إيقاف حساب طارق السيد لتأخر سداد الاشتراك.',
    severity: 'high',
  },
]

export const adminStorage = {
  // --- Helpers ---
  readLocal<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : fallback
    } catch {
      return fallback
    }
  },

  writeLocal<T>(key: string, val: T): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(val))
    } catch (e) {
      console.error('Failed to write to localStorage:', key, e)
    }
  },

  // --- Tutors Management ---
  async syncTutorToSupabase(tutor: ManagedTutor, isDelete = false): Promise<void> {
    if (!isSupabaseConfigured()) return
    const client = getSupabase()
    if (!client) return
    try {
      if (isDelete) {
        await client.from('tutors').delete().eq('id', tutor.id)
      } else {
        await client.from('tutors').upsert({
          id: tutor.id,
          name: tutor.name,
          name_ar: tutor.name_ar,
          email: tutor.email,
          phone: tutor.phone,
          subject: tutor.subject,
          title: tutor.title,
          subscription_plan: tutor.subscription_plan,
          subscription_cycle: tutor.subscription_cycle,
          max_students_limit: tutor.max_students_limit,
          subscription_status: tutor.subscription_status,
          subscription_starts_at: tutor.subscription_starts_at,
          subscription_expires_at: tutor.subscription_expires_at,
          payment_submitted_at: tutor.payment_submitted_at,
          activated_at: tutor.activated_at,
          center_names: tutor.centers,
          instapay_handle: tutor.instapay_handle,
          vodafone_cash_number: tutor.vodafone_cash_number,
        })
      }
    } catch (e) {
      console.warn('Failed to sync tutor with Supabase:', e)
    }
  },

  async getTutorsAsync(): Promise<ManagedTutor[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabase()
      if (client) {
        try {
          const { data } = await client.from('tutors').select('*').order('created_at', { ascending: false })
          if (data && data.length > 0) {
            const mapped: ManagedTutor[] = data.map((r: any) => ({
              id: r.id,
              name: r.name,
              name_ar: r.name_ar || r.name,
              email: r.email,
              phone: r.phone || '',
              subject: r.subject || 'عام',
              title: r.title || 'معلم خاص',
              status: (r.status || (r.subscription_status === 'pending' ? 'pending_approval' : 'active')) as any,
              centers: r.center_names || ['السنتر الرئيسي'],
              student_count: r.student_count || 0,
              max_students_limit: r.max_students_limit || 10,
              subscription_plan: r.subscription_plan || 'free',
              subscription_cycle: r.subscription_cycle || 'monthly',
              subscription_status: r.subscription_status || 'free',
              subscription_starts_at: r.subscription_starts_at,
              subscription_expires_at: r.subscription_expires_at,
              payment_submitted_at: r.payment_submitted_at,
              activated_at: r.activated_at,
              created_at: r.created_at,
              last_active_at: r.updated_at || r.created_at,
              instapay_handle: r.instapay_handle,
              vodafone_cash_number: r.vodafone_cash_number,
              notes_admin: r.notes_admin,
            }))
            this.saveTutors(mapped)
            return mapped
          }
        } catch (e) {
          console.warn('Supabase tutors query error:', e)
        }
      }
    }
    return this.getTutors()
  },

  getTutors(): ManagedTutor[] {
    return this.readLocal(ADMIN_STORAGE_KEYS.TUTORS, initialManagedTutors)
  },

  saveTutors(tutors: ManagedTutor[]): void {
    this.writeLocal(ADMIN_STORAGE_KEYS.TUTORS, tutors)
  },

  getTutorById(id: string): ManagedTutor | undefined {
    const tutors = this.getTutors()
    return tutors.find((t) => t.id === id || t.email.toLowerCase() === id.toLowerCase())
  },

  // Admit / Approve a tutor
  admitTutor(tutorId: string): ManagedTutor | null {
    const tutors = this.getTutors()
    const tutor = tutors.find((t) => t.id === tutorId)
    if (!tutor) return null

    tutor.status = 'active'
    delete tutor.suspension_reason
    this.saveTutors(tutors)
    this.syncTutorToSupabase(tutor)
    this.syncTutorToSupabase(tutor)

    this.logAuditEvent(
      'Tutor Admitted & Approved',
      `تم قبول وتفعيل حساب المدرس (${tutor.name}) رسمياً في المنصة.`,
      'tutor',
      tutor.id,
      'medium',
      `Admitted tutor ${tutor.name} (${tutor.email}) to active status.`
    )
    return tutor
  },

  // Bend / Suspend a tutor
  suspendTutor(tutorId: string, reason: string): ManagedTutor | null {
    const tutors = this.getTutors()
    const tutor = tutors.find((t) => t.id === tutorId)
    if (!tutor) return null

    tutor.status = 'suspended'
    tutor.suspension_reason = reason || 'تم إيقاف الحساب بقرار من الإدارة العليا.'
    this.saveTutors(tutors)
    this.syncTutorToSupabase(tutor)

    this.logAuditEvent(
      'Tutor Account Suspended',
      `تم إيقاف وتجميد حساب المدرس (${tutor.name}) - السبب: ${reason}`,
      'tutor',
      tutor.id,
      'high',
      `Suspended tutor ${tutor.name} (${tutor.email}). Reason: ${reason}`
    )
    return tutor
  },

  // Reinstate a suspended tutor
  reinstateTutor(tutorId: string): ManagedTutor | null {
    const tutors = this.getTutors()
    const tutor = tutors.find((t) => t.id === tutorId)
    if (!tutor) return null

    tutor.status = 'active'
    delete tutor.suspension_reason
    this.saveTutors(tutors)
    this.syncTutorToSupabase(tutor)

    this.logAuditEvent(
      'Tutor Reinstated',
      `تم رفع الإيقاف وإعادة تفعيل حساب المدرس (${tutor.name}).`,
      'tutor',
      tutor.id,
      'medium',
      `Reinstated tutor ${tutor.name} (${tutor.email}) back to active status.`
    )
    return tutor
  },

  // Update tutor plan & student limit
  updateTutorPlan(
    tutorId: string,
    plan: PlanTier,
    cycle: BillingCycle,
    maxLimit?: number,
    extensionMonths = 1
  ): ManagedTutor | null {
    const tutors = this.getTutors()
    const tutor = tutors.find((t) => t.id === tutorId)
    if (!tutor) return null

    tutor.subscription_plan = plan
    tutor.subscription_cycle = cycle

    const limit = maxLimit || PLAN_LIMITS[plan] || 30
    tutor.max_students_limit = limit

    // Extend expiry
    const now = new Date()
    now.setMonth(now.getMonth() + extensionMonths)
    tutor.subscription_expires_at = now.toISOString()
    tutor.subscription_status = plan === 'free' ? 'free' : 'active'
    if (!tutor.activated_at) tutor.activated_at = new Date().toISOString()

    this.saveTutors(tutors)
    this.syncTutorToSupabase(tutor)

    this.logAuditEvent(
      'Tutor Subscription Updated',
      `تم تحديث باقة المدرس (${tutor.name}) إلى [${plan.toUpperCase()}] بحد أقصى ${tutor.max_students_limit} طالب.`,
      'tutor',
      tutor.id,
      'medium',
      `Updated tutor ${tutor.name} plan to ${plan} (${cycle}) with limit ${tutor.max_students_limit}.`
    )
    return tutor
  },

  // Activate a tutor subscription after payment is verified by admin.
  // Grace period: subscription starts 3 days after payment_submitted_at.
  // Monthly plan: 30 days from start. Annual plan: 365 days from start.
  activateTutorSubscription(
    tutorId: string,
    plan: PlanTier,
    cycle: BillingCycle,
    maxLimit?: number
  ): ManagedTutor | null {
    const tutors = this.getTutors()
    const tutor = tutors.find(
      (t) => t.id === tutorId || t.email.toLowerCase() === tutorId.toLowerCase()
    )
    if (!tutor) return null

    const limit = maxLimit || PLAN_LIMITS[plan] || 30
    const now = new Date()

    // Grace: start 3 days after payment submission (or now if not recorded)
    const baseDate = tutor.payment_submitted_at
      ? new Date(tutor.payment_submitted_at)
      : now
    const startsAt = new Date(baseDate)
    startsAt.setDate(startsAt.getDate() + 3)

    // Expiry: 30 days (monthly) or 365 days (annual) from start
    const expiresAt = new Date(startsAt)
    expiresAt.setDate(expiresAt.getDate() + (cycle === 'annual' ? 365 : 30))

    tutor.subscription_plan = plan
    tutor.subscription_cycle = cycle
    tutor.max_students_limit = limit
    tutor.subscription_status = 'active'
    tutor.subscription_starts_at = startsAt.toISOString()
    tutor.subscription_expires_at = expiresAt.toISOString()
    tutor.activated_at = now.toISOString()
    tutor.status = 'active'

    this.saveTutors(tutors)
    this.syncTutorToSupabase(tutor)

    this.logAuditEvent(
      'Subscription Activated',
      `تم تفعيل اشتراك المدرس (${tutor.name}) - الباقة: [${plan.toUpperCase()}] (${cycle}) - يبدأ: ${startsAt.toLocaleDateString('ar-EG')} - ينتهي: ${expiresAt.toLocaleDateString('ar-EG')}`,
      'financial',
      tutor.id,
      'high',
      `Activated: ${tutor.name} (${tutor.email}) Plan ${plan} (${cycle}), starts ${startsAt.toISOString()}, expires ${expiresAt.toISOString()}, limit ${limit}`
    )
    return tutor
  },

  // Delete tutor permanently
  deleteTutor(tutorId: string): boolean {
    const tutors = this.getTutors()
    const tutor = tutors.find((t) => t.id === tutorId)
    if (!tutor) return false

    const filtered = tutors.filter((t) => t.id !== tutorId)
    this.saveTutors(filtered)
    this.syncTutorToSupabase(tutor, true)

    this.logAuditEvent(
      'Tutor Permanently Deleted',
      `تم حذف حساب المدرس (${tutor.name}) نهائياً من قاعدة بيانات المنصة.`,
      'tutor',
      tutor.id,
      'critical',
      `Permanently deleted tutor ${tutor.name} (${tutor.email}).`
    )
    return true
  },

  // --- Subscription Requests & Verification Queue ---
  getSubscriptionRequests(): SubscriptionRequest[] {
    return this.readLocal(ADMIN_STORAGE_KEYS.SUBSCRIPTION_REQUESTS, initialSubscriptionRequests)
  },

  saveSubscriptionRequests(requests: SubscriptionRequest[]): void {
    this.writeLocal(ADMIN_STORAGE_KEYS.SUBSCRIPTION_REQUESTS, requests)
  },

  submitSubscriptionRequest(requestData: Omit<SubscriptionRequest, 'id' | 'status' | 'requested_at'>): SubscriptionRequest {
    const requests = this.getSubscriptionRequests()
    const newReq: SubscriptionRequest = {
      ...requestData,
      id: `subreq-${Date.now()}`,
      status: 'pending',
      requested_at: new Date().toISOString(),
    }
    const updated = [newReq, ...requests]
    this.saveSubscriptionRequests(updated)

    this.logAuditEvent(
      'New Subscription Payment Submitted',
      `تم استلام إشعار سداد جديد من (${newReq.tutor_name}) لباقة [${newReq.plan_id.toUpperCase()}] بمبلغ ${newReq.amount} ج.م في انتظار التحقق.`,
      'financial',
      newReq.tutor_id,
      'medium',
      `Subscription request submitted by ${newReq.tutor_name} (${newReq.payment_method}) Ref: ${newReq.transaction_ref}`
    )
    return newReq
  },

  approveSubscriptionRequest(requestId: string): { success: boolean; request?: SubscriptionRequest } {
    const requests = this.getSubscriptionRequests()
    const req = requests.find((r) => r.id === requestId)
    if (!req) return { success: false }

    req.status = 'approved'
    req.reviewed_at = new Date().toISOString()
    this.saveSubscriptionRequests(requests)

    // Apply plan upgrade, student limits & subscription dates strictly to the tutor
    const plan = req.plan_id
    const cycle = req.billing_cycle
    const newLimit = PLAN_LIMITS[plan] || 30

    this.activateTutorSubscription(req.tutor_id, plan, cycle, newLimit)

    this.logAuditEvent(
      'Subscription Payment Verified & Activated',
      `تم التحقق من سداد واشتراك (${req.tutor_name}) وتفعيل باقة [${plan.toUpperCase()}] بسعة ${newLimit} طالب رسمياً.`,
      'financial',
      req.tutor_id,
      'high',
      `Approved subscription request for ${req.tutor_name}: Plan ${plan} (${cycle}) Limit ${newLimit}`
    )
    return { success: true, request: req }
  },

  rejectSubscriptionRequest(requestId: string, reason?: string): boolean {
    const requests = this.getSubscriptionRequests()
    const req = requests.find((r) => r.id === requestId)
    if (!req) return false

    req.status = 'rejected'
    req.reviewed_at = new Date().toISOString()
    req.admin_notes = reason || 'لم يتم العثور على المعاملة المالية في الحساب البنكي'
    this.saveSubscriptionRequests(requests)

    this.logAuditEvent(
      'Subscription Payment Rejected',
      `تم رفض طلب اشتراك (${req.tutor_name}) - السبب: ${req.admin_notes}`,
      'financial',
      req.tutor_id,
      'medium',
      `Rejected subscription request for ${req.tutor_name}. Reason: ${req.admin_notes}`
    )
    return true
  },

  // Create / Register new tutor from public or admin
  registerTutor(
    tutorData: Partial<ManagedTutor> & { name: string; email: string; phone: string; subject: string }
  ): ManagedTutor {
    const tutors = this.getTutors()
    const settings = this.getSettings()

    // Determine initial status based on admin approval policy
    const initialStatus = settings.require_admin_approval ? 'pending_approval' : 'active'

    const newTutor: ManagedTutor = {
      id: `tutor-${Date.now()}`,
      name: tutorData.name,
      name_ar: tutorData.name_ar || tutorData.name,
      email: tutorData.email.toLowerCase().trim(),
      phone: tutorData.phone,
      subject: tutorData.subject,
      title: tutorData.title || 'مدرس',
      status: tutorData.status || initialStatus,
      centers: tutorData.centers || ['السنتر الرئيسي'],
      student_count: 0,
      max_students_limit: tutorData.max_students_limit || PLAN_LIMITS[tutorData.subscription_plan || 'free'] || 10,
      subscription_plan: tutorData.subscription_plan || 'free',
      subscription_cycle: tutorData.subscription_cycle || 'monthly',
      subscription_status: tutorData.subscription_status || (tutorData.subscription_plan === 'free' ? 'free' : 'pending'),
      payment_submitted_at: tutorData.payment_submitted_at,
      subscription_starts_at: tutorData.subscription_starts_at,
      subscription_expires_at: tutorData.subscription_expires_at,
      activated_at: tutorData.activated_at,
      created_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
      instapay_handle: tutorData.instapay_handle,
      vodafone_cash_number: tutorData.vodafone_cash_number,
      notes_admin: tutorData.notes_admin,
    }

    tutors.push(newTutor)
    this.saveTutors(tutors)
    this.syncTutorToSupabase(newTutor)

    this.logAuditEvent(
      'New Tutor Registered',
      `تم تسجيل حساب مدرس جديد (${newTutor.name}) - الحالة: ${newTutor.status}.`,
      'tutor',
      newTutor.id,
      'low',
      `Registered tutor ${newTutor.name} (${newTutor.email}). Status: ${newTutor.status}`
    )
    return newTutor
  },

  // --- Platform Settings & Feature Flags ---
  getSettings(): PlatformSystemSettings {
    return this.readLocal(ADMIN_STORAGE_KEYS.SETTINGS, initialSystemSettings)
  },

  updateSettings(updates: Partial<PlatformSystemSettings>): PlatformSystemSettings {
    const current = this.getSettings()
    const updated = { ...current, ...updates }
    this.writeLocal(ADMIN_STORAGE_KEYS.SETTINGS, updated)

    this.logAuditEvent(
      'System Settings Modified',
      `تم تعديل إعدادات المنصة ومفاتيح التشغيل المركزية.`,
      'system',
      undefined,
      'medium',
      `System settings updated: ${Object.keys(updates).join(', ')}`
    )
    return updated
  },

  setMaintenanceMode(active: boolean, message?: string, messageAr?: string): PlatformSystemSettings {
    const current = this.getSettings()
    current.maintenance_mode = active
    if (message) current.maintenance_message = message
    if (messageAr) current.maintenance_message_ar = messageAr

    this.writeLocal(ADMIN_STORAGE_KEYS.SETTINGS, current)
    this.logAuditEvent(
      active ? 'Emergency Maintenance Mode ENABLED' : 'Maintenance Mode DISABLED',
      active
        ? `⚠️ تم تفعيل وضع الصيانة العام للمنصة وحجب دخول المدرسين.`
        : `✅ تم إيقاف وضع الصيانة وإتاحة المنصة لجميع المستخدمين.`,
      'system',
      undefined,
      active ? 'critical' : 'medium'
    )
    return current
  },

  setGlobalAnnouncement(announcement: GlobalAnnouncement): PlatformSystemSettings {
    const current = this.getSettings()
    current.global_announcement = announcement
    this.writeLocal(ADMIN_STORAGE_KEYS.SETTINGS, current)

    this.logAuditEvent(
      'Global Broadcast Published',
      `تم بث إشعار عام لجميع المدرسين: "${announcement.message_ar || announcement.message}"`,
      'system',
      undefined,
      'medium'
    )
    return current
  },

  // --- Audit Logs ---
  getAuditLogs(): AuditLogEntry[] {
    return this.readLocal(ADMIN_STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs)
  },

  logAuditEvent(
    action: string,
    action_ar: string,
    target_type: AuditLogEntry['target_type'],
    target_id?: string,
    severity: AuditLogEntry['severity'] = 'low',
    details?: string,
    details_ar?: string
  ): void {
    const logs = this.getAuditLogs()
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actor: 'Super Admin (Master Root)',
      action,
      action_ar,
      target_type,
      target_id,
      details: details || action,
      details_ar: details_ar || action_ar,
      severity,
    }
    const updated = [newEntry, ...logs].slice(0, 300) // keep latest 300 entries
    this.writeLocal(ADMIN_STORAGE_KEYS.AUDIT_LOGS, updated)
  },

  clearAuditLogs(): void {
    this.writeLocal(ADMIN_STORAGE_KEYS.AUDIT_LOGS, [])
  },

  // --- Full Platform Telemetry & GMV Aggregation ---
  getPlatformTelemetry() {
    const tutors = this.getTutors()
    const activeTutors = tutors.filter((t) => t.status === 'active')
    const pendingTutors = tutors.filter((t) => t.status === 'pending_approval')
    const suspendedTutors = tutors.filter((t) => t.status === 'suspended')

    // Read students & payments from local storage
    const students: Student[] = this.readLocal('muallemi_students', initialStudents)
    const payments: PaymentRecord[] = this.readLocal('muallemi_payments', initialPayments)
    const groups: Group[] = this.readLocal('muallemi_groups', initialGroups)

    const totalStudents = students.length
    const paidStudents = students.filter((s) => s.paid_this_month).length
    const lateStudents = students.filter((s) => !s.paid_this_month).length

    // Platform GMV in EGP (Gross volume processed through tutors)
    const totalGMV = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const vodafoneCashGMV = payments
      .filter((p) => p.method === 'vodafone_cash')
      .reduce((sum, p) => sum + (p.amount || 0), 0)
    const instapayGMV = payments
      .filter((p) => p.method === 'instapay')
      .reduce((sum, p) => sum + (p.amount || 0), 0)
    const cashGMV = payments
      .filter((p) => p.method === 'cash')
      .reduce((sum, p) => sum + (p.amount || 0), 0)

    // SaaS MRR calculation from tutor plans (starter: 99, pro: 199, academy: 499)
    const planPrices: Record<PlanTier, number> = {
      free: 0,
      starter: 99,
      pro: 199,
      academy: 499,
    }
    const platformMRR = tutors
      .filter((t) => t.status === 'active')
      .reduce((sum, t) => sum + (planPrices[t.subscription_plan] || 0), 0)

    return {
      tutors: {
        total: tutors.length,
        active: activeTutors.length,
        pending: pendingTutors.length,
        suspended: suspendedTutors.length,
      },
      students: {
        total: totalStudents,
        paid: paidStudents,
        late: lateStudents,
      },
      groups: {
        total: groups.length,
      },
      financials: {
        totalGMV,
        vodafoneCashGMV,
        instapayGMV,
        cashGMV,
        platformMRR,
        platformARR: platformMRR * 12,
      },
    }
  },

  // --- Export Database Backup (.json) ---
  exportFullBackup(): string {
    const backup = {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      platform: 'Classio Tutor CRM (Egypt)',
      tutors: this.getTutors(),
      settings: this.getSettings(),
      audit_logs: this.getAuditLogs(),
      students: this.readLocal('muallemi_students', initialStudents),
      groups: this.readLocal('muallemi_groups', initialGroups),
      payments: this.readLocal('muallemi_payments', initialPayments),
    }
    return JSON.stringify(backup, null, 2)
  },

  // --- Restore Database Snapshot ---
  restoreBackup(backupJson: string): boolean {
    try {
      const data = JSON.parse(backupJson)
      if (data.tutors) this.writeLocal(ADMIN_STORAGE_KEYS.TUTORS, data.tutors)
      if (data.settings) this.writeLocal(ADMIN_STORAGE_KEYS.SETTINGS, data.settings)
      if (data.audit_logs) this.writeLocal(ADMIN_STORAGE_KEYS.AUDIT_LOGS, data.audit_logs)
      if (data.students) this.writeLocal('muallemi_students', data.students)
      if (data.groups) this.writeLocal('muallemi_groups', data.groups)
      if (data.payments) this.writeLocal('muallemi_payments', data.payments)

      this.logAuditEvent(
        'Database Restored from Backup',
        'تم استرجاع نسخة احتياطية كاملة لقاعدة بيانات المنصة بنجاح.',
        'system',
        undefined,
        'critical'
      )
      return true
    } catch (e) {
      console.error('Failed to restore backup:', e)
      return false
    }
  },

  // --- Reset to Initial Factory State ---
  resetToFactory(): void {
    this.writeLocal(ADMIN_STORAGE_KEYS.TUTORS, initialManagedTutors)
    this.writeLocal(ADMIN_STORAGE_KEYS.SETTINGS, initialSystemSettings)
    this.writeLocal(ADMIN_STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs)
    this.logAuditEvent(
      'Factory Reset Executed',
      'تم إعادة ضبط جميع بيانات المنصة إلى الإعدادات الأولية للتشغيل.',
      'system',
      undefined,
      'critical'
    )
  },
}
