-- =====================================================================
-- Schéma de base de l'app d'amitié (jalon 0)
-- Les types énumérés sont repris à l'identique dans packages/core/src/types.ts.
-- Les règles d'accès (RLS) sont dans la migration suivante.
-- =====================================================================

create extension if not exists citext;

-- ---------------------------------------------------------------------
-- Types énumérés
-- ---------------------------------------------------------------------
create type genre as enum ('femme', 'homme', 'non_binaire');
create type preference_bestie as enum ('femme', 'homme', 'peu_importe');
create type role_utilisateur as enum ('user', 'admin');
create type statut_compte as enum ('actif', 'suspendu', 'exclu');

create type moment as enum ('midi', 'apres_midi', 'soir');
create type statut_demande as enum ('ouverte', 'groupee', 'annulee', 'expiree');
create type statut_groupe as enum ('en_formation', 'confirme', 'termine', 'permanent', 'dissous');
create type origine_groupe as enum ('matching', 'admin');
create type statut_membre as enum ('actif', 'parti', 'retire');

create type statut_sortie as enum ('proposee', 'confirmee', 'terminee', 'annulee');
create type ouverture_sortie as enum ('cercle', 'ouverte');
create type type_participant as enum ('membre', 'nouveau');

create type revoir_groupe as enum ('oui', 'non', 'pas_sur');
create type statut_vote as enum ('en_cours', 'accepte', 'refuse');
create type statut_proposition_bestie as enum ('en_attente', 'acceptee', 'refusee', 'expiree');

create type motif_signalement as enum
  ('harcelement', 'comportement_deplace', 'propos_haineux', 'absence', 'faux_profil', 'autre');
create type statut_signalement as enum ('nouveau', 'en_cours', 'traite', 'classe');
create type type_sanction as enum ('avertissement', 'suspension', 'exclusion');

-- ---------------------------------------------------------------------
-- Référentiels (modifiables par l'admin, lisibles par tous)
-- ---------------------------------------------------------------------

-- Réglages du produit (mêmes clés que packages/core/src/regles.ts)
create table app_config (
  cle text primary key,
  valeur jsonb not null,
  description text
);

-- Zones : groupes d'arrondissements. Jamais de coordonnées GPS.
create table zones (
  id text primary key,
  nom text not null,
  ville text not null default 'paris',
  ordre int not null default 0
);

-- Activités. Resto / voyage / sport existent déjà mais sont masquées (actif = false).
create table activity_types (
  code text primary key,
  libelle text not null,
  emoji text not null,
  actif boolean not null default false,
  ordre int not null default 0
);

create table interests (
  id serial primary key,
  code text not null unique,
  libelle text not null,
  categorie text not null
);

-- Créneaux standardisés : c'est ce qui rend deux demandes comparables.
create table slots (
  id serial primary key,
  jour date not null,
  moment moment not null,
  unique (jour, moment)
);

-- Contrat d'utilisation (versionné : une nouvelle version demande une nouvelle acceptation).
create table contract_versions (
  version text primary key,
  titre text not null,
  contenu text not null,
  publie_le timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Personnes
-- ---------------------------------------------------------------------

-- Le téléphone reste dans auth.users (géré par Supabase), jamais ici.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  prenom text not null check (char_length(prenom) between 1 and 40),
  date_naissance date not null,
  genre genre not null,
  zone_id text not null references zones (id),
  preference_bestie preference_bestie not null default 'peu_importe',
  bio text check (char_length(bio) <= 160),
  selfie_verifie boolean not null default false,
  role role_utilisateur not null default 'user',
  statut statut_compte not null default 'actif',
  push_token text,
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

create table profile_interests (
  profile_id uuid not null references profiles (id) on delete cascade,
  interest_id int not null references interests (id) on delete cascade,
  primary key (profile_id, interest_id)
);

create table contract_acceptances (
  user_id uuid not null references profiles (id) on delete cascade,
  version text not null references contract_versions (version),
  accepte_le timestamptz not null default now(),
  primary key (user_id, version)
);

-- Accès limité : invitations…
create table invites (
  code text primary key,
  cree_par uuid references profiles (id) on delete set null,
  utilise_par uuid unique references profiles (id) on delete set null,
  utilise_le timestamptz,
  expire_le timestamptz,
  cree_le timestamptz not null default now()
);

-- … et liste d'attente (autres villes, ou Paris quand c'est complet).
create table waitlist (
  id bigserial primary key,
  email citext not null,
  ville text not null,
  cree_le timestamptz not null default now(),
  unique (email, ville)
);

create table blocks (
  bloqueur_id uuid not null references profiles (id) on delete cascade,
  bloque_id uuid not null references profiles (id) on delete cascade,
  cree_le timestamptz not null default now(),
  primary key (bloqueur_id, bloque_id),
  check (bloqueur_id <> bloque_id)
);

-- ---------------------------------------------------------------------
-- Demandes, groupes (un groupe « permanent » est un cercle), sorties
-- ---------------------------------------------------------------------

create table groups (
  id uuid primary key default gen_random_uuid(),
  activity_code text not null references activity_types (code),
  slot_id int references slots (id),
  zone_id text not null references zones (id),
  non_mixte boolean not null default false,
  statut statut_groupe not null default 'en_formation',
  origine origine_groupe not null default 'matching',
  nom text check (char_length(nom) <= 40),
  cree_le timestamptz not null default now(),
  devenu_permanent_le timestamptz
);

create table requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  activity_code text not null references activity_types (code),
  slot_id int not null references slots (id),
  zone_id text not null references zones (id),
  interest_id int references interests (id),
  non_mixte boolean not null default false,
  phrase text check (char_length(phrase) <= 140),
  statut statut_demande not null default 'ouverte',
  group_id uuid references groups (id) on delete set null,
  cree_par_admin boolean not null default false,
  cree_le timestamptz not null default now()
);
-- Une seule demande ouverte par personne, activité et créneau
create unique index requests_une_ouverte
  on requests (user_id, activity_code, slot_id) where statut = 'ouverte';
