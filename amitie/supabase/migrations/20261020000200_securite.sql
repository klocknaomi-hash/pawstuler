-- =====================================================================
-- Règles d'accès (Row Level Security) — jalon 0
--
-- Principe : chaque personne ne lit que ce qui la concerne.
--  - les groupes, sorties et messages : seulement si on en est membre ;
--  - les feedbacks, notes privées et votes : seulement les siens ;
--  - les propositions bestie : seulement sa propre réponse (via une vue) ;
--  - le profil des autres : prénom, âge, zone et bio uniquement (via une vue),
--    jamais la date de naissance ni le téléphone.
-- Les actions sensibles (former un groupe, quitter un cercle, répondre à une
-- proposition bestie, utiliser une invitation) passeront par des fonctions
-- serveur dans les jalons suivants : pas d'écriture directe ici.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Fonctions d'aide (security definer : elles lisent sans déclencher les RLS)
-- ---------------------------------------------------------------------

create function est_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create function est_actif() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and statut = 'actif');
$$;

create function est_membre(g uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from group_members
    where group_id = g and user_id = auth.uid() and statut = 'actif'
  );
$$;

create function participe(e uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from event_participants where event_id = e and user_id = auth.uid());
$$;

-- Membre du groupe, ou nouvelle personne inscrite à une de ses sorties ouvertes
create function a_acces_groupe(g uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select est_membre(g) or exists (
    select 1 from event_participants ep join events e on e.id = ep.event_id
    where e.group_id = g and ep.user_id = auth.uid()
  );
$$;

-- Deux personnes se « connaissent » dans l'app : même groupe, même sortie, ou lien bestie
create function se_connaissent(autre uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select autre = auth.uid()
    or exists (
      select 1 from group_members moi join group_members lui on lui.group_id = moi.group_id
      where moi.user_id = auth.uid() and lui.user_id = autre
        and moi.statut = 'actif' and lui.statut = 'actif'
    )
    or exists (
      select 1 from event_participants moi join event_participants lui on lui.event_id = moi.event_id
      where moi.user_id = auth.uid() and lui.user_id = autre
    )
    or exists (
      select 1 from bestie_links
      where (user_a = auth.uid() and user_b = autre) or (user_b = auth.uid() and user_a = autre)
    );
$$;

-- ---------------------------------------------------------------------
-- RLS activée partout
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'app_config', 'zones', 'activity_types', 'interests', 'slots', 'contract_versions',
    'profiles', 'profile_interests', 'contract_acceptances', 'invites', 'waitlist', 'blocks',
    'groups', 'requests', 'group_members', 'events', 'event_participants',
    'join_requests', 'join_votes', 'contact_shares',
    'feedbacks', 'member_ratings', 'bestie_proposals', 'bestie_links', 'messages',
    'reports', 'sanctions'
  ] loop
    execute format('alter table %I enable row level security', t);
    -- L'admin peut tout lire et tout corriger (animation manuelle, modération)
    execute format(
      'create policy admin_tout on %I for all to authenticated using (est_admin()) with check (est_admin())', t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Référentiels : lecture libre
-- ---------------------------------------------------------------------
create policy lecture on zones for select to anon, authenticated using (true);
create policy lecture on activity_types for select to anon, authenticated using (true);
create policy lecture on contract_versions for select to anon, authenticated using (true);
create policy lecture on interests for select to authenticated using (true);
create policy lecture on slots for select to authenticated using (true);
create policy lecture on app_config for select to authenticated using (true);

-- ---------------------------------------------------------------------
-- Profil : le sien uniquement. Les colonnes sensibles (rôle, statut,
-- vérification) ne sont jamais modifiables par l'utilisateur.
-- ---------------------------------------------------------------------
create policy le_sien on profiles for select to authenticated using (id = auth.uid());
create policy creer_le_sien on profiles for insert to authenticated with check (id = auth.uid());
create policy modifier_le_sien on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

revoke insert, update on profiles from anon, authenticated;
grant insert (id, prenom, date_naissance, genre, zone_id, preference_bestie, bio) on profiles to authenticated;
grant update (prenom, zone_id, preference_bestie, bio, push_token) on profiles to authenticated;

-- Ce que les autres voient de moi
create view profils_publics with (security_barrier) as
  select
    p.id,
    p.prenom,
    extract(year from age(current_date, p.date_naissance))::int as age,
    p.zone_id,
    p.bio
  from profiles p
  where p.statut <> 'exclu' and (se_connaissent(p.id) or est_admin());
revoke all on profils_publics from anon;
grant select on profils_publics to authenticated;

create policy les_siens on profile_interests for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy les_siennes on contract_acceptances for select to authenticated using (user_id = auth.uid());
create policy accepter on contract_acceptances for insert to authenticated with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Liste d'attente : on s'inscrit, on ne lit pas les autres.
-- Le compteur public passe par une fonction qui ne renvoie que des totaux.
-- ---------------------------------------------------------------------
create policy s_inscrire on waitlist for insert to anon, authenticated with check (true);

create function compteur_liste_attente()
returns table (ville text, total bigint)
language sql stable security definer set search_path = public as $$
  select ville, count(*) from waitlist group by ville order by count(*) desc;
$$;
grant execute on function compteur_liste_attente() to anon, authenticated;

-- ---------------------------------------------------------------------
-- Blocages : les siens uniquement (la personne bloquée ne voit rien)
-- ---------------------------------------------------------------------
create policy les_siens on blocks for all to authenticated
  using (bloqueur_id = auth.uid()) with check (bloqueur_id = auth.uid());

-- ---------------------------------------------------------------------
-- Demandes
-- ---------------------------------------------------------------------
create policy les_siennes on requests for select to authenticated using (user_id = auth.uid());
create policy creer on requests for insert to authenticated with check (
  user_id = auth.uid()
  and est_actif()
  and exists (select 1 from activity_types a where a.code = activity_code and a.actif)
);
-- La seule modification possible : annuler une demande encore ouverte
create policy annuler on requests for update to authenticated
  using (user_id = auth.uid() and statut = 'ouverte')
  with check (user_id = auth.uid() and statut = 'annulee');

revoke insert, update on requests from anon, authenticated;
grant insert (user_id, activity_code, slot_id, zone_id, interest_id, non_mixte, phrase) on requests to authenticated;
grant update (statut) on requests to authenticated;

-- ---------------------------------------------------------------------
-- Groupes, membres, sorties : seulement si on en fait partie
-- ---------------------------------------------------------------------
create policy si_acces on groups for select to authenticated using (a_acces_groupe(id));
create policy si_acces on group_members for select to authenticated using (a_acces_groupe(group_id));
create policy si_acces on events for select to authenticated using (a_acces_groupe(group_id));
create policy si_acces on event_participants for select to authenticated using (
  exists (select 1 from events e where e.id = event_id and a_acces_groupe(e.group_id))
);
-- Pas de désistement : aucune règle de suppression sur event_participants.

-- ---------------------------------------------------------------------
-- Accueillir un nouveau membre : la demande est visible par les membres,
-- mais chaque vote reste secret (on ne lit que le sien).
-- ---------------------------------------------------------------------
create policy membres on join_requests for select to authenticated using (est_membre(group_id));

create policy le_sien on join_votes for select to authenticated using (votant_id = auth.uid());
create policy voter on join_votes for insert to authenticated with check (
  votant_id = auth.uid()
  and exists (
    select 1 from join_requests j
    where j.id = join_request_id and j.statut = 'en_cours' and est_membre(j.group_id)
  )
);

-- ---------------------------------------------------------------------
-- Partage de contact : uniquement dans un cercle permanent, uniquement le sien
-- ---------------------------------------------------------------------
create policy cercle on contact_shares for select to authenticated using (
  est_membre(group_id)
  and exists (select 1 from groups g where g.id = group_id and g.statut = 'permanent')
);
create policy partager on contact_shares for insert to authenticated with check (
  user_id = auth.uid()
  and est_membre(group_id)
  and exists (select 1 from groups g where g.id = group_id and g.statut = 'permanent')
);
create policy retirer on contact_shares for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Après la sortie : tout est privé
-- ---------------------------------------------------------------------
create policy le_sien on feedbacks for select to authenticated using (auteur_id = auth.uid());
create policy donner on feedbacks for insert to authenticated with check (
  auteur_id = auth.uid() and participe(event_id)
);

create policy les_siennes on member_ratings for select to authenticated using (de_id = auth.uid());
create policy noter on member_ratings for insert to authenticated with check (
  de_id = auth.uid()
  and participe(event_id)
  and exists (select 1 from event_participants ep where ep.event_id = member_ratings.event_id and ep.user_id = vers_id)
);

-- Propositions bestie : pas de lecture directe (la réponse de l'autre doit rester cachée)
create view mes_propositions_bestie with (security_barrier) as
  select
    id,
    case when user_a = auth.uid() then user_b else user_a end as autre_id,
    case when user_a = auth.uid() then reponse_a else reponse_b end as ma_reponse,
    -- Un refus n'est jamais montré : tant que ce n'est pas accepté, c'est « en attente »
    case when statut = 'acceptee' then 'acceptee'::statut_proposition_bestie
         else 'en_attente'::statut_proposition_bestie end as statut,
    cree_le
  from bestie_proposals
  where auth.uid() in (user_a, user_b) and statut in ('en_attente', 'acceptee');
revoke all on mes_propositions_bestie from anon;
grant select on mes_propositions_bestie to authenticated;

create policy les_siens on bestie_links for select to authenticated using (auth.uid() in (user_a, user_b));

-- ---------------------------------------------------------------------
-- Messages
-- ---------------------------------------------------------------------
create function peut_lire_conversation(g uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select (g is not null and est_membre(g))
      or (b is not null and exists (
            select 1 from bestie_links l where l.id = b and auth.uid() in (l.user_a, l.user_b)));
$$;

create policy lire on messages for select to authenticated
  using (peut_lire_conversation(group_id, bestie_link_id));
create policy ecrire on messages for insert to authenticated with check (
  auteur_id = auth.uid() and est_actif() and peut_lire_conversation(group_id, bestie_link_id)
);

-- ---------------------------------------------------------------------
-- Signalements et sanctions
-- ---------------------------------------------------------------------
create policy les_siens on reports for select to authenticated using (auteur_id = auth.uid());
create policy signaler on reports for insert to authenticated with check (auteur_id = auth.uid());
revoke update on reports from anon, authenticated;

create policy les_siennes on sanctions for select to authenticated using (user_id = auth.uid());
