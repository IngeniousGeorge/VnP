import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://verre-et-papilles.com',
  image: {
    remotePatterns: [
      // Local Strapi dev server
      { protocol: 'http', hostname: 'localhost', port: '1337' },
      { protocol: 'https', hostname: 'vnp-production.up.railway.app' },
    ],
  },
});
