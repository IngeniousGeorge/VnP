import { defineConfig } from 'astro/config';

export default defineConfig({
  image: {
    remotePatterns: [
      // Local Strapi dev server
      { protocol: 'http', hostname: 'localhost', port: '1337' },
      // Production Strapi on Railway — add hostname when known
      // { protocol: 'https', hostname: 'your-app.railway.app' },
    ],
  },
});
