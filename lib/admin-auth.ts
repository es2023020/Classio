import { SuperAdminSession } from './admin-types'

// Admin auth config: all credentials come ONLY from server-side environment variables.
// NEXT_PUBLIC_* is intentionally NOT used here — these values must never ship in the browser bundle.
// Set CLASSIO_ADMIN_EMAIL, CLASSIO_ADMIN_PASSWORD, CLASSIO_ADMIN_PIN, CLASSIO_ADMIN_FORTRESS_KEY
// as server-side env vars in Vercel (not exposed to the client).
export const MASTER_ADMIN_CONFIG = {
  SESSION_STORAGE_KEY: 'classio_master_superadmin_session_v2',
  ATTEMPTS_STORAGE_KEY: 'classio_master_failed_attempts_v2',
  LOCKOUT_STORAGE_KEY: 'classio_master_lockout_until_v2',
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

  // Complete login: credentials validated server-side via /api/admin/auth
  async login(email: string, pass: string, pin: string, fortressKey: string): Promise<AuthChallengeResult> {
    // 1. Check client-side lockout first (rate limit before even hitting server)
    const lockout = this.getLockoutStatus()
    if (lockout.isLocked) {
      return {
        success: false,
        message: `System locked out due to multiple failed attempts. Retry in ${lockout.remainingMinutes} minutes.`,
        messageAr: `تم تجميد الدخول بسبب محاولات خاطئة متعددة. يرجى المحاولة بعد ${lockout.remainingMinutes} دقيقة.`,
        lockedUntil: localStorage.getItem(MASTER_ADMIN_CONFIG.LOCKOUT_STORAGE_KEY) || undefined,
      }
    }

    try {
      // 2. Validate server-side — credentials NEVER compared in browser
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: pass, pin, fortressKey }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        const fail = this.recordFailedAttempt()
        return {
          success: false,
          message: data.message || `Authentication failed. (${fail.remainingAttempts} attempts remaining)`,
          messageAr: data.messageAr || `فشل التحقق. (متبقي ${fail.remainingAttempts} محاولات)`,
        }
      }

      // Authentication verified! Reset failed attempts
      this.resetFailedAttempts()

      const now = new Date()
      const expiresAt = new Date(now.getTime() + MASTER_ADMIN_CONFIG.SESSION_TIMEOUT_MINUTES * 60000)

      // Session token is a UUID from the server
      const session: SuperAdminSession = {
        token: data.token || crypto.randomUUID(),
        email: email.trim().toLowerCase(),
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
        message: 'Super-Admin identity verified. Welcome to the Admin Command Center.',
        messageAr: 'تم التحقق من هوية المسؤول بنجاح. أهلاً بك في لوحة القيادة والتحكم.',
        session,
      }
    } catch {
      const fail = this.recordFailedAttempt()
      return {
        success: false,
        message: `Network error during authentication. (${fail.remainingAttempts} attempts remaining)`,
        messageAr: `خطأ في الاتصال أثناء التحقق. (متبقي ${fail.remainingAttempts} محاولات)`,
      }
    }
  },

  // Verify PIN: validated server-side
  async verifyPin(pin: string): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await response.json()
      return response.ok && data.success === true
    } catch {
      return false
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

  // Unlock with Master PIN (server-validated)
  async unlockWithPin(pin: string): Promise<boolean> {
    const isValid = await this.verifyPin(pin)
    if (!isValid) return false
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
