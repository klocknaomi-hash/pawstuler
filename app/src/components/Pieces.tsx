/** Les pièces : l'icône et le compteur affiché en haut de l'écran. */
import { StyleSheet, Text, View } from 'react-native';

import { couleurs, polices } from '@/config/theme';

export function IconePiece({ taille = 18 }: { taille?: number }) {
  return (
    <View
      style={{
        width: taille,
        height: taille,
        borderRadius: taille / 2,
        backgroundColor: couleurs.or,
        borderWidth: Math.max(1.5, taille / 10),
        borderColor: '#D9962A',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View
        style={{
          width: taille * 0.4,
          height: taille * 0.4,
          borderRadius: taille,
          borderWidth: Math.max(1, taille / 14),
          borderColor: '#FFE7A8',
        }}
      />
    </View>
  );
}

export function CompteurPieces({ pieces }: { pieces: number }) {
  return (
    <View style={styles.compteur} accessibilityLabel={`${pieces} pièces`}>
      <IconePiece />
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
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: couleurs.ligne,
  },
  nombre: { fontFamily: polices.texte, fontWeight: '800', fontSize: 15, color: couleurs.brun, fontVariant: ['tabular-nums'] },
});
