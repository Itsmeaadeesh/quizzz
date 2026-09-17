-- ==============================================================================
-- StayAheadd Database Schema (Supabase / PostgreSQL)
-- Fully idempotent: safe to run multiple times without 42710 errors
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: Quizzes
create table if not exists public.quizzes (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete set null,
    title text not null,
    file_name text not null,
    file_type text not null default 'text',
    raw_text_preview text,
    config jsonb not null default '{}'::jsonb,
    questions jsonb not null default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: Quiz Attempts / History
create table if not exists public.quiz_attempts (
    id uuid primary key default uuid_generate_v4(),
    quiz_id uuid references public.quizzes(id) on delete cascade,
    user_id uuid references auth.users(id) on delete set null,
    score integer not null default 0,
    total_questions integer not null default 0,
    percentage numeric(5, 2) not null default 0.00,
    user_answers jsonb not null default '[]'::jsonb,
    time_taken_seconds integer default 0,
    completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_quizzes_user on public.quizzes(user_id);
create index if not exists idx_quiz_attempts_user on public.quiz_attempts(user_id);
create index if not exists idx_quiz_attempts_quiz on public.quiz_attempts(quiz_id);

-- Enable Row Level Security (RLS)
alter table public.quizzes enable row level security;
alter table public.quiz_attempts enable row level security;

-- Drop existing policies before creating to ensure idempotence
drop policy if exists "Allow public read of quizzes" on public.quizzes;
drop policy if exists "Allow insert to quizzes" on public.quizzes;
drop policy if exists "Allow users to update own quizzes" on public.quizzes;

create policy "Allow public read of quizzes"
    on public.quizzes for select
    using (true);

create policy "Allow insert to quizzes"
    on public.quizzes for insert
    with check (true);

create policy "Allow users to update own quizzes"
    on public.quizzes for update
    using (auth.uid() = user_id or user_id is null);

-- Drop existing attempt policies before creating
drop policy if exists "Allow users to view own attempts or public" on public.quiz_attempts;
drop policy if exists "Allow users to insert attempts" on public.quiz_attempts;

create policy "Allow users to view own attempts or public"
    on public.quiz_attempts for select
    using (true);

create policy "Allow users to insert attempts"
    on public.quiz_attempts for insert
    with check (true);
