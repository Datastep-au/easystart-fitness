-- EasyStart Fitness - Complete Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up your database

-- Enable necessary extensions
create extension if not exists pgcrypto;

-- Create profiles table
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

-- Create trigger function for new user profiles
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name',''));
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Exercises table
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  pillar text not null check (pillar in ('strength','tai_chi','running','mobility','cardio')),
  name text not null,
  cues text[] default '{}',
  regress text,
  progress text,
  default_reps text,           -- e.g., "2–3×8–12" or "20–40s"
  default_rest_sec int,
  is_public boolean default true,
  created_by uuid references profiles(user_id) on delete set null,
  created_at timestamptz default now()
);

-- Workout templates table
create table if not exists workout_templates (
  id uuid primary key default gen_random_uuid(),
  pillar text not null check (pillar in ('strength','tai_chi','running','mobility','cardio')),
  name text not null,
  description text,
  difficulty text default 'beginner' check (difficulty in ('beginner','easy','moderate')),
  is_public boolean default true,
  created_by uuid references profiles(user_id) on delete set null,
  created_at timestamptz default now()
);

-- Workout template items table
create table if not exists workout_template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references workout_templates(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete set null,
  name text,       -- For Tai Chi/mobility text cues or ad-hoc entries
  reps text,       -- e.g., "2×8–12" | "3–5 circles/side each way" | "30–60s/side"
  notes text,
  rest_sec int,
  sort_order int default 0
);

-- Interval sets for Running & Cardio
create table if not exists interval_sets (
  id uuid primary key default gen_random_uuid(),
  pillar text not null check (pillar in ('running','cardio')),
  name text not null,
  warmup_sec int default 300,     -- 5:00
  cooldown_sec int default 300,   -- 5:00
  steps jsonb not null,           -- [{label:'Jog', work_sec:60, rest_sec:90, repeat:8}, ...]
  est_total_min numeric,          -- cached estimate
  difficulty text default 'beginner' check (difficulty in ('beginner','easy','moderate')),
  is_public boolean default true,
  created_by uuid references profiles(user_id) on delete set null,
  created_at timestamptz default now()
);

-- User preferences & program
create table if not exists preferences (
  user_id uuid primary key references profiles(user_id) on delete cascade,
  week_length int default 10 check (week_length between 10 and 12),
  days_per_week int default 5 check (days_per_week between 3 and 6),
  max_duration_min int default 45 check (max_duration_min between 15 and 45),
  default_mode text default 'full' check (default_mode in ('short','full')),
  fitness_level text default 'beginner' check (fitness_level in ('beginner','easy','moderate')),
  pillars text[] default '{strength, tai_chi, running, mobility}',
  primary_focus text,   -- e.g., 'running' or 'strength'
  equipment jsonb       -- e.g., {"bands":true,"dbs":false}
);

-- Programs table
create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(user_id) on delete cascade,
  start_date date default current_date,
  length_weeks int not null check (length_weeks between 10 and 12),
  created_at timestamptz default now()
);

-- Program weeks table
create table if not exists program_weeks (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  week_number int not null,
  theme text,          -- 'foundation', 'tempo', 'unilateral', 'deload', etc.
  unique(program_id, week_number)
);

-- Program days table
create table if not exists program_days (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  week_number int not null,
  day_of_week int not null check (day_of_week between 1 and 7),
  mode text default 'full' check (mode in ('short','full')),
  -- Link to templates or intervals; plus a baked "blocks" fallback for offline:
  workout_template_id uuid references workout_templates(id) on delete set null,
  interval_set_id uuid references interval_sets(id) on delete set null,
  blocks jsonb,             -- [{type:'mobility'|'tai_chi'|'strength'|'run', title, items:[...], restSec}]
  est_total_min numeric,
  unique(program_id, week_number, day_of_week)
);

-- Activity logs table
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(user_id) on delete cascade,
  date date not null,
  program_id uuid references programs(id) on delete set null,
  week_number int,
  day_of_week int,
  completed boolean default false,
  duration_actual_min numeric,
  rpe numeric,
  notes text,
  created_at timestamptz default now()
);

-- Enable Row Level Security on all tables
alter table profiles enable row level security;
alter table exercises enable row level security;
alter table workout_templates enable row level security;
alter table workout_template_items enable row level security;
alter table interval_sets enable row level security;
alter table preferences enable row level security;
alter table programs enable row level security;
alter table program_weeks enable row level security;
alter table program_days enable row level security;
alter table activity_logs enable row level security;

