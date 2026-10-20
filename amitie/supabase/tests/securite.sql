-- =====================================================================
-- Tests des règles d'accès. Chaque vérification qui échoue arrête tout.
-- Lancés par verifier_base.sh après les migrations et le seed.
-- =====================================================================
\set ON_ERROR_STOP on
\set QUIET on
-- On n'affiche que les messages « ok : … » (pas les résultats des requêtes)
\o /dev/null

-- Petite aide : se mettre « dans la peau » de quelqu'un
create function pg_temp.etre(qui uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', qui)::text, false);
end $$;

create function pg_temp.verifier(condition boolean, message text) returns void language plpgsql as $$
begin
  if not condition then raise exception 'ÉCHEC : %', message; end if;
  raise notice 'ok : %', message;
end $$;

-- ---------------------------------------------------------------------
-- Mise en place (en super-utilisateur, sans RLS)
-- ---------------------------------------------------------------------
insert into auth.users (id) values
  ('aaaaaaaa-0000-0000-0000-000000000001'), -- Alice
  ('bbbbbbbb-0000-0000-0000-000000000002'), -- Bilal
  ('cccccccc-0000-0000-0000-000000000003'), -- Chloé (hors du groupe)
  ('dddddddd-0000-0000-0000-000000000004'), -- trop jeune
  ('eeeeeeee-0000-0000-0000-000000000005'); -- admin

insert into profiles (id, prenom, date_naissance, genre, zone_id) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Alice', current_date - interval '25 years', 'femme', 'paris-est'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Bilal', current_date - interval '28 years', 'homme', 'paris-nord'),
  ('cccccccc-0000-0000-0000-000000000003', 'Chloé', current_date - interval '22 years', 'femme', 'paris-sud');
insert into profiles (id, prenom, date_naissance, genre, zone_id, role) values
  ('eeeeeeee-0000-0000-0000-000000000005', 'Admin', current_date - interval '30 years', 'non_binaire', 'paris-centre', 'admin');

do $$
begin
  insert into profiles (id, prenom, date_naissance, genre, zone_id)
  values ('dddddddd-0000-0000-0000-000000000004', 'Trop jeune', current_date - interval '19 years', 'homme', 'paris-est');
  raise exception 'ÉCHEC : un profil de 19 ans a été accepté';
exception when raise_exception then
  if sqlerrm like 'ÉCHEC%' then raise; end if;
  raise notice 'ok : refus d''un profil de 19 ans';
end $$;

insert into slots (id, jour, moment) values (1, current_date + 3, 'soir');
insert into groups (id, activity_code, slot_id, zone_id, statut) values
  ('99999999-0000-0000-0000-000000000001', 'cinema', 1, 'paris-est', 'confirme');
insert into group_members (group_id, user_id) values
  ('99999999-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001'),
  ('99999999-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002');
insert into events (id, group_id, activity_code, slot_id) values
  ('88888888-0000-0000-0000-000000000001', '99999999-0000-0000-0000-000000000001', 'cinema', 1);
insert into event_participants (event_id, user_id) values
  ('88888888-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001'),
  ('88888888-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002');
