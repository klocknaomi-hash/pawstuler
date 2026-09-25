/**
 * COMPTE › PARAMÈTRES — notifications et rythme du compagnon.
 * Les préférences sont enregistrées dès maintenant ; l'envoi réel des notifications
 * sera branché dans une prochaine étape (expo-notifications).
 */
import { StyleSheet, Text, View } from 'react-native';

import { Ecran, Pastille, SousTitre } from '@/components/base';
import { Groupe, LigneInterrupteur } from '@/components/Liste';
import { couleurs, espace } from '@/config/theme';
import { HEURES_COUCHER, HEURES_REVEIL, heureLisible } from '@/logique/rythme';
import { useApp } from '@/store/etat';

export default function Parametres() {
  const { etat, dispatch } = useApp();
  const p = etat.parametres;
  const nom = etat.compagnon?.nom ?? 'Ton compagnon';
  const changer = (modifs: Partial<typeof p>) => dispatch({ type: 'MODIFIER_PARAMETRES', parametres: modifs });

  return (
    <Ecran defilant avecEntete>
      <Groupe titre="Notifications">
        <LigneInterrupteur premiere libelle="Autoriser les notifications" valeur={p.notifications} onChange={(v) => changer({ notifications: v })} />
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
  detail: { fontSize: 13.5, color: couleurs.brunDoux, fontWeight: '600', lineHeight: 19 },
  label: { fontSize: 12.5, fontWeight: '800', color: couleurs.brunDoux, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: espace.s },
});