-- RLS Policies for exercises
create policy "ex_select_public_or_owned" on exercises
  for select using (is_public = true or created_by = auth.uid());
create policy "ex_insert_owner" on exercises
  for insert with check (created_by = auth.uid());
create policy "ex_update_owner" on exercises
  for update using (created_by = auth.uid());

-- RLS Policies for workout_templates
create policy "wt_select_public_or_owned" on workout_templates
  for select using (is_public = true or created_by = auth.uid());
create policy "wt_insert_owner" on workout_templates
  for insert with check (created_by = auth.uid());
create policy "wt_update_owner" on workout_templates
  for update using (created_by = auth.uid());

-- RLS Policies for workout_template_items
create policy "wti_select_if_parent_visible" on workout_template_items
  for select using (exists (select 1 from workout_templates wt where wt.id=template_id and (wt.is_public=true or wt.created_by=auth.uid())));
create policy "wti_cud_if_parent_owned" on workout_template_items
  for all using (exists (select 1 from workout_templates wt where wt.id=template_id and wt.created_by=auth.uid()))
  with check (exists (select 1 from workout_templates wt where wt.id=template_id and wt.created_by=auth.uid()));

-- RLS Policies for interval_sets
create policy "is_select_public_or_owned" on interval_sets
  for select using (is_public = true or created_by = auth.uid());
create policy "is_insert_owner" on interval_sets
  for insert with check (created_by = auth.uid());
create policy "is_update_owner" on interval_sets
  for update using (created_by = auth.uid());

-- RLS Policies for preferences
create policy "pref_owner" on preferences
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- RLS Policies for programs
create policy "prog_owner" on programs
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- RLS Policies for program_weeks
create policy "pw_owner" on program_weeks
  for all using (exists (select 1 from programs p where p.id=program_id and p.user_id=auth.uid()))
  with check (exists (select 1 from programs p where p.id=program_id and p.user_id=auth.uid()));

-- RLS Policies for program_days
create policy "pd_owner" on program_days
  for all using (exists (select 1 from programs p where p.id=program_id and p.user_id=auth.uid()))
  with check (exists (select 1 from programs p where p.id=program_id and p.user_id=auth.uid()));

-- RLS Policies for activity_logs
create policy "al_owner" on activity_logs
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Profile RLS policies
create policy "profiles_viewable_by_user" on profiles
  for select using (auth.uid() = user_id);
create policy "profiles_updatable_by_user" on profiles
  for update using (auth.uid() = user_id);

-- Insert seed data for exercises
insert into exercises (pillar, name, cues, regress, progress, default_reps, default_rest_sec, is_public, created_by) values
-- Strength exercises
('strength', 'Sit-to-Stand', '{"sit tall", "feet flat on floor", "push through heels", "stand tall"}', 'use chair arms for support', 'add weight or single leg', '2×8-12', 45, true, null),
('strength', 'Goblet Squat (Light)', '{"hold weight at chest", "feet shoulder width", "sit back and down", "keep chest up"}', 'bodyweight squat', 'increase weight or depth', '2×8-12', 60, true, null),
('strength', 'Hip Hinge (Stick)', '{"stick on back", "hinge at hips", "push hips back", "keep back straight"}', 'hands on hips', 'add light weight', '2×8-12', 45, true, null),
('strength', 'Split Squat (Assisted)', '{"back foot elevated", "drop into lunge", "push up through front leg", "hold support if needed"}', 'static hold', 'add weight or jump', '2×6-10 each leg', 60, true, null),
('strength', 'Glute Bridge', '{"lie on back", "feet flat", "squeeze glutes", "lift hips up"}', 'hold at top', 'single leg or add weight', '2×10-15', 30, true, null),
('strength', 'Calf Raises', '{"stand tall", "rise onto toes", "squeeze calves", "control down"}', 'hold wall for support', 'single leg or add weight', '2×12-20', 30, true, null),
('strength', 'Incline Push-up (Wall)', '{"hands on wall", "body straight", "push away from wall", "control back"}', 'increase wall distance', 'lower angle or add reps', '2×5-12', 45, true, null),
('strength', 'Band/Towel Row', '{"pull band/towel back", "squeeze shoulder blades", "elbows close to body", "control release"}', 'lighter resistance', 'stronger band or single arm', '2×8-15', 45, true, null),
('strength', 'Wall Angels/Overhead Press (Light)', '{"back against wall", "arms form goal posts", "slide up and down", "keep contact with wall"}', 'smaller range', 'add light weight', '2×8-15', 30, true, null),
('strength', 'Dead Bug', '{"lie on back", "knees at 90°", "extend opposite arm/leg", "keep back flat"}', 'just arms or legs', 'add resistance or hold', '2×5-8 each side', 30, true, null),
('strength', 'Plank', '{"forearms and toes", "body straight", "engage core", "breathe normally"}', 'knees down', 'add movement or time', '20-45s', 45, true, null),