create index requests_matching on requests (activity_code, slot_id, zone_id) where statut = 'ouverte';

create table group_members (
  group_id uuid not null references groups (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  statut statut_membre not null default 'actif',
  rejoint_le timestamptz not null default now(),
  quitte_le timestamptz,
  primary key (group_id, user_id)
);
create index group_members_par_user on group_members (user_id) where statut = 'actif';

create table events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups (id) on delete cascade,
  activity_code text not null references activity_types (code),
  slot_id int references slots (id),
  date_heure timestamptz,
  lieu_nom text,
  lieu_adresse text,
  statut statut_sortie not null default 'proposee',
  ouverture ouverture_sortie not null default 'cercle',
  -- Sortie ouverte : la personne qui la crée choisit combien de nouveaux (au moins 2)
  places_nouveaux int,
  cree_par uuid references profiles (id) on delete set null,
  cree_le timestamptz not null default now(),
  check (
    (ouverture = 'cercle' and places_nouveaux is null)
    or (ouverture = 'ouverte' and places_nouveaux >= 2)
  )
);

-- Inscription à une sortie. Pas de désistement dans l'app : pas de suppression côté utilisateur.
create table event_participants (
  event_id uuid not null references events (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  type type_participant not null default 'membre',
  inscrit_le timestamptz not null default now(),
  present boolean, -- renseigné après la sortie
  primary key (event_id, user_id)
);

-- Accueillir quelqu'un dans un cercle : vote à l'unanimité des membres actifs.
create table join_requests (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups (id) on delete cascade,
  candidat_id uuid not null references profiles (id) on delete cascade,
  propose_par uuid references profiles (id) on delete set null,
  statut statut_vote not null default 'en_cours',
  cree_le timestamptz not null default now()
);
create unique index join_requests_un_en_cours
  on join_requests (group_id, candidat_id) where statut = 'en_cours';

create table join_votes (
  join_request_id uuid not null references join_requests (id) on delete cascade,
  votant_id uuid not null references profiles (id) on delete cascade,
  vote boolean not null,
  vote_le timestamptz not null default now(),
  primary key (join_request_id, votant_id)
);

-- Partage volontaire de SON PROPRE contact, uniquement dans un cercle permanent.
create table contact_shares (
  group_id uuid not null references groups (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  contact text not null check (char_length(contact) <= 80),
  partage_le timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- ---------------------------------------------------------------------
-- Après la sortie (tout est privé)
-- ---------------------------------------------------------------------

create table feedbacks (
  event_id uuid not null references events (id) on delete cascade,
  auteur_id uuid not null references profiles (id) on delete cascade,
  present boolean not null,
  revoir_groupe revoir_groupe,
  ambiance smallint check (ambiance between 1 and 5),
  cree_le timestamptz not null default now(),
  primary key (event_id, auteur_id)
);

-- « Tu aimerais revoir X ? » : jamais lisible par X ni par les autres.
create table member_ratings (
  event_id uuid not null references events (id) on delete cascade,
  de_id uuid not null references profiles (id) on delete cascade,
  vers_id uuid not null references profiles (id) on delete cascade,
  positif boolean not null,
  cree_le timestamptz not null default now(),
  primary key (event_id, de_id, vers_id),
  check (de_id <> vers_id)
);

-- La paire est toujours rangée dans le même ordre (user_a < user_b).
create table bestie_proposals (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references profiles (id) on delete cascade,
  user_b uuid not null references profiles (id) on delete cascade,
  reponse_a boolean,
  reponse_b boolean,
  statut statut_proposition_bestie not null default 'en_attente',
  cree_le timestamptz not null default now(),
  check (user_a < user_b)
);
create unique index bestie_proposals_une_en_attente
  on bestie_proposals (user_a, user_b) where statut = 'en_attente';

create table bestie_links (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references profiles (id) on delete cascade,
  user_b uuid not null references profiles (id) on delete cascade,
  cree_le timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a < user_b)
);

-- Messages : soit dans un groupe, soit dans un lien bestie.
create table messages (
  id bigserial primary key,
  group_id uuid references groups (id) on delete cascade,
  bestie_link_id uuid references bestie_links (id) on delete cascade,
  auteur_id uuid references profiles (id) on delete set null,
  texte text not null check (char_length(texte) between 1 and 2000),
  cree_le timestamptz not null default now(),
  check ((group_id is null) <> (bestie_link_id is null))
);
create index messages_groupe on messages (group_id, cree_le);
create index messages_bestie on messages (bestie_link_id, cree_le);

-- ---------------------------------------------------------------------
-- Confiance et modération
-- ---------------------------------------------------------------------

create table reports (
  id uuid primary key default gen_random_uuid(),
  auteur_id uuid references profiles (id) on delete set null,
  cible_user_id uuid references profiles (id) on delete set null,
  cible_message_id bigint references messages (id) on delete set null,
  cible_group_id uuid references groups (id) on delete set null,
  motif motif_signalement not null,
  details text check (char_length(details) <= 1000),
  statut statut_signalement not null default 'nouveau',
  cree_le timestamptz not null default now()
);

create table sanctions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  type type_sanction not null,
  motif text not null,
  report_id uuid references reports (id) on delete set null,
  jusqu_au timestamptz, -- pour une suspension
  cree_par uuid references profiles (id) on delete set null,
  cree_le timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Déclencheurs
-- ---------------------------------------------------------------------

-- Âge vérifié côté serveur à l'inscription (tranche lue dans app_config).
create function verifier_age_profil() returns trigger
language plpgsql as $$
declare
  age_min int := coalesce((select (valeur #>> '{}')::int from app_config where cle = 'age_min'), 20);
  age_max int := coalesce((select (valeur #>> '{}')::int from app_config where cle = 'age_max'), 35);
  age int := extract(year from age(current_date, new.date_naissance));
begin
  if age < age_min or age > age_max then
    raise exception 'age_hors_tranche' using hint = format('Tranche autorisée : %s à %s ans', age_min, age_max);
  end if;
  return new;
end $$;

create trigger profiles_verifier_age
  before insert on profiles
  for each row execute function verifier_age_profil();

create function maj_modifie_le() returns trigger
language plpgsql as $$
begin
  new.modifie_le := now();
  return new;
end $$;

create trigger profiles_modifie_le
  before update on profiles
  for each row execute function maj_modifie_le();
