import type { Schema, Struct } from '@strapi/strapi';

export interface BocauxCarte extends Struct.ComponentSchema {
  collectionName: 'components_bocaux_cartes';
  info: {
    displayName: 'Carte';
  };
  attributes: {
    Description_photo: Schema.Attribute.String;
    Etape: Schema.Attribute.String;
    Infos: Schema.Attribute.String;
    Photo: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    Texte: Schema.Attribute.Blocks;
  };
}

export interface CoffretsType extends Struct.ComponentSchema {
  collectionName: 'components_coffrets_types';
  info: {
    displayName: 'Type';
  };
  attributes: {
    Description_photo: Schema.Attribute.String;
    Photo: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    Texte: Schema.Attribute.Blocks;
    Type: Schema.Attribute.String;
  };
}

export interface RevendeursRevendeur extends Struct.ComponentSchema {
  collectionName: 'components_revendeurs_revendeurs';
  info: {
    displayName: 'Revendeur';
  };
  attributes: {
    Description: Schema.Attribute.String;
    Lien: Schema.Attribute.String;
    Lieu: Schema.Attribute.String;
    Nom: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'bocaux.carte': BocauxCarte;
      'coffrets.type': CoffretsType;
      'revendeurs.revendeur': RevendeursRevendeur;
    }
  }
}
