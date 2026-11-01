import {
  Group,
  Student,
  AttendanceRecord,
  PaymentRecord,
  TutorProfile,
  DashboardStats,
  LessonPlan,
  TopicMastery,
  AssessmentRecord,
  HomeworkAssignment,
} from './types'
import { getSupabase, isSupabaseConfigured } from './supabase'

const STORAGE_KEYS = {
  PROFILE: 'muallemi_tutor_profile',
  GROUPS: 'muallemi_groups',
  STUDENTS: 'muallemi_students',
  ATTENDANCE: 'muallemi_attendance',
  PAYMENTS: 'muallemi_payments',
  LESSONS: 'muallemi_lessons',
  ASSESSMENTS: 'muallemi_assessments',
  HOMEWORKS: 'muallemi_homeworks',
}

export const initialProfile: TutorProfile = {
  id: 'tutor-1',
  name: 'أحمد محمود',
  title: 'مدرس أول فيزياء وكيمياء',
  subject: 'الفيزياء للثانوية العامة',
  phone: '01012345678',
  email: 'ahmed.mahmoud@example.com',
  avatar_initials: 'أم',
  center_names: ['سنتر الأوائل — مدينة نصر', 'سنتر النخبة — التجمع', 'سنتر الأهرام — المهندسين', 'حصص أونلاين'],
  instapay_handle: 'ahmed.phys@instapay',
  vodafone_cash_number: '01012345678',
  default_monthly_fee: 850,
}

export const initialGroups: Group[] = [
  {
    id: 'grp-0',
    name: 'Grade 10 — Saturday & Tuesday',
    name_ar: 'الصف الأول الثانوي — السبت والثلاثاء',
    stage: 'الاول_الثانوي',
    stage_label: 'الصف الأول الثانوي',
    stage_label_en: 'Grade 10',
    subject: 'فيزياء',
    subject_en: 'Physics',
    center_name: 'سنتر الأوائل — مدينة نصر',
    schedule_days: ['السبت', 'الثلاثاء'],
    schedule_days_en: ['Saturday', 'Tuesday'],
    time_slot: '04:00 م - 06:00 م',
    time_slot_en: '04:00 PM - 06:00 PM',
    monthly_fee: 500,
    session_fee: 150,
    max_students: 30,
    student_count: 25,
    current_chapter: 'الفصل الثاني: الحركة والقوى وقوانين نيوتن',
    current_chapter_en: 'Chapter 2: Forces & Newton Laws',
    color_tone: 'blue',
    active: true,
  },
  {
    id: 'grp-1',
    name: 'فيزياء ٣ ث — سنتر الأوائل',
    stage: 'الثالث_الثانوي',
    stage_label: 'الصف الثالث الثانوي',
    subject: 'فيزياء',
    center_name: 'سنتر الأوائل — مدينة نصر',
    schedule_days: ['السبت', 'الثلاثاء'],
    time_slot: '04:00 م - 06:30 م',
    monthly_fee: 850,
    session_fee: 220,
    max_students: 40,
    student_count: 24,
    current_chapter: 'الفصل الثالث: الحث الكهرومغناطيسي',
    color_tone: 'blue',
    active: true,
  },
  {
    id: 'grp-2',
    name: 'فيزياء ٣ ث — سنتر النخبة',
    stage: 'الثالث_الثانوي',
    stage_label: 'الصف الثالث الثانوي',
    subject: 'فيزياء',
    center_name: 'سنتر النخبة — التجمع',
    schedule_days: ['الأحد', 'الأربعاء'],
    time_slot: '05:00 م - 07:30 م',
    monthly_fee: 900,
    session_fee: 250,
    max_students: 35,
    student_count: 18,
    current_chapter: 'الفصل الثاني: التأثير المغناطيسي للتيار',
    color_tone: 'emerald',
    active: true,
  },
  {
    id: 'grp-3',
    name: 'كيمياء ٢ ث — سنتر الأهرام',
    stage: 'الثاني_الثانوي',
    stage_label: 'الصف الثاني الثانوي',
    subject: 'كيمياء',
    center_name: 'سنتر الأهرام — المهندسين',
    schedule_days: ['الإثنين', 'الخميس'],
    time_slot: '03:30 م - 05:30 م',
    monthly_fee: 750,
    session_fee: 190,
    max_students: 30,
    student_count: 14,
    current_chapter: 'الباب الثاني: الجدول الدوري وتدرج الخواص',
    color_tone: 'purple',
    active: true,
  },
  {
    id: 'grp-4',
    name: 'فيزياء لغات (Physics) — أونلاين',
    stage: 'الثالث_الثانوي',
    stage_label: 'الصف الثالث الثانوي (لغات)',
    subject: 'Physics',
    center_name: 'حصص أونلاين',
    schedule_days: ['الجمعة'],
    time_slot: '02:00 م - 05:00 م',
    monthly_fee: 1000,
    session_fee: 280,
    max_students: 25,
    student_count: 12,
    current_chapter: 'Chapter 3: Electromagnetic Induction',
    color_tone: 'amber',
    active: true,
  },
]

