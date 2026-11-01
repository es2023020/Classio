import {
  Student,
  Group,
  TutorProfile,
  PaymentRecord,
  LessonPlan,
  TopicMastery,
  LearningTrajectory,
  TopicMasteryLevel,
  PaymentMethod,
} from './types'

// Common Egyptian tutor translations mapping dictionary
const NAME_MAP: Record<string, string> = {
  'سلمى محمد عبد الرحمن': 'Salma Mohamed Abdelrahman',
  'أحمد محمود الشناوي': 'Ahmed Mahmoud El-Shennawy',
  'عمر طارق الجمال': 'Omar Tarek El-Gammal',
  'مريم إبراهيم خليل': 'Mariam Ibrahim Khalil',
  'زياد حسام الدين': 'Ziad Hossam El-Din',
  'نور الهدى كريم': 'Nour El-Hoda Karim',
  'أحمد محمود': 'Ahmed Mahmoud',
  'سارة نبيل': 'Sara Nabil',
  'عمر خالد': 'Omar Khaled',
  'محمد الشافعي': 'Mohamed El-Shafei',
  'نورا حسن': 'Noura Hassan',
  'يوسف أحمد': 'Youssef Ahmed',
  'كريم عادل': 'Karim Adel',
  'فاطمة علي': 'Fatma Ali',
  'محمود حسن': 'Mahmoud Hassan',
  'حسام الدين': 'Hossam El-Din',
  'منى إبراهيم': 'Mona Ibrahim',
  'خالد عبد الله': 'Khaled Abdullah',
  'طارق مصطفى': 'Tarek Mostafa',
}

const VOCAB_MAP: Record<string, string> = {
  // Common Egyptian names
  'محمد': 'Mohamed',
  'أحمد': 'Ahmed',
  'محمود': 'Mahmoud',
  'عبد الرحمن': 'Abdelrahman',
  'عبد الله': 'Abdullah',
  'علي': 'Ali',
  'حسن': 'Hassan',
  'حسين': 'Hussein',
  'مصطفى': 'Mostafa',
  'إبراهيم': 'Ibrahim',
  'خالد': 'Khaled',
  'طارق': 'Tarek',
  'كريم': 'Karim',
  'يوسف': 'Youssef',
  'زياد': 'Ziad',
  'عمر': 'Omar',
  'عمرو': 'Amr',
  'سارة': 'Sara',
  'مريم': 'Mariam',
  'سلمى': 'Salma',
  'نور': 'Nour',
  'الهدى': 'El-Hoda',
  'فاطمة': 'Fatma',
  'آية': 'Aya',
  'ياسمين': 'Yasmine',
  'منى': 'Mona',
  'هدى': 'Hoda',
  'رانيا': 'Rania',
  'دينا': 'Dina',
  'حسام': 'Hossam',
  'الدين': 'El-Din',
  'عادل': 'Adel',
  'نبيل': 'Nabil',
  'الشناوي': 'El-Shennawy',
  'الجمال': 'El-Gammal',
  'خليل': 'Khalil',
  'الشافعي': 'El-Shafei',
  'النجار': 'El-Naggar',
  'الحداد': 'El-Haddad',
  'البدري': 'El-Badry',
  'صلاح': 'Salah',
  'هاني': 'Hany',
  'وليد': 'Waleed',
  'ياسر': 'Yasser',
  'شريف': 'Sherif',
  'سامح': 'Sameh',
  'ماجد': 'Maged',
  'تامر': 'Tamer',
  'وائل': 'Wael',
  'عصام': 'Essam',
  'سامي': 'Samy',
  'رمضان': 'Ramadan',

  // Centers, Locations, Groups
  'سنتر': 'Center',
  'الأوائل': 'Al-Awael',
  'النخبة': 'Al-Nokhba',
  'الأهرام': 'Al-Ahram',
  'الرواد': 'Al-Rowad',
  'القمة': 'Al-Qemma',
  'الفرسان': 'Al-Forsan',
  'التفوق': 'Al-Tafawwoq',
  'الإيمان': 'Al-Iman',
  'الزهراء': 'Al-Zahraa',
  'المدينة': 'Al-Madina',
  'مدينة نصر': 'Nasr City',
  'التجمع': 'New Cairo',
  'التجمع الخامس': 'Fifth Settlement',
  'المهندسين': 'Mohandessin',
  'المعادي': 'Maadi',
  'الدقي': 'Dokki',
  'مصر الجديدة': 'Heliopolis',
  'الشروق': 'Al-Shorouk',
  'الشيخ زايد': 'Sheikh Zayed',
  '٦ أكتوبر': '6th of October',
  'أكتوبر': 'October',
  'شبرا': 'Shubra',
  'الهرم': 'Haram',
  'فيصل': 'Faisal',
  'الإسكندرية': 'Alexandria',
  'سموحة': 'Smouha',
  'حصص أونلاين': 'Online Sessions',
  'أونلاين': 'Online',
  'مجموعة': 'Group',

  // Subjects & Stages
  'فيزياء': 'Physics',
  'الفيزياء': 'Physics',
  'كيمياء': 'Chemistry',
  'الكيمياء': 'Chemistry',
  'أحياء': 'Biology',
  'الأحياء': 'Biology',
  'رياضيات': 'Mathematics',
  'الرياضيات': 'Mathematics',
  'لغة إنجليزية': 'English Language',
  'اللغة العربية': 'Arabic Language',
  'لغات': 'Languages',
  'ثانوية عامة': 'Thanaweya Amma',
  '٣ ث': '3rd Sec',
  '٢ ث': '2nd Sec',
  '١ ث': '1st Sec',
  'الصف الثالث الثانوي': '3rd Secondary (Grade 12)',
  'الصف الثاني الثانوي': '2nd Secondary (Grade 11)',
  'الصف الأول الثانوي': '1st Secondary (Grade 10)',
  'الصف الثالث الإعدادي': '3rd Preparatory (Grade 9)',
}

