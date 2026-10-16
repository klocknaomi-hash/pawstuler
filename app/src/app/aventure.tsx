/**
 * L'AVENTURE DU JOUR DE MILO
 * Un seul écran pour toute la vie d'une aventure, en temps réel :
 *  1. Présentation : ce que Milo va faire (choisi d'après ton parcours à cet instant), durée, énergie.
 *     Si ce n'est pas possible maintenant, on dit simplement pourquoi (il dort, nouvelle aventure demain,
 *     prochaine aventure à 14 h 43 en Premium, son entretien est à 11 h 30, pas assez d'énergie).
 *  2. Départ : il s'en va avec ce qu'il emporte.
 *  3. Pendant : la scène animée raconte ce qu'il fait (rue, téléphone, entretien…), « Retour à 11 h 05 ».
 *  4. Retour : d'abord son récit et sa récompense, puis, plus discret, quand il pourra repartir.
 * Une aventure lancée ne change plus, même si tu mets une candidature à jour pendant ce temps.
 * Ouverture : `/aventure` (l'aventure du jour) ou `/aventure?moment=repos|baignade` (moment pour souffler).
 */
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown, SlideInLeft, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

import { Bouton, Ecran, Texte, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { IconePiece } from '@/components/Pieces';
import { SceneAventure } from '@/components/SceneAventure';
import { carnetDeRetour, type Carnet } from '@/logique/carnet';
import { villeParId, type VilleId } from '@/config/villes';
import { animationAventure } from '@/illustrations/registre';
import { decorDeMission } from '@/logique/decors';
import { objetParId } from '@/config/boutique';
import { accorder, type EspeceId } from '@/config/compagnons';
import { AVENTURES_PAR_JOUR } from '@/config/energie';
import { BOUTON_DEPART, COUTS_MISSION, DUREES_MINUTES, HEURES_ENTRE_AVENTURES_PREMIUM, MOMENTS, OBJET_EMPORTE, PIECES_MISSION, type TypeMoment } from '@/config/missions';
import { arrondis, couleurs, espace, ombre, relief } from '@/config/theme';
import { useMaintenant } from '@/hooks/useMaintenant';
import { dureeLisible, energieDisponible, tempsAvantRecharge } from '@/logique/energie';
import {
  aventureDuJour,
  compagnonAbsent,
  dureeMission,
  estUnMoment,
  heureLisible,
  iconeMission,
  missionEnCours,
  momentDuCompagnon,
  ouEst,
  ficheMission,
  prochainDepart,
  remplir,
  titreMission,
} from '@/logique/missions';
import { estEndormi } from '@/logique/rythme';
import { aPremium } from '@/services/abonnement';
import { gainPlafonne, useApp } from '@/store/etat';
import type { Mission } from '@/store/types';

/** Le décor de la scène : la rue pour les aventures en ville, le lac pour souffler, un coin calme pour téléphoner. */
export default function Aventure() {
  const { moment } = useLocalSearchParams<{ moment?: string }>();
  const { etat, dispatch } = useApp();
  const maintenant = useMaintenant();
  // Le récit découvert sur cet écran (et les pièces réellement gagnées, plafond compris)
  const [decouvert, setDecouvert] = useState<{ id: string; pieces: number; carnet: Carnet } | null>(null);
  // Moment pour souffler demandé depuis l'accueil (figé à l'ouverture)
  const [momentChoisi] = useState<Mission | null>(() =>
    MOMENTS.includes(moment as TypeMoment) ? momentDuCompagnon(etat, moment as TypeMoment) : null,
  );
  // Animation de départ en cours (il s'en va avec ce qu'il emporte)
  const [partant, setPartant] = useState<Mission | null>(null);
  useEffect(() => {
    if (!partant) return;
    const minuterie = setTimeout(() => setPartant(null), 2600);
    return () => clearTimeout(minuterie);
  }, [partant]);

  if (!etat.compagnon || !etat.villeId) return null;
  const compagnon = etat.compagnon;
  const nom = compagnon.nom;
  const fermer = () => router.back();
  const accord = (texte: string) => accorder(texte, compagnon.pronoms);

  const enCours = missionEnCours(etat);
  const vue = decouvert ? etat.missions.find((m) => m.id === decouvert.id) : undefined;

  /* 4. Retour : son carnet de voyage (où, ce qu'il a vécu, découvert, le lien avec toi, ce qu'il rapporte, la suite) */
  if (vue && decouvert) {
    const depart = prochainDepart(etat, maintenant);
    const suite = estUnMoment(vue)
      ? null
      : depart === 'demain'
        ? 'Une nouvelle aventure sera possible demain.'
        : typeof depart === 'number'
          ? `Prochaine aventure possible à ${heureLisible(depart)}.`
          : 'Une autre aventure est possible aujourd’hui.';
    const { carnet } = decouvert;
    // Les pages du carnet apparaissent l'une après l'autre
    let page = 0;
    const entree = () => FadeInDown.delay(250 + 180 * page++).duration(450);
    return (
      <Ecran defilant bas={<Bouton titre="Retour à l’accueil" onPress={fermer} />}>
        <Fermer onPress={fermer} />
        {/* 1. Où il est allé : l'image du lieu, et lui, tout fier de rentrer */}
        <View style={styles.photo}>
          <Image source={carnet.image} style={styles.photoImage} contentFit="cover" />
          <View style={styles.photoCompagnon}>
            <Compagnon
              espece={compagnon.espece}
              pose={vue.type === 'refus' ? 'reconfort' : vue.type === 'entretien' ? 'fier' : 'content'}
              taille={130}
              reaction={1}
              equipe={vue.type === 'entretien' && vue.tenue ? [vue.tenue] : etat.equipe}
            />
          </View>
          <View style={styles.etiquette}>
            <Text style={styles.etiquetteTexte} numberOfLines={1}>
              {carnet.ou}
            </Text>
          </View>
        </View>
        <View style={styles.entete}>
          <Titre style={styles.texteCentre}>{accord(`${nom} est rentré{e} !`)}</Titre>
          {/* Son petit mot, à la première personne */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.mot}>
            <Text style={styles.motTexte}>{carnet.mot}</Text>
          </Animated.View>
          {carnet.detail && <Text style={styles.detail}>{carnet.detail}</Text>}
          {vue.depart && vue.retour && (
            <Text style={styles.detail}>
              Parti{accord('{e}')} à {heureLisible(vue.depart)} · rentré{accord('{e}')} à {heureLisible(vue.retour)}
            </Text>
          )}
        </View>

        {/* 2. Ce qu'il a vécu */}
        <Animated.View entering={entree()} style={styles.carte}>
          <Text style={styles.rubrique}>📖 Son carnet de voyage</Text>
          <Text style={styles.texteCarte}>{carnet.vecu}</Text>
        </Animated.View>

        {/* 3. Ce qu'il a découvert */}
        {carnet.decouvertes.length > 0 && (
          <Animated.View entering={entree()} style={styles.carte}>
            <Text style={styles.rubrique}>✨ Ce qu’{accord('{il}')} a découvert</Text>
            {carnet.decouvertes.map((l) => (
              <Ligne key={l.texte} emoji={l.emoji} texte={l.texte} />
            ))}
          </Animated.View>
        )}

        {/* 4. Le lien avec ta recherche */}
        {(carnet.lien || carnet.action) && (
          <Animated.View entering={entree()} style={[styles.carte, styles.carteLien]}>
            <Text style={styles.rubrique}>🐾 Et toi, de ton côté</Text>
            {carnet.lien && <Text style={styles.texteCarte}>{carnet.lien}</Text>}
            {/* Un petit pas pour toi aussi, relié à ta recherche */}
            {carnet.action && (
              <Pressable
                onPress={() => router.push({ pathname: carnet.action!.pathname as never, params: carnet.action!.params })}
                accessibilityRole="button"
                style={styles.action}>
                <Text style={styles.actionTexte}>{carnet.action.libelle}</Text>
              </Pressable>
            )}
          </Animated.View>
        )}

        {/* 5. Ce qu'il rapporte */}
        <Animated.View entering={entree()} style={styles.carte}>
          <Text style={styles.rubrique}>🎒 Ce qu’{accord('{il}')} rapporte</Text>
          {estUnMoment(vue) ? (
            <Ligne emoji="💛" texte={accord('Un moment rien que pour {lui}.')} />
          ) : (
            <View style={styles.ligne}>
              <IconePiece taille={20} />
              <Text style={styles.recompenseTexte}>
                {decouvert.pieces > 0 ? `+${decouvert.pieces} pièces rapportées` : 'Plafond de pièces atteint aujourd’hui, mais quelle aventure !'}
              </Text>
            </View>
          )}
          {carnet.gains.map((l) => (
            <Ligne key={l.texte} emoji={l.emoji} texte={l.texte} />
          ))}
        </Animated.View>

        {/* 6. Ce qui l'attend ensuite, puis (discret) quand il pourra repartir */}
        <Animated.View entering={entree()} style={styles.carte}>
          <Text style={styles.rubrique}>🗓️ Et ensuite ?</Text>
          {carnet.ensuite.map((t) => (
            <Text key={t} style={styles.texteCarte}>
              {t}
            </Text>
          ))}
        </Animated.View>
        {suite && <Text style={styles.suite}>{suite}</Text>}
        {depart === 'demain' && !estUnMoment(vue) && !aPremium(etat) && (
          <Pressable onPress={() => router.replace('/premium')} accessibilityRole="button">
            <Text style={styles.lien}>Avec Premium : jusqu’à {AVENTURES_PAR_JOUR.premium} aventures par jour</Text>
          </Pressable>
        )}
      </Ecran>
    );
  }

  /* 2. Départ : il s'en va, avec ce qu'il emporte */
  if (partant) {
    return (
      <Ecran fond={couleurs.pecheClair} style={styles.centre}>
        <Depart
          espece={compagnon.espece}
          ville={etat.villeId}
          equipe={partant.type === 'entretien' && partant.tenue ? [partant.tenue] : etat.equipe}
          objet={OBJET_EMPORTE[partant.type]}
        />
        <Titre style={styles.texteCentre}>{partant.type === 'repos' ? 'Bonne sieste !' : partant.type === 'entretien' ? 'Bonne chance !' : 'Bonne route !'}</Titre>
        <Texte style={styles.texteCentre}>{titreMission(etat, partant)}</Texte>
      </Ecran>
    );
  }

  /* 3. Pendant l'aventure, ou revenu avec un récit à découvrir */
  if (enCours?.retour) {
    const absent = compagnonAbsent(etat, maintenant);
    const decouvrir = () => {
      // Le carnet est écrit avant d'enregistrer la découverte (pour savoir si c'était son premier passage)
      setDecouvert({ id: enCours.id, pieces: gainPlafonne(etat, PIECES_MISSION[enCours.type]), carnet: carnetDeRetour(etat, enCours) });
      dispatch({ type: 'DECOUVRIR_RESULTAT', id: enCours.id });
    };
    return (
      <Ecran
        fond={couleurs.creme}
        style={styles.centre}
        bas={absent ? <Bouton titre="D’accord, à tout à l’heure !" onPress={fermer} /> : <Bouton titre="Découvrir son aventure" onPress={decouvrir} />}>
        <Fermer onPress={fermer} flottant />
        {absent ? (
          <>
            <SceneAventure
              mission={enCours}
              espece={compagnon.espece}
              equipe={etat.equipe}
              decor={decorDeMission(etat, enCours)}
              ville={etat.villeId}
              hauteur={300}
              taille={96}
            />
            <Titre style={styles.texteCentre}>{ouEst(etat, enCours)}</Titre>
            <View style={styles.pastille}>
              <Ionicons name="time-outline" size={18} color={couleurs.brun} />
              <Text style={styles.pastilleTexte}>
                Retour à {heureLisible(enCours.retour)} · dans {dureeLisible(Math.min(enCours.retour - maintenant, dureeMission(enCours)))}
              </Text>
            </View>
            <Texte style={styles.texteCentre}>Tu peux fermer l’app : tu seras prévenu à son retour.</Texte>
          </>
        ) : (
          <>
            {/* Retour : il arrive en courant */}
            <Animated.View entering={SlideInLeft.duration(1200)}>
              <Compagnon espece={compagnon.espece} pose="excite" taille={170} reaction={1} equipe={etat.equipe} />
            </Animated.View>
            <Titre style={styles.texteCentre}>{nom} est de retour !</Titre>
          </>
        )}
      </Ecran>
    );
  }

  /* 1. Présentation, avant le départ */
  const { mission, pasAvant } = momentChoisi ? { mission: momentChoisi, pasAvant: undefined } : aventureDuJour(etat, maintenant);
  const cout = COUTS_MISSION[mission.type];
  const energie = energieDisponible(etat, maintenant);
  const recharge = tempsAvantRecharge(etat, maintenant);
  const depart = momentChoisi ? null : prochainDepart(etat, maintenant);
  const empechement = estEndormi(etat.rythme)
    ? `${nom} dort. On verra ça à son réveil.`
    : depart === 'demain'
      ? 'Nouvelle aventure demain.'
      : typeof depart === 'number'
        ? `Prochaine aventure possible à ${heureLisible(depart)} (${HEURES_ENTRE_AVENTURES_PREMIUM} h après son retour).`
        : pasAvant
          ? `Son entretien est à ${heureLisible(pasAvant)} : reviens à ce moment-là pour l’encourager !`
          : energie < cout
            ? accord(
                `${nom} a besoin de ${cout} ⚡ pour partir ({il} en a ${energie}).${recharge != null ? ` Recharge complète dans ${dureeLisible(recharge)}.` : ''} Chaque tâche terminée lui en redonne.`,
              )
            : null;
  const tenue = mission.type === 'entretien' && mission.tenue ? objetParId(mission.tenue) : undefined;

  const envoyer = () => {
    if (momentChoisi) dispatch({ type: 'PRENDRE_UN_MOMENT', moment: momentChoisi.type as TypeMoment });
    else dispatch({ type: 'LANCER_AVENTURE' });
    setPartant(mission);
  };

  const fiche = ficheMission(etat, mission);
  const image = decorDeMission(etat, mission);

  // Présentée comme une petite offre : le lieu, l'objectif, ce qu'il va faire, puis le bouton juste dessous
  return (
    <Ecran defilant style={styles.presentation}>
      <Fermer onPress={fermer} flottant />
      <View style={styles.centre}>
        <Compagnon espece={compagnon.espece} pose="aventure" taille={140} promenade equipe={tenue ? [tenue.id] : etat.equipe} />
        <Titre style={styles.texteCentre}>{titreMission(etat, mission)}</Titre>
      </View>

      <View style={styles.offre}>
        {/* En-tête de l'offre : image du lieu, type d'aventure, lieu, ville et métier */}
        <View style={styles.offreEntete}>
          <View style={styles.vignette}>
            {image ? <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
            <Text style={styles.vignetteIcone}>{iconeMission(mission)}</Text>
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <Text style={styles.type}>{fiche.type}</Text>
            <Text style={styles.offreLieu} numberOfLines={1}>
              {mission.lieu.charAt(0).toUpperCase() + mission.lieu.slice(1)}
            </Text>
            <Text style={styles.offreDetail} numberOfLines={1}>
              {villeParId(etat.villeId).nom}
              {mission.metier && !estUnMoment(mission) ? ` · ${mission.metier}` : ''}
            </Text>
          </View>
        </View>
        <View style={styles.offreBloc}>
          <Text style={styles.rubrique}>🎯 Objectif</Text>
          <Text style={styles.texteCarte}>{fiche.objectif}</Text>
        </View>
        <View style={styles.offreBloc}>
          <Text style={styles.rubrique}>🐾 Ce qu’{accord('{il}')} va faire</Text>
          <Text style={styles.texteCarte}>{fiche.action}</Text>
        </View>
        <View style={styles.infos}>
          <Info icone="time-outline" texte={`${DUREES_MINUTES[mission.type]} min`} />
          <Info icone="flash-outline" texte={`${cout} énergie`} />
          {PIECES_MISSION[mission.type] > 0 && <Info icone="ellipse-outline" texte={`+${PIECES_MISSION[mission.type]} pièces`} />}
        </View>
      </View>

      {/* Entretien : sa tenue (achetée au Shop), jamais obligatoire */}
      {mission.type === 'entretien' &&
        (tenue ? (
          <Text style={styles.tenue}>👔 {accord(`{Il} portera sa tenue : ${tenue.nom}.`)}</Text>
        ) : (
          <Pressable onPress={() => router.push('/boutique')} accessibilityRole="button" style={styles.tenueManquante}>
            <Text style={styles.tenue}>{accord(`👔 ${nom} n’a pas encore de tenue d’entretien. {Il} ira dans sa tenue de tous les jours…`)}</Text>
            <Text style={styles.lien}>Voir les tenues au Shop ›</Text>
          </Pressable>
        ))}
      {empechement && <Texte style={styles.texteCentre}>{empechement}</Texte>}
      <Bouton titre={remplir(etat, BOUTON_DEPART[mission.type])} onPress={envoyer} desactive={!!empechement} />
    </Ecran>
  );
}

/** Le départ : il fait un petit bond, puis s'en va vers la droite avec ce qu'il emporte. */
function Depart({ espece, ville, equipe, objet }: { espece: EspeceId; ville?: VilleId; equipe?: string[]; objet: string }) {
  // Animation officielle du départ (quand elle sera fournie), sinon l'illustration et son petit bond
  const animation = animationAventure(espece, ville, 'depart');
  const x = useSharedValue(0);
  const pas = useSharedValue(0);
  useEffect(() => {
    x.set(withDelay(700, withTiming(1, { duration: 1700, easing: Easing.in(Easing.quad) })));
    pas.set(withRepeat(withTiming(1, { duration: 260 }), -1, true));
  }, [x, pas]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - Math.max(0, x.get() - 0.7) / 0.3,
    transform: [{ translateX: x.get() * 360 }, { translateY: -pas.get() * 8 }],
  }));
  return (
    <Animated.View style={[styles.depart, style]}>
      {!!objet && <Text style={styles.objetDepart}>{objet}</Text>}
      {animation ? (
        <Image source={animation} style={{ width: 170, height: 170 }} contentFit="contain" />
      ) : (
        <Compagnon espece={espece} pose="aventure" taille={170} equipe={equipe} />
      )}
    </Animated.View>
  );
}

