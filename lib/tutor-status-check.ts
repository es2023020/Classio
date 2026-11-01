import { adminStorage } from './admin-storage'
import { adminAuth } from './admin-auth'
import { ManagedTutor, PlatformSystemSettings } from './admin-types'

export interface TutorStatusCheckResult {
  isAllowed: boolean
  isMaintenance: boolean
  isSuspended: boolean
  isPendingApproval: boolean
  suspensionReason?: string
  maintenanceMessage?: string
  maintenanceMessageAr?: string
  managedTutor?: ManagedTutor
  settings: PlatformSystemSettings
  isImpersonated: boolean
}

export function checkTutorAccess(tutorEmailOrId?: string): TutorStatusCheckResult {
  const settings = adminStorage.getSettings()
  const impersonatedId = adminAuth.getImpersonatedTutor()
  const isImpersonated = Boolean(impersonatedId)

  // Super Admin Impersonation bypasses maintenance mode
  if (settings.maintenance_mode && !isImpersonated) {
    return {
      isAllowed: false,
      isMaintenance: true,
      isSuspended: false,
      isPendingApproval: false,
      maintenanceMessage: settings.maintenance_message,
      maintenanceMessageAr: settings.maintenance_message_ar,
      settings,
      isImpersonated: false,
    }
  }

  // Determine which tutor to check
  const targetId = impersonatedId || tutorEmailOrId || 'tutor-1'
  const tutor = adminStorage.getTutorById(targetId)

  if (tutor) {
    if (tutor.status === 'suspended') {
      return {
        isAllowed: false,
        isMaintenance: false,
        isSuspended: true,
        isPendingApproval: false,
        suspensionReason: tutor.suspension_reason,
        managedTutor: tutor,
        settings,
        isImpersonated,
      }
    }

    if (tutor.status === 'pending_approval') {
      return {
        isAllowed: false,
        isMaintenance: false,
        isSuspended: false,
        isPendingApproval: true,
        managedTutor: tutor,
        settings,
        isImpersonated,
      }
    }
  }

  return {
    isAllowed: true,
    isMaintenance: false,
    isSuspended: false,
    isPendingApproval: false,
    managedTutor: tutor,
    settings,
    isImpersonated,
  }
}