insert into messages (group_id, auteur_id, texte) values
  ('99999999-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'On se retrouve devant le ciné ?');
insert into feedbacks (event_id, auteur_id, present, revoir_groupe, ambiance) values
  ('88888888-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', true, 'oui', 5);
insert into bestie_proposals (user_a, user_b, reponse_a, reponse_b) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', null, false);
insert into join_requests (id, group_id, candidat_id) values
  ('77777777-0000-0000-0000-000000000001', '99999999-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003');
insert into join_votes (join_request_id, votant_id, vote) values
  ('77777777-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', false);

-- ---------------------------------------------------------------------
-- Alice, membre du groupe
-- ---------------------------------------------------------------------
select pg_temp.etre('aaaaaaaa-0000-0000-0000-000000000001');
set role authenticated;

select pg_temp.verifier((select count(*) from groups) = 1, 'Alice voit son groupe');
select pg_temp.verifier((select count(*) from messages) = 1, 'Alice lit le chat de son groupe');
select pg_temp.verifier((select count(*) from profiles) = 1, 'Alice ne lit que son propre profil complet');
select pg_temp.verifier(
  (select count(*) from profils_publics where prenom = 'Bilal') = 1
  and (select count(*) from profils_publics where prenom = 'Chloé') = 0,
  'Alice voit le prénom de Bilal (même groupe), pas celui de Chloé');
select pg_temp.verifier((select count(*) from feedbacks) = 0, 'Alice ne voit pas le feedback de Bilal');
select pg_temp.verifier(
  (select ma_reponse is null and statut = 'en_attente' from mes_propositions_bestie),
  'Le refus de Bilal reste invisible pour Alice (toujours « en attente »)');
select pg_temp.verifier((select count(*) from join_votes) = 0, 'Le vote de Bilal pour Chloé est secret');

do $$
begin
  update profiles set role = 'admin' where id = auth.uid();
  raise exception 'ÉCHEC : Alice a pu se donner le rôle admin';
exception when insufficient_privilege then raise notice 'ok : impossible de se donner le rôle admin';
end $$;

delete from event_participants where user_id = auth.uid();
select pg_temp.verifier(
  (select count(*) from event_participants where user_id = auth.uid()) = 1,
  'Pas de désistement : Alice reste inscrite à la sortie');

do $$
begin
  insert into requests (user_id, activity_code, slot_id, zone_id)
  values (auth.uid(), 'resto', 1, 'paris-est');
  raise exception 'ÉCHEC : demande créée pour une activité masquée';
exception when insufficient_privilege then raise notice 'ok : pas de demande pour une activité masquée (resto)';
end $$;

insert into requests (user_id, activity_code, slot_id, zone_id, phrase)
values (auth.uid(), 'cinema', 1, 'paris-est', 'Plutôt VO !');
select pg_temp.verifier((select count(*) from requests) = 1, 'Alice crée une demande ciné');

do $$
begin
  update requests set statut = 'groupee' where user_id = auth.uid();
  raise exception 'ÉCHEC : Alice a pu marquer sa demande comme groupée';
exception when insufficient_privilege then raise notice 'ok : une demande ne peut qu''être annulée par la personne';
end $$;
update requests set statut = 'annulee' where user_id = auth.uid();
select pg_temp.verifier((select statut from requests) = 'annulee', 'Alice annule sa demande');

do $$
begin
  insert into contact_shares (group_id, user_id, contact)
  values ('99999999-0000-0000-0000-000000000001', auth.uid(), '@alice');
  raise exception 'ÉCHEC : contact partagé dans un groupe qui n''est pas encore un cercle';
exception when insufficient_privilege then raise notice 'ok : pas de partage de contact avant que le groupe soit un cercle';
end $$;

reset role;

-- ---------------------------------------------------------------------
-- Chloé, hors du groupe
-- ---------------------------------------------------------------------
select pg_temp.etre('cccccccc-0000-0000-0000-000000000003');
set role authenticated;

select pg_temp.verifier((select count(*) from groups) = 0, 'Chloé ne voit pas le groupe');
select pg_temp.verifier((select count(*) from messages) = 0, 'Chloé ne lit pas le chat');
select pg_temp.verifier((select count(*) from join_requests) = 0, 'Chloé ne voit pas qu''on vote pour elle');
do $$
begin
  insert into messages (group_id, auteur_id, texte)
  values ('99999999-0000-0000-0000-000000000001', auth.uid(), 'coucou');
  raise exception 'ÉCHEC : Chloé a écrit dans un groupe dont elle n''est pas membre';
exception when insufficient_privilege then raise notice 'ok : Chloé ne peut pas écrire dans le groupe';
end $$;

reset role;

-- ---------------------------------------------------------------------
-- Le groupe devient un cercle : partage de contact possible
-- ---------------------------------------------------------------------
update groups set statut = 'permanent' where id = '99999999-0000-0000-0000-000000000001';
select pg_temp.etre('aaaaaaaa-0000-0000-0000-000000000001');
set role authenticated;
insert into contact_shares (group_id, user_id, contact)
values ('99999999-0000-0000-0000-000000000001', auth.uid(), '@alice');
select pg_temp.verifier((select count(*) from contact_shares) = 1, 'Alice partage son contact dans le cercle');
reset role;

-- ---------------------------------------------------------------------
-- Visiteur non connecté : liste d'attente
-- ---------------------------------------------------------------------
select set_config('request.jwt.claims', '', false);
set role anon;
insert into waitlist (email, ville) values ('lea@exemple.fr', 'lyon'), ('sam@exemple.fr', 'lyon');
select pg_temp.verifier((select count(*) from waitlist) = 0, 'Les emails de la liste d''attente restent privés');
select pg_temp.verifier(
  (select total from compteur_liste_attente() where ville = 'lyon') = 2,
  'Le compteur public par ville fonctionne');
reset role;

-- ---------------------------------------------------------------------
-- Admin
-- ---------------------------------------------------------------------
select pg_temp.etre('eeeeeeee-0000-0000-0000-000000000005');
set role authenticated;
select pg_temp.verifier((select count(*) from feedbacks) = 1, 'L''admin voit les feedbacks (tableau de bord)');
select pg_temp.verifier((select count(*) from waitlist) = 2, 'L''admin voit la liste d''attente');
reset role;

\echo 'Tous les tests de sécurité sont passés.'