function Ligne({ emoji, texte }: { emoji: string; texte: string }) {
  return (
    <View style={styles.ligne}>
      <Text style={styles.ligneEmoji}>{emoji}</Text>
      <Text style={styles.texteCarte}>{texte}</Text>
    </View>
  );
}

function Info({ icone, texte }: { icone: keyof typeof Ionicons.glyphMap; texte: string }) {
  return (
    <View style={styles.info}>
      <Ionicons name={icone} size={15} color={couleurs.saugeFonce} />
      <Text style={styles.infoTexte}>{texte}</Text>
    </View>
  );
}

function Fermer({ onPress, flottant }: { onPress: () => void; flottant?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Fermer" style={flottant ? styles.fermerFlottant : styles.fermer} hitSlop={12}>
      <Ionicons name="close" size={26} color={couleurs.brun} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: 'center', justifyContent: 'center', gap: espace.m },
  /* Présentation (comme une offre), centrée verticalement */
  presentation: { flexGrow: 1, justifyContent: 'center', gap: espace.m },
  offre: { backgroundColor: couleurs.carte, borderRadius: arrondis.l, padding: espace.l, gap: espace.m, ...relief },
  offreEntete: { flexDirection: 'row', alignItems: 'center', gap: espace.m },
  vignette: { width: 58, height: 58, borderRadius: arrondis.m, overflow: 'hidden', backgroundColor: couleurs.pecheClair, alignItems: 'flex-end', justifyContent: 'flex-end' },
  vignetteIcone: { fontSize: 18, margin: 2 },
  type: { fontSize: 13, fontWeight: '700', color: couleurs.renardFonce },
  offreLieu: { fontSize: 16, fontWeight: '700', color: couleurs.brun },
  offreDetail: { fontSize: 13, color: couleurs.brunDoux },
  offreBloc: { gap: 2, borderTopWidth: 1, borderTopColor: couleurs.ligne, paddingTop: espace.s },
  texteCentre: { textAlign: 'center' },
  fermer: { alignSelf: 'flex-end' },
  fermerFlottant: { position: 'absolute', top: espace.s, right: espace.l, zIndex: 2 },
  depart: { alignItems: 'center' },
  objetDepart: { position: 'absolute', top: 0, right: 8, fontSize: 34, zIndex: 1 },
  carte: { backgroundColor: couleurs.carte, borderRadius: arrondis.l, padding: espace.l, gap: espace.s, ...ombre },
  lieu: { fontWeight: '800', color: couleurs.renardFonce, fontSize: 14 },
  recit: { fontSize: 16, lineHeight: 23, color: couleurs.brun, fontWeight: '600' },
  infos: { flexDirection: 'row', flexWrap: 'wrap', gap: espace.s },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: couleurs.saugeClair,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  infoTexte: { fontWeight: '800', color: couleurs.saugeFonce, fontSize: 12.5 },
  pastille: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: couleurs.carte,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...ombre,
  },
  pastilleTexte: { fontWeight: '800', color: couleurs.brun },
  /* Carnet de voyage (retour) */
  photo: { height: 210, borderRadius: arrondis.l, overflow: 'hidden', backgroundColor: couleurs.pecheClair, ...relief },
  photoImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  photoCompagnon: { position: 'absolute', left: 0, right: 0, bottom: 6, alignItems: 'center' },
  etiquette: {
    position: 'absolute',
    top: espace.s,
    left: espace.s,
    maxWidth: '85%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  etiquetteTexte: { fontSize: 13, fontWeight: '700', color: couleurs.brun },
  entete: { alignItems: 'center', gap: 2 },
  detail: { textAlign: 'center', fontSize: 13, color: couleurs.brunDoux },
  rubrique: { fontSize: 13, fontWeight: '700', color: couleurs.renardFonce },
  texteCarte: { flex: 1, fontSize: 15, lineHeight: 21, color: couleurs.brun },
  carteLien: { backgroundColor: couleurs.saugeClair },
  mot: { backgroundColor: couleurs.carte, borderRadius: arrondis.l, paddingHorizontal: espace.l, paddingVertical: espace.s, marginTop: espace.xs, ...relief },
  motTexte: { fontSize: 15, lineHeight: 21, color: couleurs.brun, fontStyle: 'italic', textAlign: 'center' },
  action: { alignSelf: 'flex-start', backgroundColor: couleurs.carte, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, marginTop: espace.xs },
  actionTexte: { fontSize: 14, fontWeight: '600', color: couleurs.saugeFonce },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: espace.s },
  ligneEmoji: { fontSize: 18, width: 24, textAlign: 'center' },
  recompenseTexte: { flex: 1, fontWeight: '800', color: '#9A6400' },
  suite: { textAlign: 'center', fontSize: 13.5, fontWeight: '600', color: couleurs.brunDoux },
  lien: { textAlign: 'center', fontSize: 13, fontWeight: '800', color: couleurs.renardFonce },
  tenue: { fontSize: 14, fontWeight: '700', color: couleurs.brun, lineHeight: 20 },
  tenueManquante: { backgroundColor: couleurs.pecheClair, borderRadius: arrondis.m, padding: espace.m, gap: 4 },
});