export const initialStudents: Student[] = [
  {
    id: 'std-001',
    group_id: 'grp-0',
    group_name: 'Grade 10 — Saturday & Tuesday',
    group_name_en: 'Grade 10 — Saturday & Tuesday',
    name: 'عمر محمد',
    name_en: 'Omar Mohamed',
    student_phone: '01012345678',
    parent_name: 'Mohamed Ahmed',
    parent_phone: '01123456789',
    parent_relation: 'الأب',
    school: 'مدرسة مصر للغات',
    school_en: 'Egypt Language School',
    grade: 'Grade 10',
    student_code: '#ST-001',
    status: 'active',
    monthly_fee: 500,
    paid_this_month: true,
    paid_amount: 500,
    joined_date: 'September 2026',
    last_attendance: 'present',
    last_quiz_score: '85/100',
    notes: 'طالب متميز وملتزم بالحضور والمشاركة الإيجابية ومستواه في تقدم مستمر',
    notes_en: 'Excellent and dedicated student with positive class engagement and strong progress',
    initials: 'OM',
    trajectory: 'improving',
    target_score_percent: 95,
    target_goal: 'التفوق والمركز الأول في الفيزياء والرياضيات',
    target_goal_en: 'Top 1% rank in Physics and Mathematics',
    attendance_rate: 92,
    homework_rate: 94,
    next_recommended_action: 'بدء مسائل التحدي والتطبيقات المتقدمة على قوانين نيوتن والاتزان',
    next_recommended_action_en: 'Start advanced challenge questions on Newton laws and vectors',
    weak_topics: [
      { topic_name: 'قوانين نيوتن للحركة وتطبيقاتها', topic_name_en: 'Newton Laws of Motion', level: 'strong' },
      { topic_name: 'المتجهات وتحليل القوى', topic_name_en: 'Vectors & Force Components', level: 'strong' },
      { topic_name: 'الاحتكاك وحركة الأجسام على المستويات', topic_name_en: 'Friction on Inclined Planes', level: 'needs_practice', notes: 'يحتاج تدريباً إضافياً على حساب زوايا الاحتكاك' },
    ],
    tutor_notes: [
      { id: 'tn-1', date: '2026-10-24', text: 'Omar demonstrated superior analytical skills during dynamic force problem solving.', author: 'Ahmed Mahmoud' },
      { id: 'tn-2', date: '2026-10-15', text: 'Needs minor practice on inclined plane friction calculations.', author: 'Ahmed Mahmoud' },
      { id: 'tn-3', date: '2026-09-30', text: 'Strong start to the semester. Very attentive in the front row.', author: 'Ahmed Mahmoud' },
    ],
    communication_history: [
      { id: 'ch-1', date: '2026-10-25', type: 'whatsapp', summary: 'Sent October fees confirmation receipt (500 EGP) to parent via InstaPay.', recipient: 'Mohamed Ahmed (01123456789)' },
      { id: 'ch-2', date: '2026-10-22', type: 'whatsapp', summary: 'Shared Quiz 5 assessment result: 85% with congratulatory note.', recipient: 'Mohamed Ahmed (01123456789)' },
      { id: 'ch-3', date: '2026-10-01', type: 'call', summary: 'Kickoff phone call with father to align on target goals for Grade 10.', recipient: 'Mohamed Ahmed' },
    ],
  },
  {
    id: 'std-1',
    group_id: 'grp-1',
    group_name: 'فيزياء ٣ ث — سنتر الأوائل',
    name: 'سلمى محمد عبد الرحمن',
    student_phone: '01012345678',
    parent_phone: '01098765432',
    parent_relation: 'الأب',
    school: 'مدرسة الطبري الثانوية بنات',
    student_code: 'PHY-101',
    status: 'active',
    monthly_fee: 850,
    paid_this_month: true,
    paid_amount: 850,
    last_attendance: 'present',
    last_quiz_score: '94/100',
    notes: 'طالبة متفوقة وملتزمة في الواجبات التراكمية',
    // Pedagogical Success Profile
    trajectory: 'improving',
    target_score_percent: 98,
    target_goal: 'الدرجة النهائية في الفيزياء للالتحاق بكلية الطب البشري',
    attendance_rate: 96,
    homework_rate: 95,
    next_recommended_action: 'بدء حل أسئلة المستويات العليا وبنك أسئلة الوزارة على الحث الكهرومغناطيسي',
    weak_topics: [
      { topic_name: 'قانون أوم وقوانين كيرشوف', level: 'strong' },
      { topic_name: 'التأثير المغناطيسي وأجهزة القياس', level: 'strong' },
      { topic_name: 'الدينامو والمحرك الكهربي', level: 'needs_practice', notes: 'تحتاج مراجعة بيانية على زاوية الطور' },
    ],
  },
  {
    id: 'std-2',
    group_id: 'grp-1',
    group_name: 'فيزياء ٣ ث — سنتر الأوائل',
    name: 'عمر خالد الحسيني',
    student_phone: '01124567890',
    parent_phone: '01155443322',
    parent_relation: 'الأب',
    school: 'مدرسة المتفوقين بنين',
    student_code: 'PHY-102',
    status: 'late',
    monthly_fee: 850,
    paid_this_month: false,
    paid_amount: 0,
    last_attendance: 'absent',
    last_quiz_score: '64/100',
    notes: 'تراجع مستواه مؤخراً بسبب الغياب وعدم تسليم الواجب',
    // Pedagogical Success Profile
    trajectory: 'needs_attention',
    target_score_percent: 85,
    target_goal: 'اجتياز امتحان الثانوية العامة بمجموع يؤهل لكلية الهندسة',
    attendance_rate: 75,
    homework_rate: 65,
    next_recommended_action: 'حضور حصة تعويضية لمراجعة الجلفانومتر والأوميتر وحل أخطاء الامتحان السابق',
    weak_topics: [
      { topic_name: 'توصيل المقاومات', level: 'strong' },
      { topic_name: 'قوانين كيرشوف والدوائر المعقدة', level: 'needs_practice' },
      { topic_name: 'أجهزة القياس الكهربي (الأوميتر)', level: 'review_required', notes: 'يخلط في قانون حساسية الجلفانومتر' },
    ],
  },
  {
    id: 'std-3',
    group_id: 'grp-2',
    group_name: 'فيزياء ٣ ث — سنتر النخبة',
    name: 'نور أحمد الشناوي',
    student_phone: '01278901234',
    parent_phone: '01223344556',
    parent_relation: 'الأم',
    school: 'المدرسة المصرية الدولية',
    student_code: 'PHY-201',
    status: 'active',
    monthly_fee: 900,
    paid_this_month: true,
    paid_amount: 900,
    last_attendance: 'present',
    last_quiz_score: '96/100',
    notes: 'المركز الأول في امتحان الشهر الفائت',
    // Pedagogical Success Profile
    trajectory: 'improving',
    target_score_percent: 98,
    target_goal: 'من أوائل الجمهورية في الثانوية العامة',
    attendance_rate: 100,
    homework_rate: 98,
    next_recommended_action: 'تكليفها بمسائل امتحانات الأعوام السابقة الدور الأول والثاني',
    weak_topics: [
      { topic_name: 'الكهربية التيارية', level: 'strong' },
      { topic_name: 'المغناطيسية وأجهزة القياس', level: 'strong' },
      { topic_name: 'الحث المتبادل والحث الذاتي', level: 'strong' },
    ],
  },
  {
    id: 'std-4',
    group_id: 'grp-3',
    group_name: 'كيمياء ٢ ث — سنتر الأهرام',
    name: 'يوسف محمود الشريف',
    student_phone: '01098765432',
    parent_phone: '01066778899',
    parent_relation: 'ولي الأمر',
    school: 'الأورمان الثانوية بنين',
    student_code: 'CHM-301',
    status: 'active',
    monthly_fee: 750,
    paid_this_month: true,
    paid_amount: 750,
    last_attendance: 'present',
    last_quiz_score: '84/100',
    // Pedagogical Success Profile
    trajectory: 'steady',
    target_score_percent: 90,
    target_goal: 'التفوق في الصف الثاني الثانوي والاستعداد للثانوية العامة',
    attendance_rate: 92,
    homework_rate: 85,
    next_recommended_action: 'مراجعة أعداد التأكسد في المركبات وتدريبات التوزيع الإلكتروني',
    weak_topics: [
      { topic_name: 'تطور مفهوم بنية الذرة', level: 'strong' },
      { topic_name: 'أعداد الكم وقواعد التوزيع', level: 'needs_practice' },
      { topic_name: 'نصف القطر وجهد التأين', level: 'strong' },
    ],
  },
  {
    id: 'std-5',
    group_id: 'grp-1',
    group_name: 'فيزياء ٣ ث — سنتر الأوائل',
    name: 'مريم طارق الفقي',
    student_phone: '01551234567',
    parent_phone: '01001122334',
    parent_relation: 'الأم',
    school: 'مدرسة القومية لغات',
    student_code: 'PHY-105',
    status: 'active',
    monthly_fee: 850,
    paid_this_month: false,
    paid_amount: 400,
    last_attendance: 'excused',
    last_quiz_score: '82/100',
    notes: 'مستواها مستقر وجيدة في المسائل، تحتاج سرعة أكبر في الحل',
    // Pedagogical Success Profile
    trajectory: 'steady',
    target_score_percent: 92,
    target_goal: 'كلية الصيدلة',
    attendance_rate: 88,
    homework_rate: 85,
    next_recommended_action: 'تدريب مؤقت بالوقت (Speed test) لحل ٢٠ مسألة اختيار من متعدد في نصف ساعة',
    weak_topics: [
      { topic_name: 'قانون أوم للدائرة المغلقة', level: 'strong' },
      { topic_name: 'عزم الازدواج وعزم ثنائي القطب', level: 'strong' },
      { topic_name: 'المحول الكهربي والمحرك', level: 'needs_practice' },
    ],
  },
  {
    id: 'std-6',
    group_id: 'grp-4',
    group_name: 'فيزياء لغات (Physics) — أونلاين',
    name: 'زياد إبراهيم علام',
    student_phone: '01209988776',
    parent_phone: '01221144778',
    parent_relation: 'الأب',
    school: 'Manor House International',
    student_code: 'PHY-401',
    status: 'active',
    monthly_fee: 1000,
    paid_this_month: true,
    paid_amount: 1000,
    last_attendance: 'present',
    last_quiz_score: '92/100',
    // Pedagogical Success Profile
    trajectory: 'improving',
    target_score_percent: 95,
    target_goal: 'Faculty of Engineering (Credit Hours)',
    attendance_rate: 96,
    homework_rate: 92,
    next_recommended_action: 'Practice past exam papers on Faraday\'s Law and Lenz\'s Rule',
    weak_topics: [
      { topic_name: 'Electric Current & Kirchhoff\'s Laws', level: 'strong' },
      { topic_name: 'Magnetic Force & Torques', level: 'strong' },
      { topic_name: 'Electromagnetic Induction', level: 'needs_practice' },
    ],
  },
]

