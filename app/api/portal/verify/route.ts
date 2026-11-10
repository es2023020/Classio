import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/portal/verify
 * 
 * Server-side phone verification for the parent portal.
 * - Maximum 5 attempts per token (tracked server-side — no client bypass possible)
 * - Returns 429 if rate-limited
 * - Does NOT return whether phone is registered (prevents enumeration)
 */

// In-memory attempt tracker (resets on serverless cold start, but provides basic protection)
// For production, use Upstash Redis or Vercel KV for persistent rate limiting
const attemptTracker = new Map<string, { count: number; firstAttemptAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, phoneDigits } = body

    if (!token || !phoneDigits) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Rate limiting by token
    const now = Date.now()
    const tracker = attemptTracker.get(token)

    if (tracker) {
      // Reset window if expired
      if (now - tracker.firstAttemptAt > WINDOW_MS) {
        attemptTracker.delete(token)
      } else if (tracker.count >= MAX_ATTEMPTS) {
        return NextResponse.json(
          {
            error: 'Too many verification attempts. Please try again in 15 minutes.',
            errorAr: 'تجاوزت الحد المسموح به. يرجى المحاولة بعد 15 دقيقة.',
          },
          { status: 429 }
        )
      }
    }

    // Increment attempt counter
    if (attemptTracker.has(token)) {
      attemptTracker.get(token)!.count++
    } else {
      attemptTracker.set(token, { count: 1, firstAttemptAt: now })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 503 })
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Look up portal token with phone hash
    const { data: portalToken } = await supabase
      .from('portal_tokens')
      .select('student_id, phone_last4, expires_at')
      .eq('token', token)
      .maybeSingle()

    if (!portalToken) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 404 })
    }

    // Check expiry
    if (new Date(portalToken.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: 'Token expired' }, { status: 410 })
    }

    // If no phone stored, skip verification (open portal)
    if (!portalToken.phone_last4) {
      attemptTracker.delete(token)
      return NextResponse.json({ success: true })
    }

    // Compare last 4 digits
    const cleanEntered = (phoneDigits || '').replace(/\D/g, '').slice(-4)
    const isMatch = cleanEntered === portalToken.phone_last4

    if (isMatch) {
      // Clear rate limit on success
      attemptTracker.delete(token)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Incorrect phone digits.',
        errorAr: 'الأرقام الأخيرة من رقم الهاتف غير صحيحة.',
      },
      { status: 401 }
    )
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
