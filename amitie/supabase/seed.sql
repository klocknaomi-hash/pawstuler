-- =====================================================================
-- Données de départ : réglages, zones de Paris, activités, centres d'intérêt
-- =====================================================================

-- Réglages (mêmes valeurs que packages/core/src/regles.ts)
insert into app_config (cle, valeur, description) values
  ('age_min', '20', 'Âge minimum pour s''inscrire'),
  ('age_max', '35', 'Âge maximum pour s''inscrire'),
  ('taille_groupe_min', '3', 'Un groupe n''est formé qu''à partir de ce nombre de personnes'),
  ('taille_groupe_max', '6', 'Taille maximum d''un groupe'),
  ('taille_groupe_cible_min', '4', 'Taille idéale (bas)'),
  ('taille_groupe_cible_max', '5', 'Taille idéale (haut)'),
  ('nouveaux_par_sortie_min', '2', 'Sortie ouverte d''un cercle : nouvelles personnes au minimum'),
  ('vote_nouveau_membre', '"unanimite"', 'Règle pour accueillir quelqu''un dans un cercle'),
  ('sorties_pour_bestie', '3', 'Sorties partagées avant de proposer un lien bestie'),
  ('places_max', '300', 'Plafond d''inscriptions au lancement'),
  ('ville_ouverte', '"paris"', 'Seule ville ouverte');

-- Zones : groupes d'arrondissements + petite couronne. Jamais d'adresse précise.
insert into zones (id, nom, ordre) values
  ('paris-centre',     'Paris Centre (1er – 4e)', 1),
  ('paris-rive-gauche','Rive gauche (5e, 6e, 7e)', 2),
  ('paris-sud',        'Paris Sud (13e, 14e, 15e)', 3),
  ('paris-ouest',      'Paris Ouest (8e, 16e, 17e)', 4),
  ('paris-nord',       'Paris Nord (9e, 10e, 18e, 19e)', 5),
  ('paris-est',        'Paris Est (11e, 12e, 20e)', 6),
  ('hauts-de-seine',   'Hauts-de-Seine (92)', 7),
  ('seine-saint-denis','Seine-Saint-Denis (93)', 8),
  ('val-de-marne',     'Val-de-Marne (94)', 9);

-- Activités : ciné et sorties ouverts, le reste prévu mais masqué
insert into activity_types (code, libelle, emoji, actif, ordre) values
  ('cinema', 'Ciné', '🎬', true, 1),
  ('sortie', 'Sortie', '✨', true, 2),
  ('resto', 'Resto', '🍝', false, 3),
  ('voyage', 'Voyage', '🧳', false, 4),
  ('sport', 'Sport', '🏃', false, 5);

-- Centres d'intérêt (liste de départ, à enrichir)
insert into interests (code, libelle, categorie) values
  ('films-auteur', 'Films d''auteur', 'Ciné'),
  ('blockbusters', 'Blockbusters', 'Ciné'),
  ('horreur', 'Films d''horreur', 'Ciné'),
  ('animation', 'Animation', 'Ciné'),
  ('series', 'Séries', 'Ciné'),
  ('expos', 'Expos et musées', 'Culture'),
  ('photo', 'Photo', 'Culture'),
  ('theatre', 'Théâtre et stand-up', 'Culture'),
  ('lecture', 'Lecture', 'Culture'),
  ('concerts', 'Concerts', 'Musique'),
  ('electro', 'Électro', 'Musique'),
  ('rap', 'Rap', 'Musique'),
  ('bars', 'Bars et terrasses', 'Sorties'),
  ('balades', 'Balades', 'Sorties'),
  ('brunch', 'Brunch', 'Sorties'),
  ('jeux-societe', 'Jeux de société', 'Jeux'),
  ('jeux-video', 'Jeux vidéo', 'Jeux'),
  ('quiz', 'Quiz et blind tests', 'Jeux'),
  ('sport-doux', 'Yoga et sport doux', 'Sport'),
  ('running', 'Running', 'Sport'),
  ('cuisine', 'Cuisine', 'Autres'),
  ('voyages', 'Voyages', 'Autres');
