export type GradeStage =
  | 'الاول_الثانوي'
  | 'الثاني_الثانوي'
  | 'الثالث_الثانوي'
  | 'الاول_الاعدادي'
  | 'الثاني_الاعدادي'
  | 'الثالث_الاعدادي'
  | 'الابتدائي'
  | 'جامعي'
  | 'other'

export type PaymentMethod = 'cash' | 'vodafone_cash' | 'instapay' | 'bank_transfer'
export type PaymentStatus = 'paid' | 'partial' | 'pending'
export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late'
export type LearningTrajectory = 'improving' | 'steady' | 'needs_attention'
export type TopicMasteryLevel = 'strong' | 'needs_practice' | 'review_required'

export interface TopicMastery {
  topic_name: string
  topic_name_en?: string
  topic_name_ar?: string
  level: TopicMasteryLevel
  notes?: string
}

export interface StudentSuccessProfile {
  student_id: string
  trajectory: LearningTrajectory
  target_score_percent: number
  target_goal_description: string // e.g. "درجة نهائية 60/60 فيزياء ثانوية عامة للالتحاق بهندسة"
  attendance_rate: number
  homework_completion_rate: number
  latest_exam: {
    title: string
    score: number
    max_score: number
    date: string
  }
  topics: TopicMastery[]
  next_recommended_action: string
  tutor_pedagogical_notes?: string
}

export interface LessonPlan {
  id: string
  group_id: string
  group_name: string
  group_name_en?: string
  lesson_date: string // YYYY-MM-DD
  unit_name: string // e.g. "الوحدة الأولى: الفيزياء الكهربية"
  unit_name_en?: string
  topic_title: string // e.g. "قوانين كيرشوف وتطبيقات على الدوائر المعقدة"
  topic_title_en?: string
  lesson_summary: string
  lesson_summary_en?: string
  homework_title: string // e.g. "واجب مذكرة الشرح والتدريبات"
  homework_title_en?: string
  homework_pages?: string // e.g. "ص ٤٥ إلى ص ٥٢ (مسائل ١ حتى ٢٠)"
  homework_pages_en?: string
  homework_due_date: string
  resources_url?: string
  created_at?: string
}

export interface AssessmentExam {
  id: string
  group_id: string
  group_name: string
  title: string
  exam_date: string
  max_score: number
  average_score?: number
  topics_covered: string[]
  created_at?: string
}

export type PlanTier =
  | 'free'
  | 'starter'
  | 'growth'
  | 'pro'
  | 'power'
  | 'enterprise'
  | 'elite'
  | 'academy'

export type BillingCycle = 'monthly' | 'annual'

export interface PricingPlan {
  id: PlanTier
  name: string
  nameAr: string
  desc: string
  descAr: string
  monthlyPrice: number
  annualPrice: number // per year
  annualMonthlyEquivalent: number // e.g. 83 EGP
  annualSaving: number
  originalMonthlyPrice?: number
  isCustomMeeting?: boolean
  studentsLimit: number
  studentsLabel: string
  studentsLabelAr: string
  popular?: boolean
  features: string[]
  featuresAr: string[]
}

export interface TutorProfile {
  id: string
  name: string
  name_en?: string
  name_ar?: string
  title: string
  title_en?: string
  title_ar?: string
  subject: string
  subject_en?: string
  subject_ar?: string
  phone: string
  email?: string
  avatar_initials: string
  center_names: string[]
  center_names_en?: string[]
  instapay_handle?: string
  vodafone_cash_number?: string
  default_monthly_fee: number
  subscription_plan?: PlanTier
  subscription_cycle?: BillingCycle
  max_students_limit?: number
  subscription_expires_at?: string
  created_at?: string
}

export interface Group {
  id: string
  name: string
  name_en?: string
  name_ar?: string
  stage: GradeStage | string
  stage_label: string
  stage_label_en?: string
  subject: string
  subject_en?: string
  center_name: string
  center_name_en?: string
  schedule_days: string[] // e.g. ['السبت', 'الثلاثاء']
  schedule_days_en?: string[]
  time_slot: string // e.g. '04:00 م - 06:30 م'
  time_slot_en?: string
  monthly_fee: number // in EGP
  session_fee?: number
  max_students: number
  student_count?: number
  current_chapter?: string // e.g. "الفصل الثالث: الحث الكهرومغناطيسي"
  current_chapter_en?: string
  color_tone: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose'
  active: boolean
  created_at?: string
}

export interface Student {
  id: string
  tutor_id?: string
  group_id: string
  group_name: string
  group_name_en?: string
  name: string
  name_en?: string
  name_ar?: string
  student_phone: string
  parent_name?: string
  parent_phone: string
  parent_relation: 'الأب' | 'الأم' | 'ولي الأمر' | string
  school?: string
  school_en?: string
  grade?: string // e.g. "Grade 10" or "الصف الأول الثانوي"
  student_code: string // كود الطالب في السنتر
  status: 'active' | 'inactive' | 'archived' | 'late' | 'suspended'
  monthly_fee: number
  paid_this_month: boolean
  paid_amount?: number
  notes?: string
  notes_en?: string
  joined_date?: string // e.g. "September 2026"
  last_attendance?: AttendanceStatus
  last_quiz_score?: string
  initials?: string
  
  // Pedagogical & Success Profile Fields
  trajectory?: LearningTrajectory
  target_score_percent?: number
  target_goal?: string
  target_goal_en?: string
  attendance_rate?: number
  homework_rate?: number
  next_recommended_action?: string
  next_recommended_action_en?: string
  weak_topics?: TopicMastery[]
  
  // Private notes and communication logs
  tutor_notes?: { id: string; date: string; text: string; author?: string }[]
  communication_history?: {
    id: string
    date: string
    type: 'whatsapp' | 'call' | 'in_person'
    summary: string
    recipient: string
  }[]

  created_at?: string
}

export interface AssessmentRecord {
  id: string
  student_id: string
  student_name?: string
  group_id?: string
  title: string
  exam_date: string // YYYY-MM-DD
  score: number
  max_score: number
  type?: 'exam' | 'quiz' | 'monthly' | 'diagnostic'
  feedback?: string
  created_at?: string
}

export interface HomeworkAssignment {
  id: string
  student_id: string
  student_name?: string
  group_id?: string
  title: string
  details?: string
  due_date: string // YYYY-MM-DD
  completed: boolean
  grade?: string
  created_at?: string
}

export interface AttendanceRecord {
  id: string
  student_id: string
  student_name: string
  student_name_en?: string
  group_id: string
  lesson_date: string // YYYY-MM-DD
  status: AttendanceStatus
  homework_done: boolean
  homework_quality?: 'complete' | 'incomplete' | 'missing'
  quiz_score?: number | null
  max_quiz_score?: number | null
  notes?: string
  created_at?: string
}

export interface PaymentRecord {
  id: string
  student_id: string
  student_name: string
  student_name_en?: string
  group_id: string
  group_name: string
  group_name_en?: string
  month_year: string // e.g. 'مايو ٢٠٢٤' or '2024-05'
  month_year_en?: string
  amount: number
  payment_date: string // YYYY-MM-DD
  method: PaymentMethod
  status: PaymentStatus
  receipt_number: string
  notes?: string
  created_at?: string
}

export interface DashboardStats {
  totalStudents: number
  activeGroups: number
  todayLessonsCount: number
  monthlyExpected: number
  monthlyCollected: number
  monthlyOutstanding: number
  attendanceRateToday: number
  pendingRemindersCount: number
  averageHomeworkRate?: number
  studentsImprovingCount?: number
}
