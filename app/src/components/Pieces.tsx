/** Les pièces : l'icône et le compteur affiché en haut de l'écran. */
import { StyleSheet, Text, View } from 'react-native';

import { couleurs, polices, relief } from '@/config/theme';

/**
 * Une pièce d'or dessinée en couches : la tranche (plus foncée, un peu décalée vers le bas
 * pour donner de l'épaisseur), le bord doré, la face, un anneau gravé et un reflet de lumière.
 */
export function IconePiece({ taille = 20 }: { taille?: number }) {
  const t = taille;
  const rond = (d: number) => ({ width: d, height: d, borderRadius: d / 2 });
  return (
    <View style={{ width: t, height: t + t * 0.1 }}>
      {/* Tranche : donne l'épaisseur de la pièce */}
      <View style={[rond(t), { position: 'absolute', top: t * 0.1, backgroundColor: '#B8741A' }]} />
      {/* Bord doré */}
      <View style={[rond(t), { position: 'absolute', top: 0, backgroundColor: '#E9A21E', alignItems: 'center', justifyContent: 'center' }]}>
        {/* Face */}
        <View style={[rond(t * 0.8), { backgroundColor: '#FFCC47', alignItems: 'center', justifyContent: 'center' }]}>
          {/* Anneau gravé */}
          <View style={[rond(t * 0.5), { borderWidth: Math.max(1, t / 14), borderColor: '#E9A21E' }]} />
        </View>
        {/* Reflet */}
        <View
          style={{
            position: 'absolute',
            top: t * 0.16,
            left: t * 0.2,
            width: t * 0.26,
            height: t * 0.13,
            borderRadius: t,
            backgroundColor: '#FFF6D6',
            opacity: 0.9,
            transform: [{ rotate: '-35deg' }],
          }}
        />
      </View>
    </View>
  );
}

export function CompteurPieces({ pieces }: { pieces: number }) {
  return (
    <View style={styles.compteur} accessibilityLabel={`${pieces} pièces`}>
      <IconePiece taille={24} />
      <Text style={styles.nombre}>{pieces}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  compteur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: couleurs.carte,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    ...relief,
  },
  nombre: { fontFamily: polices.texte, fontWeight: '800', fontSize: 16, color: '#9A6312', fontVariant: ['tabular-nums'] },
});
