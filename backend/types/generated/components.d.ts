import type { Schema, Struct } from '@strapi/strapi';

export interface BocauxCarte extends Struct.ComponentSchema {
  collectionName: 'components_bocaux_cartes';
  info: {
    displayName: 'Carte';
  };
  attributes: {
    Description_photo: Schema.Attribute.String;
    Etape: Schema.Attribute.String;
    Photo: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    Texte: Schema.Attribute.Blocks;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'bocaux.carte': BocauxCarte;
    }
  }
}
