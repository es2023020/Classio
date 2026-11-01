import { PlanTier, BillingCycle } from './types'

export type TutorAccountStatus = 'active' | 'pending_approval' | 'suspended' | 'deleted'

export interface ManagedTutor {
  id: string
  name: string
  name_ar?: string
  email: string
  phone: string
  subject: string
  title: string
  status: TutorAccountStatus
  suspension_reason?: string
  centers: string[]
  student_count: number
  max_students_limit: number
  subscription_plan: PlanTier
  subscription_cycle: BillingCycle
  subscription_expires_at?: string
  created_at: string
  last_active_at: string
  instapay_handle?: string
  vodafone_cash_number?: string
  notes_admin?: string
}

export type AnnouncementType = 'info' | 'warning' | 'urgent' | 'success'

export interface GlobalAnnouncement {
  id: string
  active: boolean
  message: string
  message_ar: string
  type: AnnouncementType
  action_text?: string
  action_text_ar?: string
  action_url?: string
  created_at: string
  expires_at?: string
}

export interface PlatformSystemSettings {
  maintenance_mode: boolean
  maintenance_message: string
  maintenance_message_ar: string
  require_admin_approval: boolean
  allow_tutor_registration: boolean
  whatsapp_gateway_active: boolean
  instapay_reconciliation_active: boolean
  ai_diagnostics_active: boolean
  export_features_active: boolean
  global_announcement: GlobalAnnouncement
}

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical'

export type SubscriptionRequestStatus = 'pending' | 'approved' | 'rejected'

export interface SubscriptionRequest {
  id: string
  tutor_id: string
  tutor_name: string
  tutor_email: string
  plan_id: PlanTier
  billing_cycle: BillingCycle
  amount: number
  payment_method: 'instapay' | 'vodafone_cash' | 'fawry' | 'card'
  transaction_ref: string
  sender_phone?: string
  status: SubscriptionRequestStatus
  requested_at: string
  reviewed_at?: string
  admin_notes?: string
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  actor: string
  action: string
  action_ar: string
  target_type: 'tutor' | 'system' | 'student' | 'financial' | 'security'
  target_id?: string
  details: string
  details_ar?: string
  severity: AuditSeverity
  ip_address?: string
}

export interface SuperAdminSession {
  token: string
  email: string
  role: 'super_admin'
  authenticated_at: string
  expires_at: string
  last_activity_at: string
  is_locked: boolean
}
