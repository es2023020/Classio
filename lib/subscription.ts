// Pure subscription date helpers — no side effects, no imports from Next.js

import { BillingCycle } from './types'

export type SubscriptionStatus = 'free' | 'pending' | 'active' | 'expiring_soon' | 'expired'

export interface SubscriptionDates {
  paymentSubmittedAt: string    // ISO — when payment form was submitted
  subscriptionStartsAt: string  // paymentSubmittedAt + 3 days (grace period)
  subscriptionExpiresAt: string // subscriptionStartsAt + 30 or 365 days
  subscriptionStatus: SubscriptionStatus
  activatedAt?: string
  billing: BillingCycle
}

const GRACE_DAYS = 3
const MONTHLY_DAYS = 30
const ANNUAL_DAYS = 365
export const EXPIRY_WARNING_DAYS = 7

/**
 * Build subscription date fields at the moment of payment submission.
 * Grace period: 3 days before subscription starts.
 * Monthly: 30 days from start. Annual: 365 days from start.
 */
export function buildSubscriptionDates(billing: BillingCycle): SubscriptionDates {
  const now = new Date()

  const startsAt = new Date(now)
  startsAt.setDate(startsAt.getDate() + GRACE_DAYS)

  const expiresAt = new Date(startsAt)
  expiresAt.setDate(expiresAt.getDate() + (billing === 'annual' ? ANNUAL_DAYS : MONTHLY_DAYS))

  return {
    paymentSubmittedAt: now.toISOString(),
    subscriptionStartsAt: startsAt.toISOString(),
    subscriptionExpiresAt: expiresAt.toISOString(),
    subscriptionStatus: 'pending',
    billing,
  }
}

/**
 * Compute the live subscription status from stored values.
 */
export function getSubscriptionStatus(
  expiresAt: string | undefined,
  storedStatus: string | undefined
): SubscriptionStatus {
  if (!storedStatus || storedStatus === 'free') return 'free'
  if (storedStatus === 'pending') return 'pending'
  if (!expiresAt) return 'active'

  const now = new Date()
  const expiry = new Date(expiresAt)

  if (expiry < now) return 'expired'

  const msLeft = expiry.getTime() - now.getTime()
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24))
  if (daysLeft <= EXPIRY_WARNING_DAYS) return 'expiring_soon'

  return 'active'
}

/**
 * Return number of days until subscription expires.
 * Returns 9999 for free/indefinite subscriptions.
 */
export function daysUntilExpiry(expiresAt: string | undefined): number {
  if (!expiresAt) return 9999
  const now = new Date()
  const expiry = new Date(expiresAt)
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Format an ISO date string for display.
 */
export function formatExpiryDate(isoDate: string | undefined, lang: 'en' | 'ar'): string {
  if (!isoDate) return lang === 'en' ? 'N/A' : 'غير محدد'
  const d = new Date(isoDate)
  return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
