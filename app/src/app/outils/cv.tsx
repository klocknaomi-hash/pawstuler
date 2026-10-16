/**
 * OUTIL — CHECKLIST CV
 * Les points à vérifier sur ton CV, à cocher (gardés sur le téléphone), avec ta progression,
 * puis « Adapter ton CV à une offre ». En gratuit : les 5 points essentiels ; Premium : tout.
 */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ecran, Texte } from '@/components/base';
import { Bloc, Verrou, stylesOutils } from '@/components/Outils';
import { ADAPTER_A_UNE_OFFRE, CHECKLIST_CV } from '@/config/outils';
import { arrondis, couleurs, espace } from '@/config/theme';
import { aPremium } from '@/services/abonnement';
import { useApp } from '@/store/etat';

export default function ChecklistCV() {
  const { etat, dispatch } = useApp();
  const premium = aPremium(etat);
  const coches = etat.outils?.cv ?? [];
  const accessibles = CHECKLIST_CV.filter((g) => premium || g.gratuit).flatMap((g) => g.points);
  const faits = accessibles.filter((p) => coches.includes(p.id)).length;

  return (
    <Ecran defilant avecEntete>
      <Texte>Coche ce qui est déjà bon sur ton CV. Tu peux revenir quand tu veux : tout est gardé.</Texte>
      <View style={{ gap: 6 }}>
        <View style={styles.barre}>
          <View style={[styles.barreRemplie, { width: `${accessibles.length ? (faits / accessibles.length) * 100 : 0}%` }]} />
        </View>
        <Text style={stylesOutils.petit}>
          {faits} sur {accessibles.length} points vérifiés{faits === accessibles.length && faits > 0 ? ' · bravo, ton CV est prêt ! 🎉' : ''}
        </Text>
      </View>

      {CHECKLIST_CV.map((g) => {
        const accessible = premium || !!g.gratuit;
        return (
          <Bloc key={g.id} titre={g.titre}>
            {g.points.map((p) => {
              const fait = coches.includes(p.id);
              return (
                <Pressable
                  key={p.id}
                  disabled={!accessible}
                  onPress={() => dispatch({ type: 'COCHER_CV', id: p.id })}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: fait, disabled: !accessible }}
                  style={styles.point}>
                  <Ionicons
                    name={!accessible ? 'lock-closed-outline' : fait ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={!accessible ? couleurs.brunDoux : fait ? couleurs.saugeFonce : couleurs.brunDoux}
                  />
                  <Text style={[stylesOutils.texte, { flex: 1 }, !accessible && { color: couleurs.brunDoux }]}>{p.texte}</Text>
                </Pressable>
              );
            })}
            {!accessible && <Verrou />}
          </Bloc>
        );
      })}

      <Bloc titre="🎯 Adapter ton CV à une offre" fond={couleurs.saugeClair}>
        {premium ? (
          ADAPTER_A_UNE_OFFRE.map((t, i) => (
            <Text key={t} style={stylesOutils.texte}>
              {i + 1}. {t}
            </Text>
          ))
        ) : (
          <>
            <Text style={stylesOutils.texte}>Une méthode en 5 étapes pour que ton CV parle directement à chaque offre.</Text>
            <Verrou />
          </>
        )}
      </Bloc>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  barre: { height: 8, borderRadius: 4, backgroundColor: couleurs.ligne, overflow: 'hidden' },
  barreRemplie: { height: 8, borderRadius: 4, backgroundColor: couleurs.sauge },
  point: { flexDirection: 'row', alignItems: 'flex-start', gap: espace.s, paddingVertical: 4, borderRadius: arrondis.s },
});
