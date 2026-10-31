-- ==============================================================================
-- Muallemi Tutor CRM - Supabase PostgreSQL Schema (for Egypt Tutors & Centers)
-- Complete Tutor Management & Student Success Platform Schema
-- ==============================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Tutors Table (Profiles)
create table if not exists public.tutors (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  title text default 'مدرس',
  subject text not null,
  phone text,
  email text,
  avatar_initials text default 'م',
  center_names text[] default array[]::text[],
  instapay_handle text,
  vodafone_cash_number text,
  default_monthly_fee numeric default 800,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Groups Table (المجموعات والسناتر)
create table if not exists public.groups (
  id uuid primary key default uuid_generate_v4(),
  tutor_id uuid references public.tutors(id) on delete cascade,
  name text not null,
  stage text not null,
  stage_label text not null,
  subject text not null,
  center_name text default 'السنتر الرئيسي',
  schedule_days text[] default array['السبت', 'الثلاثاء']::text[],
  time_slot text default '04:00 م - 06:00 م',
  monthly_fee numeric not null default 800,
  session_fee numeric default 200,
  max_students integer default 30,
  current_chapter text,
  color_tone text default 'blue',
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Students Table (الطلاب ومؤشرات النجاح)
create table if not exists public.students (
  id uuid primary key default uuid_generate_v4(),
  tutor_id uuid references public.tutors(id) on delete cascade,
  group_id uuid references public.groups(id) on delete set null,
  name text not null,
  student_phone text,
  parent_phone text not null,
  parent_relation text default 'ولي الأمر',
  school text,
  student_code text unique,
  status text default 'active',
  monthly_fee numeric default 800,
  paid_this_month boolean default false,
  paid_amount numeric default 0,
  notes text,
  -- Pedagogical fields
  trajectory text default 'improving', -- improving, steady, needs_attention
  target_score_percent integer default 90,
  target_goal text default 'التفوق في الثانوية العامة',
  next_recommended_action text,
  weak_topics jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Lesson Plans & Curriculum Tracker (دفتر تحضير ومحتوى الحصص)
create table if not exists public.lessons (
  id uuid primary key default uuid_generate_v4(),
  tutor_id uuid references public.tutors(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade not null,
  lesson_date date default current_date not null,
  unit_name text not null,
  topic_title text not null,
  lesson_summary text,
  homework_title text,
  homework_pages text,
  homework_due_date date,
  resources_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Attendance Table (سجل الحضور والواجب)
create table if not exists public.attendance (
  id uuid primary key default uuid_generate_v4(),
  tutor_id uuid references public.tutors(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade not null,
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
  id uuid primary key default uuid_generate_v4(),
  tutor_id uuid references public.tutors(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade not null,
  title text not null,
  exam_date date default current_date not null,
  max_score numeric default 100,
  average_score numeric,
  topics_covered text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Payments Table (المدفوعات والمصروفات)
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  tutor_id uuid references public.tutors(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete set null,
  month_year text not null,
  amount numeric not null,
  payment_date date default current_date not null,
  method text default 'cash', -- cash, vodafone_cash, instapay, bank_transfer
  status text default 'paid',
  receipt_number text not null unique,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for High Performance
create index if not exists idx_groups_tutor_id on public.groups(tutor_id);
create index if not exists idx_students_tutor_id on public.students(tutor_id);
create index if not exists idx_students_group_id on public.students(group_id);
create index if not exists idx_students_student_code on public.students(student_code);
create index if not exists idx_lessons_group_date on public.lessons(group_id, lesson_date);
create index if not exists idx_attendance_student_id on public.attendance(student_id);
create index if not exists idx_attendance_group_date on public.attendance(group_id, lesson_date);
create index if not exists idx_payments_student_id on public.payments(student_id);
create index if not exists idx_exams_group_id on public.exams(group_id);

-- Row Level Security (RLS)
alter table public.tutors enable row level security;
alter table public.groups enable row level security;
alter table public.students enable row level security;
alter table public.lessons enable row level security;
alter table public.attendance enable row level security;
alter table public.exams enable row level security;
alter table public.payments enable row level security;

-- Policies for Authenticated Tutors
create policy "Allow tutor full access to own profile" on public.tutors for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Allow tutor full access to own groups" on public.groups for all using (tutor_id in (select id from public.tutors where user_id = auth.uid()));
create policy "Allow tutor full access to own students" on public.students for all using (tutor_id in (select id from public.tutors where user_id = auth.uid()));
create policy "Allow tutor full access to own lessons" on public.lessons for all using (tutor_id in (select id from public.tutors where user_id = auth.uid()));
create policy "Allow tutor full access to own attendance" on public.attendance for all using (tutor_id in (select id from public.tutors where user_id = auth.uid()));
create policy "Allow tutor full access to own exams" on public.exams for all using (tutor_id in (select id from public.tutors where user_id = auth.uid()));
create policy "Allow tutor full access to own payments" on public.payments for all using (tutor_id in (select id from public.tutors where user_id = auth.uid()));

-- Local / Demo Policies for Development
create policy "Anon access for local development tutors" on public.tutors for all using (true) with check (true);
create policy "Anon access for local development groups" on public.groups for all using (true) with check (true);
create policy "Anon access for local development students" on public.students for all using (true) with check (true);
create policy "Anon access for local development lessons" on public.lessons for all using (true) with check (true);
create policy "Anon access for local development attendance" on public.attendance for all using (true) with check (true);
create policy "Anon access for local development exams" on public.exams for all using (true) with check (true);
create policy "Anon access for local development payments" on public.payments for all using (true) with check (true);
