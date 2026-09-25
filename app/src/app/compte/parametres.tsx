/**
 * COMPTE › PARAMÈTRES — rappels sur le téléphone et rythme du compagnon.
 * Les rappels sont programmés par src/services/rappels.ts (sans serveur).
 */
import { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { Bouton, Ecran, Pastille, SousTitre } from '@/components/base';
import { Groupe, LigneInterrupteur } from '@/components/Liste';
import { couleurs, espace } from '@/config/theme';
import { HEURES_COUCHER, HEURES_REVEIL, heureLisible } from '@/logique/rythme';
import { autorisation, type Autorisation } from '@/services/rappels';
import { useApp } from '@/store/etat';

export default function Parametres() {
  const { etat, dispatch } = useApp();
  const p = etat.parametres;
  const nom = etat.compagnon?.nom ?? 'Ton compagnon';
  const changer = (modifs: Partial<typeof p>) => dispatch({ type: 'MODIFIER_PARAMETRES', parametres: modifs });
  // Autorisation du téléphone : si elle a été refusée, on explique comment la rétablir
  const [permis, setPermis] = useState<Autorisation>('accordee');
  useEffect(() => {
    autorisation().then(setPermis).catch(() => {});
  }, [p]);

  return (
    <Ecran defilant avecEntete>
      <Groupe titre="Rappels">
        <LigneInterrupteur premiere libelle="Recevoir des rappels" valeur={p.notifications} onChange={(v) => changer({ notifications: v })} />
        <LigneInterrupteur
          libelle="Rappels de relance"
          detail="Quand une candidature n’a pas de réponse depuis 7 jours"
          valeur={p.notifications && p.rappelsRelance}
          onChange={(v) => changer({ rappelsRelance: v })}
        />
        <LigneInterrupteur
          libelle="Tâches du jour"
          detail={`Un petit mot de ${nom} le matin`}
          valeur={p.notifications && p.rappelsTaches}
          onChange={(v) => changer({ rappelsTaches: v })}
        />
      </Groupe>
      {p.notifications && permis === 'refusee' && (
        <View style={styles.alerte}>
          <Text style={styles.detail}>
            Les notifications de Pawstuler sont coupées dans les réglages de ton iPhone. Tu peux les réactiver quand tu veux.
          </Text>
          <Bouton titre="Ouvrir les réglages" variante="secondaire" onPress={() => Linking.openSettings()} />
        </View>
      )}
      {p.notifications && permis === 'indisponible' && (
        <Text style={styles.detail}>Les rappels fonctionnent sur ton téléphone (pas dans la version web).</Text>
      )}

      <View style={{ gap: espace.s }}>
        <SousTitre>Le rythme de {nom}</SousTitre>
        <Text style={styles.detail}>En dehors de ces heures, {nom} dort. Tu peux toujours avancer : tes progrès l’attendront au réveil.</Text>
        <Text style={styles.label}>Réveil</Text>
        <View style={styles.pastilles}>
          {HEURES_REVEIL.map((h) => (
            <Pastille
              key={h}
              libelle={heureLisible(h)}
              choisi={etat.rythme.reveil === h}
              onPress={() => dispatch({ type: 'DEFINIR_RYTHME', reveil: h, coucher: etat.rythme.coucher })}
            />
          ))}
        </View>
        <Text style={styles.label}>Coucher</Text>
        <View style={styles.pastilles}>
          {HEURES_COUCHER.map((h) => (
            <Pastille
              key={h}
              libelle={heureLisible(h)}
              choisi={etat.rythme.coucher === h}
              onPress={() => dispatch({ type: 'DEFINIR_RYTHME', reveil: etat.rythme.reveil, coucher: h })}
            />
          ))}
        </View>
      </View>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  pastilles: { flexDirection: 'row', flexWrap: 'wrap', gap: espace.s },
  alerte: { backgroundColor: couleurs.pecheClair, borderRadius: 16, padding: espace.l, gap: espace.m },
  detail: { fontSize: 13.5, color: couleurs.brunDoux, fontWeight: '600', lineHeight: 19 },
  label: { fontSize: 12.5, fontWeight: '800', color: couleurs.brunDoux, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: espace.s },
});
