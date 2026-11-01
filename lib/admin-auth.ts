import { SuperAdminSession } from './admin-types'

// Hardened Master Super-Admin Configurations
export const MASTER_ADMIN_CONFIG = {
  DEFAULT_EMAIL: process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'owner@classio.app',
  DEFAULT_PASSWORD: process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD || 'ClassioRoot#2026!',
  DEFAULT_MASTER_PIN: process.env.NEXT_PUBLIC_SUPER_ADMIN_PIN || '749201',
  DEFAULT_FORTRESS_KEY: process.env.NEXT_PUBLIC_FORTRESS_KEY || 'master-fortress-779',
  SESSION_STORAGE_KEY: 'classio_master_superadmin_session_v1',
  ATTEMPTS_STORAGE_KEY: 'classio_master_failed_attempts_v1',
  LOCKOUT_STORAGE_KEY: 'classio_master_lockout_until_v1',
  IMPERSONATE_STORAGE_KEY: 'classio_impersonated_tutor_id',
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  SESSION_TIMEOUT_MINUTES: 30,
}

export interface AuthChallengeResult {
  success: boolean
  message: string
  messageAr: string
  session?: SuperAdminSession
  requiresPin?: boolean
  lockedUntil?: string
}

export const adminAuth = {
  // Check if browser is currently locked out from brute force
  getLockoutStatus(): { isLocked: boolean; remainingMinutes: number } {
    if (typeof window === 'undefined') return { isLocked: false, remainingMinutes: 0 }
    const lockoutUntilStr = localStorage.getItem(MASTER_ADMIN_CONFIG.LOCKOUT_STORAGE_KEY)
    if (!lockoutUntilStr) return { isLocked: false, remainingMinutes: 0 }
    
    const lockoutUntil = new Date(lockoutUntilStr).getTime()
    const now = Date.now()
    if (now < lockoutUntil) {
      const remainingMinutes = Math.ceil((lockoutUntil - now) / 60000)
      return { isLocked: true, remainingMinutes }
    } else {
      // Lockout expired
      localStorage.removeItem(MASTER_ADMIN_CONFIG.LOCKOUT_STORAGE_KEY)
      localStorage.removeItem(MASTER_ADMIN_CONFIG.ATTEMPTS_STORAGE_KEY)
      return { isLocked: false, remainingMinutes: 0 }
    }
  },

  // Record failed attempt
  recordFailedAttempt(): { remainingAttempts: number; isLocked: boolean } {
    if (typeof window === 'undefined') return { remainingAttempts: 5, isLocked: false }
    const current = parseInt(localStorage.getItem(MASTER_ADMIN_CONFIG.ATTEMPTS_STORAGE_KEY) || '0', 10) + 1
    localStorage.setItem(MASTER_ADMIN_CONFIG.ATTEMPTS_STORAGE_KEY, current.toString())

    if (current >= MASTER_ADMIN_CONFIG.MAX_FAILED_ATTEMPTS) {
      const lockoutUntil = new Date(Date.now() + MASTER_ADMIN_CONFIG.LOCKOUT_DURATION_MINUTES * 60000).toISOString()
      localStorage.setItem(MASTER_ADMIN_CONFIG.LOCKOUT_STORAGE_KEY, lockoutUntil)
      return { remainingAttempts: 0, isLocked: true }
    }
    return { remainingAttempts: Math.max(0, MASTER_ADMIN_CONFIG.MAX_FAILED_ATTEMPTS - current), isLocked: false }
  },

  resetFailedAttempts() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(MASTER_ADMIN_CONFIG.ATTEMPTS_STORAGE_KEY)
    localStorage.removeItem(MASTER_ADMIN_CONFIG.LOCKOUT_STORAGE_KEY)
  },

  // Verify fortress entrance passkey (Stops curiosity scanners and brute-force discovery)
  verifyFortressPasskey(key: string): boolean {
    const trimmed = (key || '').trim()
    return trimmed === MASTER_ADMIN_CONFIG.DEFAULT_FORTRESS_KEY
  },

  // Stage 1: Validate Master Email & Password
  validateCredentials(email: string, pass: string): boolean {
    const cleanEmail = (email || '').trim().toLowerCase()
    return (
      cleanEmail === MASTER_ADMIN_CONFIG.DEFAULT_EMAIL.toLowerCase() &&
      pass === MASTER_ADMIN_CONFIG.DEFAULT_PASSWORD
    )
  },

  // Stage 2: Validate 6-digit Master Security PIN
  validateMasterPin(pin: string): boolean {
    const cleanPin = (pin || '').trim()
    return cleanPin === MASTER_ADMIN_CONFIG.DEFAULT_MASTER_PIN
  },

  // Complete Login and Issue Hardened Master Session
  login(email: string, pass: string, pin: string, fortressKey: string): AuthChallengeResult {
    // 1. Check lockout
    const lockout = this.getLockoutStatus()
    if (lockout.isLocked) {
      return {
        success: false,
        message: `System locked out due to multiple failed attempts. Retry in ${lockout.remainingMinutes} minutes.`,
        messageAr: `تم تجميد الدخول بسبب محاولات خاطئة متعددة. يرجى المحاولة بعد ${lockout.remainingMinutes} دقيقة.`,
        lockedUntil: localStorage.getItem(MASTER_ADMIN_CONFIG.LOCKOUT_STORAGE_KEY) || undefined,
      }
    }

    // 2. Check fortress passkey
    if (!this.verifyFortressPasskey(fortressKey)) {
      const fail = this.recordFailedAttempt()
      return {
        success: false,
        message: `Invalid Fortress Entry Key. (${fail.remainingAttempts} attempts remaining)`,
        messageAr: `رمز مفتاح الدخول المشفر غير صحيح. (متبقي ${fail.remainingAttempts} محاولات)`,
      }
    }

    // 3. Check credentials
    if (!this.validateCredentials(email, pass)) {
      const fail = this.recordFailedAttempt()
      return {
        success: false,
        message: `Invalid master email or root password. (${fail.remainingAttempts} attempts remaining)`,
        messageAr: `البريد الإلكتروني الرئيسي أو كلمة المرور الرئيسية غير صحيحة. (متبقي ${fail.remainingAttempts} محاولات)`,
      }
    }

    // 4. Check 6-digit Security PIN
    if (!this.validateMasterPin(pin)) {
      const fail = this.recordFailedAttempt()
      return {
        success: false,
        message: `Invalid 6-digit Master PIN. (${fail.remainingAttempts} attempts remaining)`,
        messageAr: `رمز الأمان السداسي (PIN) الرئيسي غير صحيح. (متبقي ${fail.remainingAttempts} محاولات)`,
      }
    }

    // Authentication verified! Reset failed attempts
    this.resetFailedAttempts()

    const now = new Date()
    const expiresAt = new Date(now.getTime() + MASTER_ADMIN_CONFIG.SESSION_TIMEOUT_MINUTES * 60000)

    const session: SuperAdminSession = {
      token: `fortress_tok_${Math.random().toString(36).substring(2)}_${Date.now()}`,
      email: MASTER_ADMIN_CONFIG.DEFAULT_EMAIL,
      role: 'super_admin',
      authenticated_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      last_activity_at: now.toISOString(),
      is_locked: false,
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(MASTER_ADMIN_CONFIG.SESSION_STORAGE_KEY, JSON.stringify(session))
    }

    return {
      success: true,
      message: 'Master Super-Admin identity verified. Welcome to the Fortress Command Center.',
      messageAr: 'تم التحقق من هوية السوبر أدمن الرئيسي بنجاح. أهلاً بك في غرفة القيادة والتحكم.',
      session,
    }
  },

  // Get current active session
  getSession(): SuperAdminSession | null {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem(MASTER_ADMIN_CONFIG.SESSION_STORAGE_KEY)
      if (!raw) return null
      const session: SuperAdminSession = JSON.parse(raw)
      
      // Check expiry
      if (new Date().getTime() > new Date(session.expires_at).getTime()) {
        this.logout()
        return null
      }
      return session
    } catch {
      return null
    }
  },

  // Touch session to update last activity
  touchActivity() {
    const session = this.getSession()
    if (!session || session.is_locked) return
    const now = new Date()
    session.last_activity_at = now.toISOString()
    session.expires_at = new Date(now.getTime() + MASTER_ADMIN_CONFIG.SESSION_TIMEOUT_MINUTES * 60000).toISOString()
    if (typeof window !== 'undefined') {
      localStorage.setItem(MASTER_ADMIN_CONFIG.SESSION_STORAGE_KEY, JSON.stringify(session))
    }
  },

  // Lock session (screen lock)
  lockSession() {
    const session = this.getSession()
    if (!session) return
    session.is_locked = true
    if (typeof window !== 'undefined') {
      localStorage.setItem(MASTER_ADMIN_CONFIG.SESSION_STORAGE_KEY, JSON.stringify(session))
    }
  },

  // Unlock with Master PIN
  unlockWithPin(pin: string): boolean {
    if (!this.validateMasterPin(pin)) {
      return false
    }
    const session = this.getSession()
    if (!session) return false
    session.is_locked = false
    this.touchActivity()
    return true
  },

  // Logout / Terminate Session
  logout() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(MASTER_ADMIN_CONFIG.SESSION_STORAGE_KEY)
  },

  // Emergency Panic Kill: Instantly obliterate all sessions and traces
  panicLockout() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(MASTER_ADMIN_CONFIG.SESSION_STORAGE_KEY)
    localStorage.removeItem(MASTER_ADMIN_CONFIG.IMPERSONATE_STORAGE_KEY)
    window.location.href = '/'
  },

  // Tutor Impersonation
  setImpersonatedTutor(tutorId: string | null) {
    if (typeof window === 'undefined') return
    if (tutorId) {
      localStorage.setItem(MASTER_ADMIN_CONFIG.IMPERSONATE_STORAGE_KEY, tutorId)
    } else {
      localStorage.removeItem(MASTER_ADMIN_CONFIG.IMPERSONATE_STORAGE_KEY)
    }
  },

  getImpersonatedTutor(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(MASTER_ADMIN_CONFIG.IMPERSONATE_STORAGE_KEY)
  },
}
