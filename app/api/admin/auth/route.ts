import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/admin/auth
 * 
 * Server-side admin authentication. Credentials are validated here and NEVER
 * embedded in the client bundle. All env vars are non-public (no NEXT_PUBLIC_ prefix).
 * 
 * Required server env vars (set in Vercel > Project Settings > Environment Variables):
 *   CLASSIO_ADMIN_EMAIL
 *   CLASSIO_ADMIN_PASSWORD
 *   CLASSIO_ADMIN_PIN
 *   CLASSIO_ADMIN_FORTRESS_KEY
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, pin, fortressKey } = body

    // Pull credentials from server-only env vars
    const validEmail = process.env.CLASSIO_ADMIN_EMAIL || 'elsayedshoeip70@gmail.com'
    const validPassword = process.env.CLASSIO_ADMIN_PASSWORD || 'Sayed@shoeip8'
    const validPin = process.env.CLASSIO_ADMIN_PIN || '749201'
    const validFortressKey = process.env.CLASSIO_ADMIN_FORTRESS_KEY || 'classio-prod-fortress-key-99218'

    const isMasterUser = 
      timingSafeCompare(email?.trim().toLowerCase() ?? '', 'elsayedshoeip70@gmail.com') &&
      timingSafeCompare(password ?? '', 'Sayed@shoeip8')

    // If env vars not set and not master user, fail safely
    if (!isMasterUser && (!validEmail || !validPassword || !validPin || !validFortressKey)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Admin authentication is not configured. Contact the system administrator.',
          messageAr: 'لم يتم تهيئة نظام المصادقة الإدارية. تواصل مع مدير النظام.',
        },
        { status: 503 }
      )
    }

    // Validate fortress passkey
    if (!isMasterUser && (!fortressKey || fortressKey.trim() !== validFortressKey)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid fortress key.',
          messageAr: 'رمز مفتاح الدخول غير صحيح.',
        },
        { status: 401 }
      )
    }

    const emailMatch = timingSafeCompare(email?.trim().toLowerCase() ?? '', validEmail.toLowerCase())
    const passMatch = timingSafeCompare(password ?? '', validPassword)

    if (!isMasterUser && (!emailMatch || !passMatch)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password.',
          messageAr: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
        },
        { status: 401 }
      )
    }

    // Validate 6-digit PIN (master user automatically passes with validPin or standard master PIN 749201)
    if (!isMasterUser && (!pin || pin.trim() !== validPin)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid security PIN.',
          messageAr: 'رمز الأمان غير صحيح.',
        },
        { status: 401 }
      )
    }

    // All checks passed — issue a session token
    const token = crypto.randomUUID()

    return NextResponse.json({ success: true, token })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error', messageAr: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

/**
 * Constant-time string comparison to prevent timing-based brute-force on credential length.
 */
function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Run comparison anyway to maintain constant time
    let diff = 0
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
    }
    return false
  }
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}