const CENTER_MAP: Record<string, string> = {
  'سنتر الأوائل — مدينة نصر': 'Al-Awael Center — Nasr City',
  'سنتر النخبة — التجمع': 'Al-Nokhba Center — New Cairo',
  'سنتر الأهرام — المهندسين': 'Al-Ahram Center — Mohandessin',
  'حصص أونلاين': 'Online Sessions',
}

const GROUP_MAP: Record<string, string> = {
  'فيزياء ٣ ث — سنتر الأوائل': 'Physics 3rd Sec — Al-Awael Center',
  'فيزياء ٣ ث — سنتر النخبة': 'Physics 3rd Sec — Al-Nokhba Center',
  'كيمياء ٢ ث — سنتر الأهرام': 'Chemistry 2nd Sec — Al-Ahram Center',
  'فيزياء لغات (Physics) — أونلاين': 'Physics (Languages) — Online',
}

const SUBJECT_MAP: Record<string, string> = {
  'فيزياء': 'Physics',
  'الفيزياء': 'Physics',
  'كيمياء': 'Chemistry',
  'الكيمياء': 'Chemistry',
  'الفيزياء للثانوية العامة': 'Physics for Thanaweya Amma',
  'رياضيات': 'Mathematics',
  'الرياضيات': 'Mathematics',
  'أحياء': 'Biology',
  'الأحياء': 'Biology',
  'لغة إنجليزية': 'English Language',
  'اللغة العربية': 'Arabic Language',
}

const STAGE_MAP: Record<string, string> = {
  'الصف الثالث الثانوي': '3rd Secondary (Grade 12)',
  'الصف الثاني الثانوي': '2nd Secondary (Grade 11)',
  'الصف الأول الثانوي': '1st Secondary (Grade 10)',
  'الصف الثالث الثانوي (لغات)': '3rd Secondary (Language Section)',
  'الصف الثالث الإعدادي': '3rd Preparatory (Grade 9)',
}

const CHAPTER_MAP: Record<string, string> = {
  'الفصل الثالث: الحث الكهرومغناطيسي': 'Chapter 3: Electromagnetic Induction',
  'الفصل الثاني: التأثير المغناطيسي للتيار': 'Chapter 2: Magnetic Effects of Electric Current',
  'الباب الثاني: الجدول الدوري وتدرج الخواص': 'Chapter 2: Periodic Table & Periodic Trends',
  'Chapter 3: Electromagnetic Induction': 'الفصل الثالث: الحث الكهرومغناطيسي',
}

const CHAR_MAP: Record<string, string> = {
  'أ': 'A', 'إ': 'E', 'آ': 'A', 'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th',
  'ج': 'g', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z',
  'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a',
  'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ة': 'a', 'ء': '\'', 'ئ': 'e', 'ؤ': 'o'
}

/**
 * Phonetically transliterate or translate any Arabic string to English
 */
