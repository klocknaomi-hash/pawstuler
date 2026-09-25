/**
 * COMPTE › PORTEFEUILLE
 * Le solde de pièces (jamais remis à zéro) et l'historique des gains et des achats.
 */
import { StyleSheet, Text, View } from 'react-native';

import { Ecran } from '@/components/base';
import { IconePiece } from '@/components/Pieces';
import { arrondis, couleurs, espace, polices } from '@/config/theme';
import { dateLisible } from '@/logique/dates';
import { useApp } from '@/store/etat';

export default function Portefeuille() {
  const { etat } = useApp();
  const gagne = etat.mouvements.filter((m) => m.montant > 0).reduce((s, m) => s + m.montant, 0);
  const depense = -etat.mouvements.filter((m) => m.montant < 0).reduce((s, m) => s + m.montant, 0);

  return (
    <Ecran defilant avecEntete>
      <View style={styles.solde}>
        <Text style={styles.soldeLibelle}>Ton solde</Text>
        <View style={styles.ligneSolde}>
          <IconePiece taille={32} />
          <Text style={styles.soldeValeur}>{etat.pieces}</Text>
        </View>
        <Text style={styles.soldeDetail}>
          {gagne} gagnées · {depense} dépensées ou reprises
        </Text>
      </View>

      <Text style={styles.titre}>Historique</Text>
      {etat.mouvements.length === 0 ? (
        <Text style={styles.vide}>Termine une tâche du jour pour gagner tes premières pièces.</Text>
      ) : (
        <View style={styles.liste}>
          {etat.mouvements.map((m, i) => (
            <View key={m.id} style={[styles.mouvement, i > 0 && styles.separateur]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.libelle} numberOfLines={2}>
                  {m.libelle}
                </Text>
                <Text style={styles.date}>{dateLisible(m.le)}</Text>
              </View>
              <Text style={[styles.montant, { color: m.montant > 0 ? couleurs.saugeFonce : couleurs.danger }]}>
                {m.montant > 0 ? `+${m.montant}` : `−${-m.montant}`}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  solde: { backgroundColor: couleurs.orClair, borderRadius: arrondis.l, padding: espace.xl, alignItems: 'center', gap: 4 },
  soldeLibelle: { fontWeight: '800', color: '#9A6400', textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 12.5 },
  ligneSolde: { flexDirection: 'row', alignItems: 'center', gap: espace.s },
  soldeValeur: { fontFamily: polices.titre, fontSize: 44, fontWeight: '800', color: couleurs.brun, fontVariant: ['tabular-nums'] },
  soldeDetail: { fontWeight: '600', color: couleurs.brunDoux },
  titre: { fontFamily: polices.titre, fontSize: 19, fontWeight: '800', color: couleurs.brun },
  vide: { color: couleurs.brunDoux, fontWeight: '600', textAlign: 'center' },
  liste: { backgroundColor: couleurs.carte, borderRadius: arrondis.m, borderWidth: 1, borderColor: couleurs.ligne },
  mouvement: { flexDirection: 'row', alignItems: 'center', gap: espace.m, padding: espace.l },
  separateur: { borderTopWidth: 1, borderTopColor: couleurs.ligne },
  libelle: { fontWeight: '700', color: couleurs.brun, fontSize: 14.5 },
  date: { fontWeight: '600', color: couleurs.brunDoux, fontSize: 12.5, marginTop: 2 },
  montant: { fontWeight: '800', fontSize: 16, fontVariant: ['tabular-nums'] },
});