-- Mobility exercises
('mobility', 'Neck Nods/Turns', '{"gentle yes/no movements", "hold end ranges", "breathe deeply", "no force"}', 'smaller movements', 'add resistance gently', '5-10 each direction', 0, true, null),
('mobility', 'Shoulder Circles', '{"arms by sides", "small to large circles", "forward and back", "feel the stretch"}', 'seated version', 'add light weights', '5-10 each direction', 0, true, null),
('mobility', 'Open Books', '{"lie on side", "knees bent", "top arm opens to sky", "follow with eyes"}', 'pillow under head', 'add thoracic extension', '5-8 each side', 0, true, null),
('mobility', 'Hip CARs', '{"stand tall, hold wall", "lift knee ~hip height", "slow circle out–back–around", "torso still"}', 'smaller circles', 'larger range or standing unsupported', '3-5 circles/side each way', 0, true, null),
('mobility', 'Ankle Rocks', '{"sit or stand", "rock ankles up/down", "circles both ways", "point and flex"}', 'seated with support', 'add resistance band', '10-15 each direction', 0, true, null),
('mobility', 'Hamstring Floss', '{"seated", "one leg straight", "gently reach forward", "feel behind thigh"}', 'use towel for assistance', 'add gentle bouncing', '30-60s each leg', 0, true, null),
('mobility', 'Couch Stretch', '{"back foot on couch", "front foot forward", "hips square", "gentle pressure"}', 'lower back foot', 'add hip flexor emphasis', '30-90s each leg', 0, true, null),

-- Tai Chi movements
('tai_chi', 'Wuji Stance', '{"feet shoulder width", "knees soft", "arms relaxed", "breathe deeply"}', 'hold for less time', 'eyes closed or longer holds', '30-60s', 30, true, null),
('tai_chi', 'Bow Stance', '{"70/30 weight distribution", "front knee over ankle", "back leg straight", "sink into position"}', 'less depth', 'lower stance or longer holds', '30s each side', 30, true, null),
('tai_chi', 'Horse Stance', '{"feet wide", "toes forward", "sit back like chair", "thighs parallel if possible"}', 'higher stance', 'lower stance or add arm movements', '20-45s', 30, true, null),
('tai_chi', 'Silk Reeling', '{"circular arm movements", "coordinate with waist", "smooth and continuous", "imagine moving through water"}', 'smaller circles', 'larger circles or faster tempo', '8-12 circles each arm', 30, true, null),
('tai_chi', 'Commencement', '{"raise arms slowly", "breathe in lifting", "breathe out lowering", "imagine lifting water"}', 'seated version', 'add stepping or weight shifts', '3-5 repetitions', 30, true, null),
('tai_chi', 'Part the Wild Horse\'s Mane', '{"step and shift weight", "arms separate high/low", "look toward high hand", "flow continuously"}', 'stationary practice', 'add larger steps', '3-5 each side', 30, true, null),
('tai_chi', 'White Crane Spreads Wings', '{"shift to one leg", "arms open wide", "look up slightly", "balance and breathe"}', 'keep both feet down', 'close eyes or extend holds', '3-5 each side', 30, true, null),
('tai_chi', 'Brush Knee and Push', '{"circular blocking motion", "step forward", "push with palm", "coordinate whole body"}', 'practice arms only', 'add more dynamic stepping', '3-5 each side', 30, true, null),
('tai_chi', 'Play the Lute', '{"shift weight back", "hands in lute position", "feel the connection", "breathe naturally"}', 'seated practice', 'add subtle weight shifts', '3-5 repetitions', 30, true, null),
('tai_chi', 'Repulse Monkey', '{"step back while turning", "alternating hand pushes", "maintain balance", "smooth transitions"}', 'smaller steps', 'larger steps or lower stance', '3-5 steps each side', 30, true, null),
('tai_chi', 'Wave Hands Like Clouds', '{"shift side to side", "arms move like clouds", "waist leads movement", "continuous flow"}', 'smaller movements', 'add stepping or lower stance', '5-8 waves', 30, true, null),
('tai_chi', 'Golden Rooster Stands on One Leg', '{"balance on one leg", "opposite knee up", "arms graceful", "hold steady"}', 'touch toe for balance', 'close eyes or longer holds', '10-30s each leg', 30, true, null);