export const initialLessons: LessonPlan[] = [
  {
    id: 'les-1',
    group_id: 'grp-1',
    group_name: 'فيزياء ٣ ث — سنتر الأوائل',
    lesson_date: '2024-05-11',
    unit_name: 'الفصل الثالث: الحث الكهرومغناطيسي',
    topic_title: 'قانون فاراداي وقاعدة لنز والحث الكهرومغناطيسي',
    lesson_summary:
      'شرح تجربة فاراداي، استنتاج القوة الدافعة الكهربية المستحثة (emf)، وتطبيق قاعدة لنز لتحديد اتجاه التيار المستحث في الحلقات والملفات.',
    homework_title: 'تدريبات قانون فاراداي وقاعدة لنز',
    homework_pages: 'مذكرة الواجب ص ٧٨ إلى ص ٨٤ (الأسئلة ١ حتى ٢٥)',
    homework_due_date: '2024-05-18',
  },
  {
    id: 'les-2',
    group_id: 'grp-1',
    group_name: 'فيزياء ٣ ث — سنتر الأوائل',
    lesson_date: '2024-05-04',
    unit_name: 'الفصل الثاني: التأثير المغناطيسي للتيار',
    topic_title: 'أجهزة القياس الكهربي: الأوميتر وتدريجه غير المنتظم',
    lesson_summary:
      'شرح فكرة عمل الأوميتر كأداة لقياس المقاومة المجهولة، استنتاج مقاومة الجهاز الكلية، وتفسير سبب عدم انتظام تدريج الأوميتر مقارنة بتدريج التيار.',
    homework_title: 'مسائل تدريج الأوميتر ومقاومة العيارية',
    homework_pages: 'كتاب الامتحان ص ٦٢ إلى ص ٦٧',
    homework_due_date: '2024-05-11',
  },
  {
    id: 'les-3',
    group_id: 'grp-2',
    group_name: 'فيزياء ٣ ث — سنتر النخبة',
    lesson_date: '2024-05-12',
    unit_name: 'الفصل الثاني: التأثير المغناطيسي للتيار',
    topic_title: 'عزم الازدواج المؤثر على ملف يمر به تيار وعزم ثنائي القطب',
    lesson_summary:
      'حساب عزم الازدواج tau = B I A N sin(theta)، شروط انعدام ونهاية عزم الازدواج، وعزم ثنائي القطب المغناطيسي كمية متجهة.',
    homework_title: 'مسائل عزم الازدواج وأجهزة القياس',
    homework_pages: 'مذكرة الشرح ص ٥٠ إلى ٥٥',
    homework_due_date: '2024-05-19',
  },
]