export function autoLocalizeToEnglish(arabicText: string): string {
  if (!arabicText) return ''
  const trimmed = arabicText.trim()
  if (NAME_MAP[trimmed]) return NAME_MAP[trimmed]
  if (GROUP_MAP[trimmed]) return GROUP_MAP[trimmed]
  if (CENTER_MAP[trimmed]) return CENTER_MAP[trimmed]
  if (SUBJECT_MAP[trimmed]) return SUBJECT_MAP[trimmed]
  if (STAGE_MAP[trimmed]) return STAGE_MAP[trimmed]
  if (CHAPTER_MAP[trimmed]) return CHAPTER_MAP[trimmed]
  if (VOCAB_MAP[trimmed]) return VOCAB_MAP[trimmed]

  // If already contains mostly Latin chars, return as is
  if (/^[A-Za-z0-9\s\-—.,()&]+$/.test(trimmed)) {
    return trimmed
  }

  // Token-by-token replacement
  // Handle phrases separated by —, -, or space
  const delimiterParts = trimmed.split(/\s*([—\-])\s*/)
  if (delimiterParts.length > 1) {
    return delimiterParts.map(part => {
      if (part === '—' || part === '-') return ` ${part} `
      return autoLocalizeToEnglish(part)
    }).join('').replace(/\s+/g, ' ').trim()
  }

  // Word-by-word
  const words = trimmed.split(/\s+/)
  const translatedWords = words.map(w => {
    if (VOCAB_MAP[w]) return VOCAB_MAP[w]
    // Check with 'ال' stripped
    if (w.startsWith('ال') && VOCAB_MAP[w.slice(2)]) {
      return `Al-${VOCAB_MAP[w.slice(2)]}`
    }
    // Letter-by-letter fallback transliteration
    let trans = ''
    for (const char of w) {
      trans += CHAR_MAP[char] || char
    }
    return trans.charAt(0).toUpperCase() + trans.slice(1)
  })

  return translatedWords.join(' ')
}

const DAYS_MAP: Record<string, string> = {
  'السبت': 'Saturday',
  'الأحد': 'Sunday',
  'الإثنين': 'Monday',
  'الثلاثاء': 'Tuesday',
  'الأربعاء': 'Wednesday',
  'الخميس': 'Thursday',
  'الجمعة': 'Friday',
}

const MONTHS_MAP: Record<string, string> = {
  'مايو ٢٠٢٤': 'May 2024',
  'مايو ٢٠٢٦': 'May 2026',
  'أبريل ٢٠٢٦': 'April 2026',
  'يونيو ٢٠٢٦': 'June 2026',
  'مارس ٢٠٢٦': 'March 2026',
}

export function localizeStudent(student: Student, lang: 'en' | 'ar'): Student {
  if (lang === 'ar') {
    return {
      ...student,
      name: student.name_ar || student.name,
      group_name: student.group_name,
    }
  }

  // English localization
  const enName = student.name_en || NAME_MAP[student.name] || autoLocalizeToEnglish(student.name)
  const enGroup = student.group_name_en || GROUP_MAP[student.group_name] || autoLocalizeToEnglish(student.group_name)
  const enSchool = student.school_en || (student.school ? `${autoLocalizeToEnglish(student.school)} (Secondary)` : undefined)
  const enGoal = student.target_goal_en || student.target_goal
  const enAction = student.next_recommended_action_en || student.next_recommended_action

  const localizedTopics = student.weak_topics?.map((topic) => ({
    ...topic,
    topic_name: topic.topic_name_en || autoLocalizeToEnglish(topic.topic_name),
  }))

  return {
    ...student,
    name: enName,
    group_name: enGroup,
    school: enSchool,
    target_goal: enGoal,
    next_recommended_action: enAction,
    weak_topics: localizedTopics,
  }
}

export function localizeGroup(group: Group, lang: 'en' | 'ar'): Group {
  if (lang === 'ar') {
    return {
      ...group,
      name: group.name_ar || group.name,
      center_name: group.center_name,
      subject: group.subject,
      stage_label: group.stage_label,
      current_chapter: group.current_chapter,
    }
  }

  // English localization
  const enName = group.name_en || GROUP_MAP[group.name] || autoLocalizeToEnglish(group.name)
  const enCenter = group.center_name_en || CENTER_MAP[group.center_name] || autoLocalizeToEnglish(group.center_name)
  const enSubject = group.subject_en || SUBJECT_MAP[group.subject] || autoLocalizeToEnglish(group.subject)
  const enStage = group.stage_label_en || STAGE_MAP[group.stage_label] || autoLocalizeToEnglish(group.stage_label)
  const enChapter = group.current_chapter_en || (group.current_chapter ? CHAPTER_MAP[group.current_chapter] || autoLocalizeToEnglish(group.current_chapter) : undefined)
  const enDays = group.schedule_days_en || group.schedule_days.map((d) => DAYS_MAP[d] || d)
  const enTime = group.time_slot_en || group.time_slot.replace('م', 'PM').replace('ص', 'AM')

  return {
    ...group,
    name: enName,
    center_name: enCenter,
    subject: enSubject,
    stage_label: enStage,
    current_chapter: enChapter,
    schedule_days: enDays,
    time_slot: enTime,
  }
}

