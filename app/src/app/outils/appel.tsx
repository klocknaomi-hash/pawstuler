/**
 * OUTIL — SCRIPTS D'APPEL
 * Quoi dire au téléphone, étape par étape : relancer une candidature, candidature spontanée,
 * quand un recruteur t'appelle. L'entreprise et le poste se remplissent avec la candidature choisie.
 * Ouverture : `/outils/appel?script=relance&candidature=<id>` (depuis la fiche d'une candidature).
 * En gratuit : le script de relance ; Premium : tous.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ecran, Texte } from '@/components/base';
import { Bloc, ChoixCandidature, Verrou, remplirModele, stylesOutils } from '@/components/Outils';
import { SCRIPTS_APPEL } from '@/config/outils';
import { arrondis, couleurs, espace } from '@/config/theme';
import { aPremium } from '@/services/abonnement';
import { useApp } from '@/store/etat';

export default function ScriptsAppel() {
  const params = useLocalSearchParams<{ script?: string; candidature?: string }>();
  const { etat } = useApp();
  const premium = aPremium(etat);
  const [scriptId, setScriptId] = useState(SCRIPTS_APPEL.some((s) => s.id === params.script) ? params.script! : SCRIPTS_APPEL[0].id);
  const [candidatureId, setCandidatureId] = useState<string | undefined>(params.candidature);
  const script = SCRIPTS_APPEL.find((s) => s.id === scriptId) ?? SCRIPTS_APPEL[0];
  const accessible = premium || !!script.gratuit;
  const candidature = etat.candidatures.find((c) => c.id === candidatureId);

  return (
    <Ecran defilant avecEntete>
      <View style={styles.choix}>
        {SCRIPTS_APPEL.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => setScriptId(s.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: s.id === scriptId }}
            style={[styles.onglet, s.id === scriptId && styles.ongletChoisi]}>
            <Text style={[styles.ongletTexte, s.id === scriptId && { color: couleurs.blanc }]}>
              {s.emoji} {s.titre}
              {!premium && !s.gratuit ? ' 🔒' : ''}
            </Text>
          </Pressable>
        ))}
      </View>
      <Texte>Quand ? {script.quand}</Texte>

      {accessible ? (
        <>
          <ChoixCandidature etat={etat} choisie={candidatureId} onChoisir={setCandidatureId} />
          {script.etapes.map((e, i) => (
            <Bloc key={e.titre} titre={`${i + 1}. ${e.titre}`}>
              <Text style={stylesOutils.texte}>{remplirModele(e.texte, etat, candidature)}</Text>
            </Bloc>
          ))}
          <Text style={stylesOutils.petit}>Astuce : garde ce script ouvert pendant l’appel, et souris en parlant, ça s’entend.</Text>
          {candidature && (
            <Pressable onPress={() => router.push({ pathname: '/candidature/[id]', params: { id: candidature.id } })} accessibilityRole="button">
              <Text style={styles.lien}>Après l’appel : mettre à jour la candidature ›</Text>
            </Pressable>
          )}
        </>
      ) : (
        <Bloc>
          <Text style={stylesOutils.texte}>Ce script fait partie de Pawstuler Premium, avec tous les autres scripts et modèles.</Text>
          <Verrou />
        </Bloc>
      )}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  choix: { gap: espace.s },
  onglet: { borderRadius: arrondis.m, paddingVertical: 10, paddingHorizontal: espace.m, backgroundColor: couleurs.pecheClair },
  ongletChoisi: { backgroundColor: couleurs.renardFonce },
  ongletTexte: { fontSize: 14, fontWeight: '600', color: couleurs.brun },
  lien: { fontSize: 14, fontWeight: '700', color: couleurs.renardFonce },
});