export const initialPayments: PaymentRecord[] = [
  {
    id: 'pay-omar-1',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    student_name_en: 'Omar Mohamed',
    group_id: 'grp-0',
    group_name: 'Grade 10 — Saturday & Tuesday',
    group_name_en: 'Grade 10 — Saturday & Tuesday',
    month_year: 'أكتوبر ٢٠٢٦',
    month_year_en: 'October 2026',
    amount: 500,
    payment_date: '2026-10-25',
    method: 'instapay',
    status: 'paid',
    receipt_number: 'REC-261025',
    notes: 'مصاريف شهر أكتوبر مسددة بالكامل عبر إنستاباي',
  },
  {
    id: 'pay-omar-0',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    student_name_en: 'Omar Mohamed',
    group_id: 'grp-0',
    group_name: 'Grade 10 — Saturday & Tuesday',
    group_name_en: 'Grade 10 — Saturday & Tuesday',
    month_year: 'سبتمبر ٢٠٢٦',
    month_year_en: 'September 2026',
    amount: 500,
    payment_date: '2026-09-24',
    method: 'vodafone_cash',
    status: 'paid',
    receipt_number: 'REC-260920',
    notes: 'مصاريف شهر سبتمبر مسددة عبر فودافون كاش',
  },
  {
    id: 'pay-1',
    student_id: 'std-1',
    student_name: 'سلمى محمد عبد الرحمن',
    group_id: 'grp-1',
    group_name: 'فيزياء ٣ ث — سنتر الأوائل',
    month_year: 'مايو ٢٠٢٤',
    amount: 850,
    payment_date: '2024-05-02',
    method: 'vodafone_cash',
    status: 'paid',
    receipt_number: 'REC-240501',
    notes: 'تحويل فودافون كاش من رقم الأب',
  },
  {
    id: 'pay-2',
    student_id: 'std-3',
    student_name: 'نور أحمد الشناوي',
    group_id: 'grp-2',
    group_name: 'فيزياء ٣ ث — سنتر النخبة',
    month_year: 'مايو ٢٠٢٤',
    amount: 900,
    payment_date: '2024-05-04',
    method: 'instapay',
    status: 'paid',
    receipt_number: 'REC-240502',
    notes: 'تم الدفع عبر إنستاباي',
  },
  {
    id: 'pay-3',
    student_id: 'std-4',
    student_name: 'يوسف محمود الشريف',
    group_id: 'grp-3',
    group_name: 'كيمياء ٢ ث — سنتر الأهرام',
    month_year: 'مايو ٢٠٢٤',
    amount: 750,
    payment_date: '2024-05-05',
    method: 'cash',
    status: 'paid',
    receipt_number: 'REC-240503',
    notes: 'استلام نقدي في السنتر',
  },
  {
    id: 'pay-4',
    student_id: 'std-6',
    student_name: 'زياد إبراهيم علام',
    group_id: 'grp-4',
    group_name: 'فيزياء لغات (Physics) — أونلاين',
    month_year: 'مايو ٢٠٢٤',
    amount: 1000,
    payment_date: '2024-05-07',
    method: 'instapay',
    status: 'paid',
    receipt_number: 'REC-240504',
  },
  {
    id: 'pay-5',
    student_id: 'std-5',
    student_name: 'مريم طارق الفقي',
    group_id: 'grp-1',
    group_name: 'فيزياء ٣ ث — سنتر الأوائل',
    month_year: 'مايو ٢٠٢٤',
    amount: 400,
    payment_date: '2024-05-09',
    method: 'cash',
    status: 'partial',
    receipt_number: 'REC-240505',
    notes: 'دفعة أولى ٤٠٠ ومتبقي ٤٥٠',
  },
]

export const initialAttendance: AttendanceRecord[] = [
  // Omar Mohamed - 25 sessions (23 present, 1 late, 1 absent = 92% attendance)
  {
    id: 'att-om-25',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-10-28',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
    notes: 'حضر في الموعد وشارك بفعالية في حل مسائل الحركة',
  },
  {
    id: 'att-om-24',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-10-24',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
    quiz_score: 18,
    max_quiz_score: 20,
    notes: 'أداء ممتاز في كويز نيوتن',
  },
  {
    id: 'att-om-23',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-10-21',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
  },
  {
    id: 'att-om-22',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-10-17',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
  },
  {
    id: 'att-om-21',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-10-14',
    status: 'late',
    homework_done: true,
    homework_quality: 'complete',
    notes: 'تأخر ١٥ دقيقة بسبب زحام باص المدرسة',
  },
  {
    id: 'att-om-20',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-10-10',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
    quiz_score: 19,
    max_quiz_score: 20,
  },
  {
    id: 'att-om-19',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-10-07',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
  },
  {
    id: 'att-om-18',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-10-03',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
  },
  {
    id: 'att-om-17',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-09-30',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
    quiz_score: 17,
    max_quiz_score: 20,
  },
  {
    id: 'att-om-16',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-09-26',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
  },
  {
    id: 'att-om-15',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-09-23',
    status: 'absent',
    homework_done: false,
    homework_quality: 'missing',
    notes: 'غياب بعذر صحي مسبق تم إبلاغ السكرتارية به',
  },
  {
    id: 'att-om-14',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-09-19',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
  },
  {
    id: 'att-om-13',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-09-16',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
  },
  {
    id: 'att-om-12',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-09-12',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
    quiz_score: 18,
    max_quiz_score: 20,
  },
  {
    id: 'att-om-11',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-09-09',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
  },
  {
    id: 'att-om-10',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-09-05',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
  },
  {
    id: 'att-om-9',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-09-02',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
  },
  {
    id: 'att-om-8',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-08-29',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
  },
  {
    id: 'att-om-7',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-08-26',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
    quiz_score: 17,
    max_quiz_score: 20,
  },
  {
    id: 'att-om-6',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-08-22',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
  },
  {
    id: 'att-om-5',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-08-19',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
  },
  {
    id: 'att-om-4',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-08-15',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
  },
  {
    id: 'att-om-3',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-08-12',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
  },
  {
    id: 'att-om-2',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-08-08',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
    quiz_score: 18,
    max_quiz_score: 20,
  },
  {
    id: 'att-om-1',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    lesson_date: '2026-08-05',
    status: 'present',
    homework_done: true,
    homework_quality: 'complete',
  },
  {
    id: 'att-1',
    student_id: 'std-1',
    student_name: 'سلمى محمد عبد الرحمن',
    group_id: 'grp-1',
    lesson_date: new Date().toISOString().split('T')[0],
    status: 'present',
    homework_done: true,
    quiz_score: 19,
    max_quiz_score: 20,
  },
  {
    id: 'att-2',
    student_id: 'std-2',
    student_name: 'عمر خالد الحسيني',
    group_id: 'grp-1',
    lesson_date: new Date().toISOString().split('T')[0],
    status: 'absent',
    homework_done: false,
    quiz_score: null,
    notes: 'لم يحضر بدون عذر مسبق',
  },
  {
    id: 'att-3',
    student_id: 'std-5',
    student_name: 'مريم طارق الفقي',
    group_id: 'grp-1',
    lesson_date: new Date().toISOString().split('T')[0],
    status: 'excused',
    homework_done: true,
    quiz_score: null,
    notes: 'عذر صحي تم إبلاغ السكرتارية به',
  },
]

