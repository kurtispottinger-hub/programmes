-- Game IQ — Initial Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── USERS ───────────────────────────────────────────────────────────────────
-- Mirrors Supabase auth.users with role and profile info
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null check (role in ('coach', 'player', 'parent')),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- Users can read their own record; coach can read all
create policy "users_self_read" on public.users
  for select using (auth.uid() = id);

create policy "coach_read_all_users" on public.users
  for select using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'coach')
  );

create policy "users_self_update" on public.users
  for update using (auth.uid() = id);

create policy "coach_insert_users" on public.users
  for insert with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'coach')
  );

-- ─── PLAYERS ─────────────────────────────────────────────────────────────────
create table if not exists public.players (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  parent_id uuid references public.users(id) on delete set null,
  age integer,
  position text,
  programme_tier text check (programme_tier in ('GIA', 'Game IQ Remote')),
  development_focus text,
  join_date date not null default current_date,
  streak_count integer not null default 0,
  last_active timestamptz default now(),
  created_at timestamptz not null default now()
);

alter table public.players enable row level security;

create policy "player_self_read" on public.players
  for select using (auth.uid() = user_id);

create policy "parent_read_child" on public.players
  for select using (auth.uid() = parent_id);

create policy "coach_full_access_players" on public.players
  for all using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'coach')
  );

-- ─── SESSION NOTES ───────────────────────────────────────────────────────────
create table if not exists public.session_notes (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references public.players(id) on delete cascade,
  date date not null,
  session_type text check (session_type in ('in-person', 'remote')),
  content text,
  coach_private_note text,
  created_at timestamptz not null default now()
);

alter table public.session_notes enable row level security;

-- Player sees note content (not coach_private_note — handled by column select in queries)
create policy "player_read_session_notes" on public.session_notes
  for select using (
    exists (select 1 from public.players p where p.id = player_id and p.user_id = auth.uid())
  );

create policy "parent_read_session_notes" on public.session_notes
  for select using (
    exists (select 1 from public.players p where p.id = player_id and p.parent_id = auth.uid())
  );

create policy "coach_full_access_notes" on public.session_notes
  for all using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'coach')
  );

-- ─── GAME LOGS ───────────────────────────────────────────────────────────────
create table if not exists public.game_logs (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references public.players(id) on delete cascade,
  date date not null,
  opponent text,
  result text check (result in ('win', 'draw', 'loss')),
  score text,
  position text,
  minutes integer,
  self_rating integer check (self_rating between 1 and 5),
  reflection_question text,
  reflection_answer text,
  created_at timestamptz not null default now()
);

alter table public.game_logs enable row level security;

create policy "player_full_access_game_logs" on public.game_logs
  for all using (
    exists (select 1 from public.players p where p.id = player_id and p.user_id = auth.uid())
  );

create policy "parent_read_game_logs" on public.game_logs
  for select using (
    exists (select 1 from public.players p where p.id = player_id and p.parent_id = auth.uid())
  );

create policy "coach_full_access_game_logs" on public.game_logs
  for all using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'coach')
  );

-- ─── HOMEWORK ────────────────────────────────────────────────────────────────
create table if not exists public.homework (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references public.players(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  due_date date,
  completed boolean not null default false,
  completion_note text,
  created_at timestamptz not null default now()
);

alter table public.homework enable row level security;

create policy "player_read_homework" on public.homework
  for select using (
    exists (select 1 from public.players p where p.id = player_id and p.user_id = auth.uid())
  );

create policy "player_update_homework" on public.homework
  for update using (
    exists (select 1 from public.players p where p.id = player_id and p.user_id = auth.uid())
  );

create policy "parent_read_homework" on public.homework
  for select using (
    exists (select 1 from public.players p where p.id = player_id and p.parent_id = auth.uid())
  );

create policy "coach_full_access_homework" on public.homework
  for all using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'coach')
  );

-- ─── REPORTS ─────────────────────────────────────────────────────────────────
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references public.players(id) on delete cascade,
  month integer not null check (month between 1 and 12),
  year integer not null,
  ai_draft text,
  final_content text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

-- Players and parents can only read sent reports
create policy "player_read_sent_reports" on public.reports
  for select using (
    sent_at is not null and
    exists (select 1 from public.players p where p.id = player_id and p.user_id = auth.uid())
  );

create policy "parent_read_sent_reports" on public.reports
  for select using (
    sent_at is not null and
    exists (select 1 from public.players p where p.id = player_id and p.parent_id = auth.uid())
  );

create policy "coach_full_access_reports" on public.reports
  for all using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'coach')
  );

-- ─── MESSAGES ────────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references public.users(id) on delete cascade,
  recipient_id uuid not null references public.users(id) on delete cascade,
  thread_type text not null check (thread_type in ('coach-player', 'coach-parent')),
  content text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "message_participants_access" on public.messages
  for all using (auth.uid() = sender_id or auth.uid() = recipient_id);

-- ─── MILESTONES ──────────────────────────────────────────────────────────────
create table if not exists public.milestones (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references public.players(id) on delete cascade,
  badge_name text not null,
  badge_description text,
  awarded_at timestamptz not null default now(),
  awarded_by text not null check (awarded_by in ('system', 'coach'))
);

alter table public.milestones enable row level security;

create policy "player_read_milestones" on public.milestones
  for select using (
    exists (select 1 from public.players p where p.id = player_id and p.user_id = auth.uid())
  );

create policy "parent_read_milestones" on public.milestones
  for select using (
    exists (select 1 from public.players p where p.id = player_id and p.parent_id = auth.uid())
  );

create policy "coach_full_access_milestones" on public.milestones
  for all using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'coach')
  );

-- ─── TRIGGER: sync new auth user to public.users ─────────────────────────────
-- Used when creating accounts programmatically from the backend
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  -- Only auto-insert if the user metadata contains name and role
  if new.raw_user_meta_data ? 'name' and new.raw_user_meta_data ? 'role' then
    insert into public.users (id, name, email, role)
    values (
      new.id,
      new.raw_user_meta_data->>'name',
      new.email,
      new.raw_user_meta_data->>'role'
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
