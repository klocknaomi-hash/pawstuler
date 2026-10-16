/**
 * OUTIL — MODÈLES DE MAILS
 * Relance, remerciement après un entretien, demande de retour après un refus, candidature spontanée.
 * Préremplis avec la candidature choisie ; on peut les copier, ou les ouvrir directement dans sa
 * messagerie (à l'adresse enregistrée sur la candidature).
 * Ouverture : `/outils/mail?modele=relance&candidature=<id>`. En gratuit : le mail de relance ; Premium : tous.
 */
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Bouton, Ecran, Texte } from '@/components/base';
import { Bloc, ChoixCandidature, Verrou, remplirModele, stylesOutils } from '@/components/Outils';
import { MODELES_MAILS } from '@/config/outils';
import { arrondis, couleurs, espace } from '@/config/theme';
import { aPremium } from '@/services/abonnement';
import { useApp } from '@/store/etat';

export default function ModelesMails() {
  const params = useLocalSearchParams<{ modele?: string; candidature?: string }>();
  const { etat } = useApp();
  const premium = aPremium(etat);
  const [modeleId, setModeleId] = useState(MODELES_MAILS.some((m) => m.id === params.modele) ? params.modele! : MODELES_MAILS[0].id);
  const [candidatureId, setCandidatureId] = useState<string | undefined>(params.candidature);
  const [copie, setCopie] = useState(false);
  const modele = MODELES_MAILS.find((m) => m.id === modeleId) ?? MODELES_MAILS[0];
  const accessible = premium || !!modele.gratuit;
  const candidature = etat.candidatures.find((c) => c.id === candidatureId);
  const objet = remplirModele(modele.objet, etat, candidature);
  const corps = remplirModele(modele.corps, etat, candidature);

  async function copier() {
    await Clipboard.setStringAsync(`${objet}\n\n${corps}`);
    setCopie(true);
  }
  const ouvrir = () =>
    Linking.openURL(`mailto:${candidature?.email ?? ''}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(corps)}`);

  return (
    <Ecran defilant avecEntete>
      <View style={styles.choix}>
        {MODELES_MAILS.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => {
              setModeleId(m.id);
              setCopie(false);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: m.id === modeleId }}
            style={[styles.onglet, m.id === modeleId && styles.ongletChoisi]}>
            <Text style={[styles.ongletTexte, m.id === modeleId && { color: couleurs.blanc }]}>
              {m.emoji} {m.titre}
              {!premium && !m.gratuit ? ' 🔒' : ''}
            </Text>
          </Pressable>
        ))}
      </View>
      <Texte>Quand ? {modele.quand}</Texte>

      {accessible ? (
        <>
          <ChoixCandidature
            etat={etat}
            choisie={candidatureId}
            onChoisir={(id) => {
              setCandidatureId(id);
              setCopie(false);
            }}
          />
          <Bloc titre="Objet">
            <Text style={stylesOutils.texte}>{objet}</Text>
          </Bloc>
          <Bloc titre="Message">
            <Text style={stylesOutils.texte} selectable>
              {corps}
            </Text>
          </Bloc>
          <Text style={stylesOutils.petit}>Relis-le et personnalise les « … » : un mail un peu personnel fait toujours la différence.</Text>
          <Bouton titre={copie ? 'Copié ✓' : 'Copier le mail'} variante="secondaire" onPress={copier} />
          <Bouton titre={candidature?.email ? `Écrire à ${candidature.email}` : 'Ouvrir dans ma messagerie'} onPress={ouvrir} />
        </>
      ) : (
        <Bloc>
          <Text style={stylesOutils.texte}>Ce modèle fait partie de Pawstuler Premium, avec tous les autres modèles et scripts.</Text>
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
});
