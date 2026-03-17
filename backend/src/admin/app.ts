import React from 'react';
import type { StrapiApp } from '@strapi/strapi/admin';

const DeployIcon = () => React.createElement(
  'svg',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  },
  React.createElement('polyline', { points: '16 16 12 12 8 16' }),
  React.createElement('line', { x1: '12', y1: '12', x2: '12', y2: '21' }),
  React.createElement('path', { d: 'M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3' }),
);

export default {
  config: {
    locales: ['fr'],
  },
  bootstrap(app: StrapiApp) {
    app.addMenuLink({
      to: '/deploy',
      icon: DeployIcon,
      intlLabel: {
        id: 'deploy.link.label',
        defaultMessage: 'Déployer le site',
      },
      Component: () => import('./DeployPage'),
    });
  },
};
