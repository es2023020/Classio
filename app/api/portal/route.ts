import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/portal?token=<uuid>
 * 
 * Server-side parent portal data fetching.
 * - Looks up the portal token in the DB (not client-side logic)
 * - Checks expiry
 * - Returns sanitized student data only (no PII beyond what parent needs)
 * - Phone verification is handled separately via POST /api/portal/verify
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(token)) {
    return NextResponse.json({ error: 'Invalid token format' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Service not configured' }, { status: 503 })
  }

  // Use service role to bypass RLS for portal token lookup
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Look up the portal token
  const { data: portalToken, error: tokenError } = await supabase
    .from('portal_tokens')
    .select('student_id, tutor_id, expires_at, phone_last4')
    .eq('token', token)
    .maybeSingle()

  if (tokenError || !portalToken) {
    return NextResponse.json({ error: 'Token not found or expired' }, { status: 404 })
  }

  // Check expiry
  if (new Date(portalToken.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Portal link has expired' }, { status: 410 })
  }

  // Fetch student data (service role bypasses RLS safely here — read-only portal)
  const { data: student } = await supabase
    .from('students')
    .select('id, name, name_ar, name_en, student_code, school, grade, group_name, monthly_fee, paid_this_month, paid_amount, attendance_rate, homework_rate, trajectory, target_goal, parent_relation, parent_phone')
    .eq('id', portalToken.student_id)
    .maybeSingle()

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  // Fetch tutor (only public contact info)
  const { data: tutor } = await supabase
    .from('tutors')
    .select('name, title, subject, phone, instapay_handle, vodafone_cash_number')
    .eq('id', portalToken.tutor_id)
    .maybeSingle()

  // Fetch attendance history (last 60 records)
  const { data: attendance } = await supabase
    .from('attendance')
    .select('id, lesson_date, status, homework_done, homework_quality, quiz_score, max_quiz_score, notes')
    .eq('student_id', portalToken.student_id)
    .order('lesson_date', { ascending: false })
    .limit(60)

  // Fetch payment history
  const { data: payments } = await supabase
    .from('payments')
    .select('id, month_year, amount, payment_date, method, status, receipt_number')
    .eq('student_id', portalToken.student_id)
    .order('payment_date', { ascending: false })
    .limit(24)

  // Mask phone
  const rawPhone = student.parent_phone || ''
  const maskedPhone =
    rawPhone.length > 6
      ? `${rawPhone.substring(0, 3)}****${rawPhone.substring(rawPhone.length - 4)}`
      : '010****0000'

  // Sanitize: remove raw phone from response
  const { parent_phone: _removed, ...studentSafe } = student

  return NextResponse.json({
    student: { ...studentSafe, parent_phone_masked: maskedPhone },
    tutor: tutor || {},
    attendanceHistory: attendance || [],
    paymentHistory: payments || [],
    requiresVerification: Boolean(portalToken.phone_last4),
  })
}