-- Insert seed data for interval sets
insert into interval_sets (pillar, name, warmup_sec, cooldown_sec, steps, est_total_min, difficulty, is_public, created_by) values
-- Running intervals W1-W10
('running', 'W1: Walk/Jog Intervals', 300, 300, '[{"label":"Jog","work_sec":60,"rest_sec":90,"repeat":8}]', 30, 'beginner', true, null),
('running', 'W2: Extended Jogs', 300, 300, '[{"label":"Jog","work_sec":90,"rest_sec":120,"repeat":6}]', 32, 'beginner', true, null),
('running', 'W3: Building Endurance', 300, 300, '[{"label":"Jog","work_sec":90,"rest_sec":90,"repeat":8}]', 34, 'beginner', true, null),
('running', 'W4: Longer Jogs', 300, 300, '[{"label":"Jog","work_sec":180,"rest_sec":90,"repeat":5}]', 35, 'beginner', true, null),
('running', 'W5: Deload Week', 300, 300, '[{"label":"Easy Jog","work_sec":120,"rest_sec":120,"repeat":5}]', 30, 'beginner', true, null),
('running', 'W6: Tempo Building', 300, 300, '[{"label":"Jog","work_sec":300,"rest_sec":180,"repeat":3}]', 36, 'beginner', true, null),
('running', 'W7: Sustained Efforts', 300, 300, '[{"label":"Jog","work_sec":420,"rest_sec":120,"repeat":3}]', 38, 'beginner', true, null),
('running', 'W8: Long Intervals', 300, 300, '[{"label":"Jog","work_sec":600,"rest_sec":180,"repeat":2}]', 36, 'beginner', true, null),
('running', 'W9: Continuous Jog', 300, 300, '[{"label":"Continuous Jog","work_sec":1200,"rest_sec":0,"repeat":1}]', 30, 'beginner', true, null),
('running', 'W10: Extended Run', 300, 300, '[{"label":"Continuous Run","work_sec":1800,"rest_sec":0,"repeat":1}]', 40, 'beginner', true, null),

-- Cardio (low impact) intervals W1-W10
('cardio', 'W1: Brisk Walk Intervals', 300, 300, '[{"label":"Brisk Walk","work_sec":60,"rest_sec":90,"repeat":8}]', 30, 'beginner', true, null),
('cardio', 'W2: Extended Walks', 300, 300, '[{"label":"Brisk Walk","work_sec":90,"rest_sec":120,"repeat":6}]', 32, 'beginner', true, null),
('cardio', 'W3: Steady Pace', 300, 300, '[{"label":"Brisk Walk","work_sec":90,"rest_sec":90,"repeat":8}]', 34, 'beginner', true, null),
('cardio', 'W4: Longer Walks', 300, 300, '[{"label":"Brisk Walk","work_sec":180,"rest_sec":90,"repeat":5}]', 35, 'beginner', true, null),
('cardio', 'W5: Recovery Week', 300, 300, '[{"label":"Easy Walk","work_sec":120,"rest_sec":120,"repeat":5}]', 30, 'beginner', true, null),
('cardio', 'W6: Power Walking', 300, 300, '[{"label":"Power Walk","work_sec":300,"rest_sec":180,"repeat":3}]', 36, 'beginner', true, null),
('cardio', 'W7: Sustained Walking', 300, 300, '[{"label":"Power Walk","work_sec":420,"rest_sec":120,"repeat":3}]', 38, 'beginner', true, null),
('cardio', 'W8: Long Walks', 300, 300, '[{"label":"Power Walk","work_sec":600,"rest_sec":180,"repeat":2}]', 36, 'beginner', true, null),
('cardio', 'W9: Continuous Walk', 300, 300, '[{"label":"Continuous Walk","work_sec":1200,"rest_sec":0,"repeat":1}]', 30, 'beginner', true, null),
('cardio', 'W10: Extended Walk', 300, 300, '[{"label":"Continuous Walk","work_sec":1800,"rest_sec":0,"repeat":1}]', 40, 'beginner', true, null);