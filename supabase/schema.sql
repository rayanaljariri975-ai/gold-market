-- Run this entire file in Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text,
 created_at timestamptz not null default now()
);
create table if not exists public.listings (
 id uuid primary key default gen_random_uuid(),
 seller_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(length(title) between 4 and 100),
 game text not null check(game in ('Free Fire','PUBG Mobile','PlayStation','Xbox','Fortnite','Roblox')),
 price numeric(12,2) not null check(price > 0),
 currency text not null default 'USD',
 description text not null default '' check(length(description)<=1200),
 details jsonb not null default '{}'::jsonb,
 image_urls text[] not null default '{}',
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 reviewed_by uuid references auth.users(id),
 reviewed_at timestamptz,
 created_at timestamptz not null default now()
);
create table if not exists public.chat_threads (
 id uuid primary key default gen_random_uuid(),
 listing_id uuid references public.listings(id) on delete set null,
 buyer_id uuid not null references auth.users(id) on delete cascade,
 seller_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 unique(listing_id,buyer_id,seller_id),
 check(buyer_id<>seller_id)
);
create table if not exists public.messages (
 id uuid primary key default gen_random_uuid(),
 thread_id uuid not null references public.chat_threads(id) on delete cascade,
 sender_id uuid not null references auth.users(id) on delete cascade,
 body text not null check(length(body) between 1 and 2000),
 created_at timestamptz not null default now()
);
create table if not exists public.reports (
 id uuid primary key default gen_random_uuid(),
 reporter_id uuid not null references auth.users(id) on delete cascade,
 message_id uuid references public.messages(id) on delete cascade,
 listing_id uuid references public.listings(id) on delete cascade,
 reason text not null,
 status text not null default 'open' check(status in ('open','reviewing','closed')),
 created_at timestamptz not null default now()
);
create table if not exists public.transactions (
 id uuid primary key default gen_random_uuid(),
 listing_id uuid not null references public.listings(id),
 buyer_id uuid not null references auth.users(id),
 seller_id uuid not null references auth.users(id),
 amount numeric(12,2) not null,
 currency text not null,
 status text not null default 'pending_verification' check(status in ('pending_verification','confirmed','disputed','refunded')),
 provider_reference text,
 created_at timestamptz not null default now()
);
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.admin_users where user_id=auth.uid())
$$;
create table if not exists public.admin_users(user_id uuid primary key references auth.users(id) on delete cascade, role text not null default 'admin' check(role in ('admin','chat_moderator')));
-- Seed the primary administrator safely by email after the owner has signed in once:
-- insert into public.admin_users(user_id) select id from auth.users where lower(email)='rayanaljariri975@gmail.com' on conflict do nothing;
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.chat_threads enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;
alter table public.transactions enable row level security;
alter table public.admin_users enable row level security;
create policy "profiles readable" on public.profiles for select using (true);
create policy "profile owner insert" on public.profiles for insert with check(id=auth.uid());
create policy "profile owner update" on public.profiles for update using(id=auth.uid()) with check(id=auth.uid());
create policy "approved listings public" on public.listings for select using(status='approved' or seller_id=auth.uid() or public.is_admin());
create policy "owner create pending listing" on public.listings for insert with check(seller_id=auth.uid() and status='pending');
create policy "admin moderate listings" on public.listings for update using(public.is_admin()) with check(public.is_admin());
create policy "thread members read" on public.chat_threads for select using(auth.uid() in (buyer_id,seller_id) or public.is_admin());
create policy "buyer creates thread" on public.chat_threads for insert with check(buyer_id=auth.uid());
create policy "members read messages" on public.messages for select using(exists(select 1 from public.chat_threads t where t.id=thread_id and auth.uid() in(t.buyer_id,t.seller_id)) or public.is_admin());
create policy "members send messages" on public.messages for insert with check(sender_id=auth.uid() and exists(select 1 from public.chat_threads t where t.id=thread_id and auth.uid() in(t.buyer_id,t.seller_id)));
create policy "report own" on public.reports for insert with check(reporter_id=auth.uid());
create policy "reporter or admin reads" on public.reports for select using(reporter_id=auth.uid() or public.is_admin());
create policy "transaction participants read" on public.transactions for select using(auth.uid() in(buyer_id,seller_id) or public.is_admin());
create policy "buyer creates transaction" on public.transactions for insert with check(buyer_id=auth.uid() and status='pending_verification');
create policy "admin updates transactions" on public.transactions for update using(public.is_admin()) with check(public.is_admin());
create policy "admin reads admins" on public.admin_users for select using(user_id=auth.uid() or public.is_admin());
create or replace function public.get_or_create_thread(p_listing_id uuid,p_other_user uuid) returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid; v_buyer uuid; v_seller uuid;
begin
 if auth.uid() is null or auth.uid()=p_other_user then raise exception 'Invalid participants'; end if;
 select seller_id into v_seller from public.listings where id=p_listing_id and status='approved';
 if v_seller is null or v_seller<>p_other_user then raise exception 'Listing unavailable'; end if;
 v_buyer:=auth.uid();
 insert into public.chat_threads(listing_id,buyer_id,seller_id) values(p_listing_id,v_buyer,v_seller)
 on conflict(listing_id,buyer_id,seller_id) do update set listing_id=excluded.listing_id returning id into v_id;
 return v_id;
end $$;
grant execute on function public.get_or_create_thread(uuid,uuid) to authenticated;
-- Storage bucket: create "listing-images" as PUBLIC in Supabase Storage dashboard.
-- Storage policies: allow authenticated users to upload only to their own first-level folder.
create policy "listing image upload own folder" on storage.objects for insert to authenticated with check(bucket_id='listing-images' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "public read listing images" on storage.objects for select using(bucket_id='listing-images');
-- Enable Realtime for messages table in Supabase Dashboard > Database > Publications.
