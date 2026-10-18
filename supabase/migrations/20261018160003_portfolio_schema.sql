-- Shared portfolio content and the explicit administrator allow-list.
-- Create an Auth user first, then insert its UUID into portfolio_admins.

begin;

create table if not exists public.portfolio_admins (
    user_id uuid primary key references auth.users (id) on delete cascade,
    created_at timestamptz not null default now()
);

create table if not exists public.portfolio_content (
    id text primary key default 'default' check (id = 'default'),
    content jsonb not null check (jsonb_typeof(content) = 'object'),
    schema_version integer not null default 1 check (schema_version = 1),
    updated_at timestamptz not null default now(),
    updated_by uuid references auth.users (id) on delete set null
);

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.portfolio_admins
        where user_id = auth.uid()
    );
$$;

create or replace function public.touch_portfolio_content()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    new.updated_at = now();
    new.updated_by = auth.uid();
    return new;
end;
$$;

drop trigger if exists portfolio_content_touch on public.portfolio_content;
create trigger portfolio_content_touch
    before insert or update on public.portfolio_content
    for each row execute function public.touch_portfolio_content();

alter table public.portfolio_admins enable row level security;
alter table public.portfolio_content enable row level security;

drop policy if exists "Administrators can read their own allow-list row" on public.portfolio_admins;
create policy "Administrators can read their own allow-list row"
    on public.portfolio_admins
    for select
    to authenticated
    using (user_id = auth.uid());

drop policy if exists "Published portfolio content is publicly readable" on public.portfolio_content;
create policy "Published portfolio content is publicly readable"
    on public.portfolio_content
    for select
    to anon, authenticated
    using (id = 'default');

drop policy if exists "Allow-listed administrators can insert portfolio content" on public.portfolio_content;
create policy "Allow-listed administrators can insert portfolio content"
    on public.portfolio_content
    for insert
    to authenticated
    with check (id = 'default' and public.is_portfolio_admin());

drop policy if exists "Allow-listed administrators can update portfolio content" on public.portfolio_content;
create policy "Allow-listed administrators can update portfolio content"
    on public.portfolio_content
    for update
    to authenticated
    using (id = 'default' and public.is_portfolio_admin())
    with check (id = 'default' and public.is_portfolio_admin());

revoke all on public.portfolio_admins from public, anon, authenticated;
grant select on public.portfolio_admins to authenticated;
revoke all on public.portfolio_content from public, anon, authenticated;
grant select on public.portfolio_content to anon, authenticated;
grant insert, update on public.portfolio_content to authenticated;
revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to authenticated;
revoke all on function public.touch_portfolio_content() from public, anon, authenticated;
grant execute on function public.touch_portfolio_content() to authenticated;

commit;