export const initialAssessments: AssessmentRecord[] = [
  // Omar Mohamed assessments (last 5 average = (85+88+82+85+85)/5 = 85%)
  {
    id: 'asm-1',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    title: 'Chapter 2 Physics Assessment Quiz',
    exam_date: '2026-10-22',
    score: 85,
    max_score: 100,
    type: 'quiz',
    feedback: 'Excellent conceptual grasp of velocity and acceleration. Minor arithmetic slip on problem 4.',
  },
  {
    id: 'asm-2',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    title: 'Newton First & Second Laws Exam',
    exam_date: '2026-10-15',
    score: 88,
    max_score: 100,
    type: 'exam',
    feedback: 'Solid derivation of F=ma and net force equilibrium equations.',
  },
  {
    id: 'asm-3',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    title: 'Vectors and Equilibrium Test',
    exam_date: '2026-10-08',
    score: 82,
    max_score: 100,
    type: 'quiz',
    feedback: 'Needs more practice decomposing vectors on angled inclines.',
  },
  {
    id: 'asm-4',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    title: 'Monthly Mechanics Assessment 1',
    exam_date: '2026-10-01',
    score: 85,
    max_score: 100,
    type: 'monthly',
    feedback: 'Consistent problem solving and strong fundamentals across all topics.',
  },
  {
    id: 'asm-5',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    title: 'Diagnostic Baseline Physics Test',
    exam_date: '2026-09-24',
    score: 85,
    max_score: 100,
    type: 'diagnostic',
    feedback: 'Strong foundational scientific logic and mathematical reasoning.',
  },
  // Salma
  {
    id: 'asm-6',
    student_id: 'std-1',
    student_name: 'سلمى محمد عبد الرحمن',
    group_id: 'grp-1',
    title: 'امتحان الحث الكهرومغناطيسي الشامل',
    exam_date: '2026-10-20',
    score: 95,
    max_score: 100,
    type: 'exam',
    feedback: 'ممتازة في استنتاج emf المستحثة وقاعدة لينز',
  },
  {
    id: 'asm-7',
    student_id: 'std-1',
    student_name: 'سلمى محمد عبد الرحمن',
    group_id: 'grp-1',
    title: 'كويز أجهزة القياس والجلفانومتر',
    exam_date: '2026-10-10',
    score: 92,
    max_score: 100,
    type: 'quiz',
    feedback: 'إجابات نموذجية وسرعة حل ملحوظة',
  },
]

export const initialHomeworks: HomeworkAssignment[] = [
  {
    id: 'hw-1',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    title: 'Newton Third Law Application Sheet',
    details: 'Complete problems 1 to 15 on page 56-58 of workbook',
    due_date: '2026-11-04',
    completed: false,
  },
  {
    id: 'hw-2',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    title: 'Free-body Diagram Calculations',
    details: 'Draw diagrams and solve equilibrium equations for 5 cases',
    due_date: '2026-10-28',
    completed: true,
    grade: 'A+',
  },
  {
    id: 'hw-3',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    title: 'Kinematics Equations & Graphs',
    details: 'Page 40-45 textbook exercises',
    due_date: '2026-10-21',
    completed: true,
    grade: 'A',
  },
  {
    id: 'hw-4',
    student_id: 'std-001',
    student_name: 'عمر محمد',
    group_id: 'grp-0',
    title: 'Vector Resolution Practice',
    details: 'Workbook exercises #12 through #28',
    due_date: '2026-10-14',
    completed: true,
    grade: 'A-',
  },
]



export function getCurrentTutorId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('classio_auth_user')
    if (!raw) return null
    const user = JSON.parse(raw)
    if (user?.email) {
      return user.email.toLowerCase().trim()
    }
    return user?.id || null
  } catch {
    return null
  }
}

export function getTutorStorageKey(baseKey: string, tutorId?: string | null): string {
  const tid = tutorId || getCurrentTutorId()
  if (!tid) return `classio_guest_${baseKey}`
  const sanitized = tid.replace(/[^a-z0-9_-]/g, '_')
  return `classio_tutor_${sanitized}_${baseKey}`
}


/**
 * Storage Engine: Dual Mode (Supabase or LocalStorage)
 * Multi-tenant isolated storage per tutor with zero demo placeholder leakage
 */
class StorageService {
  private isBrowser = typeof window !== 'undefined'

  private getTutorKey(baseKey: string): string {
    return getTutorStorageKey(baseKey)
  }

  private readLocal<T>(key: string, defaultValue: T): T {
    if (!this.isBrowser) return defaultValue
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  }

