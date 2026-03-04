import type { Schema, Struct } from '@strapi/strapi';

export interface BocauxCarteFlip extends Struct.ComponentSchema {
  collectionName: 'components_bocaux_carte_flips';
  info: {
    displayName: 'Carte flip';
    icon: 'layer';
  };
  attributes: {
    Description_photo: Schema.Attribute.String;
    Photo: Schema.Attribute.Media<'images'>;
    Plat: Schema.Attribute.String;
    Texte: Schema.Attribute.Blocks;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'bocaux.carte-flip': BocauxCarteFlip;
    }
  }
}
