-- Panorama Archive — run in Supabase SQL Editor

create type user_status as enum ('pending', 'active', 'banned');
create type user_role as enum ('user', 'admin');
create type content_status as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  status user_status not null default 'pending',
  role user_role not null default 'user',
  invite_code_used text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  max_uses int not null default 1,
  used_count int not null default 0,
  expires_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.community_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null,
  slug text not null,
  region_key text,
  title jsonb not null default '{"en":"","zh":""}',
  coords jsonb,
  lat double precision,
  lng double precision,
  status content_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id)
);

create table public.guestbook_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) <= 2000),
  status content_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id)
);

create index community_photos_status_idx on public.community_photos (status);
create index guestbook_messages_status_idx on public.guestbook_messages (status);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.invite_codes enable row level security;
alter table public.community_photos enable row level security;
alter table public.guestbook_messages enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'active'
  );
$$;

create policy profiles_select on public.profiles
  for select using (status = 'active' or id = auth.uid() or public.is_admin());

create policy profiles_update on public.profiles
  for update using (id = auth.uid() or public.is_admin());

create policy invite_codes_admin on public.invite_codes
  for all using (public.is_admin());

create policy community_photos_select on public.community_photos
  for select using (status = 'approved' or user_id = auth.uid() or public.is_admin());

create policy community_photos_insert on public.community_photos
  for insert with check (public.is_active_user() and user_id = auth.uid());

create policy community_photos_update on public.community_photos
  for update using (public.is_admin());

create policy guestbook_select on public.guestbook_messages
  for select using (status = 'approved' or user_id = auth.uid() or public.is_admin());

create policy guestbook_insert on public.guestbook_messages
  for insert with check (public.is_active_user() and user_id = auth.uid());

create policy guestbook_update on public.guestbook_messages
  for update using (public.is_admin());
