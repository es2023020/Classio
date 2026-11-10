import { getSupabase, isSupabaseConfigured } from './supabase'
import { TutorProfile, PlanTier, BillingCycle } from './types'

export interface SupabaseAuthResult {
  success: boolean
  user?: any
  tutor?: TutorProfile | null
  error?: string
  errorAr?: string
  needsEmailConfirmation?: boolean
}

/**
 * Translate common Supabase auth error messages to Arabic
 */
export function formatSupabaseAuthError(errorMsg: string, lang: 'en' | 'ar' = 'ar'): string {
  const msg = errorMsg.toLowerCase()

  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return lang === 'ar'
      ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
      : 'Invalid email or password.'
  }
  if (msg.includes('user already registered') || msg.includes('already exists')) {
    return lang === 'ar'
      ? 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بدلاً من التسجيل.'
      : 'An account with this email already exists. Please sign in.'
  }
  if (msg.includes('email not confirmed')) {
    return lang === 'ar'
      ? 'يرجى تأكيد بريدك الإلكتروني أولاً عبر الرابط المرسل إلى صندوق الوارد.'
      : 'Please confirm your email address via the link sent to your inbox.'
  }
  if (msg.includes('password should be at least')) {
    return lang === 'ar'
      ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.'
      : 'Password should be at least 6 characters.'
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return lang === 'ar'
      ? 'تم إرسال عدد كبير من الطلبات. يرجى الانتظار دقيقة والمحاولة ثانية.'
      : 'Too many requests. Please wait a moment and try again.'
  }

  return errorMsg
}

/**
 * Sign up a new tutor with Supabase Auth
 */
export async function signUpWithSupabase(params: {
  email: string
  password: string
  name: string
  phone: string
  subject: string
  plan: PlanTier
  billing: BillingCycle
  planLimit: number
}): Promise<SupabaseAuthResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase is not configured' }
  }

  const client = getSupabase()
  if (!client) {
    return { success: false, error: 'Supabase client unavailable' }
  }

  const cleanEmail = params.email.trim().toLowerCase()

  try {
    const { data, error } = await client.auth.signUp({
      email: cleanEmail,
      password: params.password,
      options: {
        data: {
          name: params.name.trim(),
          phone: params.phone.trim(),
          subject: params.subject.trim(),
          plan: params.plan,
          billing: params.billing,
        },
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
        errorAr: formatSupabaseAuthError(error.message, 'ar'),
      }
    }

    const userId = data.user?.id
    // Use the auth user's UUID as the tutor ID for clean, collision-proof multi-tenancy
    const tutorId = userId || crypto.randomUUID()

    // Insert or update profile in public.tutors table
    const isFree = params.plan === 'free'
    const newTutorProfile: TutorProfile = {
      id: tutorId,
      name: params.name.trim(),
      title: 'معلم خاص',
      subject: params.subject.trim() || 'عام',
      phone: params.phone.trim(),
      email: cleanEmail,
      avatar_initials: (params.name.slice(0, 2) || 'CL').toUpperCase(),
      center_names: [],
      instapay_handle: '',
      vodafone_cash_number: '',
      default_monthly_fee: 500,
      subscription_plan: params.plan,
      subscription_cycle: params.billing,
      max_students_limit: params.planLimit,
      subscription_status: isFree ? 'free' : 'pending',
    }

    // Save to public.tutors table in Supabase
    try {
      await client.from('tutors').upsert({
        ...newTutorProfile,
        user_id: userId,
      })
    } catch (e) {
      console.warn('Failed to insert tutor record into Supabase:', e)
    }

    // Check if Supabase requires email verification
    const needsEmailConfirmation = Boolean(
      data.user && !data.session && data.user.identities && data.user.identities.length > 0
    )

    return {
      success: true,
      user: data.user,
      tutor: newTutorProfile,
      needsEmailConfirmation,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to sign up',
      errorAr: formatSupabaseAuthError(err?.message || '', 'ar'),
    }
  }
}

/**
 * Sign in existing tutor with Supabase Auth
 */
export async function signInWithSupabase(
  email: string,
  password: string
): Promise<SupabaseAuthResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase is not configured' }
  }

  const client = getSupabase()
  if (!client) {
    return { success: false, error: 'Supabase client unavailable' }
  }

  const cleanEmail = email.trim().toLowerCase()

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
        errorAr: formatSupabaseAuthError(error.message, 'ar'),
      }
    }

    // Fetch tutor profile from public.tutors table
    let tutorRecord: TutorProfile | null = null
    try {
      const { data: tutorData } = await client
        .from('tutors')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle()

      if (tutorData) {
        tutorRecord = tutorData as TutorProfile
      }
    } catch (e) {
      console.warn('Failed to fetch tutor record from Supabase:', e)
    }

    // Fallback if no tutor record in table yet (e.g. first login via Supabase auth)
    if (!tutorRecord && data.user) {
      const meta = data.user.user_metadata || {}
      // Use auth user's UUID as tutor ID for proper multi-tenancy
      const fallbackTutorId = data.user.id
      tutorRecord = {
        id: fallbackTutorId,
        name: meta.name || cleanEmail.split('@')[0],
        title: 'معلم خاص',
        subject: meta.subject || 'عام',
        phone: meta.phone || '',
        email: cleanEmail,
        avatar_initials: ((meta.name || cleanEmail).slice(0, 2) || 'CL').toUpperCase(),
        center_names: [],
        instapay_handle: '',
        vodafone_cash_number: '',
        default_monthly_fee: 500,
        subscription_plan: (meta.plan as PlanTier) || 'free',
        subscription_cycle: (meta.billing as BillingCycle) || 'monthly',
        max_students_limit: meta.plan === 'free' ? 10 : 30,
        subscription_status: meta.plan === 'free' ? 'free' : 'active',
      }

      // Upsert into Supabase for future requests
      try {
        await client.from('tutors').upsert({
          ...tutorRecord,
          user_id: data.user.id,
        })
      } catch (e) {
        console.warn('Failed to upsert fallback tutor record:', e)
      }
    }

    return {
      success: true,
      user: data.user,
      tutor: tutorRecord,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to sign in',
      errorAr: formatSupabaseAuthError(err?.message || '', 'ar'),
    }
  }
}

/**
 * Sign out of Supabase Auth
 */
export async function signOutFromSupabase(): Promise<void> {
  if (!isSupabaseConfigured()) return
  const client = getSupabase()
  if (!client) return

  try {
    await client.auth.signOut()
  } catch (e) {
    console.warn('Supabase sign out error:', e)
  }
}

/**
 * Get current active Supabase user session
 */
export async function getCurrentSupabaseUser() {
  if (!isSupabaseConfigured()) return null
  const client = getSupabase()
  if (!client) return null

  try {
    const { data } = await client.auth.getUser()
    return data?.user || null
  } catch {
    return null
  }
}
