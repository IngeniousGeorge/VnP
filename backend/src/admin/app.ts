import { lazy } from 'react';
import type { StrapiApp } from '@strapi/strapi/admin';

const DeployPage = lazy(() => import('./DeployPage'));
const DeployIcon = () => null;

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
      Component: DeployPage,
    });
  },
};