export function localizeTutor(tutor: TutorProfile, lang: 'en' | 'ar'): TutorProfile {
  if (lang === 'ar') {
    return tutor
  }

  const enName = tutor.name_en || NAME_MAP[tutor.name] || autoLocalizeToEnglish(tutor.name)
  const enTitle = tutor.title_en || 'Senior Physics & Chemistry Educator'
  const enSubject = tutor.subject_en || SUBJECT_MAP[tutor.subject] || autoLocalizeToEnglish(tutor.subject)
  const enCenters = tutor.center_names_en || tutor.center_names.map((c) => CENTER_MAP[c] || autoLocalizeToEnglish(c))

  return {
    ...tutor,
    name: enName,
    title: enTitle,
    subject: enSubject,
    center_names: enCenters,
  }
}

export function localizePayment(payment: PaymentRecord, lang: 'en' | 'ar'): PaymentRecord {
  if (lang === 'ar') {
    return payment
  }

  const enStudentName = payment.student_name_en || NAME_MAP[payment.student_name] || autoLocalizeToEnglish(payment.student_name)
  const enGroupName = payment.group_name_en || GROUP_MAP[payment.group_name] || autoLocalizeToEnglish(payment.group_name)
  const enMonth = payment.month_year_en || MONTHS_MAP[payment.month_year] || autoLocalizeToEnglish(payment.month_year)

  return {
    ...payment,
    student_name: enStudentName,
    group_name: enGroupName,
    month_year: enMonth,
  }
}

export function localizeLesson(lesson: LessonPlan, lang: 'en' | 'ar'): LessonPlan {
  if (lang === 'ar') {
    return lesson
  }

  return {
    ...lesson,
    group_name: lesson.group_name_en || GROUP_MAP[lesson.group_name] || autoLocalizeToEnglish(lesson.group_name),
    unit_name: lesson.unit_name_en || autoLocalizeToEnglish(lesson.unit_name),
    topic_title: lesson.topic_title_en || autoLocalizeToEnglish(lesson.topic_title),
    lesson_summary: lesson.lesson_summary_en || lesson.lesson_summary,
    homework_title: lesson.homework_title_en || autoLocalizeToEnglish(lesson.homework_title),
    homework_pages: lesson.homework_pages_en || lesson.homework_pages,
  }
}

export function formatPrice(amount: number, _lang?: 'en' | 'ar'): string {
  return `EGP ${amount.toLocaleString('en-US')}`
}

export function getTrajectoryBadgeText(trajectory: LearningTrajectory | undefined, lang: 'en' | 'ar'): string {
  if (lang === 'en') {
    switch (trajectory) {
      case 'improving':
        return 'Improving'
      case 'needs_attention':
        return 'Needs Attention'
      case 'steady':
      default:
        return 'Steady'
    }
  }
  switch (trajectory) {
    case 'improving':
      return 'في تحسن مستمر'
    case 'needs_attention':
      return 'يحتاج متابعة'
    case 'steady':
    default:
      return 'مستوى مستقر'
  }
}

export function getTopicLevelBadge(level: TopicMasteryLevel, lang: 'en' | 'ar'): { text: string; color: string } {
  if (lang === 'en') {
    switch (level) {
      case 'strong':
        return { text: 'Strong', color: 'bg-emerald-100 text-emerald-800' }
      case 'needs_practice':
        return { text: 'Needs Practice', color: 'bg-amber-100 text-amber-800' }
      case 'review_required':
        return { text: 'Review Required', color: 'bg-rose-100 text-rose-800' }
    }
  }
  switch (level) {
    case 'strong':
      return { text: 'متقن وممتاز', color: 'bg-emerald-100 text-emerald-800' }
    case 'needs_practice':
      return { text: 'يحتاج تدريب', color: 'bg-amber-100 text-amber-800' }
    case 'review_required':
      return { text: 'إعادة شرح فورية', color: 'bg-rose-100 text-rose-800' }
  }
}

export function getPaymentMethodBadgeText(method: PaymentMethod, lang: 'en' | 'ar'): string {
  if (lang === 'en') {
    switch (method) {
      case 'instapay':
        return 'InstaPay'
      case 'vodafone_cash':
        return 'Vodafone Cash'
      case 'cash':
        return 'Cash'
      case 'bank_transfer':
        return 'Bank Transfer'
    }
  }
  switch (method) {
    case 'instapay':
      return 'إنستاباي'
    case 'vodafone_cash':
      return 'فودافون كاش'
    case 'cash':
      return 'نقداً'
    case 'bank_transfer':
      return 'تحويل بنكي'
  }
}
