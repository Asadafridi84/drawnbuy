-- DrawNBuy Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)

-- ── Users ─────────────────────────────────────────────────────────────────────
create table if not exists users (
  id            text        primary key,
  email         text        unique not null,
  name          text        not null,
  password_hash text        not null,
  bio           text        default '',
  avatar        text        default null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Index for login lookups
create index if not exists users_email_idx on users(email);

-- ── Canvases ──────────────────────────────────────────────────────────────────
create table if not exists canvases (
  id             text        primary key,
  room_id        text        not null,
  name           text        not null default 'My Canvas',
  owner_id       text        not null references users(id) on delete cascade,
  is_public      boolean     default false,
  thumbnail      text        default null,   -- base64 JPEG data URL
  collaborators  text[]      default '{}',
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- Index for "my canvases" queries
create index if not exists canvases_owner_idx on canvases(owner_id);
create index if not exists canvases_room_idx  on canvases(room_id);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- We use service role key server-side, so RLS is advisory here.
-- Enable it once you add a frontend Supabase client.
alter table users    enable row level security;
alter table canvases enable row level security;

-- Service role bypasses RLS, so server routes work without extra policies.
-- Add user-facing policies when building a direct frontend Supabase client:
--
-- create policy "Users can read own record"
--   on users for select using (auth.uid()::text = id);
--
-- create policy "Users can update own record"
--   on users for update using (auth.uid()::text = id);
--
-- create policy "Users can manage own canvases"
--   on canvases for all using (auth.uid()::text = owner_id);

-- ── Updated-at trigger ────────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on users
  for each row execute function set_updated_at();

create trigger canvases_updated_at
  before update on canvases
  for each row execute function set_updated_at();