  private writeLocal<T>(key: string, value: T): void {
    if (!this.isBrowser) return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage quota or private browsing
    }
  }

  // --- Profile ---
  async getProfile(): Promise<TutorProfile> {
    if (isSupabaseConfigured()) {
      const client = getSupabase()
      if (client) {
        const { data } = await client.from('tutors').select('*').limit(1).single()
        if (data) return data as TutorProfile
      }
    }
    const key = this.getTutorKey('profile')
    const existing = this.readLocal<TutorProfile | null>(key, null)
    if (existing) return existing

    // Check if auth user exists in local session to build their real initial profile
    if (this.isBrowser) {
      try {
        const authRaw = localStorage.getItem('classio_auth_user')
        if (authRaw) {
          const auth = JSON.parse(authRaw)
          const newProfile: TutorProfile = {
            id: auth.id || `tutor-${Date.now()}`,
            name: auth.name || 'معلم جديد',
            title: auth.title || 'معلم خاص',
            subject: auth.subject || 'عام',
            phone: auth.phone || '',
            email: auth.email || '',
            avatar_initials: (auth.name || 'CL').slice(0, 2).toUpperCase(),
            center_names: [],
            instapay_handle: '',
            vodafone_cash_number: '',
            default_monthly_fee: 500,
            subscription_plan: auth.plan || 'free',
            max_students_limit: auth.planLimit || 10,
          }
          this.writeLocal(key, newProfile)
          return newProfile
        }
      } catch (e) {}
    }

    const blankProfile: TutorProfile = {
      id: 'tutor-new',
      name: 'معلم جديد',
      title: 'معلم خاص',
      subject: 'عام',
      phone: '',
      email: '',
      avatar_initials: 'CL',
      center_names: [],
      instapay_handle: '',
      vodafone_cash_number: '',
      default_monthly_fee: 500,
      subscription_plan: 'free',
      max_students_limit: 10,
    }
    return blankProfile
  }

  async saveProfile(profile: TutorProfile): Promise<TutorProfile> {
    const key = this.getTutorKey('profile')
    this.writeLocal(key, profile)
    if (isSupabaseConfigured()) {
      const client = getSupabase()
      if (client) {
        await client.from('tutors').upsert(profile)
      }
    }
    return profile
  }

  // --- Groups ---
  async getGroups(): Promise<Group[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabase()
      if (client) {
        const { data } = await client.from('groups').select('*').order('created_at', { ascending: false })
        if (data && data.length > 0) return data as Group[]
      }
    }
    return this.readLocal<Group[]>(this.getTutorKey('groups'), [])
  }

  async saveGroup(group: Group): Promise<Group> {
    const groups = await this.getGroups()
    const index = groups.findIndex((g) => g.id === group.id)
    const updated = index >= 0 ? groups.map((g) => (g.id === group.id ? group : g)) : [group, ...groups]
    this.writeLocal(this.getTutorKey('groups'), updated)

    if (isSupabaseConfigured()) {
      const client = getSupabase()
      if (client) {
        await client.from('groups').upsert(group)
      }
    }
    return group
  }

  async deleteGroup(groupId: string): Promise<void> {
    const groups = await this.getGroups()
    const updated = groups.filter((g) => g.id !== groupId)
    this.writeLocal(this.getTutorKey('groups'), updated)

    if (isSupabaseConfigured()) {
      const client = getSupabase()
      if (client) {
        await client.from('groups').delete().eq('id', groupId)
      }
    }
  }

  // --- Students & Success Profiles ---
  async getStudents(): Promise<Student[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabase()
      if (client) {
        const { data } = await client.from('students').select('*').order('created_at', { ascending: false })
        if (data && data.length > 0) return data as Student[]
      }
    }
    return this.readLocal<Student[]>(this.getTutorKey('students'), [])
  }

  async saveStudent(student: Student): Promise<Student> {
    const students = await this.getStudents()
    const index = students.findIndex((s) => s.id === student.id)
    const updated = index >= 0 ? students.map((s) => (s.id === student.id ? student : s)) : [student, ...students]
    this.writeLocal(this.getTutorKey('students'), updated)

    if (isSupabaseConfigured()) {
      const client = getSupabase()
      if (client) {
        await client.from('students').upsert(student)
      }
    }
    return student
  }

  async updateStudentPedagogy(
    studentId: string,
    updates: Partial<Student>
  ): Promise<Student | null> {
    const students = await this.getStudents()
    const index = students.findIndex((s) => s.id === studentId)
    if (index === -1) return null

    const updatedStudent = { ...students[index], ...updates }
    students[index] = updatedStudent
    this.writeLocal(this.getTutorKey('students'), students)

    if (isSupabaseConfigured()) {
      const client = getSupabase()
      if (client) {
        await client.from('students').update(updates).eq('id', studentId)
      }
    }
    return updatedStudent
  }

  async deleteStudent(studentId: string): Promise<void> {
    const students = await this.getStudents()
    const updated = students.filter((s) => s.id !== studentId)
    this.writeLocal(this.getTutorKey('students'), updated)

    if (isSupabaseConfigured()) {
      const client = getSupabase()
      if (client) {
        await client.from('students').delete().eq('id', studentId)
      }
    }
  }

  // --- Lessons & Homework Tracker ---
  async getLessons(groupId?: string): Promise<LessonPlan[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabase()
      if (client) {
        let query = client.from('lessons').select('*').order('lesson_date', { ascending: false })
        if (groupId) query = query.eq('group_id', groupId)
        const { data } = await query
        if (data && data.length > 0) return data as LessonPlan[]
      }
    }
    const all = this.readLocal<LessonPlan[]>(this.getTutorKey('lessons'), [])
    return groupId ? all.filter((l) => l.group_id === groupId) : all
  }

  async saveLesson(lesson: LessonPlan): Promise<LessonPlan> {
    const lessons = await this.getLessons()
    const index = lessons.findIndex((l) => l.id === lesson.id)
    const updated = index >= 0 ? lessons.map((l) => (l.id === lesson.id ? lesson : l)) : [lesson, ...lessons]
    this.writeLocal(this.getTutorKey('lessons'), updated)

    if (isSupabaseConfigured()) {
      const client = getSupabase()
      if (client) {
        await client.from('lessons').upsert(lesson)
      }
    }
    return lesson
  }

  async deleteLesson(lessonId: string): Promise<void> {
    const lessons = await this.getLessons()
    const updated = lessons.filter((l) => l.id !== lessonId)
    this.writeLocal(this.getTutorKey('lessons'), updated)

    if (isSupabaseConfigured()) {
      const client = getSupabase()
      if (client) {
        await client.from('lessons').delete().eq('id', lessonId)
      }
    }
  }

  // --- Attendance ---
  async getAttendance(groupIdOrStudentId?: string, date?: string): Promise<AttendanceRecord[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabase()
      if (client) {
        let query = client.from('attendance').select('*')
        if (groupIdOrStudentId) query = query.or(`group_id.eq.${groupIdOrStudentId},student_id.eq.${groupIdOrStudentId}`)
        if (date) query = query.eq('lesson_date', date)
        const { data } = await query
        if (data) return data as AttendanceRecord[]
      }
    }
    const all = this.readLocal<AttendanceRecord[]>(this.getTutorKey('attendance'), [])
    return all.filter((a) => {
      if (groupIdOrStudentId && a.group_id !== groupIdOrStudentId && a.student_id !== groupIdOrStudentId) return false
      if (date && a.lesson_date !== date) return false
      return true
    })
  }

  async saveAttendanceRecord(record: AttendanceRecord): Promise<AttendanceRecord> {
    const all = this.readLocal<AttendanceRecord[]>(this.getTutorKey('attendance'), [])
    const index = all.findIndex((a) => a.student_id === record.student_id && a.lesson_date === record.lesson_date)
    const updated = index >= 0 ? all.map((a, i) => (i === index ? record : a)) : [record, ...all]
    this.writeLocal(this.getTutorKey('attendance'), updated)

    // Update student's last_attendance in local list
    const students = await this.getStudents()
    const student = students.find((s) => s.id === record.student_id)
    if (student) {
      student.last_attendance = record.status
      if (record.quiz_score !== null && record.quiz_score !== undefined) {
        student.last_quiz_score = `${record.quiz_score}/${record.max_quiz_score ?? 20}`
      }
      this.writeLocal(this.getTutorKey('students'), students)
    }

    if (isSupabaseConfigured()) {
      const client = getSupabase()
      if (client) {
        await client.from('attendance').upsert(record)
      }
    }
    return record
  }

  // --- Payments ---
  async getPayments(studentId?: string): Promise<PaymentRecord[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabase()
      if (client) {
        let query = client.from('payments').select('*').order('created_at', { ascending: false })
        if (studentId) query = query.eq('student_id', studentId)
        const { data } = await query
        if (data && data.length > 0) return data as PaymentRecord[]
      }
    }
    const all = this.readLocal<PaymentRecord[]>(this.getTutorKey('payments'), [])
    return studentId ? all.filter((p) => p.student_id === studentId) : all
  }

  async recordPayment(payment: PaymentRecord): Promise<PaymentRecord> {
    const payments = await this.getPayments()
    const updatedPayments = [payment, ...payments]
    this.writeLocal(this.getTutorKey('payments'), updatedPayments)

    const students = await this.getStudents()
    const student = students.find((s) => s.id === payment.student_id)
    if (student) {
      student.paid_this_month = payment.status === 'paid'
      student.paid_amount = (student.paid_amount || 0) + payment.amount
      student.status = student.paid_this_month ? 'active' : 'late'
      this.writeLocal(this.getTutorKey('students'), students)
    }

    if (isSupabaseConfigured()) {
      const client = getSupabase()
      if (client) {
        await client.from('payments').insert(payment)
      }
    }
    return payment
  }

  // --- Dashboard Calculation ---
  async getDashboardStats(): Promise<DashboardStats> {
    const students = await this.getStudents()
    const groups = await this.getGroups()
    const payments = await this.getPayments()
    const today = new Date().toISOString().split('T')[0]
    const attendanceToday = await this.getAttendance(undefined, today)

    const totalStudents = students.length
    const activeGroups = groups.filter((g) => g.active).length

    const daysMap: Record<number, string> = {
      0: 'الأحد',
      1: 'الإثنين',
      2: 'الثلاثاء',
      3: 'الأربعاء',
      4: 'الخميس',
      5: 'الجمعة',
      6: 'السبت',
    }
    const todayDayName = daysMap[new Date().getDay()]
    const todayLessonsCount = groups.filter((g) => g.schedule_days && g.schedule_days.includes(todayDayName)).length

    const monthlyExpected = students.reduce((sum, s) => sum + (s.monthly_fee || 0), 0)
    const monthlyCollected = payments.reduce((sum, p) => sum + p.amount, 0)
    const monthlyOutstanding = Math.max(0, monthlyExpected - monthlyCollected)

    const presentCount = attendanceToday.filter((a) => a.status === 'present').length
    const attendanceRateToday = attendanceToday.length > 0 ? Math.round((presentCount / attendanceToday.length) * 100) : 0

    const pendingRemindersCount = students.filter((s) => !s.paid_this_month).length
    const studentsImprovingCount = students.filter((s) => s.trajectory === 'improving').length
    const averageHomeworkRate = students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + (s.homework_rate || 0), 0) / students.length)
      : 0

    return {
      totalStudents,
      activeGroups,
      todayLessonsCount,
      monthlyExpected,
      monthlyCollected,
      monthlyOutstanding,
      attendanceRateToday,
      pendingRemindersCount,
      studentsImprovingCount,
      averageHomeworkRate,
    }
  }

  // --- Assessments ---
  async getAssessments(studentId?: string): Promise<AssessmentRecord[]> {
    const all = this.readLocal<AssessmentRecord[]>(this.getTutorKey('assessments'), [])
    return studentId ? all.filter((a) => a.student_id === studentId) : all
  }

  async saveAssessment(record: AssessmentRecord): Promise<AssessmentRecord> {
    const all = await this.getAssessments()
    const index = all.findIndex((a) => a.id === record.id)
    const updated = index >= 0 ? all.map((a) => (a.id === record.id ? record : a)) : [record, ...all]
    this.writeLocal(this.getTutorKey('assessments'), updated)

    const students = await this.getStudents()
    const student = students.find((s) => s.id === record.student_id)
    if (student) {
      student.last_quiz_score = `${record.score}/${record.max_score}`
      this.writeLocal(this.getTutorKey('students'), students)
    }

    return record
  }

  async deleteAssessment(id: string): Promise<void> {
    const all = await this.getAssessments()
    const updated = all.filter((a) => a.id !== id)
    this.writeLocal(this.getTutorKey('assessments'), updated)
  }

  // --- Homeworks ---
  async getHomeworks(studentId?: string): Promise<HomeworkAssignment[]> {
    const all = this.readLocal<HomeworkAssignment[]>(this.getTutorKey('homeworks'), [])
    return studentId ? all.filter((h) => h.student_id === studentId) : all
  }

  async saveHomework(hw: HomeworkAssignment): Promise<HomeworkAssignment> {
    const all = await this.getHomeworks()
    const index = all.findIndex((h) => h.id === hw.id)
    const updated = index >= 0 ? all.map((h) => (h.id === hw.id ? hw : h)) : [hw, ...all]
    this.writeLocal(this.getTutorKey('homeworks'), updated)
    return hw
  }

  async deleteHomework(id: string): Promise<void> {
    const all = await this.getHomeworks()
    const updated = all.filter((h) => h.id !== id)
    this.writeLocal(this.getTutorKey('homeworks'), updated)
  }

  // --- Student Details & Controls ---
  async getStudentById(studentId: string): Promise<Student | null> {
    const students = await this.getStudents()
    return students.find((s) => s.id === studentId || s.student_code === studentId) || null
  }

  async addStudentNote(studentId: string, text: string, author?: string): Promise<Student | null> {
    const students = await this.getStudents()
    const student = students.find((s) => s.id === studentId)
    if (!student) return null

    const profile = await this.getProfile()
    const newNote = {
      id: `tn-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      text,
      author: author || profile.name || 'المعلم',
    }

    student.tutor_notes = [newNote, ...(student.tutor_notes || [])]
    this.writeLocal(this.getTutorKey('students'), students)
    return student
  }

  async deleteStudentNote(studentId: string, noteId: string): Promise<Student | null> {
    const students = await this.getStudents()
    const student = students.find((s) => s.id === studentId)
    if (!student || !student.tutor_notes) return null

    student.tutor_notes = student.tutor_notes.filter((n) => n.id !== noteId)
    this.writeLocal(this.getTutorKey('students'), students)
    return student
  }

  async addCommunicationLog(
    studentId: string,
    log: { type: 'whatsapp' | 'call' | 'in_person'; summary: string; recipient: string }
  ): Promise<Student | null> {
    const students = await this.getStudents()
    const student = students.find((s) => s.id === studentId)
    if (!student) return null

    const newLog = {
      id: `ch-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...log,
    }

    student.communication_history = [newLog, ...(student.communication_history || [])]
    this.writeLocal(this.getTutorKey('students'), students)
    return student
  }

  async changeStudentGroup(studentId: string, groupId: string, groupName: string): Promise<Student | null> {
    const students = await this.getStudents()
    const student = students.find((s) => s.id === studentId)
    if (!student) return null

    student.group_id = groupId
    student.group_name = groupName
    this.writeLocal(this.getTutorKey('students'), students)
    return student
  }

  async updateStudentStatus(
    studentId: string,
    status: 'active' | 'inactive' | 'archived'
  ): Promise<Student | null> {
    const students = await this.getStudents()
    const student = students.find((s) => s.id === studentId)
    if (!student) return null

    student.status = status
    this.writeLocal(this.getTutorKey('students'), students)
    return student
  }

  // --- Backup & Restore ---
  exportBackup(): void {
    if (!this.isBrowser) return
    const backup = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      profile: this.readLocal(this.getTutorKey('profile'), null),
      groups: this.readLocal(this.getTutorKey('groups'), []),
      students: this.readLocal(this.getTutorKey('students'), []),
      payments: this.readLocal(this.getTutorKey('payments'), []),
      attendance: this.readLocal(this.getTutorKey('attendance'), []),
      lessons: this.readLocal(this.getTutorKey('lessons'), []),
      assessments: this.readLocal(this.getTutorKey('assessments'), []),
      homeworks: this.readLocal(this.getTutorKey('homeworks'), []),
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `classio-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  restoreBackup(jsonString: string): boolean {
    if (!this.isBrowser) return false
    try {
      const parsed = JSON.parse(jsonString)
      if (parsed.profile) this.writeLocal(this.getTutorKey('profile'), parsed.profile)
      if (parsed.groups) this.writeLocal(this.getTutorKey('groups'), parsed.groups)
      if (parsed.students) this.writeLocal(this.getTutorKey('students'), parsed.students)
      if (parsed.payments) this.writeLocal(this.getTutorKey('payments'), parsed.payments)
      if (parsed.attendance) this.writeLocal(this.getTutorKey('attendance'), parsed.attendance)
      if (parsed.lessons) this.writeLocal(this.getTutorKey('lessons'), parsed.lessons)
      if (parsed.assessments) this.writeLocal(this.getTutorKey('assessments'), parsed.assessments)
      if (parsed.homeworks) this.writeLocal(this.getTutorKey('homeworks'), parsed.homeworks)
      return true
    } catch {
      return false
    }
  }

  // Reset to clean state for current tutor
  resetAll(): void {
    if (!this.isBrowser) return
    localStorage.removeItem(this.getTutorKey('profile'))
    localStorage.removeItem(this.getTutorKey('groups'))
    localStorage.removeItem(this.getTutorKey('students'))
    localStorage.removeItem(this.getTutorKey('payments'))
    localStorage.removeItem(this.getTutorKey('attendance'))
    localStorage.removeItem(this.getTutorKey('lessons'))
    localStorage.removeItem(this.getTutorKey('assessments'))
    localStorage.removeItem(this.getTutorKey('homeworks'))
  }
}

export const storage = new StorageService()
