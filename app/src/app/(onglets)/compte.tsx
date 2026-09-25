/**
 * COMPTE
 * Une vraie section : profil, portefeuille, parcours, paramètres, confidentialité (RGPD),
 * abonnement Pawstuler Premium, déconnexion et suppression du compte.
 */
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Compagnon } from '@/components/Compagnon';
import { Groupe, Ligne } from '@/components/Liste';
import { compagnonParId } from '@/config/compagnons';
import { arrondis, couleurs, espace, polices } from '@/config/theme';
import { villeParId } from '@/config/villes';
import { emploiActuel } from '@/logique/tachesDuJour';
import { libelleAbonnement } from '@/services/abonnement';
import { deconnecter, supprimerCompte } from '@/services/compte';
import { useApp } from '@/store/etat';

/** Demande une confirmation (boîte de dialogue native ; directe sur le web). */
function confirmer(titre: string, message: string, action: string, onOk: () => void, destructif = false) {
  if (Platform.OS === 'web') return onOk();
  Alert.alert(titre, message, [
    { text: 'Annuler', style: 'cancel' },
    { text: action, style: destructif ? 'destructive' : 'default', onPress: onOk },
  ]);
}

export default function Compte() {
  const { etat, dispatch } = useApp();
  const compagnon = etat.compagnon;
  const infos = compagnon ? compagnonParId(compagnon.espece) : undefined;
  const ville = etat.villeId ? villeParId(etat.villeId) : undefined;
  const emploi = emploiActuel(etat);

  function seDeconnecter() {
    confirmer('Se déconnecter ?', 'Tes données restent sur ce téléphone : tu les retrouveras en te reconnectant.', 'Se déconnecter', async () => {
      await deconnecter();
      dispatch({ type: 'DECONNECTER' });
      router.replace('/presentation');
    });
  }

  function supprimer() {
    confirmer(
      'Supprimer ton compte ?',
      `Ton profil, ${compagnon?.nom ?? 'ton compagnon'}, tes pièces et tes candidatures seront définitivement effacés. Cette action est irréversible.`,
      'Supprimer définitivement',
      async () => {
        try {
          await supprimerCompte();
        } catch (e) {
          const message = e instanceof Error ? e.message : 'La suppression n’a pas abouti.';
          return Platform.OS === 'web' ? undefined : Alert.alert('Suppression impossible', message);
        }
        dispatch({ type: 'SUPPRIMER_COMPTE' });
        router.replace('/presentation');
      },
      true,
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: couleurs.creme }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={styles.titre}>Compte</Text>

        <View style={styles.profil}>
          {compagnon && <Compagnon espece={compagnon.espece} pose="neutre" taille={86} />}
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.prenom}>{etat.utilisateur?.prenom}</Text>
            {compagnon && infos && (
              <Text style={styles.detail}>
                {compagnon.nom}, {infos.espece} · {ville?.nom}
              </Text>
            )}
            <Text style={styles.detail}>{libelleAbonnement(etat)}</Text>
          </View>
        </View>

        <Groupe titre="Mon profil">
          <Ligne premiere icone="person-outline" libelle="Profil et compagnon" onPress={() => router.push('/compte/profil')} />
          {compagnon && (
            <Ligne icone="paw-outline" libelle={`Profil de ${compagnon.nom}`} valeur={`Série : ${etat.serie.actuelle} j`} onPress={() => router.push('/compagnon')} />
          )}
          <Ligne icone="wallet-outline" libelle="Mon portefeuille" valeur={`${etat.pieces} pièces`} onPress={() => router.push('/compte/portefeuille')} />
          <Ligne
            icone="briefcase-outline"
            libelle="Mon parcours pro"
            valeur={emploi ? emploi.poste : etat.contexte === 'recherche' ? 'En recherche' : undefined}
            onPress={() => router.push('/aventure-pro')}
          />
        </Groupe>

        <Groupe titre="Paramètres">
          <Ligne premiere icone="notifications-outline" libelle="Notifications et rythme" onPress={() => router.push('/compte/parametres')} />
        </Groupe>

        <Groupe titre="Confidentialité">
          <Ligne premiere icone="shield-checkmark-outline" libelle="Mes données et RGPD" onPress={() => router.push('/compte/confidentialite')} />
        </Groupe>

        <Groupe titre="Abonnement">
          <Ligne premiere icone="sparkles-outline" libelle="Pawstuler Premium" valeur={libelleAbonnement(etat)} onPress={() => router.push('/premium')} />
        </Groupe>

        <Groupe titre="Compte">
          <Ligne premiere icone="log-out-outline" libelle="Se déconnecter" onPress={seDeconnecter} />
          <Ligne icone="trash-outline" libelle="Supprimer mon compte" onPress={supprimer} danger />
        </Groupe>

        <Text style={styles.version}>Pawstuler · version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenu: { padding: espace.l, gap: espace.l, paddingBottom: espace.xxl },
  titre: { fontFamily: polices.titre, fontSize: 28, fontWeight: '800', color: couleurs.brun },
  profil: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    backgroundColor: couleurs.pecheClair,
    borderRadius: arrondis.l,
    padding: espace.m,
  },
  prenom: { fontFamily: polices.titre, fontSize: 22, fontWeight: '800', color: couleurs.brun },
  detail: { fontSize: 13.5, fontWeight: '600', color: couleurs.brunDoux },
  version: { textAlign: 'center', fontSize: 12, color: couleurs.brunDoux },
});
