/**
 * LA GARDE-ROBE DU COMPAGNON
 * Ce que le Shop propose à un animal, et ce qu'il porte.
 * Une tenue « illustrée » n'est proposée qu'aux animaux qui ont son image :
 * il suffit d'ajouter l'image dans le registre pour qu'elle apparaisse.
 */
import { CATALOGUE_BOUTIQUE, type ObjetBoutique } from '@/config/boutique';
import type { EspeceId } from '@/config/compagnons';
import { imageTenue } from '@/illustrations/registre';

/** Objets visibles dans le Shop pour cet animal. */
export const objetsPour = (espece: EspeceId): ObjetBoutique[] =>
  CATALOGUE_BOUTIQUE.filter((o) => !o.illustre || imageTenue(espece, o.id));
