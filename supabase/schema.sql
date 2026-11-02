-- ==============================================================================
-- Classio Platform - Supabase PostgreSQL Production Schema
-- Designed for Egyptian Private Tutors, Educational Centers, and Super Admin
-- Compatible with offline-first client IDs and UUIDs
-- ==============================================================================

-- 1. Enable UUID extension if needed
create extension if not exists "uuid-ossp";

-- 2. Tutors Table (Profiles & Subscription Engine)
create table if not exists public.tutors (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  name_ar text,
  name_en text,
  title text default 'معلم خاص',
  title_ar text,
  title_en text,
  subject text not null default 'عام',
  subject_ar text,
  subject_en text,
  phone text,
  email text,
  avatar_initials text default 'CL',
  center_names text[] default array[]::text[],
  center_names_ar text[] default array[]::text[],
  center_names_en text[] default array[]::text[],
  instapay_handle text default 'sayed017@instapay',
  vodafone_cash_number text default '',
  default_monthly_fee numeric default 500,
  
  -- Subscription & Tier Limits
  subscription_plan text default 'free',
  subscription_cycle text default 'monthly',
  max_students_limit integer default 10,
  subscription_status text default 'free',
  subscription_starts_at timestamp with time zone,
  subscription_expires_at timestamp with time zone,
  payment_submitted_at timestamp with time zone,
  activated_at timestamp with time zone,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Groups Table (المجموعات والسناتر)
create table if not exists public.groups (
  id text primary key,
  tutor_id text references public.tutors(id) on delete cascade,
  name text not null,
  name_ar text,
  name_en text,
  stage text not null,
  stage_label text not null,
  stage_label_en text,
  subject text not null,
  subject_en text,
  center_name text default 'السنتر الرئيسي',
  center_name_en text,
  schedule_days text[] default array['السبت', 'الثلاثاء']::text[],
  schedule_days_en text[] default array[]::text[],
  time_slot text default '04:00 م - 06:00 م',
  time_slot_en text,
  monthly_fee numeric not null default 500,
  session_fee numeric default 150,
  max_students integer default 30,
  student_count integer default 0,
  current_chapter text,
  current_chapter_en text,
  color_tone text default 'blue',
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Students Table (الطلاب ومؤشرات النجاح)
create table if not exists public.students (
  id text primary key,
  tutor_id text references public.tutors(id) on delete cascade,
  group_id text references public.groups(id) on delete set null,
  group_name text,
  group_name_en text,
  name text not null,
  name_ar text,
  name_en text,
  student_phone text,
  parent_name text,
  parent_phone text not null,
  parent_relation text default 'ولي الأمر',
  school text,
  school_en text,
  grade text,
  student_code text,
  status text default 'active',
  monthly_fee numeric default 500,
  paid_this_month boolean default false,
  paid_amount numeric default 0,
  notes text,
  notes_en text,
  joined_date text,
  last_attendance text,
  last_quiz_score text,
  initials text,
  
  -- Pedagogical & Success Profile Fields
  trajectory text default 'improving', -- improving, steady, needs_attention
  target_score_percent integer default 90,
  target_goal text default 'التفوق في الثانوية العامة',
  target_goal_en text,
  attendance_rate numeric default 100,
  homework_rate numeric default 100,
  next_recommended_action text,
  next_recommended_action_en text,
  weak_topics jsonb default '[]'::jsonb,
  tutor_notes jsonb default '[]'::jsonb,
  communication_history jsonb default '[]'::jsonb,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Lesson Plans & Curriculum Tracker (دفتر الحصص والواجبات)
create table if not exists public.lessons (
  id text primary key,
  tutor_id text references public.tutors(id) on delete cascade,
  group_id text references public.groups(id) on delete cascade not null,
  group_name text,
  group_name_en text,
  lesson_date date default current_date not null,
  unit_name text not null,
  unit_name_en text,
  topic_title text not null,
  topic_title_en text,
  lesson_summary text,
  lesson_summary_en text,
  homework_title text,
  homework_title_en text,
  homework_pages text,
  homework_pages_en text,
  homework_due_date date,
  resources_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Attendance Table (سجل الحضور اليومي والواجب)
create table if not exists public.attendance (
  id text primary key,
  tutor_id text references public.tutors(id) on delete cascade,
  student_id text references public.students(id) on delete cascade not null,
  student_name text,
  student_name_en text,
  group_id text references public.groups(id) on delete cascade not null,
  lesson_date date default current_date not null,
  status text default 'present', -- present, absent, excused, late
  homework_done boolean default true,
  homework_quality text default 'complete',
  quiz_score numeric,
  max_quiz_score numeric default 20,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_student_lesson_date unique (student_id, lesson_date)
);

-- 7. Assessment Exams (الامتحانات الشاملة والدورية)
create table if not exists public.exams (
  id text primary key,
  tutor_id text references public.tutors(id) on delete cascade,
  group_id text references public.groups(id) on delete cascade not null,
  group_name text,
  title text not null,
  exam_date date default current_date not null,
  max_score numeric default 100,
  average_score numeric,
  topics_covered text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Payments Table (سجل التحصيل والإيصالات)
create table if not exists public.payments (
  id text primary key,
  tutor_id text references public.tutors(id) on delete cascade,
  student_id text references public.students(id) on delete cascade not null,
  student_name text,
  student_name_en text,
  group_id text references public.groups(id) on delete set null,
  group_name text,
  group_name_en text,
  month_year text not null,
  month_year_en text,
  amount numeric not null,
  payment_date date default current_date not null,
  method text default 'cash', -- cash, vodafone_cash, instapay, bank_transfer
  status text default 'paid',
  receipt_number text not null unique,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for High Performance Querying
create index if not exists idx_groups_tutor_id on public.groups(tutor_id);
create index if not exists idx_students_tutor_id on public.students(tutor_id);
create index if not exists idx_students_group_id on public.students(group_id);
create index if not exists idx_students_student_code on public.students(student_code);
create index if not exists idx_lessons_group_date on public.lessons(group_id, lesson_date);
create index if not exists idx_attendance_student_id on public.attendance(student_id);
create index if not exists idx_attendance_group_date on public.attendance(group_id, lesson_date);
create index if not exists idx_payments_student_id on public.payments(student_id);
create index if not exists idx_payments_receipt_number on public.payments(receipt_number);
create index if not exists idx_exams_group_id on public.exams(group_id);

-- Row Level Security (RLS) Enablement
alter table public.tutors enable row level security;
alter table public.groups enable row level security;
alter table public.students enable row level security;
alter table public.lessons enable row level security;
alter table public.attendance enable row level security;
alter table public.exams enable row level security;
alter table public.payments enable row level security;

-- Policies: Allow full read/write for anon client access (for seamless client integration)
-- Can be restricted to authenticated user_id once Supabase Auth is activated
create policy "Anon full access to tutors" on public.tutors for all using (true) with check (true);
create policy "Anon full access to groups" on public.groups for all using (true) with check (true);
create policy "Anon full access to students" on public.students for all using (true) with check (true);
create policy "Anon full access to lessons" on public.lessons for all using (true) with check (true);
create policy "Anon full access to attendance" on public.attendance for all using (true) with check (true);
create policy "Anon full access to exams" on public.exams for all using (true) with check (true);
create policy "Anon full access to payments" on public.payments for all using (true) with check (true);
