/**
 * FICHE CANDIDATURE
 * Tout sur une candidature : infos (modifiables), lien de l'offre, e-mail (écrire ou copier),
 * statut, date d'entretien, note, historique et archivage.
 * Changer de statut se fait en deux temps : on choisit l'étape, puis « Valider ».
 * Un entretien demande sa date (obligatoire) ; un refus demande ce qui a pu jouer (facultatif,
 * pour s'améliorer). Une relance peut être prévue (+1, +3, +5 jours).
 * Chaque changement s'ajoute à l'historique (rien n'est effacé).
 * Un refus fait réagir le compagnon ; « Décroché » ouvre la page de félicitations.
 */
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Bouton, Champ, Ecran, Pastille, SousTitre, Titre } from '@/components/base';
import { ChoixStatut } from '@/components/ChoixStatut';
import { Compagnon } from '@/components/Compagnon';
import { emailValide, statutParId } from '@/config/candidatures';
import { DELAIS_RELANCE } from '@/config/missions';
import { arrondis, couleurs, espace } from '@/config/theme';
import { ajouterJours } from '@/logique/missions';
import { dateEnSaisie, dateLisible, jourDe, joursEntre, lireDateFr } from '@/logique/dates';
import { jourDeRelance, relanceDue } from '@/logique/tachesDuJour';
import { useApp } from '@/store/etat';
import type { StatutCandidature } from '@/store/types';

