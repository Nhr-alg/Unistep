-- UniStep Supabase migration
-- Run this in Supabase SQL Editor to enable cloud archive sync

create extension if not exists pgcrypto;

create table if not exists archive_entries (
    id bigint not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    ts bigint not null,
    text text not null,
    answer text default '',
    tag text default 'none' check (tag in ('none', 'important', 'revision')),
    timestamp text default '',
    created_at timestamptz default now(),
    primary key (id, user_id)
);

alter table archive_entries enable row level security;

create policy "Users can view their own archive entries"
    on archive_entries for select
    using (auth.uid() = user_id);

create policy "Users can insert their own archive entries"
    on archive_entries for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own archive entries"
    on archive_entries for update
    using (auth.uid() = user_id);

create policy "Users can delete their own archive entries"
    on archive_entries for delete
    using (auth.uid() = user_id);
