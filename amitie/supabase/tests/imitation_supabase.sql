-- =====================================================================
-- Imitation minimale de Supabase, UNIQUEMENT pour vérifier les migrations
-- sur un Postgres local (voir verifier_base.sh). Jamais envoyé à Supabase.
-- =====================================================================

create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema auth;
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  phone text
);

-- Comme Supabase : l'identifiant de la personne connectée vient du jeton (claim « sub »)
create function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid;
$$;

grant usage on schema public, auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated;

-- Comme Supabase : droits larges par défaut, les RLS font le tri
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