export default function FicheCandidature() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { etat, dispatch } = useApp();
  const c = etat.candidatures.find((x) => x.id === id);
  const [note, setNote] = useState(c?.note ?? '');
  const [entretien, setEntretien] = useState(dateEnSaisie(c?.dateEntretien));
  const [erreurDate, setErreurDate] = useState('');
  // Statut choisi mais pas encore validé
  const [choix, setChoix] = useState<StatutCandidature | undefined>(c?.statut);
  const [confirmation, setConfirmation] = useState('');
  // Précisions demandées au moment de valider : date de l'entretien, raison du refus
  const [dateNouvelEntretien, setDateNouvelEntretien] = useState('');
  const [raison, setRaison] = useState('');
  const [erreurStatut, setErreurStatut] = useState('');
  const [copie, setCopie] = useState(false);
  // Modification des informations principales
  const [edition, setEdition] = useState(false);
  const [infos, setInfos] = useState({ entreprise: c?.entreprise ?? '', poste: c?.poste ?? '', lien: c?.lien ?? '', email: c?.email ?? '' });
  const [erreurInfos, setErreurInfos] = useState('');

  if (!c) {
    return (
      <Ecran avecEntete>
        <Titre>Candidature introuvable</Titre>
        <Bouton titre="Retour" onPress={() => router.back()} />
      </Ecran>
    );
  }

  const nomCompagnon = etat.compagnon?.nom ?? 'Ton compagnon';
  const aValider = choix !== undefined && choix !== c.statut;

  function valider() {
    if (!choix || choix === c!.statut) return;
    const dateEntretien = choix === 'entretien' ? lireDateFr(dateNouvelEntretien) : undefined;
    if (choix === 'entretien' && !dateEntretien) return setErreurStatut('Indique la date de ton entretien. Exemple : 28/09.');
    setErreurStatut('');
    dispatch({ type: 'CHANGER_STATUT', id: c!.id, statut: choix, dateEntretien, raisonRefus: choix === 'refus' ? raison.trim() || undefined : undefined });
    if (dateEntretien) setEntretien(dateEnSaisie(dateEntretien));
    setConfirmation(`✓ ${statutParId(choix).evenement}`);
    if (choix === 'decroche') router.push({ pathname: '/felicitations', params: { candidatureId: c!.id } });
  }

  function enregistrerInfos() {
    if (!infos.entreprise.trim() || !infos.poste.trim()) return setErreurInfos('L’entreprise et le poste sont obligatoires.');
    if (infos.email.trim() && !emailValide(infos.email)) return setErreurInfos('Cette adresse e-mail ne semble pas complète.');
    dispatch({
      type: 'MODIFIER_CANDIDATURE',
      id: c!.id,
      modifs: {
        entreprise: infos.entreprise.trim(),
        poste: infos.poste.trim(),
        lien: infos.lien.trim() || undefined,
        email: infos.email.trim() || undefined,
      },
    });
    setErreurInfos('');
    setEdition(false);
  }

  async function copierEmail() {
    await Clipboard.setStringAsync(c!.email ?? '');
    setCopie(true);
    setTimeout(() => setCopie(false), 1800);
  }

  function enregistrerEntretien() {
    if (!entretien.trim()) return dispatch({ type: 'MODIFIER_CANDIDATURE', id: c!.id, modifs: { dateEntretien: undefined } });
    const iso = lireDateFr(entretien);
    if (!iso) return setErreurDate('Date non reconnue. Exemple : 30/09 ou 30/09/2026.');
    setErreurDate('');
    dispatch({ type: 'MODIFIER_CANDIDATURE', id: c!.id, modifs: { dateEntretien: iso } });
  }

  return (
    <Ecran defilant avecEntete>
      {!edition ? (
        <View style={{ gap: 6 }}>
          <Titre>{c.entreprise}</Titre>
          <Text style={styles.poste}>{c.poste}</Text>
          <View style={[styles.statutActuel, { backgroundColor: statutParId(c.statut).fond }]}>
            <Text style={[styles.statutActuelTexte, { color: statutParId(c.statut).texte }]}>● {statutParId(c.statut).libelle}</Text>
          </View>
          {c.lien ? (
            <Pressable
              onPress={() => Linking.openURL(c.lien!.startsWith('http') ? c.lien! : `https://${c.lien}`)}
              accessibilityRole="link"
              style={styles.ligneAction}>
              <Ionicons name="open-outline" size={17} color={couleurs.renardFonce} />
              <Text style={styles.lien} numberOfLines={1}>
                Voir l’offre
              </Text>
            </Pressable>
          ) : null}
          {c.email ? (
            <View style={styles.ligneAction}>
              <Pressable onPress={() => Linking.openURL(`mailto:${c.email}`)} accessibilityRole="link" style={styles.email} accessibilityHint="Écrire un e-mail">
                <Ionicons name="mail-outline" size={17} color={couleurs.renardFonce} />
                <Text style={styles.lien} numberOfLines={1}>
                  {c.email}
                </Text>
              </Pressable>
              <Pressable onPress={copierEmail} accessibilityRole="button" accessibilityLabel="Copier l’adresse e-mail" hitSlop={10}>
                <Ionicons name={copie ? 'checkmark' : 'copy-outline'} size={19} color={copie ? couleurs.saugeFonce : couleurs.brunDoux} />
              </Pressable>
            </View>
          ) : null}
          {copie ? <Text style={styles.copie}>Adresse copiée</Text> : null}
          <Pressable onPress={() => setEdition(true)} accessibilityRole="button" style={styles.ligneAction}>
            <Ionicons name="create-outline" size={16} color={couleurs.brunDoux} />
            <Text style={styles.modifier}>Modifier les informations</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ gap: espace.m }}>
          <Champ label="Entreprise" value={infos.entreprise} onChangeText={(v) => setInfos({ ...infos, entreprise: v })} />
          <Champ label="Poste" value={infos.poste} onChangeText={(v) => setInfos({ ...infos, poste: v })} />
          <Champ
            label="Lien de l’offre"
            value={infos.lien}
            onChangeText={(v) => setInfos({ ...infos, lien: v })}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="https://…"
          />
          <Champ
            label="Adresse e-mail"
            value={infos.email}
            onChangeText={(v) => setInfos({ ...infos, email: v })}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="recrutement@entreprise.com"
          />
          {erreurInfos ? <Text style={styles.erreur}>{erreurInfos}</Text> : null}
          <View style={{ flexDirection: 'row', gap: espace.s }}>
            <Bouton titre="Annuler" variante="secondaire" onPress={() => setEdition(false)} style={{ flex: 1 }} />
            <Bouton titre="Enregistrer" onPress={enregistrerInfos} style={{ flex: 1 }} />
          </View>
        </View>
      )}

      {relanceDue(c, jourDe()) && (
        <View style={styles.alerte}>
          <Ionicons name="notifications-outline" size={18} color={couleurs.renardFonce} />
          <Text style={styles.alerteTexte}>
            {c.relancePrevue
              ? 'C’est le jour prévu pour relancer cette candidature. Une fois fait, passe-la en « Relancé ».'
              : `Cette candidature date de ${joursEntre(c.dateEnvoi!)} jours. Pense à la relancer, puis passe-la en « Relancé ».`}
          </Text>
        </View>
      )}

      <View style={{ gap: espace.s }}>
        <SousTitre>Faire évoluer la candidature</SousTitre>
        <ChoixStatut
          valeur={choix ?? c.statut}
          onChange={(s) => {
            setChoix(s);
            setConfirmation('');
          }}
        />
        {aValider && choix === 'entretien' && (
          <Champ
            label="Date de l’entretien *"
            value={dateNouvelEntretien}
            onChangeText={setDateNouvelEntretien}
            placeholder="Ex. 28/09"
            keyboardType="numbers-and-punctuation"
          />
        )}
        {aValider && choix === 'refus' && (
          <Champ
            label="Pourquoi, selon toi ? (facultatif)"
            value={raison}
            onChangeText={setRaison}
            placeholder="Ex. Pas assez préparé sur mes expériences, trop stressé…"
            multiline
            style={{ minHeight: 70, textAlignVertical: 'top' }}
          />
        )}
        {aValider && choix === 'refus' && <Text style={styles.meta}>Le noter t’aide à t’améliorer pour la prochaine fois.</Text>}
        {erreurStatut ? <Text style={styles.erreur}>{erreurStatut}</Text> : null}
        {aValider && (
          <Bouton
            titre={`Valider : ${statutParId(choix!).libelle}`}
            onPress={valider}
            desactive={choix === 'entretien' && !dateNouvelEntretien.trim()}
          />
        )}
        {confirmation && !aValider ? <Text style={styles.confirmation}>{confirmation}</Text> : null}
      </View>

      {(c.statut === 'envoyee' || c.statut === 'relancee') && (
        <View style={{ gap: espace.s }}>
          <SousTitre>Prévoir une relance</SousTitre>
          <View style={styles.pastilles}>
            {DELAIS_RELANCE.map((j) => {
              const jour = ajouterJours(jourDe(), j);
              return (
                <Pastille
                  key={j}
                  libelle={`+${j} jour${j > 1 ? 's' : ''}`}
                  choisi={c.relancePrevue === jour}
                  onPress={() => dispatch({ type: 'MODIFIER_CANDIDATURE', id: c.id, modifs: { relancePrevue: c.relancePrevue === jour ? undefined : jour } })}
                />
              );
            })}
          </View>
          {jourDeRelance(c) && <Text style={styles.meta}>Relance prévue le {dateLisible(jourDeRelance(c)!)}.</Text>}
        </View>
      )}

      {c.statut === 'refus' && (
        <View style={styles.reconfort}>
          <Compagnon espece={etat.compagnon?.espece ?? 'renard'} pose="reconfort" taille={90} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.reconfortTexte}>« Leur perte. On en envoie une autre ensemble ? 🐾 »</Text>
            <Text style={styles.meta}>{nomCompagnon}. Tu as osé, et ça compte.</Text>
          </View>
        </View>
      )}

      {(c.statut === 'entretien' || c.dateEntretien) && (
        <View style={{ gap: 4 }}>
          <Champ
            label="Date de l’entretien"
            value={entretien}
            onChangeText={setEntretien}
            onBlur={enregistrerEntretien}
            placeholder="Ex. 30/09"
            keyboardType="numbers-and-punctuation"
          />
          {erreurDate ? <Text style={styles.erreur}>{erreurDate}</Text> : null}
        </View>
      )}

      <Champ
        label="Note"
        value={note}
        onChangeText={setNote}
        onBlur={() => dispatch({ type: 'MODIFIER_CANDIDATURE', id: c.id, modifs: { note: note.trim() || undefined } })}
        placeholder="Ce qui s’est dit, le nom du recruteur, ton ressenti…"
        multiline
        style={{ minHeight: 90, textAlignVertical: 'top' }}
      />

      <View style={{ gap: espace.s }}>
        <SousTitre>Historique</SousTitre>
        <View style={styles.historique}>
          {/* Dans l'ordre chronologique : de l'envoi jusqu'à aujourd'hui */}
          {c.historique.map((h, i) => (
            <View key={`${h.statut}-${i}`} style={styles.etape}>
              <View style={[styles.puce, { backgroundColor: statutParId(h.statut).fond }]} />
              <Text style={styles.etapeTexte}>
                ✓ {statutParId(h.statut).evenement}
                {h.detail ? <Text style={styles.meta}> · {h.detail}</Text> : null}
              </Text>
              <Text style={styles.meta}>{dateLisible(h.le)}</Text>
            </View>
          ))}
        </View>
      </View>

      <Bouton
        titre={c.archivee ? 'Remettre dans la recherche' : 'Archiver'}
        variante="secondaire"
        onPress={() => dispatch({ type: 'ARCHIVER_CANDIDATURE', id: c.id, archivee: !c.archivee })}
      />
      <Text style={styles.note}>Archiver range la candidature dans ton historique. Elle n’est jamais supprimée.</Text>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  poste: { fontSize: 16, fontWeight: '700', color: couleurs.brunDoux },
  pastilles: { flexDirection: 'row', flexWrap: 'wrap', gap: espace.s },
  meta: { fontSize: 13, fontWeight: '600', color: couleurs.brunDoux },
  lien: { fontSize: 14.5, fontWeight: '800', color: couleurs.renardFonce, flexShrink: 1 },
  ligneAction: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  email: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  copie: { fontSize: 12.5, fontWeight: '700', color: couleurs.saugeFonce },
  modifier: { fontSize: 13.5, fontWeight: '700', color: couleurs.brunDoux },
  statutActuel: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, marginTop: 2 },
  statutActuelTexte: { fontWeight: '800', fontSize: 13.5 },
  confirmation: { fontWeight: '800', color: couleurs.saugeFonce, fontSize: 14 },
  alerte: {
    flexDirection: 'row',
    gap: espace.s,
    alignItems: 'center',
    backgroundColor: couleurs.pecheClair,
    borderRadius: arrondis.m,
    padding: espace.m,
  },
  alerteTexte: { flex: 1, fontWeight: '700', color: couleurs.brun, lineHeight: 19 },
  reconfort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    backgroundColor: '#F4EEF8',
    borderRadius: arrondis.l,
    padding: espace.m,
  },
  reconfortTexte: { fontWeight: '800', color: couleurs.brun, fontSize: 15, lineHeight: 20 },
  erreur: { color: couleurs.danger, fontWeight: '600', fontSize: 13 },
  historique: {
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    padding: espace.m,
    gap: espace.s,
  },
  etape: { flexDirection: 'row', alignItems: 'center', gap: espace.s },
  puce: { width: 12, height: 12, borderRadius: 6 },
  etapeTexte: { flex: 1, fontWeight: '700', color: couleurs.brun },
  note: { fontSize: 12.5, color: couleurs.brunDoux, textAlign: 'center' },
});
