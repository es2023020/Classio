import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/admin/verify-pin
 * Server-side PIN verification for screen unlock. Never exposes PIN to client.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pin } = body

    const validPin = process.env.CLASSIO_ADMIN_PIN

    if (!validPin) {
      return NextResponse.json(
        { success: false, message: 'PIN verification not configured.' },
        { status: 503 }
      )
    }

    const isValid = (pin ?? '').trim() === validPin

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid PIN.', messageAr: 'رمز الأمان غير صحيح.' },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
