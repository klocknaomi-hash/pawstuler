/**
 * LA VIDÉO DU TRAJET (une par ville)
 * Le décor qui défile en boucle derrière le compagnon quand il marche : la campagne de Clairebourg,
 * la ville de Sunnyville (vidéos du Drive, 10 s, sans son). Elle remplace le chemin en images
 * fixes pour « Bonne route » et pendant le trajet. Au retour, l'image est retournée pour que le
 * décor défile dans l'autre sens.
 */
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View } from 'react-native';

export function VideoTrajet({ source, sens = 'aller' }: { source: number; sens?: 'aller' | 'retour' }) {
  const lecteur = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
      <VideoView
        player={lecteur}
        style={[StyleSheet.absoluteFill, sens === 'retour' && { transform: [{ scaleX: -1 }] }]}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
    </View>
  );
}
